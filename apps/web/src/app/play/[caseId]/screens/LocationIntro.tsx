"use client";

import { useEffect, useState } from "react";
import { fetchLocations, LocationsData } from "@/lib/api";

interface LocationIntroProps {
  caseId: string;
  onNext: () => void;
}

export default function LocationIntro({ caseId, onNext }: LocationIntroProps) {
  const [data, setData] = useState<LocationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations(caseId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">장소 정보를 불러올 수 없습니다.</p>
          {error && <p className="text-sm text-slate-400 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 mb-4">
            {data.intro.title}
          </h1>
          <p className="text-slate-400 text-lg">
            {data.intro.description}
          </p>
        </div>

        {/* Location Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {data.locations.map((location, index) => (
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
                    {location.objects.map((obj) => (
                      <div key={obj.id} className="flex items-start gap-2 text-sm">
                        <span className="text-amber-500 mt-1">•</span>
                        <div className="flex-1">
                          <span className="text-slate-300 font-medium">{obj.name}</span>
                          <span className="text-slate-500 ml-2 text-xs">- 조사 가능</span>
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
                {data.intro.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
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
