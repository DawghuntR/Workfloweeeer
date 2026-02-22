import { Step, ActionType, CaptureSource } from '@workfloweeeer/core';
import { v4 as uuidv4 } from 'uuid';

export interface CapturedEvent {
  type: ActionType;
  timestamp: string;
  url: string;
  target: {
    selector: string;
    xpath: string;
    elementText?: string;
    elementRole?: string;
    elementLabel?: string;
    placeholder?: string;
    inputName?: string;
    inputId?: string;
    coordinates?: { x: number; y: number };
  };
  inputValue?: string;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  guideId: string | null;
  events: CapturedEvent[];
  startTime: string | null;
}

export const initialRecordingState: RecordingState = {
  isRecording: false,
  isPaused: false,
  guideId: null,
  events: [],
  startTime: null,
};

export function getUniqueSelector(element: Element): string {
  if (element.id) {
    return `#${element.id}`;
  }
  
  const labels = Array.from(document.querySelectorAll('label'));
  const associatedLabel = labels.find((label) => {
    const forAttr = label.getAttribute('for');
    if (forAttr && element.id === forAttr) return true;
    return label.contains(element);
  });
  
  if (associatedLabel) {
    const labelText = associatedLabel.textContent?.trim();
    if (labelText) {
      return `[aria-label="${labelText}"], label:contains("${labelText}") + *`;
    }
  }
  
  const classes = Array.from(element.classList).slice(0, 3).join('.');
  if (classes) {
    const selector = `${element.tagName.toLowerCase()}.${classes}`;
    if (document.querySelectorAll(selector).length === 1) {
      return selector;
    }
  }
  
  const path: string[] = [];
  let current: Element | null = element;
  
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    
    if (current.id) {
      selector = `#${current.id}`;
      path.unshift(selector);
      break;
    }
    
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (child) => child.tagName === current!.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }
    
    path.unshift(selector);
    current = parent;
  }
  
  return path.join(' > ');
}

export function getXPath(element: Element): string {
  const parts: string[] = [];
  let current: Node | null = element;
  
  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let index = 1;
    let sibling: Node | null = current.previousSibling;
    
    while (sibling) {
      if (
        sibling.nodeType === Node.ELEMENT_NODE &&
        (sibling as Element).tagName === (current as Element).tagName
      ) {
        index++;
      }
      sibling = sibling.previousSibling;
    }
    
    const tagName = (current as Element).tagName.toLowerCase();
    parts.unshift(`${tagName}[${index}]`);
    current = current.parentNode;
  }
  
  return '/' + parts.join('/');
}

export function getElementContext(element: Element): CapturedEvent['target'] {
  const rect = element.getBoundingClientRect();
  
  return {
    selector: getUniqueSelector(element),
    xpath: getXPath(element),
    elementText: element.textContent?.trim().slice(0, 100),
    elementRole: element.getAttribute('role') || undefined,
    elementLabel: element.getAttribute('aria-label') || undefined,
    placeholder: (element as HTMLInputElement).placeholder || undefined,
    inputName: (element as HTMLInputElement).name || undefined,
    inputId: element.id || undefined,
    coordinates: {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
    },
  };
}

export function capturedEventToStep(
  event: CapturedEvent,
  screenshotBase64?: string
): Step {
  let title = '';
  
  switch (event.type) {
    case 'click':
      title = event.target.elementText
        ? `Click "${event.target.elementText.slice(0, 30)}"`
        : 'Click element';
      break;
    case 'input':
      title = event.target.elementLabel
        ? `Enter text in "${event.target.elementLabel}"`
        : 'Enter text';
      break;
    case 'navigate':
      title = `Navigate to ${new URL(event.url).pathname}`;
      break;
    case 'select':
      title = `Select "${event.inputValue || 'option'}"`;
      break;
    default:
      title = `${event.type} action`;
  }
  
  return {
    id: uuidv4(),
    title,
    description: '',
    actionType: event.type,
    timestamp: event.timestamp,
    source: 'chrome' as CaptureSource,
    target: event.target,
    inputValue: event.inputValue,
    inputMasked: false,
    screenshotBase64,
    screenshotMimeType: 'image/png',
    annotations: [],
  };
}
