"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIPC = void 0;
const electron_1 = require("electron");
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const setupIPC = () => {
    electron_1.ipcMain.handle('read-file', async (event, filePath) => {
        try {
            const content = await (0, promises_1.readFile)(filePath, 'utf-8');
            return { success: true, data: content };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('write-file', async (event, filePath, content) => {
        try {
            await (0, promises_1.writeFile)(filePath, content, 'utf-8');
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('get-project-path', async () => {
        return process.cwd();
    });
    electron_1.ipcMain.handle('open-path', async (event, pathToOpen) => {
        try {
            // Get the directory path from video file path
            const dirPath = path_1.default.dirname(pathToOpen);
            // Open the folder in file explorer
            const result = await electron_1.shell.openPath(dirPath);
            if (result) {
                return { success: false, error: result };
            }
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.on('project:open', (event, projectPath) => {
        console.log('Opening project:', projectPath);
    });
    electron_1.ipcMain.on('project:save', (event, projectData) => {
        console.log('Saving project:', projectData);
    });
    electron_1.ipcMain.on('test:start', (event, testId) => {
        console.log('Starting test:', testId);
    });
    electron_1.ipcMain.on('test:stop', (event) => {
        console.log('Stopping test execution');
    });
    electron_1.ipcMain.on('recorder:start', (event, config) => {
        console.log('Starting recorder with config:', config);
    });
    electron_1.ipcMain.on('recorder:stop', (event) => {
        console.log('Stopping recorder');
    });
};
exports.setupIPC = setupIPC;
//# sourceMappingURL=index.js.map