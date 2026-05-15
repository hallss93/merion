import type { SymbolDefinition } from '../../config/gameSceneConfig';
import { getMultiplierForSymbol, OFFICIAL_PAYLINES } from './Paytable';
import { Rng } from './Rng';
import type { LineWin, RngMode, SpinResult } from './SlotTypes';
import { DEFAULT_RNG_MODE } from './SlotRules';

interface SpinParams {
  bet: number;
  symbols: SymbolDefinition[];
  rows: number;
  columns: number;
}

/** Gera a grade do giro e calcula ganhos nas paylines. */
export class SpinEngine {
  private readonly rng = new Rng();
  private readonly rngMode: RngMode;

  public constructor(rngMode: RngMode = DEFAULT_RNG_MODE) {
    this.rngMode = rngMode;
  }

  /** Executa um giro completo: sorteia grade, avalia linhas e soma o ganho. */
  public spin(params: SpinParams): SpinResult {
    const matrix = this.buildMatrix(params.symbols, params.rows, params.columns);
    const wins = this.evaluateRows(matrix, params.bet);
    const totalMultiplier = wins.reduce((sum, item) => sum + item.multiplier, 0);
    const totalWin = wins.reduce((sum, item) => sum + item.amount, 0);

    return {
      matrix,
      wins,
      totalMultiplier,
      totalWin,
    };
  }

  /** Preenche cada célula com um símbolo sorteado pelo Rng. */
  private buildMatrix(
    symbols: SymbolDefinition[],
    rows: number,
    columns: number,
  ): SymbolDefinition[][] {
    const matrix: SymbolDefinition[][] = [];
    for (let row = 0; row < rows; row += 1) {
      const rowSymbols: SymbolDefinition[] = [];
      for (let column = 0; column < columns; column += 1) {
        rowSymbols.push(
          this.rngMode === 'mock' ? this.rng.pickMock(symbols) : this.rng.pick(symbols),
        );
      }
      matrix.push(rowSymbols);
    }
    return matrix;
  }

  /** Verifica as 10 paylines e retorna só as que pagaram (aposta × multiplicador). */
  private evaluateRows(matrix: SymbolDefinition[][], bet: number): LineWin[] {
    const wins: LineWin[] = [];

    for (let lineId = 0; lineId < OFFICIAL_PAYLINES.length; lineId += 1) {
      const pattern = OFFICIAL_PAYLINES[lineId];
      const firstRow = pattern[0];
      const firstSymbol = matrix[firstRow]?.[0];
      if (!firstSymbol) {
        continue;
      }

      const symbolName = firstSymbol.folder;
      let count = 1;

      for (let col = 1; col < pattern.length; col += 1) {
        const row = pattern[col];
        const symbol = matrix[row]?.[col];
        if (!symbol || symbol.folder !== symbolName) {
          break;
        }
        count += 1;
      }

      const multiplier = getMultiplierForSymbol(symbolName, count);
      if (multiplier <= 0) {
        continue;
      }

      wins.push({
        lineId,
        symbol: symbolName,
        count,
        multiplier,
        amount: Number((bet * multiplier).toFixed(2)),
      });
    }

    return wins;
  }
}
