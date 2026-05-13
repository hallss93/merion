# Melhorias e ideias para o projeto Merion (passo a passo)

Este documento organiza melhorias em **ordem sugerida de execução**: primeiro o que desbloqueia documentação e qualidade, depois UX, performance, produto, domínio do jogo e, por último, o que exige backend ou compliance forte. Foco em `game-client/`.

---

## Passo 1 — Documentação alinhada ao código

**Status: concluído** (README na raiz: Vitest e testes; **sem** links no README para arquivos em `docs/`, por decisão do projeto).

1. Atualizar o `README.md` na raiz: remover a afirmação de que **não há testes**; citar **Vitest** e os arquivos `SpinEngine.test.ts` e `SlotStore.test.ts`.

**Critério de pronto:** quem clona o repo entende como rodar e testar o `game-client/`.

---

## Passo 2 — Padrão de código (lint e formatação)

**Status: concluído** (`game-client/`: ESLint 9, typescript-eslint, Prettier, `@vitest/eslint-plugin`; scripts `lint`, `lint:fix`, `format`, `format:check`; primeiro `format` aplicado em `src/`).

1. Adicionar **ESLint** + **Prettier** (regras compatíveis com TypeScript 6).
2. Ajustar scripts no `package.json` (por exemplo `npm run lint`, `npm run format`).
3. Corrigir ou suprimir de forma explícita o que aparecer no primeiro passo do lint.

**Critério de pronto:** `npm run lint` passa em CI local sem surpresas.

---

## Passo 3 — Integração contínua (CI)

1. Criar workflow (ex.: GitHub Actions) na raiz do repositório.
2. Em `game-client/`: `npm ci`, `npm test`, `npm run build`.
3. Falhar o pipeline se qualquer etapa falhar.

**Critério de pronto:** cada push/PR valida build e testes automaticamente.

---

## Passo 4 — Ampliar testes unitários

1. **Paytable:** casos limite de `getMultiplierForSymbol` (símbolo inexistente, `count < 3`, `count > 6`).
2. **SlotStore:** fases, `not_idle`, limites de aposta (já há parte disso; completar lacunas).
3. **GameScene (opcional):** extrair funções puras (ex.: escolha de estágio de win) e testar thresholds com `gameSceneConfig` mockado.

**Critério de pronto:** mudanças na paytable e no store quebram testes de forma clara.

---

## Passo 5 — Testes end-to-end (E2E)

1. Escolher **Playwright** ou **Cypress**.
2. Cenário mínimo: abrir app, eventualmente rota `/coins`, disparar um giro (mock de tempo se necessário).
3. Opcional: snapshot de saldo/HUD após settle (com RNG controlado ou interceptação).

**Critério de pronto:** um fluxo crítico do jogador roda em headless sem regressão silenciosa.

---

## Passo 6 — Feedback claro na UI

1. Quando `getSpinBlockReason()` for `insufficient_balance`, mostrar mensagem ou toast (não só botão desabilitado).
2. Quando for `not_idle`, opcionalmente indicar “aguarde o fim da animação” ou equivalente.
3. Revisar se o overlay de win pode ser confundido com “ganho grande” em vitórias pequenas (ajuste de limiares ou cópia na UI).

**Critério de pronto:** o jogador sabe **por que** não pode girar.

---

## Passo 7 — Acessibilidade e teclado

1. Atalho (ex.: **Espaço** ou **Enter**) para girar quando o foco estiver no canvas ou em região focável.
2. Onde fizer sentido, expor saldo/aposta/ganho para leitores de tela (`aria-live` em HTML ao redor do canvas ou painel paralelo).
3. Foco visível em controles HTML, se houver.

**Critério de pronto:** uso básico sem mouse é possível em ambiente de teste.

---

## Passo 8 — Destaque visual das linhas vencedoras

1. Após `spinResult.wins`, mapear `lineId` → geometria das células na grade (usar mesmos ratios de `gameSceneConfig`).
2. Desenhar linhas ou contorno por cima dos reels durante `showingWin` (e limpar ao voltar para `idle`).

**Critério de pronto:** o jogador vê **quais** paylines pagaram, não só o valor.

---

## Passo 9 — Áudio robusto

1. Integrar `AudioService` ao fluxo de spin / win / botões (onde ainda faltar).
2. Controle de volume + **mute** persistido (ex.: `localStorage`).
3. Fallback silencioso se o carregamento de som falhar (não travar a cena).

