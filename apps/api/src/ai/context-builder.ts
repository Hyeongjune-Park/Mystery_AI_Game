/**
 * apps/api/src/ai/context-builder.ts
 * - 세션/케이스 상태를 모아 LLM에 줄 컨텍스트를 구성
 * - NPC 데이터는 JSON 파일에서 동적으로 로드 (최대 15명)
 */
import { Cases, type CaseDef, type Evidence } from '../cases/memory';
import * as fs from 'fs';
import * as path from 'path';

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

/**
 * NPC 데이터를 JSON 파일에서 로드
 */
function loadNpcData(caseId: string, npcId: string): any {
  const casesPath = path.join(process.cwd(), '..', '..', 'cases');
  const npcsJsonPath = path.join(casesPath, caseId, 'npcs.json');

  try {
    const fileContents = fs.readFileSync(npcsJsonPath, 'utf8');
    const npcs = JSON.parse(fileContents);

    if (!Array.isArray(npcs)) {
      throw new Error('npcs.json must be an array');
    }

    const npc = npcs.find((n) => n.id === npcId);
    if (!npc) {
      throw new Error(`NPC ${npcId} not found in npcs.json`);
    }

    return npc;
  } catch (error) {
    throw new Error(`Failed to load NPC data: ${error}`);
  }
}

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

  // ✅ NPC 데이터를 JSON 파일에서 동적으로 로드
  const npcData = loadNpcData(caseId, npcId);

  // 기본 node는 'initial' (npcs.json에 stateMachine이 없을 수 있음)
  const defaultNode = 'initial';
  const node = session.state?.node ?? defaultNode;
  const flags = session.state?.flags ?? [];
  const lastTurns = (session.logs ?? []).slice(-6);

  return {
    caseId,
    summary: c.summary,
    timeline: c.timeline,
    evidence: c.evidence,
    npc: {
      id: npcId,
      name: npcData.displayName || npcData.name,
      role: npcData.role,
      persona: npcData.persona,
      node,
      flags,
    },
    lastTurns,
  };
}
