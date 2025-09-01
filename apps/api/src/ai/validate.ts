/* eslint-disable no-console */
// AJV 기반 검증 + 보정 유틸 (ESLint 엄격 설정 대응 버전)

import Ajv, { type AnySchema } from 'ajv';
import addFormats from 'ajv-formats';
import {
  NpcReplyJsonSchema,
  SCHEMA_VERSION,
  API_VERSION,
  type NpcReplyV1,
  INTENT_FALLBACK,
} from './schema';

const DEBUG = process.env.DEBUG_AI_LOG === '1';

// 객체에 특정 키가 '자체 소유'로 존재함을 좁혀주는 타입가드
function hasProp<K extends PropertyKey>(
  obj: Record<string, unknown>,
  key: K,
): obj is Record<string, unknown> & Record<K, unknown> {
  // NOTE: call(...)은 반환타입이 any라 no-unsafe-return에 걸릴 수 있으므로
  // !! 로 boolean 단언을 하여 최종 반환 타입을 명확히 boolean으로 만듭니다.
  return !!Object.prototype.hasOwnProperty.call(obj, key);
}

/** 객체 타입가드 */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

/** 문자열 배열 보정용 */
function toStringArray(input: unknown): string[] {
  if (Array.isArray(input))
    return input.filter((x): x is string => typeof x === 'string');
  if (typeof input === 'string') return [input];
  return [];
}

/** 긴 문자열 안전 로깅 */
function safeStringify(x: unknown, limit = 1200): string {
  try {
    const s = JSON.stringify(x);
    return s.length > limit ? `${s.slice(0, limit)}…` : s;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return `[unserializable: ${msg}]`;
  }
}

/** 문자열 자르기 */
function crop(s: string, n = 800): string {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  // 문자열 숫자/단일 값을 스키마 타입에 맞게 안전 변환
  coerceTypes: 'array',
  // 스키마에 없는 필드는 제거
  removeAdditional: 'all',
  // default 값을 스키마에서 적용
  useDefaults: true,
});
addFormats(ajv);
// AnySchema 캐스팅은 ajv 타입 한계를 피하기 위한 것(스키마는 리터럴 객체로 안전)
const validate = ajv.compile(NpcReplyJsonSchema as unknown as AnySchema);

/** 루트/하위 객체의 허용 키만 남기기 (추가 필드 제거의 2중 안전망) */
function prune(o: Record<string, unknown>): void {
  const keepRoot = new Set([
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
    'choices',
  ]);
  Object.keys(o).forEach((k) => {
    if (!keepRoot.has(k)) delete o[k];
  });

  if (isRecord(o.npc)) {
    const npc = o.npc;
    const keepNpc = new Set(['id', 'name', 'role']);
    Object.keys(npc).forEach((k) => {
      if (!keepNpc.has(k)) delete npc[k];
    });
  }

  if (isRecord(o.state)) {
    const st = o.state;
    const keepState = new Set(['node', 'flags']);
    Object.keys(st).forEach((k) => {
      if (!keepState.has(k)) delete st[k];
    });
  }

  if (Array.isArray(o.choices)) {
    o.choices = o.choices
      .map((c) => (isRecord(c) ? c : null))
      .filter((c): c is Record<string, unknown> => c !== null)
      .map((c) => {
        const keepChoice = new Set(['id', 'label', 'hint']);
        Object.keys(c).forEach((k) => {
          if (!keepChoice.has(k)) delete c[k];
        });
        return c;
      });
  }
}

/** LLM 산출물 정규화(스키마 일탈 흡수) */
export function normalizeCandidate(x: unknown): unknown {
  if (!isRecord(x)) return x;
  const o: Record<string, unknown> = { ...x };

  // camelCase → snake_case 보정
  if (
    !('api_version' in o) &&
    hasProp(o, 'apiVersion') &&
    o.apiVersion !== undefined
  ) {
    o.api_version = o.apiVersion;
  }
  if (
    !('schema_version' in o) &&
    hasProp(o, 'schemaVersion') &&
    o.schemaVersion !== undefined
  ) {
    o.schema_version = o.schemaVersion;
  }
  if (
    !('session_id' in o) &&
    hasProp(o, 'sessionId') &&
    o.sessionId !== undefined
  ) {
    o.session_id = o.sessionId;
  }
  if (
    !('message_id' in o) &&
    hasProp(o, 'messageId') &&
    o.messageId !== undefined
  ) {
    o.message_id = o.messageId;
  }
  if (
    !('facts_used' in o) &&
    hasProp(o, 'factsUsed') &&
    o.factsUsed !== undefined
  ) {
    o.facts_used = o.factsUsed;
  }

  // api_version 비어있으면 기본값
  if (typeof o.api_version !== 'string' || o.api_version.trim() === '') {
    o.api_version = API_VERSION;
  }

  // ✅ schema_version은 값이 다르면 'npc_reply@1'로 강제
  if (o.schema_version !== SCHEMA_VERSION) {
    o.schema_version = SCHEMA_VERSION;
  }

  // npc 기본값 및 타입 보정
  const npc = isRecord(o.npc) ? { ...o.npc } : {};
  if (typeof npc.id !== 'string') npc.id = 'unknown';
  if (typeof npc.name !== 'string') npc.name = 'NPC';
  if (typeof npc.role !== 'string') npc.role = 'npc';
  o.npc = npc;

  // state 기본값 및 타입 보정
  const st = isRecord(o.state) ? { ...o.state } : {};
  if (typeof st.node !== 'string') st.node = 'start';
  st.flags = toStringArray(st.flags);
  o.state = st;

  // intent 안전값
  if (typeof o.intent !== 'string' || o.intent.trim().length === 0) {
    o.intent = INTENT_FALLBACK;
  }

  // reply 보정 (객체 → JSON, 원시값은 String)
  if (typeof o.reply !== 'string') {
    if (o.reply === null || o.reply === undefined) {
      o.reply = '';
    } else if (typeof o.reply === 'number' || typeof o.reply === 'boolean') {
      o.reply = String(o.reply);
    } else {
      try {
        o.reply = JSON.stringify(o.reply);
      } catch {
        o.reply = '';
      }
    }
  }

  // confidence: 문자열→숫자, 범위 클램프
  const raw =
    typeof o.confidence === 'string' ? Number(o.confidence) : o.confidence;
  const num = typeof raw === 'number' && Number.isFinite(raw) ? raw : 0.6;
  o.confidence = Math.max(0, Math.min(1, num));

  // facts_used: 배열화
  o.facts_used = toStringArray(o.facts_used);

  // choices: 잘못된 항목 제거
  if (Array.isArray(o.choices)) {
    o.choices = o.choices
      .map((c) => (isRecord(c) ? c : null))
      .filter((c): c is Record<string, unknown> => {
        return (
          c !== null && typeof c.id === 'string' && typeof c.label === 'string'
        );
      });
  }

  // 불필요 필드 제거
  prune(o);
  return o;
}

/** AJV 스키마 강제 통과 */
export function ensureNpcReply(x: unknown): NpcReplyV1 {
  const fixed = normalizeCandidate(x);
  const ok = validate(fixed);
  if (!ok) {
    if (DEBUG) {
      // 세부 에러와 값을 함께 출력해 원인 추적을 용이하게 함
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.error('[AJV] errors:', validate.errors);
      console.error('[AJV] value:', crop(safeStringify(fixed)));
    }
    throw new Error('SCHEMA_INVALID');
  }
  return fixed as NpcReplyV1;
}
