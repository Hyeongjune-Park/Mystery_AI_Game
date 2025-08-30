// apps/web/src/app/play/[caseId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createSession, sendMessage } from '@/lib/api';

export default function PlayPage({ params }: { params: { caseId: string } }) {
  const [sessionId, setSessionId] = useState<string>();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ who: 'you'|'npc'; text: string }[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string|undefined>(undefined);
  useEffect(() => {
    (async () => {
      const s = await createSession('dev-user', params.caseId);
      setSessionId(s.id);
    })();
  }, [params.caseId]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionId || !input.trim() || pending) return;
    setError(undefined);
    setPending(true);
    const text = input.trim();
    setMessages(m => [...m, { who: 'you', text }]);
    setInput('');
    try {
      const res = await sendMessage(sessionId, text);
      setMessages(m => [...m, { who: 'npc', text: res.npc_reply }]);
    } catch (err:any) {
      setError(err?.message ?? 'send failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Case: {params.caseId}</h1>
      <div className="border rounded-xl p-4 h-[60vh] overflow-auto space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={m.who === 'you' ? 'text-right' : 'text-left'}>
            <span className={`inline-block px-3 py-2 rounded-2xl ${m.who === 'you' ? 'bg-gray-200' : 'bg-gray-100'}`}>
              {m.text}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={onSend} className="flex gap-2">
        <input
          className="flex-1 border rounded-xl px-3 py-2"
          placeholder={sessionId ? '메시지를 입력...' : '세션 만드는 중...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!sessionId}
        />
        <button className="px-4 py-2 rounded-xl border" disabled={!sessionId || !input.trim() || pending}>
          Send
        </button>{error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </main>
  );
}
