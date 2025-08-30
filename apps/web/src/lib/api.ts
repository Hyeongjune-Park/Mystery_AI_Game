// apps/web/src/lib/api.ts
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
if (!BASE) {
  // 빌드/런타임에 BASE 없을 때 디버깅용
  // eslint-disable-next-line no-console
  console.warn('NEXT_PUBLIC_API_BASE_URL is not set');
}

export async function createSession(userId: string, caseId: string) {
  const r = await fetch(`${BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, caseId }),
  });
  if (!r.ok) throw new Error(`createSession failed: ${r.status}`);
  return (await r.json()) as { id: string };
}

export async function sendMessage(sessionId: string, text: string) {
  const r = await fetch(`${BASE}/sessions/${sessionId}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!r.ok) throw new Error(`sendMessage failed: ${r.status}`);
  return (await r.json()) as { npc_reply: string };
}
