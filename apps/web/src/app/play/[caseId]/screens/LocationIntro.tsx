"use client";

interface LocationIntroProps {
  caseId: string;
  onNext: () => void;
}

export default function LocationIntro({ caseId, onNext }: LocationIntroProps) {
  // 장소 정보 (나중에 케이스 데이터에서 가져올 수 있음)
  const locations = {
    c001: [
      {
        id: "location.crime_scene",
        name: "피해자의 집",
        floor: "4층",
        description: "5층 건물의 4층. 피해자가 살던 곳으로, 현장 조사가 이루어진 장소다.",
        objects: [
          { name: "와인잔", clue: "지문이 남아있음" },
          { name: "거실", clue: "정리정돈이 잘 되어 있음" },
          { name: "유서", clue: "필적 분석 필요" },
        ],
      },
      {
        id: "location.rooftop",
        name: "건물 옥상",
        floor: "5층",
        description: "피해자가 추락한 것으로 추정되는 장소. 출입문에 접근 기록이 남아있다.",
        objects: [
          { name: "출입문", clue: "지문 채취 가능" },
          { name: "난간", clue: "높이 약 1.2m" },
          { name: "바닥", clue: "특이사항 없음" },
        ],
      },
      {
        id: "location.station",
        name: "지하철역",
        floor: "지하 1층",
        description: "피해자의 집에서 도보 5분 거리. CCTV 영상이 보관되어 있다.",
        objects: [
          { name: "CCTV", clue: "23시 15분 녹화본 존재" },
          { name: "개찰구", clue: "교통카드 기록 조회 가능" },
        ],
      },
      {
        id: "location.police_station",
        name: "경찰서",
        floor: "1층",
        description: "사건을 담당하는 경찰서. 증거 자료와 부검 결과가 보관되어 있다.",
        objects: [
          { name: "증거 보관소", clue: "수집된 증거 열람 가능" },
          { name: "부검 보고서", clue: "혈액 검사 결과 포함" },
        ],
      },
    ],
  };

  const locationList = locations[caseId as keyof typeof locations] || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 mb-4">
            주요 장소 안내
          </h1>
          <p className="text-slate-400 text-lg">
            사건과 관련된 장소들입니다. 각 장소를 조사하여 단서를 찾으세요.
          </p>
        </div>

        {/* Location Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {locationList.map((location, index) => (
            <div
              key={location.id}
              className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden backdrop-blur hover:border-amber-500/30 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image Placeholder */}
              <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center">
                <svg className="w-16 h-16 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div className="absolute top-4 right-4">
                  <span className="text-xs px-3 py-1 rounded-full bg-slate-900/50 text-slate-300 border border-slate-600 backdrop-blur">
                    {location.floor}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Location Name */}
                <h3 className="text-xl font-bold text-white mb-3">{location.name}</h3>

                {/* Description */}
                <p className="text-slate-300 mb-4 leading-relaxed text-sm">
                  {location.description}
                </p>

                {/* Objects List */}
                <div className="space-y-2 pt-4 border-t border-slate-700">
                  <div className="flex items-center gap-2 text-sm text-amber-400 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="font-semibold">주요 오브젝트</span>
                  </div>
                  <div className="space-y-1.5">
                    {location.objects.map((obj, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-amber-500 mt-1">•</span>
                        <div className="flex-1">
                          <span className="text-slate-300 font-medium">{obj.name}</span>
                          <span className="text-slate-500 ml-2">- {obj.clue}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
                <strong className="text-amber-400">조사 팁:</strong>
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>각 장소의 오브젝트를 주의깊게 관찰하세요</li>
                <li>NPC와 대화할 때 장소와 관련된 질문을 하면 더 많은 정보를 얻을 수 있습니다</li>
                <li>증거들 사이의 연관성을 찾는 것이 중요합니다</li>
                <li>게임 중 언제든 장소 정보를 다시 확인할 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={onNext}
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold px-10 py-5 rounded-lg transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 text-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>수사 시작</span>
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