**Critério de pronto:** áudio opcional, previsível e recuperável.

---

## Passo 10 — Performance e assets

1. **Code splitting / lazy load:** adiar Spine e sequências não usadas na primeira tela (o README já cita bundle grande).
2. **Cache de deploy:** nomes de arquivo com hash ou estratégia de versionamento para `public/assets`.
3. **Mobile:** revisar `resolution`, número de `AnimatedSprite` ativos e testes em dispositivos reais ou emulação.

**Critério de pronto:** First load e uso contínuo aceitáveis no alvo de hardware definido pelo time.

---

## Passo 11 — Persistência e histórico leve

1. **Saldo:** persistir em `localStorage` (protótipo) ou preparar interface para saldo vindo de API.
2. **Histórico:** o log `[slot-round]` no console pode virar lista em memória, export CSV ou envio de telemetria (opt-in).

**Critério de pronto:** reload da página não “apaga” a economia em modo demo, se essa for a decisão de produto.

---

## Passo 12 — Domínio do slot (sem servidor ainda)

1. **PRNG com seed:** além do modo `mock`, permitir seed fixa para demos e regressão visual.
2. **Linhas configuráveis:** modelo “aposta por linha × N linhas ativas” (hoje o bet parece ser o valor total da rodada).
3. **Paytable injetável:** `SpinEngine.spin` aceitar paytable opcional (hoje `getMultiplierForSymbol` já aceita parâmetro, mas o engine não expõe).

**Critério de pronto:** balanceamento e testes não exigem fork pesado do motor.

---

## Passo 13 — Mecânicas de jogo avançadas

1. **Pesos / RTP:** trocar distribuição uniforme do `Rng.pick` por **strip reels** ou pesos por símbolo; documentar RTP alvo.
2. **Wild / Scatter / bônus:** estender modelo de avaliação além de “mesmo símbolo na payline da esquerda para a direita”.
3. **Free spins / minigame:** novo estado de sessão e UI.

**Critério de pronto:** design de jogo e matemática documentados (pode complementar `docs/GANHOS_E_RODADAS.md`).

---

## Passo 14 — Fluxo de produto e conteúdo

1. Decidir fluxo: **Loading → Game** direto ou passar por **HomeScene** (já existe no código).
2. **i18n:** strings e formatação numérica (moeda, separador decimal).
3. **Tutorial** na primeira visita (ligar ao doc de ganhos).

**Critério de pronto:** rota e copy alinhadas ao que o produto quer mostrar.

---

## Passo 15 — Segurança, compliance e servidor

1. **Não confiar no cliente** para saldo real nem para resultado de aposta: backend auditável que devolve o resultado do giro.
2. **Logs:** evitar dados sensíveis em produção; política de retenção.
3. **Jogo responsável:** limites de aposta, tempo de sessão, mensagens obrigatórias conforme mercado.

**Critério de pronto:** modelo ameaça/mitigação acordado com stakeholders (jurídico/negócio).

---

## Passo 16 — Empacotar núcleo compartilhado (opcional)

1. Extrair `domain/slot` + `SlotStore` (e tipos) para pacote interno, ex.: `@merion/slot-core`.
2. Consumir o pacote no `game-client` e, no futuro, no servidor de validação.

**Critério de pronto:** uma única fonte de verdade para regras compartilhadas entre cliente e servidor.

---

## Referência rápida (mapa dos passos)

| Passo | Tema principal |
|------:|----------------|
| 1 | README e links da doc |
| 2 | ESLint + Prettier |
| 3 | CI |
| 4 | Mais testes unitários |
| 5 | E2E |
| 6 | Mensagens de bloqueio de spin |
| 7 | A11y / teclado |
| 8 | Highlight de paylines |
| 9 | Áudio |
| 10 | Performance e cache de assets |
| 11 | Persistência e histórico |
| 12 | Motor: seed, linhas, paytable |
| 13 | Wild, RTP, bônus |
| 14 | Home, i18n, tutorial |
| 15 | Servidor, compliance, logs |
| 16 | Pacote interno do domínio |

---

Para **cálculo de ganhos e rodadas**, veja [GANHOS_E_RODADAS.md](./GANHOS_E_RODADAS.md). Para **uso da lógica do slot no código**, veja [DOMINIO_SLOT_E_USO.md](./DOMINIO_SLOT_E_USO.md).
