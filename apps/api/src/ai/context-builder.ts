/**
 * apps/api/src/ai/context-builder.ts
 * - 세션/케이스 상태를 모아 LLM에 줄 컨텍스트를 구성
 * - 비동기 아님(require-await 방지)
 * - 정확한 타입으로 no-unsafe-* 방지
 */
import {
  Cases,
  type CaseDef,
  type NpcDef,
  type Evidence,
} from '../cases/memory';

type SessionLike = {
  state?: { node?: string; flags?: string[] };
  logs?: Array<{ from: 'player' | 'npc'; text: string }>;
};

export type BuiltContext = {
  caseId: string;
  summary: string;
  timeline: string[];
  evidence: Evidence[];
  npc: {
    id: string;
    name: string;
    role: string;
    persona: string;
    node: string;
    flags: string[];
  };
  lastTurns: Array<{ from: 'player' | 'npc'; text: string }>;
};

export function buildContext({
  caseId,
  npcId,
  session,
}: {
  caseId: string;
  npcId: string;
  session: SessionLike;
}): BuiltContext {
  const c: CaseDef | undefined = Cases[caseId];
  if (!c) throw new Error(`Unknown caseId: ${caseId}`);

  const npcRaw: NpcDef | undefined = c.npcs[npcId];
  if (!npcRaw) throw new Error(`Unknown npcId: ${npcId}`);

  const node = session.state?.node ?? npcRaw.stateMachine.start;
  const flags = session.state?.flags ?? [];
  const lastTurns = (session.logs ?? []).slice(-6);

  return {
    caseId,
    summary: c.summary,
    timeline: c.timeline,
    evidence: c.evidence,
    npc: {
      id: npcId,
      name: npcRaw.name,
      role: npcRaw.role,
      persona: npcRaw.persona,
      node,
      flags,
    },
    lastTurns,
  };
}
