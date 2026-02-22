import { app, BrowserWindow, ipcMain, globalShortcut, desktopCapturer, screen, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import {
  Guide,
  Step,
  createGuide,
  createStep,
  addStepToGuide,
  updateStep,
  deleteStep,
  reorderSteps,
  mergeSteps,
} from '@workfloweeeer/core';
import { GuideStorage, CrashRecovery, initializeStorage } from '@workfloweeeer/storage';
import { exportToJson, exportToHtml, exportToPdf } from '@workfloweeeer/export';
import * as fs from 'fs/promises';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let storage: GuideStorage;
let recovery: CrashRecovery;

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  currentGuide: Guide | null;
  captureScope: 'fullscreen' | 'window';
  selectedWindowId?: number;
}

let recordingState: RecordingState = {
  isRecording: false,
  isPaused: false,
  currentGuide: null,
  captureScope: 'fullscreen',
};

const HOTKEYS = {
  toggleRecording: 'CommandOrControl+Shift+R',
  captureStep: 'CommandOrControl+Shift+S',
  pauseResume: 'CommandOrControl+Shift+P',
  undoStep: 'CommandOrControl+Shift+Z',
};

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (process.env.NODE_ENV === 'development') {
    await mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

function createTray(): void {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  
  updateTrayMenu();
  
  tray.setToolTip('Workfloweeeer');
}

function updateTrayMenu(): void {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: recordingState.isRecording ? 'Stop Recording' : 'Start Recording',
      click: () => toggleRecording(),
    },
    {
      label: 'Capture Step',
      enabled: recordingState.isRecording,
      click: () => captureStep(),
    },
    { type: 'separator' },
    {
      label: 'Show Window',
      click: () => mainWindow?.show(),
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);
  
  tray?.setContextMenu(contextMenu);
}

function registerHotkeys(): void {
  globalShortcut.register(HOTKEYS.toggleRecording, toggleRecording);
  globalShortcut.register(HOTKEYS.captureStep, captureStep);
  globalShortcut.register(HOTKEYS.pauseResume, togglePause);
  globalShortcut.register(HOTKEYS.undoStep, undoLastStep);
}

async function toggleRecording(): Promise<void> {
  if (recordingState.isRecording) {
    await stopRecording();
  } else {
    await startRecording();
  }
  
  updateTrayMenu();
  mainWindow?.webContents.send('recording-state-changed', recordingState);
}

async function startRecording(title?: string): Promise<void> {
  const guide = createGuide(title || 'Desktop Recording', 'desktop');
  
  recordingState = {
    isRecording: true,
    isPaused: false,
    currentGuide: guide,
    captureScope: recordingState.captureScope,
    selectedWindowId: recordingState.selectedWindowId,
  };
  
  recovery.startAutosave(() => recordingState.currentGuide, 'capture');
  
  await storage.saveGuide(guide);
}

async function stopRecording(): Promise<void> {
  recovery.stopAutosave();
  
  if (recordingState.currentGuide) {
    await storage.saveGuide(recordingState.currentGuide);
    
    if (recordingState.currentGuide.id) {
      await recovery.clearSession(recordingState.currentGuide.id);
    }
  }
  
  recordingState = {
    isRecording: false,
    isPaused: false,
    currentGuide: null,
    captureScope: recordingState.captureScope,
  };
}

function togglePause(): void {
  if (!recordingState.isRecording) return;
  
  recordingState.isPaused = !recordingState.isPaused;
  mainWindow?.webContents.send('recording-state-changed', recordingState);
}

async function captureStep(): Promise<void> {
  if (!recordingState.isRecording || recordingState.isPaused || !recordingState.currentGuide) {
    return;
  }
  
  const screenshot = await captureScreenshot();
  const windowInfo = await getActiveWindowInfo();
  
  const step = createStep('click', 'desktop', {
    title: windowInfo.title || 'Desktop action',
    screenshotBase64: screenshot,
    target: {
      windowTitle: windowInfo.title,
      processName: windowInfo.processName,
    },
  });
  
  recordingState.currentGuide = addStepToGuide(recordingState.currentGuide, step);
  
  mainWindow?.webContents.send('step-captured', step);
  mainWindow?.webContents.send('recording-state-changed', recordingState);
}

async function captureScreenshot(): Promise<string | undefined> {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: screen.getPrimaryDisplay().size,
    });
    
    let source;
    
    if (recordingState.captureScope === 'window' && recordingState.selectedWindowId) {
      source = sources.find((s) => s.id === `window:${recordingState.selectedWindowId}`);
    }
    
    if (!source) {
      source = sources.find((s) => s.id.startsWith('screen:'));
    }
    
    if (source) {
      const thumbnail = source.thumbnail;
      return thumbnail.toPNG().toString('base64');
    }
    
    return undefined;
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    return undefined;
  }
}

async function getActiveWindowInfo(): Promise<{ title?: string; processName?: string }> {
  try {
    const sources = await desktopCapturer.getSources({ types: ['window'] });
    const focusedWindow = BrowserWindow.getFocusedWindow();
    
    if (sources.length > 0) {
      return {
        title: sources[0].name,
        processName: sources[0].name.split(' - ')[0],
      };
    }
    
    return {};
  } catch {
    return {};
  }
}

