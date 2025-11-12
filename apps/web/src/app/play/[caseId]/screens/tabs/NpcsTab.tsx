"use client";

import { useState } from "react";

interface NpcData {
  id: string;
  name: string;
  age: number;
  role: string;
  description: string;
  specialty: string;
  background?: string;
  personality?: string;
}

interface NpcsTabProps {
  caseId: string;
}

export default function NpcsTab({ caseId }: NpcsTabProps) {
  const [selectedNpc, setSelectedNpc] = useState<NpcData | null>(null);

  // NPC 데이터 (나중에 API에서 가져올 예정)
  const npcs: NpcData[] = [
    {
      id: "npc.detective.doil",
      name: "도일 형사",
      age: 42,
      role: "수사 담당 형사",
      description: "이번 사건을 담당하는 베테랑 형사. 냉철하고 논리적이다.",
      specialty: "범죄 현장 분석",
      background: "경찰 경력 18년. 수많은 살인 사건을 해결한 베테랑.",
      personality: "차갑고 직설적이지만 정의감이 강하다.",
    },
    {
      id: "npc.suspect.minseo",
      name: "박민서",
      age: 32,
      role: "피해자의 전 연인",
      description: "피해자와 2주 전 결별했다. 겉으로는 침착하지만 불안해 보인다.",
      specialty: "바리스타",
      background: "피해자와 3년간 연애. 최근 갑작스럽게 결별했다.",
      personality: "감정 기복이 심하고 질투심이 강한 편이다.",
    },
    {
      id: "npc.witness.neighbor",
      name: "이웃 주민",
      age: 55,
      role: "목격자",
      description: "피해자가 살던 건물의 이웃. 사건 당일 밤 이상한 소리를 들었다고 증언했다.",
      specialty: "관찰력 좋음",
      background: "건물에서 10년째 거주 중. 조용한 성격이지만 주변 관찰력이 뛰어나다.",
      personality: "말수가 적고 신중하다. 세심한 관찰력을 지녔다.",
    },
    {
      id: "npc.friend.suji",
      name: "이수진",
      age: 34,
      role: "피해자의 절친",
      description: "피해자와 10년 지기 친구. 피해자의 생활 습관을 잘 알고 있다.",
      specialty: "패션 디자이너",
      background: "대학 시절부터 피해자와 친구. 피해자의 비밀을 가장 많이 아는 인물.",
      personality: "밝고 사교적이지만 친구의 죽음에 큰 충격을 받았다.",
    },
  ];

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">인물 정보</h2>
        <p className="text-slate-400 mb-6">
          사건과 관련된 인물들의 정보입니다. 클릭하여 상세 정보를 확인하세요.
        </p>

        {/* NPC Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {npcs.map((npc) => (
            <button
              key={npc.id}
              onClick={() => setSelectedNpc(npc)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-amber-500/50 hover:bg-slate-800/70 transition-all text-left group"
            >
              {/* Card Header */}
              <div className="flex items-center gap-4 mb-3">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center border-2 border-slate-600 group-hover:border-amber-500/30 transition-colors flex-shrink-0">
                  <svg className="w-7 h-7 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* Name & Role */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">{npc.name}</h3>
                    <span className="text-sm text-slate-400">{npc.age}세</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30">
                    {npc.role}
                  </span>
                </div>

                {/* Arrow Icon */}
                <svg
                  className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">{npc.description}</p>

              {/* Specialty */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{npc.specialty}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedNpc && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedNpc(null)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-800/95 backdrop-blur border-b border-slate-700 p-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                {/* Large Avatar */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center border-2 border-amber-500/30">
                  <svg className="w-10 h-10 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{selectedNpc.name}</h2>
                    <span className="text-slate-400">{selectedNpc.age}세</span>
                  </div>
                  <span className="text-sm px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30">
                    {selectedNpc.role}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedNpc(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  기본 정보
                </h3>
                <p className="text-slate-300 leading-relaxed">{selectedNpc.description}</p>
              </div>

              {/* Background */}
              {selectedNpc.background && (
                <div>
                  <h3 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    배경
                  </h3>
                  <p className="text-slate-300 leading-relaxed">{selectedNpc.background}</p>
                </div>
              )}

              {/* Personality */}
              {selectedNpc.personality && (
                <div>
                  <h3 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    성격
                  </h3>
                  <p className="text-slate-300 leading-relaxed">{selectedNpc.personality}</p>
                </div>
              )}

              {/* Specialty */}
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-slate-400">전문 분야:</span>
                  <span className="text-white font-medium">{selectedNpc.specialty}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}