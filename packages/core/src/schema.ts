import { z } from 'zod';

export const SCHEMA_VERSION = '1.0' as const;

export const AnnotationTypeSchema = z.enum([
  'arrow',
  'box',
  'highlight',
  'text',
  'circle',
  'freehand'
]);

export const AnnotationSchema = z.object({
  id: z.string().uuid(),
  type: AnnotationTypeSchema,
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  endX: z.number().optional(),
  endY: z.number().optional(),
  points: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
  color: z.string().default('#FF0000'),
  strokeWidth: z.number().default(2),
  text: z.string().optional(),
  fontSize: z.number().optional(),
});

export const ActionTypeSchema = z.enum([
  'click',
  'doubleClick',
  'rightClick',
  'input',
  'navigate',
  'scroll',
  'key',
  'select',
  'hover',
  'drag',
  'paste',
  'custom'
]);

export const CaptureSourceSchema = z.enum([
  'chrome',
  'desktop',
  'manual'
]);

export const TargetMetadataSchema = z.object({
  selector: z.string().optional(),
  xpath: z.string().optional(),
  elementText: z.string().optional(),
  elementRole: z.string().optional(),
  elementLabel: z.string().optional(),
  placeholder: z.string().optional(),
  inputName: z.string().optional(),
  inputId: z.string().optional(),
  url: z.string().optional(),
  windowTitle: z.string().optional(),
  processName: z.string().optional(),
  coordinates: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
});

export const StepSchema = z.object({
  id: z.string().uuid(),
  title: z.string().default(''),
  description: z.string().default(''),
  actionType: ActionTypeSchema,
  timestamp: z.string().datetime(),
  source: CaptureSourceSchema,
  target: TargetMetadataSchema.optional(),
  inputValue: z.string().optional(),
  inputMasked: z.boolean().default(false),
  screenshotBase64: z.string().optional(),
  screenshotMimeType: z.string().default('image/png'),
  annotations: z.array(AnnotationSchema).default([]),
  aiSummary: z.string().optional(),
  aiDescription: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const GuideMetadataSchema = z.object({
  app: z.string().optional(),
  environment: z.string().optional(),
  tags: z.array(z.string()).default([]),
  author: z.string().optional(),
  version: z.string().optional(),
});

export const GuideSchema = z.object({
  id: z.string().uuid(),
  schemaVersion: z.literal(SCHEMA_VERSION),
  title: z.string(),
  description: z.string().default(''),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  source: z.enum(['chrome', 'desktop', 'mixed']),
  steps: z.array(StepSchema).default([]),
  metadata: GuideMetadataSchema.default({}),
  aiSummary: z.string().optional(),
});

export type AnnotationType = z.infer<typeof AnnotationTypeSchema>;
export type Annotation = z.infer<typeof AnnotationSchema>;
export type ActionType = z.infer<typeof ActionTypeSchema>;
export type CaptureSource = z.infer<typeof CaptureSourceSchema>;
export type TargetMetadata = z.infer<typeof TargetMetadataSchema>;
export type Step = z.infer<typeof StepSchema>;
export type GuideMetadata = z.infer<typeof GuideMetadataSchema>;
export type Guide = z.infer<typeof GuideSchema>;
