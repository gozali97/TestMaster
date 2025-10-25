import { ipcMain, shell } from 'electron';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export const setupIPC = () => {
  ipcMain.handle('read-file', async (event, filePath: string) => {
    try {
      const content = await readFile(filePath, 'utf-8');
      return { success: true, data: content };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('write-file', async (event, filePath: string, content: string) => {
    try {
      await writeFile(filePath, content, 'utf-8');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-project-path', async () => {
    return process.cwd();
  });

  ipcMain.handle('open-path', async (event, pathToOpen: string) => {
    try {
      // Get the directory path from video file path
      const dirPath = path.dirname(pathToOpen);
      // Open the folder in file explorer
      const result = await shell.openPath(dirPath);
      if (result) {
        return { success: false, error: result };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.on('project:open', (event, projectPath: string) => {
    console.log('Opening project:', projectPath);
  });

  ipcMain.on('project:save', (event, projectData: any) => {
    console.log('Saving project:', projectData);
  });

  ipcMain.on('test:start', (event, testId: string) => {
    console.log('Starting test:', testId);
  });

  ipcMain.on('test:stop', (event) => {
    console.log('Stopping test execution');
  });

  ipcMain.on('recorder:start', (event, config: any) => {
    console.log('Starting recorder with config:', config);
  });

  ipcMain.on('recorder:stop', (event) => {
    console.log('Stopping recorder');
  });
};
