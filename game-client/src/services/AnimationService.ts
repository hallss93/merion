import { AnimatedSprite, Assets, type Texture } from 'pixi.js';
import { SEQUENCE_DEFINITIONS } from '../assets/assetsManifest';

const DEFAULT_SEQUENCE_SPEED = 0.58;

interface SequenceSpriteOptions {
  loop?: boolean;
  animationSpeed?: number;
}

export class AnimationService {
  public createSequenceSprite(
    sequenceKey: string,
    options: SequenceSpriteOptions = {},
  ): AnimatedSprite {
    const sequence = SEQUENCE_DEFINITIONS.find((item) => item.key === sequenceKey);
    if (!sequence) {
      throw new Error(`Sequencia nao encontrada: ${sequenceKey}`);
    }

    const textures = this.getSequenceTextures(sequenceKey);
    const sprite = new AnimatedSprite(textures);
    sprite.loop = options.loop ?? true;
    sprite.animationSpeed = options.animationSpeed ?? DEFAULT_SEQUENCE_SPEED;
    sprite.anchor.set(0.5);

    return sprite;
  }

  public play(sprite: AnimatedSprite): void {
    sprite.gotoAndPlay(0);
  }

  public stop(sprite: AnimatedSprite): void {
    sprite.stop();
  }

  private getSequenceTextures(sequenceKey: string): Texture[] {
    const sequence = SEQUENCE_DEFINITIONS.find((item) => item.key === sequenceKey);
    if (!sequence) {
      return [];
    }

    const textures: Texture[] = [];
    for (let frame = sequence.startFrame; frame <= sequence.endFrame; frame += 1) {
      const frameIndex = String(frame).padStart(sequence.padLength, '0');
      const path = `${sequence.basePath}/${sequence.prefix}${frameIndex}.png`;
      const texture = Assets.get(path) as Texture | undefined;
      if (texture) {
        textures.push(texture);
      }
    }

    return textures;
  }
}
