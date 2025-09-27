"use client";

/**
 * 채팅 UI(왼쪽) + 타임라인 패널(오른쪽) 2열 레이아웃
 * - 모바일: 세로 스택
 * - md 이상: 2컬럼(채팅 1fr, 패널 320px)
 */

import { useState, useTransition } from "react";
import { sendMessage } from "@/lib/api";
import TimelinePanel from "./TimelinePanel"; // ✅ 사이드 패널

type Log = { from: "player" | "npc"; text: string };

export default function ClientPlay({ caseId }: { caseId: string }) {
  const [text, setText] = useState("");
  const [logs, setLogs] = useState<Log[]>([]);
  const [pending, startTransition] = useTransition();

  const npcId = "suspect-minseo";

  // ✅ 세션ID: 케이스/캐릭터별로 1회 생성 후 보관
  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return "web";
    const key = `mp_session:${caseId}:${npcId}`;
    const existed = localStorage.getItem(key);
    if (existed) return existed;
    const sid =
      "web-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 8);
    localStorage.setItem(key, sid);
    return sid;
  });

  const onSend = () => {
    const userText = text.trim();
    if (!userText) return;
    setText("");

    // ✅ 낙관적 로그
    setLogs((ls) => [...ls, { from: "player", text: userText }]);

    startTransition(async () => {
      try {
        const res = await sendMessage(sessionId, { caseId, npcId, text: userText });
        setLogs((ls) => [...ls, { from: "npc", text: res.reply }]); // ← reply 사용
      } catch (e) {
        console.error(e);
        setLogs((ls) => [
          ...ls,
          { from: "npc", text: "오류가 발생했어요. 잠시 후 다시 시도해 주세요." },
        ]);
      }
    });
  };

  return (
    <div className="mx-auto max-w-5xl p-4">
      {/* ✅ 2열 레이아웃: 모바일 1열 → md 이상 2열 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px]">
        {/* ========== 왼쪽: 채팅 영역 ========== */}
        <div className="space-y-3">
          {/* 채팅 로그 박스 */}
          <div className="h-80 overflow-auto rounded border bg-white p-3">
            {logs.map((l, i) => (
              <div
                key={i}
                className={l.from === "player" ? "text-right" : "text-left"}
              >
                <span className="my-1 inline-block rounded bg-gray-100 px-3 py-2">
                  <strong className="mr-2">
                    {l.from === "player" ? "나" : "NPC"}
                  </strong>
                  {l.text}
                </span>
              </div>
            ))}
            {pending && (
              <div className="mt-2 text-sm text-gray-500">생각 중…</div>
            )}
          </div>

          {/* 입력 폼 */}
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSend()}
              placeholder="메시지를 입력하세요"
              className="flex-1 rounded border px-3 py-2"
            />
            <button
              onClick={onSend}
              disabled={pending}
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              보내기
            </button>
          </div>
        </div>

        {/* ========== 오른쪽: 타임라인 패널 ========== */}
        <div className="md:sticky md:top-4">
          {/* ✅ 핵심: 여기 추가 */}
          <TimelinePanel sessionId={sessionId} />
          {/* 필요하면 다른 사이드 위젯을 아래에 더 추가하세요 */}
        </div>
      </div>
    </div>
  );
}
