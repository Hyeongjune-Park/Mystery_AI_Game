'use client';

/**
 * apps/web/src/app/play/[caseId]/ChoiceBar.tsx
 * - 드라마틱(엔딩/긴급) 순간에만 뜨는 선택지 바
 * - 선택하면 onPick(choice) 콜백 호출
 * - 디자인은 Tailwind v4 기준 심플
 */

export type Choice = { id: string; text: string };

export default function ChoiceBar({
  choices,
  onPick,
  disabled,
}: {
  choices: Choice[];
  onPick: (c: Choice) => void;
  disabled?: boolean;
}) {
  if (!choices?.length) return null;

  return (
    <div className="rounded-xl border p-3 bg-white shadow-sm">
      <div className="mb-2 text-sm font-semibold">결정이 필요합니다</div>
      <div className="flex flex-wrap gap-2">
        {choices.map((c) => (
          <button
            key={c.id}
            onClick={() => onPick(c)}
            disabled={disabled}
            className="rounded-full border px-3 py-1 text-sm hover:bg-black hover:text-white disabled:opacity-50"
          >
            {c.text}
          </button>
        ))}
      </div>
    </div>
  );
}
