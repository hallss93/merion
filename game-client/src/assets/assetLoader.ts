import { Assets } from 'pixi.js';
import {
  ASSETS_MANIFEST,
  SEQUENCE_DEFINITIONS,
  type AssetItem,
  type SequenceDefinition,
} from './assetsManifest';

function isRuntimeLoadable(asset: AssetItem): boolean {
  return asset.path.startsWith('/assets/');
}

export function registerRuntimeAssets(): void {
  for (const asset of ASSETS_MANIFEST) {
    if (!isRuntimeLoadable(asset)) {
      continue;
    }

    Assets.add({ alias: asset.key, src: asset.path });
  }
}

export async function loadAssetGroup(group: 'loading' | 'boot' | 'lazy'): Promise<void> {
  const keys = ASSETS_MANIFEST.filter(
    (asset) => asset.loadGroup === group && isRuntimeLoadable(asset),
  ).map((asset) => asset.key);

  if (keys.length === 0) {
    return;
  }

  await Assets.load(keys);
}

function buildSequenceFrameUrls(sequence: SequenceDefinition): string[] {
  const frames: string[] = [];

  for (let frame = sequence.startFrame; frame <= sequence.endFrame; frame += 1) {
    const frameIndex = String(frame).padStart(sequence.padLength, '0');
    frames.push(`${sequence.basePath}/${sequence.prefix}${frameIndex}.png`);
  }

  return frames;
}

export async function loadSequenceGroup(group: 'boot' | 'lazy'): Promise<void> {
  const frameUrls = SEQUENCE_DEFINITIONS.filter((sequence) => sequence.loadGroup === group).flatMap(
    (sequence) => buildSequenceFrameUrls(sequence),
  );

  if (frameUrls.length === 0) {
    return;
  }

  await Assets.load(frameUrls);
}
