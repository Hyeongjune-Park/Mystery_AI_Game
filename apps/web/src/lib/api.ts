// 프런트에서 직접 메시지만 전송 (세션ID는 클라이언트가 생성/보관)
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export type SendPayload = {
  caseId: string;
  npcId: string;
  text: string;
};

export type NpcReply = {
  reply: string;           // ← 백엔드가 반환하는 필드명은 reply
  [k: string]: unknown;
};

export async function sendMessage(
  sessionId: string,
  payload: SendPayload
): Promise<NpcReply> {
  const r = await fetch(`${BASE}/sessions/${encodeURIComponent(sessionId)}/message`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const msg = await r.text().catch(() => r.statusText);
    throw new Error(`sendMessage failed: ${r.status} ${msg}`);
  }
  return (await r.json()) as NpcReply;
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:3001';