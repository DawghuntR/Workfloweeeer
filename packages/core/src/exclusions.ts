export interface ExclusionConfig {
  domains: string[];
  windowTitles: string[];
  processNames: string[];
}

const DEFAULT_EXCLUSIONS: ExclusionConfig = {
  domains: [
    'bank.',
    'secure.',
    '.gov',
    'login.',
    'auth.',
    'password',
    'paypal.com',
    'stripe.com',
  ],
  windowTitles: [
    'Password',
    'Keychain',
    '1Password',
    'LastPass',
    'Bitwarden',
    'KeePass',
  ],
  processNames: [
    'keychain',
    '1password',
    'lastpass',
    'bitwarden',
    'keepass',
  ],
};

export function isExcludedDomain(url: string, config: ExclusionConfig = DEFAULT_EXCLUSIONS): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    
    return config.domains.some((pattern) => {
      const normalizedPattern = pattern.toLowerCase();
      
      if (normalizedPattern.startsWith('.')) {
        return hostname.endsWith(normalizedPattern);
      }
      
      return hostname.includes(normalizedPattern);
    });
  } catch {
    return false;
  }
}

export function isExcludedWindow(
  windowTitle: string,
  config: ExclusionConfig = DEFAULT_EXCLUSIONS
): boolean {
  const normalizedTitle = windowTitle.toLowerCase();
  
  return config.windowTitles.some((pattern) =>
    normalizedTitle.includes(pattern.toLowerCase())
  );
}

export function isExcludedProcess(
  processName: string,
  config: ExclusionConfig = DEFAULT_EXCLUSIONS
): boolean {
  const normalizedProcess = processName.toLowerCase();
  
  return config.processNames.some((pattern) =>
    normalizedProcess.includes(pattern.toLowerCase())
  );
}

export function shouldExcludeCapture(
  context: {
    url?: string;
    windowTitle?: string;
    processName?: string;
  },
  config: ExclusionConfig = DEFAULT_EXCLUSIONS
): boolean {
  if (context.url && isExcludedDomain(context.url, config)) {
    return true;
  }
  
  if (context.windowTitle && isExcludedWindow(context.windowTitle, config)) {
    return true;
  }
  
  if (context.processName && isExcludedProcess(context.processName, config)) {
    return true;
  }
  
  return false;
}

export function createExclusionConfig(
  customExclusions: Partial<ExclusionConfig> = {}
): ExclusionConfig {
  return {
    domains: [...DEFAULT_EXCLUSIONS.domains, ...(customExclusions.domains || [])],
    windowTitles: [...DEFAULT_EXCLUSIONS.windowTitles, ...(customExclusions.windowTitles || [])],
    processNames: [...DEFAULT_EXCLUSIONS.processNames, ...(customExclusions.processNames || [])],
  };
}

export function loadExclusionConfig(configJson: string): ExclusionConfig {
  try {
    const parsed = JSON.parse(configJson);
    return createExclusionConfig(parsed);
  } catch {
    return DEFAULT_EXCLUSIONS;
  }
}

export const CAPTURE_WARNING_MESSAGE = `
⚠️ CAPTURE WARNING

Recording is active. Please be aware:

• Text you type in forms will be captured
• Screenshots of your screen will be saved
• Sensitive information may be recorded

Recommendations:
• Avoid entering passwords or sensitive data
• Use the pause feature when handling sensitive information
• Review captured steps before sharing

Press the pause button (Ctrl+Shift+P) to temporarily pause recording.
`.trim();

export function generatePreRecordingWarning(options: {
  includesTextCapture?: boolean;
  includesScreenshots?: boolean;
}): string {
  const warnings: string[] = ['Recording will capture:'];
  
  if (options.includesTextCapture !== false) {
    warnings.push('• Text entered in forms and input fields');
  }
  
  if (options.includesScreenshots !== false) {
    warnings.push('• Screenshots of your screen');
  }
  
  warnings.push('');
  warnings.push('Avoid entering sensitive information like passwords or API keys during recording.');
  warnings.push('Use the pause feature to temporarily stop capturing.');
  
  return warnings.join('\n');
}
