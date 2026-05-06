export const LOADING_VIEW_CONFIG = {
  spineSpeedMultiplier: 1.25,
  fallbackColor: 0x12081f,
  fox: {
    minWidthRatio: 0.5,
    targetHeightBase: 0.36,
    targetHeightWidthRatioFactor: 0.22,
    xBase: 0.86,
    xWidthRatioFactor: 0.07,
    yBase: 0.65,
    yWidthRatioFactor: 0.07,
    zIndex: 20,
  },
  preloader: {
    zIndex: 1,
  },
  label: {
    text: 'Loading...',
    fontSize: 42,
  },
} as const;
