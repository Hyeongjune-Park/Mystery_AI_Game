"use client";

import { useState, useEffect } from "react";

interface NotesTabProps {
  caseId: string;
}

export default function NotesTab({ caseId }: NotesTabProps) {
  const [notes, setNotes] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 로컬 스토리지에서 노트 불러오기
  useEffect(() => {
    const savedNotes = localStorage.getItem(`notes_${caseId}`);
    if (savedNotes) {
      setNotes(savedNotes);
      const savedTime = localStorage.getItem(`notes_${caseId}_time`);
      if (savedTime) {
        setLastSaved(new Date(savedTime));
      }
    }
  }, [caseId]);

  // 노트 저장 (디바운스)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (notes) {
        setIsSaving(true);
        localStorage.setItem(`notes_${caseId}`, notes);
        const now = new Date();
        localStorage.setItem(`notes_${caseId}_time`, now.toISOString());
        setLastSaved(now);
        setTimeout(() => setIsSaving(false), 500);
      }
    }, 1000); // 1초 후 자동 저장

    return () => clearTimeout(timer);
  }, [notes, caseId]);

  const handleClear = () => {
    if (confirm("노트를 모두 삭제하시겠습니까?")) {
      setNotes("");
      localStorage.removeItem(`notes_${caseId}`);
      localStorage.removeItem(`notes_${caseId}_time`);
      setLastSaved(null);
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return null;
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

    if (diff < 60) return "방금 전 저장됨";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전 저장됨`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전 저장됨`;
    return lastSaved.toLocaleDateString("ko-KR");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-240px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">수사노트</h2>
          <p className="text-sm text-slate-400">
            사건 조사 중 발견한 단서나 생각을 자유롭게 메모하세요.
          </p>
        </div>
        <button
          onClick={handleClear}
          disabled={!notes}
          className="text-sm text-slate-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>전체 삭제</span>
        </button>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>자동 저장됨</span>
          {lastSaved && <span>{formatLastSaved()}</span>}
        </div>
        {isSaving && (
          <div className="flex items-center gap-2 text-amber-400">
            <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>저장 중...</span>
          </div>
        )}
      </div>

      {/* Notes Textarea */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="여기에 메모를 작성하세요...

예시:
- 박민서: 피해자와 2주 전 결별, 불안한 모습
- 와인잔에 지문이 남아있음 → 부검 보고서와 대조 필요
- 옥상 출입문 지문 조사 필요
- 유서 필적 분석 요청

자유롭게 작성하세요!"
        className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none font-mono text-sm leading-relaxed"
      />

      {/* Tips */}
      <div className="mt-4 bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-slate-300 space-y-1">
            <p className="font-semibold text-amber-400 mb-2">메모 작성 팁</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>NPC와의 대화에서 중요한 정보를 기록하세요</li>
              <li>모순되는 진술이나 의심스러운 행동을 메모하세요</li>
              <li>증거들 간의 연관성을 정리하세요</li>
              <li>노트는 자동으로 저장되며, 언제든 다시 확인할 수 있습니다</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Character Count */}
      <div className="mt-2 text-right text-xs text-slate-500">
        {notes.length.toLocaleString()}자
      </div>
    </div>
  );
}