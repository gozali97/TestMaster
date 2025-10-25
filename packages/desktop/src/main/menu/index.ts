import { Menu, shell } from 'electron';

export const createMenu = () => {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        { label: 'New Project', accelerator: 'CmdOrCtrl+N', click: () => {} },
        { label: 'Open Project', accelerator: 'CmdOrCtrl+O', click: () => {} },
        { type: 'separator' },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => {} },
        { label: 'Save All', accelerator: 'CmdOrCtrl+Shift+S', click: () => {} },
        { type: 'separator' },
        { label: 'Exit', role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { type: 'separator' },
        { label: 'Find', accelerator: 'CmdOrCtrl+F', click: () => {} },
        { label: 'Replace', accelerator: 'CmdOrCtrl+H', click: () => {} },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Toggle Sidebar', accelerator: 'CmdOrCtrl+B', click: () => {} },
        { label: 'Toggle Console', accelerator: 'CmdOrCtrl+`', click: () => {} },
        { type: 'separator' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+=', role: 'zoomIn' },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'Toggle DevTools', accelerator: 'F12', role: 'toggleDevTools' },
      ],
    },
    {
      label: 'Test',
      submenu: [
        { label: 'Record Test', accelerator: 'CmdOrCtrl+R', click: () => {} },
        { label: 'Run Test', accelerator: 'F5', click: () => {} },
        { label: 'Debug Test', accelerator: 'Shift+F5', click: () => {} },
        { label: 'Stop Execution', accelerator: 'Shift+F6', click: () => {} },
      ],
    },
    {
      label: 'Tools',
      submenu: [
        { label: 'Object Spy', accelerator: 'CmdOrCtrl+Shift+O', click: () => {} },
        { label: 'Data Editor', click: () => {} },
        { label: 'Settings', accelerator: 'CmdOrCtrl+,', click: () => {} },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://docs.testmaster.com');
          },
        },
        { label: 'Keyboard Shortcuts', click: () => {} },
        { type: 'separator' },
        { label: 'Check for Updates', click: () => {} },
        { label: 'About TestMaster', click: () => {} },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
};
