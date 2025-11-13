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
    summary: '서울 강남구 타워팰리스에서 발생한 살인사건. 피해자는 김민수(45세).',
    timeline: ['23:00 이웃 소음 목격', '23:15 역 CCTV 박민서 포착', '23:40 추정 범행 시간'],
    evidence: [
      {
        id: 'bloody_knife',
        title: '피묻은 칼',
        reliability: 0.9,
        note: '서랍에서 발견',
      },
      {
        id: 'cctv',
        title: '역 CCTV 영상',
        reliability: 0.8,
        note: '23:15 박민서 포착',
      },
    ],
    npcs: {
      'npc.detective.doil': {
        name: '도일 형사',
        role: '조력자',
        persona: '냉철하고 논리적인 베테랑 형사. 플레이어를 조력하며 힌트를 제공한다.',
        stateMachine: { start: 'initial' },
      },
      'npc.suspect.minseo': {
        name: '박민서',
        role: '용의자',
        persona: '피해자의 전 연인. 겉으로는 침착하지만 내면은 불안하고 방어적이다.',
        stateMachine: { start: 'deny' },
      },
      'npc.witness.neighbor': {
        name: '이웃 주민',
        role: '증인',
        persona: '사건 당일 밤 소음을 들은 이웃. 정확한 정보를 제공한다.',
        stateMachine: { start: 'initial' },
      },
      'npc.friend.suji': {
        name: '이수진',
        role: '지인',
        persona: '피해자와 박민서의 공통 친구. 두 사람의 관계에 대해 알고 있다.',
        stateMachine: { start: 'initial' },
      },
    },
  },
};
