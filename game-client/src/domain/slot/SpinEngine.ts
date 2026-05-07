import type { SymbolDefinition } from '../../config/gameSceneConfig';
import { getMultiplierForSymbol } from './Paytable';
import { Rng } from './Rng';
import type { LineWin, SpinResult } from './SlotTypes';

interface SpinParams {
  bet: number;
  symbols: SymbolDefinition[];
  rows: number;
  columns: number;
}

export class SpinEngine {
  private readonly rng = new Rng();

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

  private buildMatrix(
    symbols: SymbolDefinition[],
    rows: number,
    columns: number,
  ): SymbolDefinition[][] {
    const matrix: SymbolDefinition[][] = [];
    for (let row = 0; row < rows; row += 1) {
      const rowSymbols: SymbolDefinition[] = [];
      for (let column = 0; column < columns; column += 1) {
        rowSymbols.push(this.rng.pick(symbols));
      }
      matrix.push(rowSymbols);
    }
    return matrix;
  }

  private evaluateRows(matrix: SymbolDefinition[][], bet: number): LineWin[] {
    const wins: LineWin[] = [];

    for (let row = 0; row < matrix.length; row += 1) {
      const rowData = matrix[row];
      if (!rowData || rowData.length === 0) {
        continue;
      }

      const first = rowData[0];
      const symbolName = first.folder;
      let count = 1;

      for (let col = 1; col < rowData.length; col += 1) {
        if (rowData[col].folder !== symbolName) {
          break;
        }
        count += 1;
      }

      const multiplier = getMultiplierForSymbol(symbolName, count);
      if (multiplier <= 0) {
        continue;
      }

      wins.push({
        lineId: row,
        symbol: symbolName,
        count,
        multiplier,
        amount: Number((bet * multiplier).toFixed(2)),
      });
    }

    return wins;
  }
}
