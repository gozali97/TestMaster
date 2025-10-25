import { contextBridge, ipcRenderer } from 'electron';

const api = {
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('write-file', filePath, content),
  getProjectPath: () => ipcRenderer.invoke('get-project-path'),
  openPath: (path: string) => ipcRenderer.invoke('open-path', path),
  
  project: {
    open: (projectPath: string) => ipcRenderer.send('project:open', projectPath),
    save: (projectData: any) => ipcRenderer.send('project:save', projectData),
  },
  
  test: {
    start: (testId: string) => ipcRenderer.send('test:start', testId),
    stop: () => ipcRenderer.send('test:stop'),
  },
  
  recorder: {
    start: (config: any) => ipcRenderer.send('recorder:start', config),
    stop: () => ipcRenderer.send('recorder:stop'),
  },
};

contextBridge.exposeInMainWorld('electron', api);

export type ElectronAPI = typeof api;
