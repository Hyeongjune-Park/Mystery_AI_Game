"use client";

import { useState, useRef, useEffect } from "react";

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

  // NPC 선택 시 초기 메시지
  const handleSelectNpc = (npcId: string) => {
    setSelectedNpc(npcId);
    const npc = npcs.find((n) => n.id === npcId);
    if (npc) {
      setMessages([
        {
          id: "initial",
          sender: "npc",
          text: `안녕하세요. ${npc.name}입니다. 무엇을 도와드릴까요?`,
          timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  };

  // 메시지 전송 (나중에 API 연동)
  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedNpcInfo) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputText,
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // 임시 NPC 응답 (나중에 API 호출로 대체)
    setTimeout(() => {
      const npcMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "npc",
        text: "죄송합니다. 현재 AI 연동 기능은 개발 중입니다. 곧 실제 대화가 가능해집니다.",
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, npcMessage]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col">
      {!selectedNpc ? (
        // NPC 선택 화면
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">대화</h2>
          <p className="text-slate-400 mb-6">대화할 인물을 선택하세요.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {npcs.map((npc) => (
              <button
                key={npc.id}
                onClick={() => handleSelectNpc(npc.id)}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:border-amber-500/50 hover:bg-slate-800/70 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center border-2 border-slate-600 group-hover:border-amber-500/30 transition-colors flex-shrink-0">
                    <svg className="w-7 h-7 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{npc.name}</h3>
                    <p className="text-sm text-slate-400">{npc.role}</p>
                  </div>

                  {/* Arrow */}
                  <svg
                    className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        // 대화 화면
        <div className="flex flex-col h-[calc(100vh-240px)]">
          {/* Chat Header */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-t-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center border-2 border-slate-600">
                <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>

              {/* Name & Status */}
              <div>
                <h3 className="text-white font-semibold">{selectedNpcInfo?.name}</h3>
                <p className="text-xs text-slate-400">{selectedNpcInfo?.role}</p>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedNpc(null);
                setMessages([]);
              }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 bg-slate-800/30 border-x border-slate-700 p-4 overflow-y-auto">
            <div className="space-y-4">
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
          </div>

          {/* Input Area */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-b-lg p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
                placeholder="메시지를 입력하세요..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
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
      )}
    </div>
  );
}