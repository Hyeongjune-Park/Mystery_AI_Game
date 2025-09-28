"use client";

/**
 * 채팅(좌) + 타임라인(우) 2열 레이아웃 + 드라마틱 선택지 UI
 * - 평시: 자유 입력
 * - 드라마틱 순간: ChoiceBar 노출, 입력창 비활성화
 */

import { useState, useTransition } from "react";
import { sendMessage, type NpcReplyLite } from "@/lib/api";
import TimelinePanel from "./TimelinePanel";
import ChoiceBar, { type Choice } from "./ChoiceBar";

type Log = { from: "player" | "npc"; text: string };

export default function ClientPlay({ caseId }: { caseId: string }) {
  const [text, setText] = useState("");
  const [logs, setLogs] = useState<Log[]>([]);
  const [pending, startTransition] = useTransition();

  // 드라마틱 선택지
  const [decision, setDecision] = useState<Choice[] | null>(null);

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

  const handleNpcReply = (res: NpcReplyLite) => {
    // NPC 말풍선
    setLogs((ls) => [...ls, { from: "npc", text: res.reply }]);

    // 드라마틱 선택지 등장 시 결정 모드 진입
    if (res.choices && res.choices.length > 0) {
      setDecision(res.choices);
    } else {
      setDecision(null);
    }
  };

  const onSend = () => {
    const userText = text.trim();
    if (!userText) return;
    setText("");

    // 낙관적 로그
    setLogs((ls) => [...ls, { from: "player", text: userText }]);

    startTransition(async () => {
      try {
        const res = await sendMessage(sessionId, { caseId, npcId, text: userText });
        handleNpcReply(res);
      } catch (e) {
        console.error(e);
        setLogs((ls) => [...ls, { from: "npc", text: "오류가 발생했어요. 잠시 후 다시 시도해 주세요." }]);
      }
    });
  };

  const onPickChoice = (c: Choice) => {
    // 입력창 대신 선택지로 보냄 (특수 태그 포함 → 후처리에 유리)
    const userText = `[CHOICE:${c.id}] ${c.text}`;
    setDecision(null); // 버튼 중복 클릭 방지

    // 낙관적 로그
    setLogs((ls) => [...ls, { from: "player", text: c.text }]);

    startTransition(async () => {
      try {
        const res = await sendMessage(sessionId, { caseId, npcId, text: userText });
        handleNpcReply(res);
      } catch (e) {
        console.error(e);
        setLogs((ls) => [...ls, { from: "npc", text: "오류가 발생했어요. 잠시 후 다시 시도해 주세요." }]);
      }
    });
  };

  const inputDisabled = pending || !!decision;

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px]">
        {/* 왼쪽: 채팅 + 선택지 바 */}
        <div className="space-y-3">
          {/* 드라마틱 선택지 바 (있을 때만) */}
          {decision && decision.length > 0 && (
            <ChoiceBar choices={decision} onPick={onPickChoice} disabled={pending} />
          )}

          {/* 채팅 로그 박스 */}
          <div className="h-80 overflow-auto rounded border bg-white p-3">
            {logs.map((l, i) => (
              <div key={i} className={l.from === "player" ? "text-right" : "text-left"}>
                <span className="my-1 inline-block rounded bg-gray-100 px-3 py-2">
                  <strong className="mr-2">{l.from === "player" ? "나" : "NPC"}</strong>
                  {l.text}
                </span>
              </div>
            ))}
            {pending && <div className="mt-2 text-sm text-gray-500">생각 중…</div>}
          </div>

          {/* 입력 폼 (결정 모드에서는 비활성화) */}
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => !inputDisabled && e.key === "Enter" && onSend()}
              placeholder={decision ? "결정이 필요합니다. 선택지를 고르세요." : "메시지를 입력하세요"}
              className="flex-1 rounded border px-3 py-2 disabled:opacity-50"
              disabled={inputDisabled}
            />
            <button
              onClick={onSend}
              disabled={inputDisabled}
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              보내기
            </button>
          </div>
        </div>

        {/* 오른쪽: 타임라인 */}
        <div className="md:sticky md:top-4">
          <TimelinePanel sessionId={sessionId} />
        </div>
      </div>
    </div>
  );
}
