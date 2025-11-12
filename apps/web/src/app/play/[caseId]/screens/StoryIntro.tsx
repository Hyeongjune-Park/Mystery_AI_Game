"use client";

import { useState } from "react";

interface StoryIntroProps {
  caseId: string;
  onNext: () => void;
}

export default function StoryIntro({ caseId, onNext }: StoryIntroProps) {
  const [currentPage, setCurrentPage] = useState(0);

  // 스토리 페이지들 (나중에 케이스 데이터에서 가져올 수 있음)
  const storyPages = {
    c001: [
      {
        title: "사건 발생",
        content: `2025년 1월 14일 밤 11시 40분.

강남구 한 고급 주택가에서 유명 와인 소믈리에 김재현(35세)이 자택 건물 아래에서 숨진 채 발견되었다.

경찰은 현장 조사 결과, 옥상에서 떨어진 것으로 추정하고 자살로 결론 내렸다.

현장에서는 '더 이상 살고 싶지 않습니다'라는 내용의 유서가 발견되었다.`,
      },
      {
        title: "의문점",
        content: `하지만 몇 가지 의문점이 남아있다.

피해자는 평소 밝고 긍정적인 성격으로 알려져 있었으며, 최근 방송 출연까지 예정되어 있었다.

또한 현장에서 발견된 와인잔과 피해자의 생활 습관 사이에 모순이 있다는 제보가 들어왔다.

당신은 이 사건의 진실을 밝혀야 한다.`,
      },
      {
        title: "당신의 임무",
        content: `당신은 이 사건을 재조사하게 된 형사다.

현장을 다시 살펴보고, 관련자들을 심문하여 진실을 밝혀내야 한다.

과연 이것은 정말 자살일까?
아니면 숨겨진 범인이 있는 것일까?

모든 것은 당신의 추리에 달려있다.`,
      },
    ],
  };

  const pages = storyPages[caseId as keyof typeof storyPages] || [];
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

  if (!currentStory) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">스토리를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

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
        <div className="text-center mt-6">
          <button
            onClick={onNext}
            className="text-sm text-slate-500 hover:text-slate-400 transition-colors underline"
          >
            스토리 건너뛰기
          </button>
        </div>
      </div>
    </div>
  );
}