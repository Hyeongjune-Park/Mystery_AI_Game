/**
 * apps/api/src/ai/choices.ts
 * 드라마틱(엔딩/긴급) 순간에만 노출할 선택지 계산.
 * NpcReplyV1.choices 스키마와 맞추기 위해 { id, label, hint? } 형식 사용.
 */

export type DramaticChoice = { id: string; label: string; hint?: string };

export function computeDramaticChoices(input: {
  node?: string;
  flags?: readonly string[];
}): DramaticChoice[] | undefined {
  const node = input.node ?? '';
  const flags = new Set(input.flags ?? []);

  const isEndgameNode = node.startsWith('endgame.');
  const accuseReady =
    flags.has('accuse_ready') || flags.has('alibi_all_failed');

  if (isEndgameNode || accuseReady) {
    return [
      { id: 'arrest', label: '체포한다' },
      { id: 'press', label: '계속 추궁한다' },
      { id: 'letgo', label: '넘어간다' },
    ];
  }

  return undefined; // 평시엔 없음
}
