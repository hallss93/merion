import { contextBridge } from 'electron';

/** API mínima exposta ao renderer (pode ser estendida depois). */
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
});
