import { CapturedEvent } from './capture.js';

export interface GroupingConfig {
  inputDebounceMs: number;
  clickDebounceMs: number;
  minInputLength: number;
}

const DEFAULT_GROUPING_CONFIG: GroupingConfig = {
  inputDebounceMs: 500,
  clickDebounceMs: 200,
  minInputLength: 1,
};

export function groupEvents(
  events: CapturedEvent[],
  config: GroupingConfig = DEFAULT_GROUPING_CONFIG
): CapturedEvent[] {
  if (events.length === 0) return [];
  
  const grouped: CapturedEvent[] = [];
  let currentInputGroup: CapturedEvent[] = [];
  let lastClickEvent: CapturedEvent | null = null;
  
  for (const event of events) {
    const eventTime = new Date(event.timestamp).getTime();
    
    if (event.type === 'input') {
      if (currentInputGroup.length > 0) {
        const lastInput = currentInputGroup[currentInputGroup.length - 1];
        const lastTime = new Date(lastInput.timestamp).getTime();
        const sameTarget = lastInput.target.selector === event.target.selector;
        
        if (sameTarget && eventTime - lastTime <= config.inputDebounceMs) {
          currentInputGroup.push(event);
          continue;
        } else {
          grouped.push(mergeInputGroup(currentInputGroup));
          currentInputGroup = [];
        }
      }
      
      currentInputGroup.push(event);
      continue;
    }
    
    if (currentInputGroup.length > 0) {
      grouped.push(mergeInputGroup(currentInputGroup));
      currentInputGroup = [];
    }
    
    if (event.type === 'click') {
      if (lastClickEvent) {
        const lastTime = new Date(lastClickEvent.timestamp).getTime();
        const sameTarget = lastClickEvent.target.selector === event.target.selector;
        
        if (sameTarget && eventTime - lastTime <= config.clickDebounceMs) {
          continue;
        }
        
        grouped.push(lastClickEvent);
      }
      
      lastClickEvent = event;
      continue;
    }
    
    if (lastClickEvent) {
      grouped.push(lastClickEvent);
      lastClickEvent = null;
    }
    
    grouped.push(event);
  }
  
  if (currentInputGroup.length > 0) {
    grouped.push(mergeInputGroup(currentInputGroup));
  }
  
  if (lastClickEvent) {
    grouped.push(lastClickEvent);
  }
  
  return grouped;
}

function mergeInputGroup(events: CapturedEvent[]): CapturedEvent {
  const first = events[0];
  const last = events[events.length - 1];
  
  return {
    ...first,
    timestamp: last.timestamp,
    inputValue: last.inputValue,
  };
}

export function detectNavigationEvents(
  previousUrl: string | null,
  currentUrl: string
): CapturedEvent | null {
  if (!previousUrl || previousUrl === currentUrl) {
    return null;
  }
  
  const prevParsed = new URL(previousUrl);
  const currParsed = new URL(currentUrl);
  
  if (prevParsed.origin !== currParsed.origin || prevParsed.pathname !== currParsed.pathname) {
    return {
      type: 'navigate',
      timestamp: new Date().toISOString(),
      url: currentUrl,
      target: {
        selector: '',
        xpath: '',
        elementText: document.title,
      },
    };
  }
  
  return null;
}
