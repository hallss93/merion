import { Container } from 'pixi.js';
import type { IScene } from './types';
import { HomeView } from '../ui/components/HomeView';
import { AudioService } from '../services/AudioService';
import { AnimationService } from '../services/AnimationService';

export class HomeScene implements IScene {
  public readonly container = new Container();
  private readonly view: HomeView;
  private readonly audioService: AudioService;
  private readonly animationService: AnimationService;

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
  }

  public onExit(): void {
    this.view.setVisible(false);
  }

  public resize(width: number, height: number): void {
    this.view.resize(width, height);
  }

  private handleStart(): void {
    this.audioService.play('ui_click');
    this.animationService.play('home_start');
  }
}
