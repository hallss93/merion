import { Container } from 'pixi.js';
import type { IScene } from './types';
import { HomeView } from '../ui/components/HomeView';
import { AudioService } from '../services/AudioService';
import { AnimationService } from '../services/AnimationService';
import type { AnimatedSprite } from 'pixi.js';

type HomeState = 'loading' | 'idle' | 'interacting' | 'transition';

export class HomeScene implements IScene {
  public readonly container = new Container();
  private readonly view: HomeView;
  private readonly audioService: AudioService;
  private readonly animationService: AnimationService;
  private state: HomeState = 'loading';
  private foxIdleSprite: AnimatedSprite | null = null;
  private foxWinSprite: AnimatedSprite | null = null;
  private coinFxSprite: AnimatedSprite | null = null;

  public constructor(audioService: AudioService, animationService: AnimationService) {
    this.audioService = audioService;
    this.animationService = animationService;
    this.view = new HomeView();
    this.container.sortableChildren = true;
    this.container.addChild(this.view.container);
    this.view.onStart(() => this.handleStart());
  }

  public onEnter(): void {
    this.view.setVisible(true);
    this.ensureSprites();
    this.showIdleCharacter();
    this.setState('idle');
  }

  public onExit(): void {
    if (this.foxIdleSprite) {
      this.animationService.stop(this.foxIdleSprite);
    }
    if (this.foxWinSprite) {
      this.animationService.stop(this.foxWinSprite);
    }
    if (this.coinFxSprite) {
      this.animationService.stop(this.coinFxSprite);
    }
    this.view.setVisible(false);
  }

  public resize(width: number, height: number): void {
    this.view.resize(width, height);
  }

  private handleStart(): void {
    if (this.state !== 'idle') {
      return;
    }

    this.setState('interacting');
    this.audioService.play('ui_click');
    this.showWinCharacter();
    this.beginTransitionFlow();
  }

  private setState(nextState: HomeState): void {
    this.state = nextState;

    switch (nextState) {
      case 'loading':
        this.view.setStartEnabled(false);
        this.view.setOverlayVisible(true, 'Loading...');
        this.view.setSubtitle('Carregando recursos da cena inicial...');
        break;
      case 'idle':
        this.view.setStartEnabled(true);
        this.view.setOverlayVisible(false);
        this.view.setSubtitle('Cena inicial pronta para integrar assets e fluxo.');
        this.showIdleCharacter();
        break;
      case 'interacting':
        this.view.setStartEnabled(false);
        this.view.setOverlayVisible(false);
        this.view.setSubtitle('Processando interacao do jogador...');
        break;
      case 'transition':
        this.view.setStartEnabled(false);
        this.view.setOverlayVisible(true, 'TRANSITION');
        this.view.setSubtitle('Executando transicao de estado...');
        this.showCoinFx();
        break;
    }
  }

  private beginTransitionFlow(): void {
    globalThis.setTimeout(() => {
      this.setState('transition');

      globalThis.setTimeout(() => {
        this.hideCoinFx();
        this.setState('idle');
      }, 500);
    }, 350);
  }

  private ensureSprites(): void {
    if (!this.foxIdleSprite) {
      this.foxIdleSprite = this.animationService.createSequenceSprite('fox_idle', {
        loop: true,
        animationSpeed: 0.38,
      });
    }

    if (!this.foxWinSprite) {
      this.foxWinSprite = this.animationService.createSequenceSprite('fox_win', {
        loop: false,
        animationSpeed: 0.5,
      });
    }

    if (!this.coinFxSprite) {
      this.coinFxSprite = this.animationService.createSequenceSprite('golden_coin_1', {
        loop: true,
        animationSpeed: 0.62,
      });
    }
  }

  private showIdleCharacter(): void {
    if (!this.foxIdleSprite) {
      return;
    }

    this.view.setCharacterSprite(this.foxIdleSprite);
    this.animationService.play(this.foxIdleSprite);
  }

  private showWinCharacter(): void {
    if (!this.foxWinSprite) {
      return;
    }

    this.view.setCharacterSprite(this.foxWinSprite);
    this.animationService.play(this.foxWinSprite);
  }

  private showCoinFx(): void {
    if (!this.coinFxSprite) {
      return;
    }

    this.view.setFxSprite(this.coinFxSprite);
    this.animationService.play(this.coinFxSprite);
  }

  private hideCoinFx(): void {
    if (this.coinFxSprite) {
      this.animationService.stop(this.coinFxSprite);
    }

    this.view.setFxSprite(null);
  }
}
