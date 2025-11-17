"use client";

import { useState } from "react";
import NpcsTab from "./tabs/NpcsTab";
import LocationsTab from "./tabs/LocationsTab";
import ConversationTab from "./tabs/ConversationTab";
import NotesTab from "./tabs/NotesTab";
import ReportTab from "./tabs/ReportTab";

interface GameMainProps {
  caseId: string;
}

type TabType = "npcs" | "locations" | "conversation" | "notes" | "report";

interface Message {
  id: string;
  sender: "user" | "npc";
  text: string;
  timestamp: string;
}

export default function GameMain({ caseId }: GameMainProps) {
  const [activeTab, setActiveTab] = useState<TabType>("npcs");

  // 대화 탭 상태를 GameMain에서 관리 (탭 전환 시에도 유지)
  const [npcSessions, setNpcSessions] = useState<Record<string, string>>({});
  const [npcMessages, setNpcMessages] = useState<Record<string, Message[]>>({});

  // 미확인 메시지 상태 (임시: 테스트용 더미 데이터)
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>({
    "npc.detective.doil": 1, // 테스트용
  });

  const tabs = [
    {
      id: "npcs" as TabType,
      label: "인물 정보",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: "locations" as TabType,
      label: "장소 정보",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: "conversation" as TabType,
      label: "대화",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      id: "notes" as TabType,
      label: "수사노트",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      id: "report" as TabType,
      label: "보고서",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/80 border-b border-slate-700 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                와인잔의 비밀
              </h1>
              <p className="text-sm text-slate-500 mt-1">Case {caseId.toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Timer placeholder */}
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-mono">00:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "border-amber-500 text-amber-400 bg-slate-800/50"
                    : "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/30"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {activeTab === "npcs" && <NpcsTab caseId={caseId} unreadMessages={unreadMessages} />}

          {activeTab === "locations" && <LocationsTab caseId={caseId} />}

          {activeTab === "conversation" && (
            <ConversationTab
              caseId={caseId}
              npcSessions={npcSessions}
              setNpcSessions={setNpcSessions}
              npcMessages={npcMessages}
              setNpcMessages={setNpcMessages}
            />
          )}

          {activeTab === "notes" && <NotesTab caseId={caseId} />}

          {activeTab === "report" && <ReportTab caseId={caseId} />}
        </div>
      </div>
    </div>
  );
}