async function undoLastStep(): Promise<void> {
  if (!recordingState.currentGuide || recordingState.currentGuide.steps.length === 0) {
    return;
  }
  
  const lastStep = recordingState.currentGuide.steps[recordingState.currentGuide.steps.length - 1];
  recordingState.currentGuide = deleteStep(recordingState.currentGuide, lastStep.id);
  
  mainWindow?.webContents.send('recording-state-changed', recordingState);
}

function setupIpcHandlers(): void {
  ipcMain.handle('get-recording-state', () => recordingState);
  
  ipcMain.handle('start-recording', async (_, title?: string) => {
    await startRecording(title);
    return recordingState;
  });
  
  ipcMain.handle('stop-recording', async () => {
    await stopRecording();
    return recordingState;
  });
  
  ipcMain.handle('toggle-pause', () => {
    togglePause();
    return recordingState;
  });
  
  ipcMain.handle('capture-step', async () => {
    await captureStep();
    return recordingState;
  });
  
  ipcMain.handle('undo-step', async () => {
    await undoLastStep();
    return recordingState;
  });
  
  ipcMain.handle('set-capture-scope', (_, scope: 'fullscreen' | 'window', windowId?: number) => {
    recordingState.captureScope = scope;
    recordingState.selectedWindowId = windowId;
    return recordingState;
  });
  
  ipcMain.handle('get-windows', async () => {
    const sources = await desktopCapturer.getSources({ types: ['window'] });
    return sources.map((source) => ({
      id: source.id,
      name: source.name,
      thumbnail: source.thumbnail.toDataURL(),
    }));
  });
  
  ipcMain.handle('list-guides', async () => {
    return storage.listGuides();
  });
  
  ipcMain.handle('load-guide', async (_, guideId: string) => {
    return storage.loadGuide(guideId);
  });
  
  ipcMain.handle('save-guide', async (_, guide: Guide) => {
    await storage.saveGuide(guide);
    return true;
  });
  
  ipcMain.handle('delete-guide', async (_, guideId: string) => {
    await storage.deleteGuide(guideId);
    return true;
  });
  
  ipcMain.handle('update-step', async (_, guideId: string, stepId: string, updates: Partial<Step>) => {
    const guide = await storage.loadGuide(guideId);
    const updatedGuide = updateStep(guide, stepId, updates);
    await storage.saveGuide(updatedGuide);
    return updatedGuide;
  });
  
  ipcMain.handle('delete-step', async (_, guideId: string, stepId: string) => {
    const guide = await storage.loadGuide(guideId);
    const updatedGuide = deleteStep(guide, stepId);
    await storage.saveGuide(updatedGuide);
    return updatedGuide;
  });
  
  ipcMain.handle('reorder-steps', async (_, guideId: string, fromIndex: number, toIndex: number) => {
    const guide = await storage.loadGuide(guideId);
    const updatedGuide = reorderSteps(guide, fromIndex, toIndex);
    await storage.saveGuide(updatedGuide);
    return updatedGuide;
  });
  
  ipcMain.handle('merge-steps', async (_, guideId: string, stepIds: string[], options) => {
    const guide = await storage.loadGuide(guideId);
    const updatedGuide = mergeSteps(guide, stepIds, options);
    await storage.saveGuide(updatedGuide);
    return updatedGuide;
  });
  
  ipcMain.handle('export-json', async (_, guideId: string, outputPath: string) => {
    const guide = await storage.loadGuide(guideId, true);
    const json = exportToJson(guide);
    await fs.writeFile(outputPath, json, 'utf-8');
    return true;
  });
  
  ipcMain.handle('export-html', async (_, guideId: string, outputPath: string, options) => {
    const guide = await storage.loadGuide(guideId, true);
    const html = exportToHtml(guide, options);
    await fs.writeFile(outputPath, html, 'utf-8');
    return true;
  });
  
  ipcMain.handle('export-pdf', async (_, guideId: string, outputPath: string, options) => {
    const guide = await storage.loadGuide(guideId, true);
    const pdf = await exportToPdf(guide, options);
    await fs.writeFile(outputPath, pdf);
    return true;
  });
  
  ipcMain.handle('replace-screenshot', async (_, guideId: string, stepId: string, imagePath: string) => {
    const imageBuffer = await fs.readFile(imagePath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
    
    const guide = await storage.loadGuide(guideId);
    const updatedGuide = updateStep(guide, stepId, {
      screenshotBase64: base64,
      screenshotMimeType: mimeType,
    });
    await storage.saveGuide(updatedGuide);
    return updatedGuide;
  });
  
  ipcMain.handle('get-recoverable-sessions', async () => {
    return recovery.listRecoverableSessions();
  });
  
  ipcMain.handle('recover-session', async (_, guideId: string) => {
    return recovery.recoverSession(guideId);
  });
  
  ipcMain.handle('discard-session', async (_, guideId: string) => {
    await recovery.clearSession(guideId);
    return true;
  });
}

app.whenReady().then(async () => {
  storage = await initializeStorage();
  recovery = new CrashRecovery(storage);
  await recovery.initialize();
  
  await createWindow();
  createTray();
  registerHotkeys();
  setupIpcHandlers();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  recovery.stopAutosave();
});
