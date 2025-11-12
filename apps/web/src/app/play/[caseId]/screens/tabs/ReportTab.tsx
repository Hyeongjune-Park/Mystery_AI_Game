"use client";

import { useState } from "react";

interface ReportTabProps {
  caseId: string;
}

export default function ReportTab({ caseId }: ReportTabProps) {
  const [culprit, setCulprit] = useState("");
  const [evidence, setEvidence] = useState<string[]>([]);
  const [explanation, setExplanation] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // NPC 목록 (범인 선택용)
  const suspects = [
    { id: "npc.detective.doil", name: "도일 형사" },
    { id: "npc.suspect.minseo", name: "박민서" },
    { id: "npc.witness.neighbor", name: "이웃 주민" },
    { id: "npc.friend.suji", name: "이수진" },
    { id: "other", name: "기타 (직접 입력)" },
  ];

  // 증거 목록 (체크박스용)
  const evidenceList = [
    { id: "evidence.wine_glass", label: "와인잔의 지문" },
    { id: "evidence.suicide_note", label: "유서" },
    { id: "evidence.rooftop_door", label: "옥상 출입문 지문" },
    { id: "evidence.cctv", label: "지하철역 CCTV" },
    { id: "evidence.autopsy", label: "부검 보고서" },
    { id: "evidence.transport_card", label: "교통카드 기록" },
  ];

  const handleEvidenceToggle = (evidenceId: string) => {
    setEvidence((prev) =>
      prev.includes(evidenceId)
        ? prev.filter((id) => id !== evidenceId)
        : [...prev, evidenceId]
    );
  };

  const handleSubmit = () => {
    if (!culprit || evidence.length === 0 || !explanation.trim()) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    // 임시 제출 처리 (나중에 API 연동)
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      alert("보고서가 제출되었습니다! (현재는 더미 제출입니다. 실제 채점 기능은 추후 구현됩니다.)");
    }, 1500);
  };

  const canSubmit = culprit && evidence.length > 0 && explanation.trim();

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">결과 보고서 제출</h2>
      <p className="text-slate-400 mb-8">
        수사 결과를 정리하여 제출하세요. 모든 항목을 신중하게 작성해주세요.
      </p>

      {submitted ? (
        // 제출 완료 화면
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">보고서가 제출되었습니다!</h3>
          <p className="text-slate-400 mb-6">
            제출된 보고서는 검토 중입니다. 결과는 곧 확인할 수 있습니다.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            다시 작성하기
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 범인 선택 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <label className="block text-white font-semibold mb-3">
              범인 <span className="text-red-400">*</span>
            </label>
            <p className="text-sm text-slate-400 mb-4">
              누가 이 사건의 범인이라고 생각하시나요?
            </p>
            <div className="space-y-2">
              {suspects.map((suspect) => (
                <label
                  key={suspect.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    culprit === suspect.id
                      ? "bg-amber-500/10 border-amber-500/50"
                      : "bg-slate-700/30 border-slate-600 hover:border-slate-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="culprit"
                    value={suspect.id}
                    checked={culprit === suspect.id}
                    onChange={(e) => setCulprit(e.target.value)}
                    className="w-4 h-4 text-amber-500"
                  />
                  <span className="text-white">{suspect.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 증거 선택 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <label className="block text-white font-semibold mb-3">
              증거 선택 <span className="text-red-400">*</span>
            </label>
            <p className="text-sm text-slate-400 mb-4">
              범인을 특정하는 데 사용한 증거를 모두 선택하세요. (복수 선택 가능)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {evidenceList.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    evidence.includes(item.id)
                      ? "bg-amber-500/10 border-amber-500/50"
                      : "bg-slate-700/30 border-slate-600 hover:border-slate-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={evidence.includes(item.id)}
                    onChange={() => handleEvidenceToggle(item.id)}
                    className="w-4 h-4 text-amber-500"
                  />
                  <span className="text-white text-sm">{item.label}</span>
                </label>
              ))}
            </div>
            {evidence.length > 0 && (
              <p className="text-xs text-amber-400 mt-3">
                {evidence.length}개의 증거가 선택되었습니다
              </p>
            )}
          </div>

          {/* 추리 설명 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <label className="block text-white font-semibold mb-3">
              추리 설명 <span className="text-red-400">*</span>
            </label>
            <p className="text-sm text-slate-400 mb-4">
              왜 이 사람이 범인이라고 생각하시나요? 증거를 바탕으로 논리적으로 설명해주세요.
            </p>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="예시:
박민서는 피해자와 2주 전 결별했으며, 사건 당일 밤 지하철역 CCTV에 포착되었습니다.
와인잔에서 발견된 지문은 박민서의 것으로 확인되었으며, 부검 보고서에 따르면..."
              className="w-full h-48 bg-slate-700 border border-slate-600 rounded-lg p-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
            <p className="text-xs text-slate-500 mt-2">
              {explanation.length}자 / 최소 100자 권장
            </p>
          </div>

          {/* 특이사항 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <label className="block text-white font-semibold mb-3">
              특이사항 (선택)
            </label>
            <p className="text-sm text-slate-400 mb-4">
              수사 과정에서 발견한 추가 정보나 의견을 자유롭게 작성하세요.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="기타 의견이나 특이사항을 자유롭게 작성하세요..."
              className="w-full h-32 bg-slate-700 border border-slate-600 rounded-lg p-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          {/* 제출 버튼 */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-slate-400">
              {!canSubmit && <span className="text-red-400">* 필수 항목을 모두 입력해주세요</span>}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-slate-900 disabled:text-slate-500 font-bold px-8 py-4 rounded-lg transition-all shadow-lg disabled:shadow-none flex items-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>제출 중...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>보고서 제출</span>
                </>
              )}
            </button>
          </div>

          {/* 경고 메시지 */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-slate-300">
                <p className="font-semibold text-amber-400 mb-1">주의사항</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>제출 후에는 수정할 수 없습니다</li>
                  <li>모든 증거와 추리를 신중하게 검토하세요</li>
                  <li>논리적 근거가 부족하면 점수가 낮아질 수 있습니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}