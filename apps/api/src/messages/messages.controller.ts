/**
 * 플레이어 발화 → 컨텍스트 구성 → LLM 호출(tools) → 검증 → 세션 반영 → JSON 반환
 * 실패해도 항상 200 + NpcReplyV1 폴백으로 응답하여 UX가 끊기지 않도록 보호
 */
import { Body, Controller, Logger, Param, Post } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { SessionsService } from '../sessions/sessions.service';
import { buildContext } from '../ai/context-builder';
import { makeDeveloperContext, makeSystemPrompt } from '../ai/prompts';
import { callLLMWithTools } from '../ai/openai.tools';
import { ensureNpcReply } from '../ai/validate';
import type { NpcReplyV1 } from '../ai/schema';
import { INTENT_FALLBACK } from '../ai/schema';
import { LRU, makeKey } from '../ai/cache';

const replyCache = new LRU<NpcReplyV1>(200);
const API_VERSION = '2025-08-30' as const;
const SCHEMA_VERSION = 'npc_reply@1' as const;

type MessageDto = Readonly<{ text: string; caseId: string; npcId: string }>;

function isMessageDto(x: unknown): x is MessageDto {
  if (x === null || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.text === 'string' &&
    typeof o.caseId === 'string' &&
    typeof o.npcId === 'string' &&
    o.text.trim().length > 0 &&
    o.caseId.trim().length > 0 &&
    o.npcId.trim().length > 0
  );
}

function toLogMessage(e: unknown): string {
  if (e instanceof Error) return e.stack ?? e.message;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

/** 스키마에 맞춘 안전 폴백(JSON) — 반드시 스네이크케이스, 추가 필드 금지 */
function makeFallback(params: {
  sessionId: string;
  npcId: string;
  userText: string;
  node?: string;
  flags?: readonly string[];
  message?: string;
  npcName?: string;
  npcRole?: string;
}): NpcReplyV1 {
  const { sessionId, npcId, node, flags, message, npcName, npcRole } = params;

  return {
    api_version: API_VERSION,
    schema_version: SCHEMA_VERSION,
    session_id: sessionId,
    message_id: randomUUID(),
    npc: {
      id: npcId,
      name: npcName ?? 'NPC',
      role: npcRole ?? 'npc',
    },
    reply:
      message ?? '오류가 발생했어요. 잠시 후 다시 시도해 주세요. (임시 답변)',
    intent: INTENT_FALLBACK,
    tone: 'neutral',
    confidence: 0,
    facts_used: [],
    state: {
      node: node ?? 'start',
      flags: [...(flags ?? [])],
    },
  };
}

@Controller()
export class MessagesController {
  private readonly logger = new Logger(MessagesController.name);

  constructor(private readonly sessions: SessionsService) {}

  @Post('/sessions/:id/message')
  async handle(
    @Param('id') sessionId: string,
    @Body() body: unknown,
  ): Promise<NpcReplyV1> {
    // 0) DTO 검증
    if (!isMessageDto(body)) {
      this.logger.warn(`Bad request body: ${toLogMessage(body)}`);
      return makeFallback({
        sessionId,
        npcId: 'unknown',
        userText: '',
        message: '요청 형식이 올바르지 않습니다.',
      });
    }
    const dto = body;
    const userText =
      dto.text.length > 1_000 ? `${dto.text.slice(0, 1_000)}…` : dto.text;

    // 1) 세션 + 플레이어 로그
    const session = await Promise.resolve(this.sessions.getOrCreate(sessionId));
    await Promise.resolve(
      this.sessions.append(sessionId, { from: 'player', text: userText }),
    ).catch((e) =>
      this.logger.warn(`append(player) failed: ${toLogMessage(e)}`),
    );

    // 2) 컨텍스트
    let nodeForFallback = session.state?.node ?? 'start';
    let flagsForFallback = session.state?.flags ?? [];
    let ctx: ReturnType<typeof buildContext> extends Promise<infer T>
      ? T
      : ReturnType<typeof buildContext>;

    try {
      ctx = await Promise.resolve(
        buildContext({ caseId: dto.caseId, npcId: dto.npcId, session }),
      );
      nodeForFallback = ctx.npc.node;
      flagsForFallback = ctx.npc.flags;
    } catch (e) {
      this.logger.error(`buildContext failed: ${toLogMessage(e)}`);
      const fb = makeFallback({
        sessionId,
        npcId: dto.npcId,
        userText,
        node: nodeForFallback,
        flags: flagsForFallback,
        message: '해당 인물/상태를 찾을 수 없습니다.',
      });
      await Promise.resolve(
        this.sessions.append(sessionId, { from: 'npc', text: fb.reply }),
      ).catch(() => void 0);
      return fb;
    }

    // 3) 캐시
    const cacheKey = makeKey({
      caseId: dto.caseId,
      npcId: dto.npcId,
      node: ctx.npc.node,
      flags: ctx.npc.flags,
      q: userText,
    });
    const cached = replyCache.get(cacheKey);
    if (cached) {
      await Promise.resolve(
        this.sessions.append(sessionId, { from: 'npc', text: cached.reply }),
      ).catch(() => void 0);
      return cached;
    }

    // 4) 프롬프트
    const system = makeSystemPrompt();
    const developerCtx = makeDeveloperContext(ctx);

    // 5) LLM + 검증
    try {
      const raw = await callLLMWithTools({ system, developerCtx, userText });

      // 5-1) 원본을 스키마로 1차 검증
      const base = ensureNpcReply(raw);

      // 5-2) 허용된 키만 복사(추가 필드 제거) + 메타 보강
      const json: NpcReplyV1 = {
        api_version: API_VERSION,
        schema_version: SCHEMA_VERSION,
        session_id: sessionId,
        message_id: randomUUID(),
        npc: base.npc,
        reply: base.reply,
        intent: base.intent,
        tone: base.tone,
        confidence: base.confidence,
        facts_used: base.facts_used ?? [],
        state: base.state,
        ...(base.choices ? { choices: base.choices } : null),
      };

      await Promise.resolve(
        this.sessions.append(sessionId, { from: 'npc', text: json.reply }),
      ).catch(() => void 0);

      if (json.state?.node) {
        await Promise.resolve(
          this.sessions.setState(sessionId, json.state),
        ).catch(() => void 0);
      }

      replyCache.set(cacheKey, json);
      return json;
    } catch (e) {
      this.logger.error(`LLM/validate failed: ${toLogMessage(e)}`);
      const fb = makeFallback({
        sessionId,
        npcId: dto.npcId,
        userText,
        node: nodeForFallback,
        flags: flagsForFallback,
        npcName: ctx?.npc?.name,
        npcRole: ctx?.npc?.role,
      });
      await Promise.resolve(
        this.sessions.append(sessionId, { from: 'npc', text: fb.reply }),
      ).catch(() => void 0);
      return fb;
    }
  }
}
