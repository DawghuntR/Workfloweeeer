import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  createGuide,
  createStep,
  addStepToGuide,
  updateStep,
  deleteStep,
  reorderSteps,
  mergeSteps,
  validateGuide,
  serializeGuide,
  deserializeGuide,
  GuideSchema,
  Guide,
} from '@workfloweeeer/core';

describe('Guide Data Model', () => {
  let guide: Guide;

  beforeEach(() => {
    guide = createGuide('Test Guide', 'chrome');
  });

  describe('createGuide', () => {
    it('should create a valid guide with UUID', () => {
      expect(guide.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should have schema version 1.0', () => {
      expect(guide.schemaVersion).toBe('1.0');
    });

    it('should have valid timestamps', () => {
      expect(new Date(guide.createdAt).getTime()).toBeLessThanOrEqual(Date.now());
      expect(guide.createdAt).toBe(guide.updatedAt);
    });

    it('should initialize with empty steps array', () => {
      expect(guide.steps).toEqual([]);
    });
  });

  describe('createStep', () => {
    it('should create a valid step with UUID', () => {
      const step = createStep('click', 'chrome');
      expect(step.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should set action type and source', () => {
      const step = createStep('input', 'desktop');
      expect(step.actionType).toBe('input');
      expect(step.source).toBe('desktop');
    });
  });

  describe('addStepToGuide', () => {
    it('should add a step to the guide', () => {
      const step = createStep('click', 'chrome');
      const updatedGuide = addStepToGuide(guide, step);
      expect(updatedGuide.steps).toHaveLength(1);
      expect(updatedGuide.steps[0].id).toBe(step.id);
    });

    it('should update the guide updatedAt timestamp', () => {
      const step = createStep('click', 'chrome');
      const updatedGuide = addStepToGuide(guide, step);
      expect(new Date(updatedGuide.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(guide.updatedAt).getTime()
      );
    });

    it('should change source to mixed when adding different source', () => {
      const step = createStep('click', 'desktop');
      const updatedGuide = addStepToGuide(guide, step);
      expect(updatedGuide.source).toBe('mixed');
    });
  });

  describe('updateStep', () => {
    it('should update step properties', () => {
      const step = createStep('click', 'chrome');
      guide = addStepToGuide(guide, step);
      
      const updatedGuide = updateStep(guide, step.id, {
        title: 'Updated Title',
        description: 'Updated Description',
      });
      
      expect(updatedGuide.steps[0].title).toBe('Updated Title');
      expect(updatedGuide.steps[0].description).toBe('Updated Description');
    });
  });

  describe('deleteStep', () => {
    it('should remove a step from the guide', () => {
      const step1 = createStep('click', 'chrome');
      const step2 = createStep('input', 'chrome');
      guide = addStepToGuide(guide, step1);
      guide = addStepToGuide(guide, step2);
      
      const updatedGuide = deleteStep(guide, step1.id);
      
      expect(updatedGuide.steps).toHaveLength(1);
      expect(updatedGuide.steps[0].id).toBe(step2.id);
    });
  });

  describe('reorderSteps', () => {
    it('should reorder steps correctly', () => {
      const step1 = createStep('click', 'chrome', { title: 'First' });
      const step2 = createStep('input', 'chrome', { title: 'Second' });
      const step3 = createStep('navigate', 'chrome', { title: 'Third' });
      
      guide = addStepToGuide(guide, step1);
      guide = addStepToGuide(guide, step2);
      guide = addStepToGuide(guide, step3);
      
      const reorderedGuide = reorderSteps(guide, 0, 2);
      
      expect(reorderedGuide.steps[0].title).toBe('Second');
      expect(reorderedGuide.steps[1].title).toBe('Third');
      expect(reorderedGuide.steps[2].title).toBe('First');
    });
  });

  describe('mergeSteps', () => {
    it('should merge multiple steps into one', () => {
      const step1 = createStep('click', 'chrome', { title: 'Click button' });
      const step2 = createStep('input', 'chrome', { title: 'Enter text' });
      
      guide = addStepToGuide(guide, step1);
      guide = addStepToGuide(guide, step2);
      
      const mergedGuide = mergeSteps(guide, [step1.id, step2.id]);
      
      expect(mergedGuide.steps).toHaveLength(1);
      expect(mergedGuide.steps[0].title).toContain('Click button');
      expect(mergedGuide.steps[0].title).toContain('Enter text');
    });
  });

  describe('validateGuide', () => {
    it('should validate a correct guide', () => {
      const result = validateGuide(guide);
      expect(result.success).toBe(true);
    });

    it('should reject invalid guide', () => {
      const invalid = { title: 'No other fields' };
      const result = validateGuide(invalid);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('serialization', () => {
    it('should serialize and deserialize without data loss', () => {
      const step = createStep('click', 'chrome', {
        title: 'Test Step',
        description: 'Test Description',
      });
      guide = addStepToGuide(guide, step);
      
      const json = serializeGuide(guide);
      const restored = deserializeGuide(json);
      
      expect(restored.id).toBe(guide.id);
      expect(restored.title).toBe(guide.title);
      expect(restored.steps).toHaveLength(1);
      expect(restored.steps[0].title).toBe('Test Step');
    });
  });
});

describe('Sample Workflow Validation', () => {
  const samplesDir = path.join(__dirname, '..', 'samples');

  it('should validate sample-web-workflow.json', async () => {
    const content = await fs.readFile(path.join(samplesDir, 'sample-web-workflow.json'), 'utf-8');
    const data = JSON.parse(content);
    const result = validateGuide(data);
    expect(result.success).toBe(true);
  });

  it('should validate sample-desktop-workflow.json', async () => {
    const content = await fs.readFile(path.join(samplesDir, 'sample-desktop-workflow.json'), 'utf-8');
    const data = JSON.parse(content);
    const result = validateGuide(data);
    expect(result.success).toBe(true);
  });

  it('should validate sample-mixed-workflow.json', async () => {
    const content = await fs.readFile(path.join(samplesDir, 'sample-mixed-workflow.json'), 'utf-8');
    const data = JSON.parse(content);
    const result = validateGuide(data);
    expect(result.success).toBe(true);
  });
});
