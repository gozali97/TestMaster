"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const api = {
    readFile: (filePath) => electron_1.ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, content) => electron_1.ipcRenderer.invoke('write-file', filePath, content),
    getProjectPath: () => electron_1.ipcRenderer.invoke('get-project-path'),
    project: {
        open: (projectPath) => electron_1.ipcRenderer.send('project:open', projectPath),
        save: (projectData) => electron_1.ipcRenderer.send('project:save', projectData),
    },
    test: {
        start: (testId) => electron_1.ipcRenderer.send('test:start', testId),
        stop: () => electron_1.ipcRenderer.send('test:stop'),
    },
    recorder: {
        start: (config) => electron_1.ipcRenderer.send('recorder:start', config),
        stop: () => electron_1.ipcRenderer.send('recorder:stop'),
    },
};
electron_1.contextBridge.exposeInMainWorld('electron', api);
//# sourceMappingURL=index.js.map