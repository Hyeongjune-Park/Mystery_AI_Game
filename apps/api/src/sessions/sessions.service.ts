/**
 * apps/api/src/sessions/sessions.service.ts
 * - Prisma 기반 세션/메시지 영속 서비스 (TS/ESLint 안전 접근으로 정리)
 */

import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type LogFrom = 'player' | 'npc';
type Log = { from: LogFrom; text: string };

type SessionLike = {
  id: string;
  state?: { node?: string; flags?: string[] };
  logs: Log[];
};

// ---------- 작은 유틸 ----------
function isNonEmptyString(x: unknown): x is string {
  return typeof x === 'string' && x.trim().length > 0;
}

function toStringArray(x: unknown): string[] {
  if (Array.isArray(x))
    return x.filter((v): v is string => typeof v === 'string');
  if (typeof x === 'string') return [x];
  return [];
}

// flags JSON의 안전 접근을 위한 타입/가드
type FlagsJson = { node?: unknown; flags?: unknown };
function isFlagsJson(x: unknown): x is FlagsJson {
  return typeof x === 'object' && x !== null;
}
function readNode(f: FlagsJson): string | undefined {
  return isNonEmptyString(f.node) ? f.node : undefined;
}
function readFlags(f: FlagsJson): string[] {
  return toStringArray(f.flags);
}

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 세션 조회/생성 + 대화 로그 로드
   * - caseCode: 프런트에서 넘겨주는 시나리오 코드(e.g., "c001")
   */
  async getOrCreate(id: string, caseCode?: string): Promise<SessionLike> {
    // 1) 조회
    let session = await this.prisma.session.findUnique({
      where: { id },
      select: { id: true, flags: true },
    });

    // 2) 없으면 생성
    if (!session) {
      const safeCode = isNonEmptyString(caseCode) ? caseCode : '__unknown__';

      session = await this.prisma.session.create({
        data: {
          id,
          flags: {},
          case: {
            connectOrCreate: {
              where: { code: safeCode }, // UNIQUE
              create: { code: safeCode, title: `Case ${safeCode}` },
            },
          },
        },
        select: { id: true, flags: true },
      });
    }

    // 3) 메시지 로드(생성시간 정렬 우선, 실패 시 id 정렬)
    let messages: Array<{ role: string; content: unknown }> = [];
    try {
      messages = await this.prisma.message.findMany({
        where: { sessionId: id },
        orderBy: { createdAt: 'asc' } as Prisma.MessageOrderByWithRelationInput,
        select: { role: true, content: true },
      } as unknown as Prisma.MessageFindManyArgs);
    } catch {
      messages = await this.prisma.message.findMany({
        where: { sessionId: id },
        orderBy: { id: 'asc' },
        select: { role: true, content: true },
      });
    }

    // 4) Log으로 변환 (from의 리터럴 유니온을 유지하도록 캐스팅)
    const logs: Log[] = messages
      .map((m) => {
        const from = (m.role === 'player' ? 'player' : 'npc') as LogFrom; // 🔒 literal 좁히기
        const text =
          typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
        return { from, text };
      })
      // 타입 가드로 filter 결과를 Log로 좁히기
      .filter((l): l is Log => isNonEmptyString(l.text));

    // 5) flags(JSON) → state 복원 (안전 가드로 접근)
    const raw = session.flags as unknown;
    const fj: FlagsJson = isFlagsJson(raw) ? raw : {};
    const node = readNode(fj);
    const flags = readFlags(fj);

    return { id: session.id, state: { node, flags }, logs };
  }

  /**
   * 플레이어/NPC 로그 추가
   */
  async append(id: string, log: Log, payloadJson?: unknown): Promise<void> {
    await this.ensureSession(id);
    await this.prisma.message.create({
      data: {
        sessionId: id,
        role: log.from, // 'player' | 'npc'
        content: log.text,
        payloadJson: payloadJson as Prisma.InputJsonValue | undefined, // ✅
      },
    });
  }

  /**
   * 상태 저장(노드/플래그 → Session.flags JSON)
   */
  async setState(
    id: string,
    state: { node?: string; flags?: string[] },
  ): Promise<void> {
    await this.ensureSession(id);
    const payload: FlagsJson = {
      node: state.node ?? undefined,
      flags: Array.isArray(state.flags) ? state.flags : [],
    };

    await this.prisma.session.update({
      where: { id },
      data: { flags: payload as unknown as Prisma.InputJsonValue },
    });

    // 상태 변경 이력 저장
    await this.prisma.stateSnapshot.create({
      data: {
        sessionId: id,
        flags: payload as unknown as Prisma.InputJsonValue,
        note: state.node ?? null,
      },
    });
  }

  async listTimeline(
    id: string,
    limit = 50,
  ): Promise<Array<{ at: Date; from: Log['from']; text: string }>> {
    const rows = await this.prisma.message.findMany({
      where: { sessionId: id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { createdAt: true, role: true, content: true },
    });
    return rows
      .map((r) => ({
        at: r.createdAt,
        from: (r.role === 'player' ? 'player' : 'npc') as Log['from'],
        text: r.content,
      }))
      .reverse();
  }

  /**
   * 내부 유틸: 세션이 없으면 생성(중복에도 안전)
   */
  private async ensureSession(
    id: string,
    caseCode = '__unknown__',
  ): Promise<void> {
    await this.prisma.session.upsert({
      where: { id },
      create: {
        id,
        flags: {},
        case: {
          connectOrCreate: {
            where: { code: caseCode },
            create: { code: caseCode, title: `Case ${caseCode}` },
          },
        },
      },
      update: { id },
    });
  }
}
