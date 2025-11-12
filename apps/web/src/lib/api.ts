// apps/web/src/lib/api.ts
/**
 * 클라이언트는 무조건 상대경로 '/api/proxy/*'만 사용.
 * 실제 백엔드 위치는 서버에서 route.ts가 환경변수로 해석해 연결.
 */

type SendMessageDto = { caseId: string; npcId: string; text: string };

export type NpcReplyLite = {
  reply: string;
  state?: { node?: string; flags?: string[] };
  choices?: { id: string; text: string }[]; // ✅ 드라마틱 선택지(조건부)
};

export async function sendMessage(sessionId: string, dto: SendMessageDto) {
  const res = await fetch(`/api/proxy/sessions/${encodeURIComponent(sessionId)}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`sendMessage failed: ${res.status}`);
  return (await res.json()) as NpcReplyLite;
}

export async function fetchTimeline(sessionId: string, limit = 100) {
  const res = await fetch(`/api/proxy/sessions/${encodeURIComponent(sessionId)}/timeline?limit=${limit}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`fetchTimeline failed: ${res.status}`);
  return await res.json();
}
