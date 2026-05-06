import './style.css';
import { GameApp } from './core/GameApp';

async function bootstrap(): Promise<void> {
  const host = document.querySelector<HTMLDivElement>('#app');
  if (!host) {
    throw new Error('Container #app nao encontrado.');
  }

  const game = new GameApp(host);
  await game.start();
}

void bootstrap();
