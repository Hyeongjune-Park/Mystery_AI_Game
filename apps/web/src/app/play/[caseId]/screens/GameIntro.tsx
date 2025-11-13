"use client";

import { useEffect, useState } from "react";
import { fetchCaseMetadata, CaseMetadata } from "@/lib/api";

interface GameIntroProps {
  caseId: string;
  onStart: () => void;
}

export default function GameIntro({ caseId, onStart }: GameIntroProps) {
  const [caseInfo, setCaseInfo] = useState<CaseMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCaseMetadata(caseId)
      .then(setCaseInfo)
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

  if (error || !caseInfo) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">케이스를 찾을 수 없습니다.</p>
          {error && <p className="text-sm text-slate-400 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in">
        {/* Case Badge */}
        <div className="flex justify-center">
          <span className="text-sm font-mono text-amber-400 bg-amber-400/10 px-4 py-2 rounded-full border border-amber-400/30">
            CASE {caseId.toUpperCase()}
          </span>
        </div>

        {/* Logo / Title Area */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 tracking-tight">
            {caseInfo.title}
          </h1>
          <p className="text-lg text-slate-400 font-light tracking-wide">
            {caseInfo.subtitle}
          </p>
        </div>

        {/* Decorative Line */}
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-amber-500/50"></div>
          <svg className="w-6 h-6 text-amber-500/50" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.06 1.06z" />
          </svg>
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-amber-500/50"></div>
        </div>

        {/* Synopsis */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
          <p className="text-slate-300 leading-relaxed">
            {caseInfo.synopsis}
          </p>
        </div>

        {/* Game Info */}
        <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>난이도: {caseInfo.difficulty}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>예상 플레이 시간: {caseInfo.estimatedMinutes}분</span>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-8">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold px-8 py-4 rounded-lg transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105"
          >
            <span className="text-lg">게임 시작</span>
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

        {/* Hint Text */}
        <p className="text-xs text-slate-500 pt-4">
          게임을 시작하면 사건의 배경 이야기가 시작됩니다
        </p>
      </div>
    </div>
  );
}
