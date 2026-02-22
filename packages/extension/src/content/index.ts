import {
  CapturedEvent,
  RecordingState,
  initialRecordingState,
  getElementContext,
} from '../capture.js';
import { detectNavigationEvents } from '../grouping.js';

let state: RecordingState = { ...initialRecordingState };
let previousUrl: string | null = null;
let inputMaskingEnabled = false;

function sendEventToBackground(event: CapturedEvent): void {
  chrome.runtime.sendMessage({
    type: 'CAPTURED_EVENT',
    payload: event,
  });
}

function handleClick(e: MouseEvent): void {
  if (!state.isRecording || state.isPaused) return;
  
  const target = e.target as Element;
  if (!target) return;
  
  const event: CapturedEvent = {
    type: 'click',
    timestamp: new Date().toISOString(),
    url: window.location.href,
    target: getElementContext(target),
  };
  
  sendEventToBackground(event);
}

function handleInput(e: Event): void {
  if (!state.isRecording || state.isPaused) return;
  
  const target = e.target as HTMLInputElement | HTMLTextAreaElement;
  if (!target) return;
  
  const isPasswordField = target.type === 'password';
  let value = target.value;
  
  if (inputMaskingEnabled || isPasswordField) {
    value = '•'.repeat(value.length);
  }
  
  const event: CapturedEvent = {
    type: 'input',
    timestamp: new Date().toISOString(),
    url: window.location.href,
    target: getElementContext(target),
    inputValue: value,
  };
  
  sendEventToBackground(event);
}

function handleChange(e: Event): void {
  if (!state.isRecording || state.isPaused) return;
  
  const target = e.target as HTMLSelectElement;
  if (target.tagName !== 'SELECT') return;
  
  const selectedOption = target.options[target.selectedIndex];
  
  const event: CapturedEvent = {
    type: 'select',
    timestamp: new Date().toISOString(),
    url: window.location.href,
    target: getElementContext(target),
    inputValue: selectedOption?.text || target.value,
  };
  
  sendEventToBackground(event);
}

function handleKeydown(e: KeyboardEvent): void {
  if (!state.isRecording || state.isPaused) return;
  
  if (['Enter', 'Escape', 'Tab'].includes(e.key)) {
    const target = e.target as Element;
    
    const event: CapturedEvent = {
      type: 'key',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      target: target ? getElementContext(target) : { selector: '', xpath: '' },
      inputValue: e.key,
    };
    
    sendEventToBackground(event);
  }
}

function checkNavigation(): void {
  if (!state.isRecording || state.isPaused) return;
  
  const currentUrl = window.location.href;
  const navEvent = detectNavigationEvents(previousUrl, currentUrl);
  
  if (navEvent) {
    sendEventToBackground(navEvent);
  }
  
  previousUrl = currentUrl;
}

function attachListeners(): void {
  document.addEventListener('click', handleClick, true);
  document.addEventListener('input', handleInput, true);
  document.addEventListener('change', handleChange, true);
  document.addEventListener('keydown', handleKeydown, true);
  
  previousUrl = window.location.href;
  
  const observer = new MutationObserver(() => {
    checkNavigation();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  
  window.addEventListener('popstate', checkNavigation);
  window.addEventListener('hashchange', checkNavigation);
}

function detachListeners(): void {
  document.removeEventListener('click', handleClick, true);
  document.removeEventListener('input', handleInput, true);
  document.removeEventListener('change', handleChange, true);
  document.removeEventListener('keydown', handleKeydown, true);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'START_RECORDING':
      state = {
        isRecording: true,
        isPaused: false,
        guideId: message.payload.guideId,
        events: [],
        startTime: new Date().toISOString(),
      };
      inputMaskingEnabled = message.payload.maskInput || false;
      attachListeners();
      sendResponse({ success: true });
      break;
    
    case 'STOP_RECORDING':
      state = { ...initialRecordingState };
      detachListeners();
      sendResponse({ success: true });
      break;
    
    case 'PAUSE_RECORDING':
      state.isPaused = true;
      sendResponse({ success: true });
      break;
    
    case 'RESUME_RECORDING':
      state.isPaused = false;
      sendResponse({ success: true });
      break;
    
    case 'GET_STATE':
      sendResponse({ state });
      break;
    
    case 'SET_MASK_INPUT':
      inputMaskingEnabled = message.payload.enabled;
      sendResponse({ success: true });
      break;
  }
  
  return true;
});

console.log('Workfloweeeer content script loaded');
