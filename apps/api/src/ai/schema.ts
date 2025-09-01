// NPC Reply 타입, 기본값 상수, AJV 스키마를 한 파일에서 export

/** 모델이 의도를 못 맞췄을 때 사용할 안전 기본 intent */
export const INTENT_FALLBACK = 'unknown';

// 상단에 추가
export const SCHEMA_VERSION = 'npc_reply@1' as const;
export const API_VERSION = '2025-08-30' as const; // 프로젝트가 쓰는 값으로 맞춰도 됨

/** 런타임에서 사용하는 NPC Reply 타입(스키마와 1:1 대응) */
export interface NpcReplyV1 {
  api_version: string;
  schema_version: typeof SCHEMA_VERSION;
  session_id: string;
  message_id: string;
  npc: {
    id: string;
    name: string;
    role: string;
  };
  reply: string;
  intent: string; // 의도 값은 모델에 따라 다양할 수 있어 string으로 둠
  tone: string;
  confidence: number; // 0..1
  facts_used: string[];
  state: {
    node: string;
    flags: string[];
  };
  choices?: Array<{
    id: string;
    label: string;
    hint?: string;
  }>;
}

/** AJV 검증용 JSON 스키마 (defaults 포함) */
export const NpcReplyJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    api_version: { type: 'string' },
    schema_version: { type: 'string', const: 'npc_reply@1' },
    session_id: { type: 'string' },
    message_id: { type: 'string' },
    npc: {
      type: 'object',
      additionalProperties: false,
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string' },
      },
      required: ['id', 'name', 'role'],
    },
    reply: { type: 'string' },
    intent: { type: 'string' },
    tone: { type: 'string' },
    confidence: { type: 'number' },
    facts_used: { type: 'array', items: { type: 'string' }, default: [] },
    state: {
      type: 'object',
      additionalProperties: false,
      properties: {
        node: { type: 'string' },
        flags: { type: 'array', items: { type: 'string' }, default: [] },
      },
      required: ['node', 'flags'],
    },
    choices: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          hint: { type: 'string' },
        },
        required: ['id', 'label'],
      },
    },
  },
  required: [
    'api_version',
    'schema_version',
    'session_id',
    'message_id',
    'npc',
    'reply',
    'intent',
    'tone',
    'confidence',
    'facts_used',
    'state',
  ],
} as const;
