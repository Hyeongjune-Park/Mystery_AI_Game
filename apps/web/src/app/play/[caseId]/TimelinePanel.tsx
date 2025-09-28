'use client';

import { useEffect, useState } from 'react';
import { fetchTimeline } from "@/lib/api";

type Item = { at: string; from: 'player' | 'npc'; text: string };

export default function TimelinePanel({ sessionId }: { sessionId: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let canceled = false;
    const fetcher = async () => {
      setLoading(true);
      try {
        const base = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
        const res = await fetchTimeline(sessionId, 100);
        setItems(res.items ?? []);
        const json = await res.json();
        if (!canceled) setItems(json.items ?? []);
      } catch {
        // noop
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    fetcher();
    const t = setInterval(fetcher, 3000); // 3초마다 갱신
    return () => { canceled = true; clearInterval(t); };
  }, [sessionId]);

  return (
    <div className="p-3 border rounded-xl text-sm space-y-2 max-h-80 overflow-auto">
      <div className="font-semibold">Timeline</div>
      {loading && <div>Loading…</div>}
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <span className="shrink-0 tabular-nums">{new Date(it.at).toLocaleTimeString()}</span>
          <span className={`shrink-0 uppercase ${it.from === 'player' ? 'text-blue-600' : 'text-emerald-600'}`}>
            {it.from}
          </span>
          <span className="break-words">{it.text}</span>
        </div>
      ))}
    </div>
  );
}
