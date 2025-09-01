/**
 * apps/api/src/cases/memory.ts
 * - 인메모리 케이스/증거/NPC 설정 (MVP)
 * - 문자열 인덱싱 안전을 위해 강타이핑
 */

export interface Evidence {
  id: string;
  title: string;
  reliability: number;
  note?: string;
}
export interface NpcDef {
  name: string;
  role: string;
  persona: string;
  stateMachine: { start: string };
}
export interface CaseDef {
  summary: string;
  timeline: string[];
  evidence: Evidence[];
  npcs: Record<string, NpcDef>;
}

export const Cases: Record<string, CaseDef> = {
  c001: {
    summary: '피해자 A 사망 사건. 용의자: 박민서(바리스타).',
    timeline: ['22:00 피해자 마지막 목격', '22:30 카페 뒷문 개폐 기록'],
    evidence: [
      {
        id: 'e-cctv',
        title: '카페 뒷문 CCTV',
        reliability: 0.8,
        note: '실루엣 유사',
      },
      {
        id: 'e-receipt',
        title: '커피 영수증',
        reliability: 0.6,
        note: '22:05 결제',
      },
    ],
    npcs: {
      'suspect-minseo': {
        name: '박민서',
        role: '용의자',
        persona: '겉으로 침착하지만 압박에 흔들림. 방어적 화법.',
        stateMachine: { start: 'deny' },
      },
    },
  },
};
