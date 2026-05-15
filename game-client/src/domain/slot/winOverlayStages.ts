/** Valores mínimos de ganho para cada nível de animação de vitória. */
export interface WinAmountThresholds {
  readonly bigWin: number;
  readonly megaWin: number;
  readonly superMegaWin: number;
}

/** Define a animação principal (0=Big, 1=Mega, 2=Super Mega) conforme o valor ganho. */
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

/** Lista de estágios a exibir: animação principal + Total Win (índice 3). */
export function getWinStageIndices(totalWin: number, thresholds: WinAmountThresholds): number[] {
  const primaryStageIndex = getPrimaryWinStageIndex(totalWin, thresholds);
  if (primaryStageIndex === null) {
    return [];
  }
  return [primaryStageIndex, 3];
}
