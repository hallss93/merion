# Merion - Desafio Tecnico PixiJS (Bank Roberry Slot)

Implementacao da tela inicial e fluxo principal do desafio tecnico usando `PixiJS + TypeScript + Vite`, com foco em:

- estrutura visual baseada nas referencias
- fluxo de interacao principal
- organizacao modular de codigo
- performance basica para navegacao fluida

## Visao geral

O projeto executavel esta em `game-client/` e usa:

- `pixi.js` para renderizacao
- `@esotericsoftware/spine-pixi-v8` para animacoes Spine
- `vite` para desenvolvimento/build
- `typescript` para tipagem e organizacao

Fluxo implementado:

1. **LoadingScene**
   - exibe `preloader_full.png`
   - exibe Fox Spine em overlay
2. **GameScene**
   - exibe `main_game.png`
   - renderiza grade de simbolos animados (6x5)
   - alterna modo por rota (`/coins` ou padrao)
   - exibe sequencia de wins com overlay escuro:
     - `Big_Win` (sequencia PNG)
     - `Mega_Win` (Spine)
     - `Super_Mega_Win` (Spine)
     - `Total_Win` (Spine)

## Estrutura de pastas

```txt
merion/
  BANK ROBERRY SLOT/                # material de apoio do desafio (assets/previews/docs)
  game-client/                      # projeto executavel PixiJS
    public/assets/
      ui/
      sequences/
      spine/
    src/
      assets/                       # manifest + loader
      config/                       # configs de layout/animacao (sem valores magicos)
      core/                         # GameApp e SceneManager
      scenes/                       # LoadingScene e GameScene
      services/                     # AssetService, AnimationService, AudioService
      ui/components/                # LoadingView, HomeView
      utils/
```

## Requisitos

- Node.js 20+ (recomendado)
- npm 10+ (ou versao compativel com seu Node)

## Como rodar

No terminal, a partir da raiz do repositorio:

```bash
cd game-client
npm install
npm run dev
```

Abrir no navegador:

- padrao (objetos): `http://localhost:5173/`
- modo coins: `http://localhost:5173/coins`

## Scripts disponiveis

Em `game-client/package.json`:

- `npm run dev` - sobe servidor local com Vite
- `npm run build` - gera build de producao (`tsc && vite build`)
- `npm run preview` - sobe preview da build gerada
- `npm test` - executa testes com [Vitest](https://vitest.dev/) (ex.: `src/domain/slot/SpinEngine.test.ts`, `src/state/SlotStore.test.ts`)
- `npm run lint` - executa [ESLint](https://eslint.org/) em `src/`
- `npm run lint:fix` - ESLint com correcao automatica quando possivel
- `npm run format` - aplica [Prettier](https://prettier.io/) em `src/**/*.ts` e `src/**/*.css`
- `npm run format:check` - verifica formatacao sem alterar arquivos

## Build de producao

```bash
cd game-client
npm run build
npm run preview
```

Saida gerada em `game-client/dist/`.

## Arquitetura e decisoes tecnicas

### 1) Cena e ciclo de vida

- `GameApp` inicializa Pixi, registra assets e troca cenas.
- `SceneManager` centraliza `onEnter`, `onExit` e `resize`.
- Cenas seguem contrato de `IScene` (`container`, `onEnter`, `onExit`, `resize`).

### 2) Pipeline de assets

- `src/assets/assetsManifest.ts` define grupos:
  - `loading`: recursos essenciais da tela inicial
  - `boot`: recursos essenciais para entrada no jogo
  - `lazy`: recursos nao criticos
- `src/assets/assetLoader.ts`:
  - registra aliases no Pixi `Assets`
  - carrega grupos por etapa
  - carrega sequencias por faixa de frames

### 3) Responsividade

- Layout baseado em ratios configuraveis.
- Configs extraidas para `src/config/`:
  - `gameSceneConfig.ts`
  - `loadingViewConfig.ts`

### 4) Performance basica aplicada

- Reuso de `AnimatedSprite` na grade (pool de sprites).
- Cache de texturas por simbolo para evitar lookup repetitivo.
- Evita rebuild desnecessario quando o modo da rota nao muda.
- Carregamento lazy em runtime (sem sobrecarregar o boot inicial).

## Comportamento por rota

`GameScene` decide o grupo de simbolos por `window.location.pathname`:

- se incluir `/coins` -> usa `Coins`
- caso contrario -> usa `Objects`

Em ambos os casos a distribuicao e randomizada.

## Validacao antes da entrega

Checklist tecnico recomendado:

- `npm run dev` inicia sem erro
- `npm run build` conclui com sucesso
- `npm test` passa em `game-client/`
- `npm run lint` e `npm run format:check` passam em `game-client/`
- fluxo visual confere com as referencias do desafio

## Limitacoes conhecidas

- o bundle principal ainda esta acima do warning padrao do Vite de 500kB.
- a cobertura de testes automatizados ainda e limitada (motor do slot e store; sem E2E na pipeline).
- ajustes finos de timing/layout podem variar por resolucao e dispositivo.

## Melhorias futuras

- code splitting adicional para reduzir tamanho de bundle inicial
- ampliar testes de unidade (servicos asset/animation, paytable, mais fluxos de UI)
- testes E2E de fluxo de cena/rota
- telemetry simples de FPS e tempo de loading por etapa

## Referencias

- [PixiJS](https://pixijs.com/)
- [Spine Pixi Runtime](https://github.com/EsotericSoftware/spine-runtimes)

