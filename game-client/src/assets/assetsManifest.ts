export type AssetCategory = 'ui' | 'sequences' | 'spine';

export type AssetLoadGroup = 'loading' | 'boot' | 'lazy';

export type AssetType = 'image' | 'atlas' | 'spine-json';

export interface AssetItem {
  key: string;
  path: string;
  type: AssetType;
  category: AssetCategory;
  loadGroup: AssetLoadGroup;
  source: 'ui' | 'sequence' | 'spine';
}

export const ASSETS_MANIFEST: AssetItem[] = [
  {
    key: 'preloader_full',
    path: '/assets/ui/preloader_full.png',
    type: 'image',
    category: 'ui',
    loadGroup: 'loading',
    source: 'ui',
  },
  {
    key: 'main_game_screen',
    path: '/assets/ui/main_game_1.png',
    type: 'image',
    category: 'ui',
    loadGroup: 'boot',
    source: 'ui',
  },
  {
    key: 'spine_fox_json',
    path: '/assets/spine/Fox/Fox.json',
    type: 'spine-json',
    category: 'spine',
    loadGroup: 'loading',
    source: 'spine',
  },
  {
    key: 'spine_fox_atlas',
    path: '/assets/spine/Fox/Fox.atlas',
    type: 'atlas',
    category: 'spine',
    loadGroup: 'loading',
    source: 'spine',
  },

  // Key sequence frames (runtime source of truth)
  {
    key: 'sequence_fox_idle_start',
    path: '/assets/sequences/Character/Idle/Fox-Idle_00.png',
    type: 'image',
    category: 'sequences',
    loadGroup: 'boot',
    source: 'sequence',
  },
  {
    key: 'sequence_fox_win_start',
    path: '/assets/sequences/Character/Win/Win_00.png',
    type: 'image',
    category: 'sequences',
    loadGroup: 'lazy',
    source: 'sequence',
  },
  {
    key: 'sequence_big_win_start',
    path: '/assets/sequences/Wins/Big_Win/Big_Win_00.png',
    type: 'image',
    category: 'sequences',
    loadGroup: 'lazy',
    source: 'sequence',
  },
  {
    key: 'sequence_golden_coin_1_start',
    path: '/assets/sequences/Coins/Golden_coin_1/Golden_coin_1_00.png',
    type: 'image',
    category: 'sequences',
    loadGroup: 'lazy',
    source: 'sequence',
  },

  // Spine runtime descriptors
  {
    key: 'spine_letters_json',
    path: '/assets/spine/A_K_J_Q_10/LETTERS.json',
    type: 'spine-json',
    category: 'spine',
    loadGroup: 'lazy',
    source: 'spine',
  },
  {
    key: 'spine_letters_atlas',
    path: '/assets/spine/A_K_J_Q_10/LETTERS.atlas',
    type: 'atlas',
    category: 'spine',
    loadGroup: 'lazy',
    source: 'spine',
  },
  {
    key: 'spine_big_win_atlas',
    path: '/assets/spine/Big_Win/Big_Win.atlas',
    type: 'atlas',
    category: 'spine',
    loadGroup: 'lazy',
    source: 'spine',
  },
  {
    key: 'spine_mega_win_json',
    path: '/assets/spine/Mega_Win/Mega_Win.json',
    type: 'spine-json',
    category: 'spine',
    loadGroup: 'lazy',
    source: 'spine',
  },
  {
    key: 'spine_super_mega_win_json',
    path: '/assets/spine/Super_Mega_Win/Super_Mega_Win.json',
    type: 'spine-json',
    category: 'spine',
    loadGroup: 'lazy',
    source: 'spine',
  },
  {
    key: 'spine_total_win_json',
    path: '/assets/spine/Total_Win/Total_Win.json',
    type: 'spine-json',
    category: 'spine',
    loadGroup: 'lazy',
    source: 'spine',
  },
];

export const BOOT_ASSET_KEYS = ASSETS_MANIFEST.filter((item) => item.loadGroup === 'boot').map(
  (item) => item.key,
);

export interface SequenceDefinition {
  key: string;
  basePath: string;
  prefix: string;
  startFrame: number;
  endFrame: number;
  padLength: number;
  loadGroup: AssetLoadGroup;
}

export const SEQUENCE_DEFINITIONS: SequenceDefinition[] = [
  {
    key: 'fox_idle',
    basePath: '/assets/sequences/Character/Idle',
    prefix: 'Fox-Idle_',
    startFrame: 0,
    endFrame: 60,
    padLength: 2,
    loadGroup: 'boot',
  },
  {
    key: 'fox_win',
    basePath: '/assets/sequences/Character/Win',
    prefix: 'Win_',
    startFrame: 0,
    endFrame: 60,
    padLength: 2,
    loadGroup: 'lazy',
  },
  {
    key: 'big_win',
    basePath: '/assets/sequences/Wins/Big_Win',
    prefix: 'Big_Win_',
    startFrame: 0,
    endFrame: 45,
    padLength: 2,
    loadGroup: 'lazy',
  },
  {
    key: 'golden_coin_1',
    basePath: '/assets/sequences/Coins/Golden_coin_1',
    prefix: 'Golden_coin_1_',
    startFrame: 0,
    endFrame: 45,
    padLength: 2,
    loadGroup: 'lazy',
  },
];
