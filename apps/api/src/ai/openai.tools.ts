// apps/api/src/ai/openai.tools.ts
import 'dotenv/config';
import OpenAI from 'openai';
import { NpcReplyJsonSchema, type NpcReplyV1 } from './schema';

const MODEL = process.env.MODEL_NAME ?? 'gpt-4o-mini';
const DEBUG = process.env.DEBUG_AI === '1';
const SCHEMA_VERSION = 'npc_reply@1' as const;

/** OpenAI Chat Completions용 도구 스키마 */
const returnNpcReplyTool = {
  type: 'function',
  function: {
    name: 'return_npc_reply',
    description: '최종 NPC 응답을 스키마에 맞춰 반환한다.',
    parameters: NpcReplyJsonSchema,
  },
} as const satisfies OpenAI.Chat.Completions.ChatCompletionTool;

/** 클라이언트 지연 생성 (키 없으면 명확히 에러) */
function getClient(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is missing');
  return new OpenAI({ apiKey: key });
}

/** 툴콜 타입가드에 사용할 최소 구조 타입 */
type ReturnNpcReplyCall = {
  type: 'function';
  function: { name: string; arguments: string };
};

/** tool_calls 배열에서 우리가 원하는 함수콜인지 검증 */
function isReturnNpcReplyCall(x: unknown): x is ReturnNpcReplyCall {
  if (x === null || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  if (o.type !== 'function') return false;

  const f = o.function;
  if (f === null || typeof f !== 'object') return false;
  const fn = f as Record<string, unknown>;
  return typeof fn.name === 'string' && typeof fn.arguments === 'string';
}

/** DEBUG 모드에서 스키마에 정확히 맞는 값 반환 */
function makeDebugReply(userText: string): NpcReplyV1 {
  return {
    api_version: '2025-08-30',
    schema_version: SCHEMA_VERSION,
    session_id: 'debug-session',
    message_id: 'debug-message',
    npc: { id: 'suspect-minseo', name: '박민서', role: '용의자' },
    reply: userText.trim()
      ? `(${userText.trim()}) 에 대한 테스트 응답입니다.`
      : '테스트 응답입니다.',
    intent: 'greet', // ← schema.ts의 Intent에 포함된 값 사용
    tone: 'neutral',
    confidence: 0.7,
    facts_used: [],
    state: { node: 'deny', flags: [] },
    choices: [],
  };
}

/** LLM 호출(도구 강제) + 안전 파싱 */
export async function callLLMWithTools(params: {
  system: string;
  developerCtx: string;
  userText: string;
}): Promise<unknown> {
  const { system, developerCtx, userText } = params;

  if (process.env.DEBUG_AI === '1') {
    // 디버그 모드일 땐 너희 프로젝트의 더미 응답 함수 사용
    return makeDebugReply(userText);
  }

  const client = getClient();

  const chat = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.6,
    tools: [returnNpcReplyTool],
    tool_choice: { type: 'function', function: { name: 'return_npc_reply' } },
    messages: [
      {
        role: 'system',
        content: [
          system,
          'OUTPUT RULES:',
          '- You MUST call the `return_npc_reply` tool.',
          '- All keys must be snake_case exactly as the schema.',
          '- Always include `state` with both `node` and `flags` (use [] if none).',
          '- Do NOT add fields outside the schema.',
          '- If unsure, return safe defaults that satisfy the schema.',
        ].join('\n'),
      },
      { role: 'developer', content: developerCtx },
      { role: 'user', content: `[PLAYER]: ${userText}` },
    ],
  });

  // tool_calls 안전 접근
  const toolCallsUnknown: unknown = chat.choices?.[0]?.message?.tool_calls;
  const calls: unknown[] = Array.isArray(toolCallsUnknown)
    ? toolCallsUnknown
    : [];

  const call = calls.find(isReturnNpcReplyCall);
  if (!call) {
    throw new Error('NO_TOOL_CALL: return_npc_reply was not produced.');
  }

  const argsText = call.function.arguments; // 이미 string으로 보장됨

  // JSON.parse는 any를 반환 → 즉시 unknown으로 고정
  try {
    const parsed: unknown = JSON.parse(argsText) as unknown;
    return parsed;
  } catch (e) {
    // e는 unknown → 문자열화해서 안전하게 로깅
    if (process.env.NODE_ENV !== 'production') {
      const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
      // eslint-disable-next-line no-console
      console.error('[LLM] JSON.parse failed:', msg);
      // eslint-disable-next-line no-console
      console.error('[LLM] argsText snapshot:', argsText.slice(0, 500));
    }
    throw new Error('BAD_ARGS_JSON: Invalid tool arguments JSON.');
  }
}
