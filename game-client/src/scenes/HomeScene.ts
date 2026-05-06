import { Container } from 'pixi.js';
import type { IScene } from './types';
import { HomeView } from '../ui/components/HomeView';
import { AudioService } from '../services/AudioService';
import { AnimationService } from '../services/AnimationService';

type HomeState = 'loading' | 'idle' | 'interacting' | 'transition';

export class HomeScene implements IScene {
  public readonly container = new Container();
  private readonly view: HomeView;
  private readonly audioService: AudioService;
  private readonly animationService: AnimationService;
  private state: HomeState = 'loading';

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
    this.setState('idle');
  }

  public onExit(): void {
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
    this.animationService.play('home_start');
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
        break;
    }
  }

  private beginTransitionFlow(): void {
    globalThis.setTimeout(() => {
      this.setState('transition');

      globalThis.setTimeout(() => {
        this.setState('idle');
      }, 500);
    }, 350);
  }
}
