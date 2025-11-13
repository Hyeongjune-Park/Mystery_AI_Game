"use client";

import { useState, useRef, useEffect } from "react";
import { sendMessage } from "@/lib/api";

interface NpcOption {
  id: string;
  name: string;
  role: string;
}

interface Message {
  id: string;
  sender: "user" | "npc";
  text: string;
  timestamp: string;
}

interface ConversationTabProps {
  caseId: string;
}

export default function ConversationTab({ caseId }: ConversationTabProps) {
  const [selectedNpc, setSelectedNpc] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // NPC 목록
  const npcs: NpcOption[] = [
    { id: "npc.detective.doil", name: "도일 형사", role: "수사 담당 형사" },
    { id: "npc.suspect.minseo", name: "박민서", role: "피해자의 전 연인" },
    { id: "npc.witness.neighbor", name: "이웃 주민", role: "목격자" },
    { id: "npc.friend.suji", name: "이수진", role: "피해자의 절친" },
  ];

  const selectedNpcInfo = npcs.find((npc) => npc.id === selectedNpc);

  // 메시지 전송 시 스크롤 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // NPC 선택 시 세션 생성 (초기 메시지 없음)
  const handleSelectNpc = async (npcId: string) => {
    setSelectedNpc(npcId);
    setMessages([]); // 빈 상태로 시작

    // 세션 생성
    try {
      const res = await fetch(`/api/proxy/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, playerId: "web-player" }),
      });

      if (res.ok) {
        const session = await res.json();
        setSessionId(session.id);
      }
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  // 메시지 전송 (실제 API 연동)
  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedNpcInfo || !sessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputText,
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = inputText;
    setInputText("");
    setIsTyping(true);

    try {
      // 실제 API 호출
      const response = await sendMessage(sessionId, {
        caseId,
        npcId: selectedNpcInfo.id,
        text: messageText,
      });

      const npcMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "npc",
        text: response.reply,
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, npcMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);

      // 에러 시 폴백 메시지
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "npc",
        text: "죄송합니다. 메시지 전송 중 오류가 발생했습니다. 다시 시도해 주세요.",
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full flex gap-4">
      {/* 좌측: 대화창 */}
      <div className="flex-1 flex flex-col h-[calc(100vh-240px)]">
        {/* Chat Header */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-t-lg p-4">
          {selectedNpcInfo ? (
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center border-2 border-slate-600">
                <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>

              {/* Name & Status */}
              <div>
                <h3 className="text-white font-semibold">{selectedNpcInfo.name}</h3>
                <p className="text-xs text-slate-400">{selectedNpcInfo.role}</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400">
              <p className="text-sm">대화할 인물을 선택하세요</p>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 bg-slate-800/30 border-x border-slate-700 p-4 overflow-y-auto">
          {selectedNpc ? (
            <div className="space-y-4">
              {messages.length === 0 && !isTyping && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-500 text-sm">대화를 시작해보세요</p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] ${
                      message.sender === "user"
                        ? "bg-amber-500 text-slate-900"
                        : "bg-slate-700 text-white"
                    } rounded-lg p-3`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === "user" ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-white rounded-lg p-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-slate-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm">오른쪽에서 대화할 인물을 선택하세요</p>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-b-lg p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={selectedNpc ? "메시지를 입력하세요..." : "먼저 인물을 선택하세요"}
              disabled={!selectedNpc}
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || !selectedNpc}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-900 disabled:text-slate-500 font-semibold px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>전송</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 우측: NPC 연락처 목록 */}
      <div className="w-80 flex flex-col">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 h-[calc(100vh-240px)] overflow-y-auto">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
            인물 목록
          </h3>

          <div className="space-y-2">
            {npcs.map((npc) => (
              <button
                key={npc.id}
                onClick={() => handleSelectNpc(npc.id)}
                className={`w-full bg-slate-800/50 border ${
                  selectedNpc === npc.id
                    ? "border-amber-500 bg-slate-800/80"
                    : "border-slate-700 hover:border-amber-500/50 hover:bg-slate-800/70"
                } rounded-lg p-4 transition-all text-left group`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center border-2 ${
                    selectedNpc === npc.id ? "border-amber-500" : "border-slate-600 group-hover:border-amber-500/30"
                  } transition-colors flex-shrink-0`}>
                    <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold mb-1 ${
                      selectedNpc === npc.id ? "text-amber-400" : "text-white"
                    }`}>
                      {npc.name}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">{npc.role}</p>
                  </div>

                  {/* Active Indicator */}
                  {selectedNpc === npc.id && (
                    <div className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}