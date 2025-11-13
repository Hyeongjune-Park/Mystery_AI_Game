'use client';

/**
 * StoryViewer Component
 * 스토리/컷신을 표시하는 풀스크린 뷰어
 */

import React, { useState, useEffect } from 'react';
import { Story } from '@/types/story.types';

interface StoryViewerProps {
  /** 표시할 스토리 객체 */
  story: Story;
  /** 스토리가 끝났을 때 호출되는 콜백 */
  onComplete: () => void;
  /** 스토리를 건너뛸 수 있는지 여부 */
  skippable?: boolean;
}

export default function StoryViewer({
  story,
  onComplete,
  skippable = true,
}: StoryViewerProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const currentScene = story.scenes[currentSceneIndex];
  const isLastScene = currentSceneIndex === story.scenes.length - 1;

  // 장면이 바뀔 때마다 이미지 로드 상태 초기화
  useEffect(() => {
    setIsImageLoaded(false);
  }, [currentSceneIndex]);

  // 다음 장면으로 이동
  const handleNext = () => {
    if (isLastScene) {
      onComplete();
    } else {
      setCurrentSceneIndex((prev) => prev + 1);
    }
  };

  // 이전 장면으로 이동
  const handlePrevious = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex((prev) => prev - 1);
    }
  };

  // 스토리 건너뛰기
  const handleSkip = () => {
    if (skippable) {
      onComplete();
    }
  };

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'Escape' && skippable) {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSceneIndex, isLastScene, skippable]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* 배경 이미지 */}
      <div className="absolute inset-0">
        <img
          src={currentScene.imageUrl}
          alt={currentScene.caption}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsImageLoaded(true)}
        />
        {/* 어두운 오버레이 (자막 가독성 향상) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />
      </div>

      {/* 컨텐츠 영역 */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* 상단 - 스토리 제목 & 건너뛰기 버튼 */}
        <div className="flex justify-between items-center p-6">
          <div className="text-white/80 text-sm font-medium">
            {story.title}
          </div>
          {skippable && (
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-white/80 hover:text-white text-sm font-medium transition-colors border border-white/30 hover:border-white/60 rounded"
            >
              건너뛰기 (ESC)
            </button>
          )}
        </div>

        {/* 중앙 - 장면 진행 인디케이터 */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 flex gap-2">
          {story.scenes.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentSceneIndex
                  ? 'w-12 bg-white'
                  : index < currentSceneIndex
                  ? 'w-8 bg-white/60'
                  : 'w-8 bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* 하단 - 자막 영역 */}
        <div className="mt-auto p-8 pb-12">
          <div className="max-w-4xl mx-auto">
            <p
              className="text-white text-xl md:text-2xl font-medium leading-relaxed text-center
                         shadow-lg"
              style={{
                textShadow: '2px 2px 8px rgba(0,0,0,0.9)',
                WebkitTextStroke: '0.5px rgba(0,0,0,0.5)',
              }}
            >
              {currentScene.caption}
            </p>
          </div>
        </div>

        {/* 네비게이션 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-center">
          {/* 이전 버튼 */}
          <button
            onClick={handlePrevious}
            disabled={currentSceneIndex === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              currentSceneIndex === 0
                ? 'opacity-0 cursor-not-allowed'
                : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
            }`}
          >
            ← 이전
          </button>

          {/* 장면 카운터 */}
          <div className="text-white/80 text-sm font-medium">
            {currentSceneIndex + 1} / {story.scenes.length}
          </div>

          {/* 다음/완료 버튼 */}
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium backdrop-blur-sm transition-all"
          >
            {isLastScene ? '시작하기' : '다음 →'}
          </button>
        </div>

        {/* 클릭으로 다음 장면 (모바일 친화적) */}
        <div
          className="absolute inset-0 cursor-pointer md:cursor-default"
          onClick={(e) => {
            // 버튼 영역 클릭은 무시
            if ((e.target as HTMLElement).tagName !== 'BUTTON') {
              handleNext();
            }
          }}
        />
      </div>

      {/* 로딩 인디케이터 */}
      {!isImageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
}
