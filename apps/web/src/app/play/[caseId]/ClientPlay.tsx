"use client";

import { useState, useTransition } from "react";
import { sendMessage } from "@/lib/api";

type Log = { from: "player" | "npc"; text: string };

export default function ClientPlay({ caseId }: { caseId: string }) {
  const [text, setText] = useState("");
  const [logs, setLogs] = useState<Log[]>([]);
  const [pending, startTransition] = useTransition();

  const npcId = "suspect-minseo";

  // 세션ID: 케이스/캐릭터별로 1회 생성 후 보관
  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return "web";
    const key = `mp_session:${caseId}:${npcId}`;
    const existed = localStorage.getItem(key);
    if (existed) return existed;
    const sid = "web-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    localStorage.setItem(key, sid);
    return sid;
  });

  const onSend = () => {
    const userText = text.trim();
    if (!userText) return;
    setText("");

    // 낙관적 로그
    setLogs((ls) => [...ls, { from: "player", text: userText }]);

    startTransition(async () => {
      try {
        const res = await sendMessage(sessionId, { caseId, npcId, text: userText });
        setLogs((ls) => [...ls, { from: "npc", text: res.reply }]); // ← reply 사용
      } catch (e) {
        console.error(e);
        setLogs((ls) => [...ls, { from: "npc", text: "오류가 발생했어요. 잠시 후 다시 시도해 주세요." }]);
      }
    });
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-3">
      <div className="border rounded p-3 h-80 overflow-auto bg-white">
        {logs.map((l, i) => (
          <div key={i} className={l.from === "player" ? "text-right" : "text-left"}>
            <span className="inline-block px-3 py-2 my-1 rounded bg-gray-100">
              <strong className="mr-2">{l.from === "player" ? "나" : "NPC"}</strong>
              {l.text}
            </span>
          </div>
        ))}
        {pending && <div className="text-sm text-gray-500 mt-2">생각 중…</div>}
      </div>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="메시지를 입력하세요"
          className="flex-1 border rounded px-3 py-2"
        />
        <button onClick={onSend} disabled={pending} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
          보내기
        </button>
      </div>
    </div>
  );
}
