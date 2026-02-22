import { Guide, serializeGuide } from '@workfloweeeer/core';

export interface JsonExportOptions {
  pretty?: boolean;
  includeScreenshots?: boolean;
}

export function exportToJson(guide: Guide, options: JsonExportOptions = {}): string {
  const { pretty = true, includeScreenshots = true } = options;
  
  let exportGuide = guide;
  
  if (!includeScreenshots) {
    exportGuide = {
      ...guide,
      steps: guide.steps.map((step) => ({
        ...step,
        screenshotBase64: undefined,
      })),
    };
  }
  
  if (pretty) {
    return JSON.stringify(exportGuide, null, 2);
  }
  
  return JSON.stringify(exportGuide);
}

export function validateExportedJson(json: string): boolean {
  try {
    const data = JSON.parse(json);
    return (
      data.schemaVersion &&
      data.id &&
      data.title &&
      Array.isArray(data.steps)
    );
  } catch {
    return false;
  }
}
