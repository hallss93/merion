export interface SymbolDefinition {
  folder: string;
  prefix: string;
}

export interface SpineWinDefinition {
  skeleton: string;
  atlas: string;
  animation: string;
}

export const GAME_SCENE_CONFIG = {
  animationSpeedMultiplier: 1.35,
  spineSpeedMultiplier: 1.25,
  reel: {
    columns: 6,
    rows: 5,
    startXRatio: 0.266,
    endXRatio: 0.715,
    startYRatio: 0.208,
    endYRatio: 0.803,
    cellHeightRatio: 0.112,
    minRandomOffset: 7,
    zIndex: 6,
  },
  fox: {
    targetHeightBase: 0.3,
    targetHeightWidthRatioFactor: 0.16,
    xBase: 0.92,
    xWidthRatioFactor: 0.05,
    yBase: 0.73,
    yWidthRatioFactor: 0.06,
    zIndex: 10,
  },
  winOverlay: {
    zIndex: 100,
    dimAlpha: 0.6,
    targetWidthRatio: 0.62,
    centerXRatio: 0.5,
    centerYRatio: 0.5,
    stageToTotalDelayMs: 5000,
    spriteSpeed: 0.28,
    amountThresholds: {
      bigWin: 100,
      megaWin: 1000,
      superMegaWin: 5000,
    },
  },
} as const;

export const OBJECT_SYMBOL_DEFINITIONS: SymbolDefinition[] = [
  { folder: 'Bank', prefix: 'Bank_' },
  { folder: 'Cell', prefix: 'Cell_' },
  { folder: 'Dynamit', prefix: 'Dynamit_' },
  { folder: 'Handcuffs', prefix: 'Handcuffs_' },
  { folder: 'Littera_A', prefix: 'Littera_A_' },
  { folder: 'Littera_J', prefix: 'Littera_J_' },
  { folder: 'Littera_K', prefix: 'Littera_K_' },
  { folder: 'Littera_Q', prefix: 'Littera_Q_' },
  { folder: 'Number_10', prefix: 'Number_10_' },
  { folder: 'Safe', prefix: 'Safe_' },
];

export const COIN_SYMBOL_DEFINITIONS: SymbolDefinition[] = [
  { folder: 'Bronze_coin_1', prefix: 'Bronze_coin_1_' },
  { folder: 'Bronze_coin_2', prefix: 'Bronze_coin_2_' },
  { folder: 'Bronze_coin_3', prefix: 'Bronze_coin_3_' },
  { folder: 'Bronze_coin_4', prefix: 'Bronze_coin_4_' },
  { folder: 'Silver_coin_1', prefix: 'Silver_coin_1_' },
  { folder: 'Silver_coin_2', prefix: 'Silver_coin_2_' },
  { folder: 'Silver_coin_3', prefix: 'Silver_coin_3_' },
  { folder: 'Silver_coin_4', prefix: 'Silver_coin_4_' },
  { folder: 'Golden_coin_1', prefix: 'Golden_coin_1_' },
  { folder: 'Golden_coin_2', prefix: 'Golden_coin_2_' },
  { folder: 'Golden_coin_3', prefix: 'Golden_coin_3_' },
  { folder: 'Golden_coin_4', prefix: 'Golden_coin_4_' },
];

export const SPINE_WIN_DEFINITIONS: readonly SpineWinDefinition[] = [
  {
    skeleton: '/assets/spine/Mega_Win/Mega_Win.json',
    atlas: '/assets/spine/Mega_Win/Mega_Win.atlas',
    animation: 'Mega_Win',
  },
  {
    skeleton: '/assets/spine/Super_Mega_Win/Super_Mega_Win.json',
    atlas: '/assets/spine/Super_Mega_Win/Super_Mega_Win.atlas',
    animation: 'Super_Mega_Win',
  },
  {
    skeleton: '/assets/spine/Total_Win/Total_Win.json',
    atlas: '/assets/spine/Total_Win/Total_Win.atlas',
    animation: 'Total_Win',
  },
];
