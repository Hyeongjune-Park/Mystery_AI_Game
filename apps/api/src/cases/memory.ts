/**
 * apps/api/src/cases/memory.ts
 * - 케이스 기본 정보만 정의 (NPC 정보는 JSON 파일에서 로드)
 * - NPC는 최대 15명까지 지원
 */

export interface Evidence {
  id: string;
  title: string;
  reliability: number;
  note?: string;
}

export interface NpcDef {
  id: string;
  displayName: string;
  role: string;
  persona: string;
  personality?: {
    traits: string[];
    speechPattern: string;
    emotionalRange: string[];
  };
  knowledge?: {
    knows: string[];
    ignores: string[];
    smallClues: string[];
  };
  deception?: {
    allowed: boolean;
    maxLies?: number;
    currentLies?: number;
  };
  lies?: any[];
  stateChanges?: any[];
  hintBehavior?: any;
}

export interface CaseDef {
  summary: string;
  timeline: string[];
  evidence: Evidence[];
  npcs: Record<string, NpcDef>; // 동적으로 JSON에서 로드됨
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
    npcs: {}, // ✅ JSON 파일에서 동적으로 로드될 것 (최대 15명)
  },
};
