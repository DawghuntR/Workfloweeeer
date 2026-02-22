import { contextBridge, ipcRenderer } from 'electron';

const api = {
  getRecordingState: () => ipcRenderer.invoke('get-recording-state'),
  startRecording: (title?: string) => ipcRenderer.invoke('start-recording', title),
  stopRecording: () => ipcRenderer.invoke('stop-recording'),
  togglePause: () => ipcRenderer.invoke('toggle-pause'),
  captureStep: () => ipcRenderer.invoke('capture-step'),
  undoStep: () => ipcRenderer.invoke('undo-step'),
  setCaptureScope: (scope: string, windowId?: number) =>
    ipcRenderer.invoke('set-capture-scope', scope, windowId),
  getWindows: () => ipcRenderer.invoke('get-windows'),
  
  listGuides: () => ipcRenderer.invoke('list-guides'),
  loadGuide: (guideId: string) => ipcRenderer.invoke('load-guide', guideId),
  saveGuide: (guide: any) => ipcRenderer.invoke('save-guide', guide),
  deleteGuide: (guideId: string) => ipcRenderer.invoke('delete-guide', guideId),
  
  updateStep: (guideId: string, stepId: string, updates: any) =>
    ipcRenderer.invoke('update-step', guideId, stepId, updates),
  deleteStep: (guideId: string, stepId: string) =>
    ipcRenderer.invoke('delete-step', guideId, stepId),
  reorderSteps: (guideId: string, fromIndex: number, toIndex: number) =>
    ipcRenderer.invoke('reorder-steps', guideId, fromIndex, toIndex),
  mergeSteps: (guideId: string, stepIds: string[], options?: any) =>
    ipcRenderer.invoke('merge-steps', guideId, stepIds, options),
  
  exportJson: (guideId: string, outputPath: string) =>
    ipcRenderer.invoke('export-json', guideId, outputPath),
  exportHtml: (guideId: string, outputPath: string, options?: any) =>
    ipcRenderer.invoke('export-html', guideId, outputPath, options),
  exportPdf: (guideId: string, outputPath: string, options?: any) =>
    ipcRenderer.invoke('export-pdf', guideId, outputPath, options),
  
  replaceScreenshot: (guideId: string, stepId: string, imagePath: string) =>
    ipcRenderer.invoke('replace-screenshot', guideId, stepId, imagePath),
  
  getRecoverableSessions: () => ipcRenderer.invoke('get-recoverable-sessions'),
  recoverSession: (guideId: string) => ipcRenderer.invoke('recover-session', guideId),
  discardSession: (guideId: string) => ipcRenderer.invoke('discard-session', guideId),
  
  onRecordingStateChanged: (callback: (state: any) => void) => {
    ipcRenderer.on('recording-state-changed', (_, state) => callback(state));
  },
  onStepCaptured: (callback: (step: any) => void) => {
    ipcRenderer.on('step-captured', (_, step) => callback(step));
  },
};

contextBridge.exposeInMainWorld('workfloweeeer', api);

export type WorkfloweeeerAPI = typeof api;
