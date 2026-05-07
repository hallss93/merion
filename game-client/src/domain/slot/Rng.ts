export class Rng {
  public int(min: number, max: number): number {
    if (max < min) {
      return min;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public pick<T>(items: T[]): T {
    if (items.length === 0) {
      throw new Error('Rng.pick recebeu lista vazia.');
    }
    const index = this.int(0, items.length - 1);
    return items[index];
  }
}
