import { v4 as uuidv4 } from 'uuid';
import {
  Guide,
  Step,
  Annotation,
  ActionType,
  CaptureSource,
  TargetMetadata,
  SCHEMA_VERSION,
  GuideSchema,
  StepSchema,
  AnnotationSchema,
} from './schema.js';

export function createGuide(
  title: string,
  source: 'chrome' | 'desktop' | 'mixed' = 'chrome',
  options: Partial<Omit<Guide, 'id' | 'schemaVersion' | 'title' | 'source' | 'createdAt' | 'updatedAt'>> = {}
): Guide {
  const now = new Date().toISOString();
  return GuideSchema.parse({
    id: uuidv4(),
    schemaVersion: SCHEMA_VERSION,
    title,
    source,
    createdAt: now,
    updatedAt: now,
    steps: [],
    ...options,
  });
}

export function createStep(
  actionType: ActionType,
  source: CaptureSource,
  options: Partial<Omit<Step, 'id' | 'actionType' | 'source' | 'timestamp'>> = {}
): Step {
  return StepSchema.parse({
    id: uuidv4(),
    actionType,
    source,
    timestamp: new Date().toISOString(),
    title: '',
    description: '',
    annotations: [],
    ...options,
  });
}

export function createAnnotation(
  type: Annotation['type'],
  x: number,
  y: number,
  options: Partial<Omit<Annotation, 'id' | 'type' | 'x' | 'y'>> = {}
): Annotation {
  return AnnotationSchema.parse({
    id: uuidv4(),
    type,
    x,
    y,
    color: '#FF0000',
    strokeWidth: 2,
    ...options,
  });
}

export function addStepToGuide(guide: Guide, step: Step): Guide {
  const updatedGuide = {
    ...guide,
    steps: [...guide.steps, step],
    updatedAt: new Date().toISOString(),
  };
  
  if (guide.source !== step.source && guide.source !== 'mixed') {
    updatedGuide.source = 'mixed';
  }
  
  return GuideSchema.parse(updatedGuide);
}

export function updateStep(guide: Guide, stepId: string, updates: Partial<Step>): Guide {
  return GuideSchema.parse({
    ...guide,
    steps: guide.steps.map((step) =>
      step.id === stepId ? StepSchema.parse({ ...step, ...updates }) : step
    ),
    updatedAt: new Date().toISOString(),
  });
}

export function deleteStep(guide: Guide, stepId: string): Guide {
  return GuideSchema.parse({
    ...guide,
    steps: guide.steps.filter((step) => step.id !== stepId),
    updatedAt: new Date().toISOString(),
  });
}

export function reorderSteps(guide: Guide, fromIndex: number, toIndex: number): Guide {
  const steps = [...guide.steps];
  const [removed] = steps.splice(fromIndex, 1);
  steps.splice(toIndex, 0, removed);
  
  return GuideSchema.parse({
    ...guide,
    steps,
    updatedAt: new Date().toISOString(),
  });
}

export function mergeSteps(
  guide: Guide,
  stepIds: string[],
  mergeOptions: {
    screenshotStrategy?: 'first' | 'last' | 'none';
    combineDescriptions?: boolean;
  } = {}
): Guide {
  const { screenshotStrategy = 'first', combineDescriptions = true } = mergeOptions;
  
  const stepsToMerge = guide.steps.filter((s) => stepIds.includes(s.id));
  if (stepsToMerge.length < 2) return guide;
  
  const firstStepIndex = guide.steps.findIndex((s) => stepIds.includes(s.id));
  const sortedSteps = stepIds.map((id) => guide.steps.find((s) => s.id === id)!);
  
  let screenshot: string | undefined;
  let mimeType = 'image/png';
  
  if (screenshotStrategy === 'first') {
    const stepWithScreenshot = sortedSteps.find((s) => s.screenshotBase64);
    screenshot = stepWithScreenshot?.screenshotBase64;
    mimeType = stepWithScreenshot?.screenshotMimeType || mimeType;
  } else if (screenshotStrategy === 'last') {
    const stepWithScreenshot = [...sortedSteps].reverse().find((s) => s.screenshotBase64);
    screenshot = stepWithScreenshot?.screenshotBase64;
    mimeType = stepWithScreenshot?.screenshotMimeType || mimeType;
  }
  
  const mergedStep: Step = StepSchema.parse({
    id: uuidv4(),
    actionType: sortedSteps[0].actionType,
    source: sortedSteps[0].source,
    timestamp: sortedSteps[0].timestamp,
    title: sortedSteps.map((s) => s.title).filter(Boolean).join(' → ') || 'Merged Step',
    description: combineDescriptions
      ? sortedSteps.map((s) => s.description).filter(Boolean).join('\n\n')
      : sortedSteps[0].description,
    screenshotBase64: screenshot,
    screenshotMimeType: mimeType,
    annotations: sortedSteps.flatMap((s) => s.annotations),
  });
  
  const remainingSteps = guide.steps.filter((s) => !stepIds.includes(s.id));
  remainingSteps.splice(firstStepIndex, 0, mergedStep);
  
  return GuideSchema.parse({
    ...guide,
    steps: remainingSteps,
    updatedAt: new Date().toISOString(),
  });
}

export function addAnnotationToStep(guide: Guide, stepId: string, annotation: Annotation): Guide {
  return updateStep(guide, stepId, {
    annotations: [
      ...(guide.steps.find((s) => s.id === stepId)?.annotations || []),
      annotation,
    ],
  });
}

export function removeAnnotationFromStep(
  guide: Guide,
  stepId: string,
  annotationId: string
): Guide {
  const step = guide.steps.find((s) => s.id === stepId);
  if (!step) return guide;
  
  return updateStep(guide, stepId, {
    annotations: step.annotations.filter((a) => a.id !== annotationId),
  });
}

export function updateStepScreenshot(
  guide: Guide,
  stepId: string,
  screenshotBase64: string,
  mimeType = 'image/png'
): Guide {
  return updateStep(guide, stepId, {
    screenshotBase64,
    screenshotMimeType: mimeType,
  });
}

export function validateGuide(data: unknown): { success: true; data: Guide } | { success: false; errors: string[] } {
  const result = GuideSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
  };
}

export function serializeGuide(guide: Guide): string {
  return JSON.stringify(guide, null, 2);
}

export function deserializeGuide(json: string): Guide {
  const data = JSON.parse(json);
  return GuideSchema.parse(data);
}
