/**
 * 플레이어 발화 → 컨텍스트 구성 → LLM 호출(tools) → 검증 → 세션 반영 → JSON 반환
 * 실패해도 항상 200 + NpcReplyV1 폴백으로 응답하여 UX가 끊기지 않도록 보호
 */
import {
  Body,
  Controller,
  Logger,
  Param,
  Post,
  Get,
  Query,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { SessionsService } from '../sessions/sessions.service';
import { buildContext } from '../ai/context-builder';
import { makeDeveloperContext, makeSystemPrompt } from '../ai/prompts';
import { callLLMWithTools } from '../ai/openai.tools';
import { ensureNpcReply } from '../ai/validate';
import type { NpcReplyV1 } from '../ai/schema';
import { INTENT_FALLBACK } from '../ai/schema';
import { LRU, makeKey } from '../ai/cache';
import { computeDramaticChoices } from '../ai/choices';
import { FlowEvaluatorService } from '../flow/flow-evaluator.service';
import { storyLoader } from '../cases/story.loader';

const replyCache = new LRU<NpcReplyV1>(200);

/** 응답 타입: NPC 답변 + 트리거된 액션들 */
type MessageResponse = NpcReplyV1 & {
  triggeredActions?: any[];
};
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
  choicesHint?: { id: string; label: string; hint?: string }[]; // ✅ 선택지(조건부)
}): NpcReplyV1 {
  const {
    sessionId,
    npcId,
    node,
    flags,
    message,
    npcName,
    npcRole,
    choicesHint,
  } = params;

  const base: NpcReplyV1 = {
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

  // ✅ any 멤버접근 없이 안전하게 병합
  return choicesHint && choicesHint.length > 0
    ? { ...base, choices: choicesHint }
    : base;
}

@Controller()
export class MessagesController {
  private readonly logger = new Logger(MessagesController.name);

  constructor(
    private readonly sessions: SessionsService,
    private readonly flowEvaluator: FlowEvaluatorService,
  ) {}

  @Post('/sessions/:id/message')
  async handle(
    @Param('id') sessionId: string,
    @Body() body: unknown,
  ): Promise<MessageResponse> {
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
    const dto: MessageDto = body;
    const userText =
      dto.text.length > 1_000 ? `${dto.text.slice(0, 1_000)}…` : dto.text;

    // 1) 세션 + 플레이어 로그
    const session = await Promise.resolve(
      this.sessions.getOrCreate(sessionId, dto.caseId),
    );
    await Promise.resolve(
      this.sessions.append(sessionId, { from: 'player', text: userText }),
    ).catch((e) =>
      this.logger.warn(`append(player) failed: ${toLogMessage(e)}`),
    );

    // 1-1) 턴 증가
    const currentTurn = await this.sessions.incrementTurn(sessionId);
    this.logger.log(`Turn ${currentTurn} for session ${sessionId}`);

    // 1-2) 완료된 조사 체크 및 시스템 메시지 생성
    const completedInvestigations = await this.sessions.getCompletedInvestigations(sessionId);
    for (const investigation of completedInvestigations) {
      // 시스템 메시지 생성
      await this.sessions.append(
        sessionId,
        {
          from: 'system',
          text: investigation.notificationMessage,
        },
        {
          type: 'investigation_complete',
          requestId: investigation.id,
          clueRevealed: investigation.clueToReveal,
        },
      );

      // 조사 상태 업데이트
      await this.sessions.updateInvestigationStatus(
        sessionId,
        investigation.id,
        'ready',
      );

      // 미확인 메시지 카운트 증가
      await this.sessions.incrementUnreadMessages(sessionId, investigation.npcId);

      // 단서 공개
      await this.sessions.addClue(sessionId, investigation.clueToReveal);

      this.logger.log(
        `Investigation ${investigation.id} completed: ${investigation.clueToReveal}`,
      );
    }

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
        choicesHint: computeDramaticChoices({
          node: nodeForFallback,
          flags: flagsForFallback,
        }),
      });
      await Promise.resolve(
        this.sessions.append(sessionId, { from: 'npc', text: fb.reply }, fb),
      ).catch(() => void 0);

      // ✅ Flow 트리거 평가 (buildContext 실패 시에도 실행)
      let triggeredActions: any[] = [];
      try {
        const flowConfig = storyLoader.loadFlowConfig(dto.caseId);
        const gameState = await this.flowEvaluator.loadGameState(sessionId);
        const actions = await this.flowEvaluator.evaluateTriggers(
          flowConfig,
          gameState,
        );

        for (const action of actions) {
          const result = await this.flowEvaluator.executeAction(
            action,
            sessionId,
          );
          if (result) {
            triggeredActions.push(result);
          }
        }

        if (triggeredActions.length > 0) {
          this.logger.log(
            `Triggered ${triggeredActions.length} actions for session ${sessionId}`,
          );
        }
      } catch (flowError) {
        this.logger.warn(`Flow evaluation failed: ${toLogMessage(flowError)}`);
      }

      return { ...fb, triggeredActions };
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
        this.sessions.append(
          sessionId,
          { from: 'npc', text: cached.reply },
          cached,
        ),
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

      // 5-2) 드라마틱 선택지(모델이 안 줬을 때만 제공)
      const dramatic = computeDramaticChoices({
        node: base.state?.node ?? ctx.npc.node,
        flags: base.state?.flags ?? ctx.npc.flags,
      });

      // 5-3) 허용된 키만 복사(추가 필드 제거) + 메타 보강
      const mergedChoices = base.choices ?? dramatic;

      const replyObj: NpcReplyV1 = {
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
        ...(mergedChoices ? { choices: mergedChoices } : {}), // ✅ 타입 안전
      };

      await Promise.resolve(
        this.sessions.append(
          sessionId,
          { from: 'npc', text: replyObj.reply },
          replyObj,
        ),
      ).catch(() => void 0);

      if (replyObj.state?.node) {
        await Promise.resolve(
          this.sessions.setState(sessionId, replyObj.state),
        ).catch(() => void 0);
      }

      // 조사 의뢰 처리
      if (base.investigation_request) {
        const req = base.investigation_request;

        const investigationRequest = {
          id: randomUUID(),
          type: req.type,
          requestedAt: currentTurn,
          completesAt: currentTurn + req.duration_turns,
          clueToReveal: req.clue_to_reveal,
          npcId: dto.npcId,
          status: 'pending' as const,
          notificationMessage: `${req.description} 결과가 나왔습니다.`,
        };

        await this.sessions.addInvestigationRequest(sessionId, investigationRequest);
        this.logger.log(
          `Investigation request created: ${investigationRequest.id} (${req.type}, completes at turn ${investigationRequest.completesAt})`,
        );
      }

      replyCache.set(cacheKey, replyObj);

      // ✅ Flow 트리거 평가
      let triggeredActions: any[] = [];
      try {
        const flowConfig = storyLoader.loadFlowConfig(dto.caseId);
        const gameState = await this.flowEvaluator.loadGameState(sessionId);
        const actions = await this.flowEvaluator.evaluateTriggers(
          flowConfig,
          gameState,
        );

        // 액션 실행 및 결과 수집
        for (const action of actions) {
          const result = await this.flowEvaluator.executeAction(
            action,
            sessionId,
          );
          if (result) {
            triggeredActions.push(result);
          }
        }

        if (triggeredActions.length > 0) {
          this.logger.log(
            `Triggered ${triggeredActions.length} actions for session ${sessionId}`,
          );
        }
      } catch (flowError) {
        this.logger.warn(`Flow evaluation failed: ${toLogMessage(flowError)}`);
        // Flow 에러는 무시하고 계속 진행
      }

      return { ...replyObj, triggeredActions };
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
        choicesHint: computeDramaticChoices({
          node: nodeForFallback,
          flags: flagsForFallback,
        }),
      });
      await Promise.resolve(
        this.sessions.append(sessionId, { from: 'npc', text: fb.reply }, fb),
      ).catch(() => void 0);

      // ✅ Flow 트리거 평가 (fallback path에서도 실행)
      let triggeredActions: any[] = [];
      try {
        const flowConfig = storyLoader.loadFlowConfig(dto.caseId);
        const gameState = await this.flowEvaluator.loadGameState(sessionId);
        const actions = await this.flowEvaluator.evaluateTriggers(
          flowConfig,
          gameState,
        );

        for (const action of actions) {
          const result = await this.flowEvaluator.executeAction(
            action,
            sessionId,
          );
          if (result) {
            triggeredActions.push(result);
          }
        }

        if (triggeredActions.length > 0) {
          this.logger.log(
            `Triggered ${triggeredActions.length} actions for session ${sessionId}`,
          );
        }
      } catch (flowError) {
        this.logger.warn(`Flow evaluation failed: ${toLogMessage(flowError)}`);
      }

      return { ...fb, triggeredActions };
    }
  }

  // 타임라인 유지
  @Get('/sessions/:id/timeline')
  async timeline(
    @Param('id') sessionId: string,
    @Query('limit') limit?: string,
  ): Promise<{
    sessionId: string;
    items: Array<{ at: string; from: 'player' | 'npc' | 'system'; text: string }>;
  }> {
    const n = Math.min(Math.max(Number(limit ?? '50'), 1), 200);
    const items = await this.sessions.listTimeline(sessionId, n);
    return {
      sessionId,
      items: items.map((i) => ({ ...i, at: i.at.toISOString() })),
    };
  }
}
