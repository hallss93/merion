import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron/simple';

export default defineConfig(({ mode }) => {
  const isElectron = mode === 'electron';

  return {
    base: isElectron ? './' : '/',
    plugins: isElectron
      ? [
          electron({
            main: {
              entry: 'electron/main.ts',
            },
            preload: {
              input: 'electron/preload.ts',
            },
          }),
        ]
      : [],
  };
});
