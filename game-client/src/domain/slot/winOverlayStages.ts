export interface WinAmountThresholds {
  readonly bigWin: number;
  readonly megaWin: number;
  readonly superMegaWin: number;
}

export function getPrimaryWinStageIndex(
  totalWin: number,
  thresholds: WinAmountThresholds,
): 0 | 1 | 2 | null {
  if (totalWin >= thresholds.superMegaWin) {
    return 2;
  }
  if (totalWin >= thresholds.megaWin) {
    return 1;
  }
  if (totalWin >= thresholds.bigWin) {
    return 0;
  }
  if (totalWin > 0) {
    return 0;
  }
  return null;
}

export function getWinStageIndices(totalWin: number, thresholds: WinAmountThresholds): number[] {
  const primaryStageIndex = getPrimaryWinStageIndex(totalWin, thresholds);
  if (primaryStageIndex === null) {
    return [];
  }
  return [primaryStageIndex, 3];
}
