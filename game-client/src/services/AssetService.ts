import {
  loadAssetGroup,
  loadSequenceGroup,
  registerRuntimeAssets,
} from '../assets/assetLoader';

export class AssetService {
  public registerAssets(): void {
    registerRuntimeAssets();
  }

  public async preloadLoadingScreen(): Promise<void> {
    await loadAssetGroup('loading');
  }

  public async preloadBoot(): Promise<void> {
    await Promise.all([loadAssetGroup('boot'), loadSequenceGroup('boot')]);
  }

  public async preloadLazy(): Promise<void> {
    await Promise.all([loadAssetGroup('lazy'), loadSequenceGroup('lazy')]);
  }
}
