import { loadAssetGroup, loadSequenceGroup, registerRuntimeAssets } from '../assets/assetLoader';

/** Orquestra registro e preload de assets por grupo (loading, boot, lazy). */
export class AssetService {
  /** Registra URLs no loader do Pixi antes de qualquer preload. */
  public registerAssets(): void {
    registerRuntimeAssets();
  }

  /** Carrega o mínimo para exibir a tela de loading. */
  public async preloadLoadingScreen(): Promise<void> {
    await loadAssetGroup('loading');
  }

  /** Carrega assets essenciais do jogo principal. */
  public async preloadBoot(): Promise<void> {
    await Promise.all([loadAssetGroup('boot'), loadSequenceGroup('boot')]);
  }

  /** Carrega assets secundários sob demanda. */
  public async preloadLazy(): Promise<void> {
    await Promise.all([loadAssetGroup('lazy'), loadSequenceGroup('lazy')]);
  }
}
