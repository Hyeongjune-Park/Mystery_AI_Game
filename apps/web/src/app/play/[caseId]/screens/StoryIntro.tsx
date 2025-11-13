"use client";

import { useState, useEffect } from "react";
import { fetchStory, StoryData } from "@/lib/api";

interface StoryIntroProps {
  caseId: string;
  onNext: () => void;
}

export default function StoryIntro({ caseId, onNext }: StoryIntroProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStory(caseId)
      .then(setStoryData)
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

  if (error || !storyData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">스토리를 불러올 수 없습니다.</p>
          {error && <p className="text-sm text-slate-400 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  const pages = storyData.pages;
  const currentStory = pages[currentPage];
  const isLastPage = currentPage === pages.length - 1;

  const handleNext = () => {
    if (isLastPage) {
      onNext();
    } else {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {pages.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentPage
                  ? "w-12 bg-amber-500"
                  : index < currentPage
                  ? "w-8 bg-amber-500/50"
                  : "w-8 bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Story Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 md:p-12 backdrop-blur shadow-2xl min-h-[400px] flex flex-col">
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-amber-400 mb-2">
              {currentStory.title}
            </h2>
            <div className="h-px bg-gradient-to-r from-amber-500/50 to-transparent"></div>
          </div>

          {/* Content */}
          <div className="flex-1 mb-8">
            <div className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">
              {currentStory.content}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-700">
            <button
              onClick={handlePrev}
              disabled={currentPage === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all disabled:opacity-0 disabled:pointer-events-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>이전</span>
            </button>

            <div className="text-sm text-slate-500">
              {currentPage + 1} / {pages.length}
            </div>

            <button
              onClick={handleNext}
              className="group flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-semibold transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
            >
              <span>{isLastPage ? "다음으로" : "계속"}</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Skip Button */}
        {storyData.skippable && (
          <div className="text-center mt-6">
            <button
              onClick={onNext}
              className="text-sm text-slate-500 hover:text-slate-400 transition-colors underline"
            >
              스토리 건너뛰기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
