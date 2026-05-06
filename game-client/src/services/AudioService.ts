import { sound } from '@pixi/sound';

export class AudioService {
  public play(alias: string): void {
    if (!sound.exists(alias)) {
      return;
    }

    sound.play(alias);
  }
}
