import { Guide, Step, createGuide, addStepToGuide } from '@workfloweeeer/core';
import { CapturedEvent, capturedEventToStep } from '../capture.js';
import { groupEvents } from '../grouping.js';

interface BackgroundState {
  currentGuide: Guide | null;
  rawEvents: CapturedEvent[];
  isRecording: boolean;
  isPaused: boolean;
}

let state: BackgroundState = {
  currentGuide: null,
  rawEvents: [],
  isRecording: false,
  isPaused: false,
};

async function captureScreenshot(): Promise<string | undefined> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return undefined;
    
    const dataUrl = await chrome.tabs.captureVisibleTab(undefined, {
      format: 'png',
      quality: 90,
    });
    
    return dataUrl.replace(/^data:image\/png;base64,/, '');
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    return undefined;
  }
}

async function processEvent(event: CapturedEvent): Promise<void> {
  if (!state.currentGuide || !state.isRecording || state.isPaused) return;
  
  state.rawEvents.push(event);
  
  const screenshot = await captureScreenshot();
  
  const groupedEvents = groupEvents(state.rawEvents);
  const latestEvent = groupedEvents[groupedEvents.length - 1];
  
  if (latestEvent && latestEvent.timestamp === event.timestamp) {
    const step = capturedEventToStep(event, screenshot);
    state.currentGuide = addStepToGuide(state.currentGuide, step);
    
    await saveGuideToStorage(state.currentGuide);
  }
}

async function saveGuideToStorage(guide: Guide): Promise<void> {
  await chrome.storage.local.set({
    [`guide_${guide.id}`]: guide,
    currentGuideId: guide.id,
  });
}

async function loadGuideFromStorage(guideId: string): Promise<Guide | null> {
  const result = await chrome.storage.local.get(`guide_${guideId}`);
  return result[`guide_${guideId}`] || null;
}

async function getAllGuides(): Promise<Guide[]> {
  const result = await chrome.storage.local.get(null);
  const guides: Guide[] = [];
  
  for (const key of Object.keys(result)) {
    if (key.startsWith('guide_')) {
      guides.push(result[key]);
    }
  }
  
  return guides.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    switch (message.type) {
      case 'START_NEW_RECORDING': {
        const guide = createGuide(message.payload.title || 'Untitled Guide', 'chrome');
        state = {
          currentGuide: guide,
          rawEvents: [],
          isRecording: true,
          isPaused: false,
        };
        
        await saveGuideToStorage(guide);
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'START_RECORDING',
            payload: {
              guideId: guide.id,
              maskInput: message.payload.maskInput || false,
            },
          });
        }
        
        sendResponse({ success: true, guideId: guide.id });
        break;
      }
      
      case 'STOP_RECORDING': {
        state.isRecording = false;
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
          await chrome.tabs.sendMessage(tab.id, { type: 'STOP_RECORDING' });
        }
        
        const finalGuide = state.currentGuide;
        state = {
          currentGuide: null,
          rawEvents: [],
          isRecording: false,
          isPaused: false,
        };
        
        sendResponse({ success: true, guide: finalGuide });
        break;
      }
      
      case 'PAUSE_RECORDING': {
        state.isPaused = true;
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
          await chrome.tabs.sendMessage(tab.id, { type: 'PAUSE_RECORDING' });
        }
        
        sendResponse({ success: true });
        break;
      }
      
      case 'RESUME_RECORDING': {
        state.isPaused = false;
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
          await chrome.tabs.sendMessage(tab.id, { type: 'RESUME_RECORDING' });
        }
        
        sendResponse({ success: true });
        break;
      }
      
      case 'UNDO_LAST_STEP': {
        if (state.currentGuide && state.currentGuide.steps.length > 0) {
          state.currentGuide = {
            ...state.currentGuide,
            steps: state.currentGuide.steps.slice(0, -1),
            updatedAt: new Date().toISOString(),
          };
          state.rawEvents = state.rawEvents.slice(0, -1);
          
          await saveGuideToStorage(state.currentGuide);
        }
        
        sendResponse({ success: true, guide: state.currentGuide });
        break;
      }
      
      case 'GET_RECORDING_STATE': {
        sendResponse({
          isRecording: state.isRecording,
          isPaused: state.isPaused,
          guide: state.currentGuide,
          stepCount: state.currentGuide?.steps.length || 0,
        });
        break;
      }
      
      case 'GET_ALL_GUIDES': {
        const guides = await getAllGuides();
        sendResponse({ guides });
        break;
      }
      
      case 'DELETE_GUIDE': {
        await chrome.storage.local.remove(`guide_${message.payload.guideId}`);
        sendResponse({ success: true });
        break;
      }
      
      case 'EXPORT_GUIDE': {
        const guide = await loadGuideFromStorage(message.payload.guideId);
        sendResponse({ guide });
        break;
      }
      
      case 'CAPTURED_EVENT': {
        await processEvent(message.payload);
        sendResponse({ success: true });
        break;
      }
    }
  })();
  
  return true;
});

chrome.action.onClicked.addListener(async (tab) => {
  // Popup will handle this
});

console.log('Workfloweeeer background script loaded');
