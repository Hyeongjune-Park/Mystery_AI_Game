"use client";

import { useState } from "react";

interface LocationObject {
  name: string;
  clue: string;
}

interface LocationData {
  id: string;
  name: string;
  floor: string;
  description: string;
  objects: LocationObject[];
  details?: string;
}

interface LocationsTabProps {
  caseId: string;
}

export default function LocationsTab({ caseId }: LocationsTabProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  // 장소 데이터 (나중에 API에서 가져올 예정)
  const locations: LocationData[] = [
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
      details: "깔끔하게 정돈된 원룸 형태의 주거 공간. 피해자의 직업적 특성이 드러나는 와인 관련 서적과 각종 와인 도구들이 보인다.",
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
      details: "건물 최상층 옥상. 난간 높이가 낮아 추락 가능성이 있으나, 고의로 넘어가지 않는 이상 실수로 떨어지기는 어려운 구조.",
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
      details: "피해자가 자주 이용하던 역. 사건 당일 밤 관련 인물들의 동선 파악에 중요한 장소.",
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
      details: "모든 공식적인 증거 자료와 과학적 분석 결과를 확인할 수 있는 장소. 형사와의 협조가 필요하다.",
    },
  ];

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">장소 정보</h2>
        <p className="text-slate-400 mb-6">
          사건과 관련된 장소들입니다. 클릭하여 상세 정보를 확인하세요.
        </p>

        {/* Location Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((location) => (
            <button
              key={location.id}
              onClick={() => setSelectedLocation(location)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden hover:border-amber-500/50 hover:bg-slate-800/70 transition-all text-left group"
            >
              {/* Image Placeholder */}
              <div className="relative h-32 bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center group-hover:from-slate-600 group-hover:to-slate-500 transition-colors">
                <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>

                {/* Floor Badge */}
                <div className="absolute top-3 right-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-900/50 text-slate-300 border border-slate-600 backdrop-blur">
                    {location.floor}
                  </span>
                </div>

                {/* Arrow Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <svg
                    className="w-8 h-8 text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-2">{location.name}</h3>
                <p className="text-sm text-slate-300 leading-relaxed line-clamp-2 mb-3">
                  {location.description}
                </p>

                {/* Object Count Badge */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>오브젝트 {location.objects.length}개</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLocation && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedLocation(null)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Large Image */}
            <div className="relative h-64 bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center border-b border-slate-700">
              <svg className="w-20 h-20 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>

              {/* Floor Badge */}
              <div className="absolute top-4 right-4">
                <span className="text-sm px-3 py-1.5 rounded-full bg-slate-900/50 text-slate-300 border border-slate-600 backdrop-blur">
                  {selectedLocation.floor}
                </span>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedLocation(null)}
                className="absolute top-4 left-4 text-slate-300 hover:text-white transition-colors bg-slate-900/50 hover:bg-slate-900/70 rounded-full p-2 backdrop-blur"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedLocation.name}</h2>
                <p className="text-slate-400">{selectedLocation.description}</p>
              </div>

              {/* Details */}
              {selectedLocation.details && (
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    상세 정보
                  </h3>
                  <p className="text-slate-300 leading-relaxed">{selectedLocation.details}</p>
                </div>
              )}

              {/* Objects */}
              <div>
                <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  주요 오브젝트
                </h3>
                <div className="space-y-3">
                  {selectedLocation.objects.map((obj, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/30 border border-slate-700 rounded-lg p-4 hover:border-amber-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-amber-500">•</span>
                            <h4 className="text-white font-medium">{obj.name}</h4>
                          </div>
                          <p className="text-sm text-slate-400 ml-5">{obj.clue}</p>
                        </div>
                        <svg className="w-5 h-5 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Investigation Tips */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-slate-300">
                    NPC와 대화할 때 이 장소에 대해 질문하면 더 많은 정보를 얻을 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}