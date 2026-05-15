import { sound } from '@pixi/sound';

/** Toca sons registrados no Pixi Sound pelo alias. */
export class AudioService {
  /** Reproduz o som se o alias existir (ignora silenciosamente se não). */
  public play(alias: string): void {
    if (!sound.exists(alias)) {
      return;
    }

    sound.play(alias);
  }
}
