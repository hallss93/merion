/** Sorteia símbolos e números para o motor do slot. */
export class Rng {
  private mockCounter = 0;

  /** Inteiro aleatório entre min e max (inclusive). */
  public int(min: number, max: number): number {
    if (max < min) {
      return min;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /** Escolhe um item aleatório da lista (modo fair). */
  public pick<T>(items: T[]): T {
    if (items.length === 0) {
      throw new Error('Rng.pick recebeu lista vazia.');
    }
    const index = this.int(0, items.length - 1);
    return items[index];
  }

  /** Percorre a lista em ordem — previsível para testes. */
  public pickMock<T>(items: T[]): T {
    if (items.length === 0) {
      throw new Error('Rng.pickMock recebeu lista vazia.');
    }
    const index = this.mockCounter % items.length;
    this.mockCounter += 1;
    return items[index];
  }
}
