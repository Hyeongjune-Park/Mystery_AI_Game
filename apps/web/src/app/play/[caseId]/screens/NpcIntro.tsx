"use client";

interface NpcIntroProps {
  caseId: string;
  onNext: () => void;
}

export default function NpcIntro({ caseId, onNext }: NpcIntroProps) {
  // NPC 정보 (나중에 npcs.json에서 가져올 수 있음)
  const npcs = {
    c001: [
      {
        id: "npc.detective.doil",
        name: "도일 형사",
        age: 42,
        role: "수사 담당 형사",
        description: "이번 사건을 담당하는 베테랑 형사. 냉철하고 논리적이다.",
        specialty: "범죄 현장 분석",
      },
      {
        id: "npc.suspect.minseo",
        name: "박민서",
        age: 32,
        role: "피해자의 전 연인",
        description: "피해자와 2주 전 결별했다. 겉으로는 침착하지만 불안해 보인다.",
        specialty: "바리스타",
      },
      {
        id: "npc.witness.neighbor",
        name: "이웃 주민",
        age: 55,
        role: "목격자",
        description: "피해자가 살던 건물의 이웃. 사건 당일 밤 이상한 소리를 들었다고 증언했다.",
        specialty: "관찰력 좋음",
      },
      {
        id: "npc.friend.suji",
        name: "이수진",
        age: 34,
        role: "피해자의 절친",
        description: "피해자와 10년 지기 친구. 피해자의 생활 습관을 잘 알고 있다.",
        specialty: "패션 디자이너",
      },
    ],
  };

  const npcList = npcs[caseId as keyof typeof npcs] || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 mb-4">
            주요 인물 소개
          </h1>
          <p className="text-slate-400 text-lg">
            사건과 관련된 인물들입니다. 각 인물과 대화하여 단서를 수집하세요.
          </p>
        </div>

        {/* NPC Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {npcList.map((npc, index) => (
            <div
              key={npc.id}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur hover:border-amber-500/30 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* NPC Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {/* Avatar Placeholder */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center border-2 border-slate-600">
                    <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {/* Name & Age */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{npc.name}</h3>
                    <p className="text-sm text-slate-400">{npc.age}세</p>
                  </div>
                </div>

                {/* Role Badge */}
                <span className="text-xs px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  {npc.role}
                </span>
              </div>

              {/* Description */}
              <p className="text-slate-300 mb-4 leading-relaxed">{npc.description}</p>

              {/* Specialty */}
              <div className="flex items-center gap-2 text-sm text-slate-500 pt-4 border-t border-slate-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{npc.specialty}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-slate-300 text-sm leading-relaxed">
              <p className="mb-2">
                <strong className="text-amber-400">주의사항:</strong>
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>각 인물은 자신이 아는 정보만 제공할 수 있습니다</li>
                <li>일부 인물은 거짓말을 할 수 있습니다</li>
                <li>증거를 제시하면 숨긴 정보를 얻을 수 있습니다</li>
                <li>게임 중 언제든 인물 정보를 다시 확인할 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Next Button */}
        <div className="text-center">
          <button
            onClick={onNext}
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold px-8 py-4 rounded-lg transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105"
          >
            <span className="text-lg">다음으로</span>
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}