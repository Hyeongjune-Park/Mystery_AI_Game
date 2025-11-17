'use client';

import { useEffect, useState } from 'react';
import { fetchTimeline, type TimelineItem } from "@/lib/api";

interface TimelinePanelProps {
  sessionId: string;
  onUnreadMessagesUpdate?: (unreadByNpc: Record<string, number>) => void;
}

export default function TimelinePanel({ sessionId, onUnreadMessagesUpdate }: TimelinePanelProps) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let canceled = false;
    const fetcher = async () => {
      setLoading(true);
      try {
        const res = await fetchTimeline(sessionId, 100);
        if (!canceled) {
          setItems(res.items ?? []);

          // 시스템 메시지에서 미확인 메시지 카운트 추출
          // TODO: 백엔드에서 직접 unreadMessages를 제공하도록 수정 필요
          // 현재는 임시로 더미 데이터 전송
          if (onUnreadMessagesUpdate) {
            onUnreadMessagesUpdate({});
          }
        }
      } catch {
        // noop
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    fetcher();
    const t = setInterval(fetcher, 3000); // 3초마다 갱신
    return () => { canceled = true; clearInterval(t); };
  }, [sessionId, onUnreadMessagesUpdate]);

  const getMessageStyle = (from: TimelineItem['from']) => {
    switch (from) {
      case 'player':
        return 'text-blue-600';
      case 'npc':
        return 'text-emerald-600';
      case 'system':
        return 'text-amber-500 font-semibold';
      default:
        return 'text-slate-500';
    }
  };

  const getMessageIcon = (from: TimelineItem['from']) => {
    if (from === 'system') {
      return (
        <svg className="w-4 h-4 text-amber-400 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="p-3 border rounded-xl text-sm space-y-2 max-h-80 overflow-auto">
      <div className="font-semibold">Timeline</div>
      {loading && <div>Loading…</div>}
      {items.map((it, i) => (
        <div
          key={i}
          className={`flex gap-2 ${it.from === 'system' ? 'bg-amber-400/5 border-l-2 border-amber-400 pl-2 py-1 -ml-1' : ''}`}
        >
          <span className="shrink-0 tabular-nums text-slate-500">{new Date(it.at).toLocaleTimeString()}</span>
          <span className={`shrink-0 uppercase ${getMessageStyle(it.from)}`}>
            {getMessageIcon(it.from)}
            {it.from}
          </span>
          <span className="break-words">{it.text}</span>
        </div>
      ))}
    </div>
  );
}
