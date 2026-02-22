import { create } from 'zustand';
import {
  Guide,
  Step,
  Annotation,
  updateStep,
  deleteStep,
  reorderSteps,
  mergeSteps,
  addAnnotationToStep,
  removeAnnotationFromStep,
  updateStepScreenshot,
} from '@workfloweeeer/core';

interface EditorState {
  guide: Guide | null;
  selectedStepId: string | null;
  selectedStepIds: string[];
  undoStack: Guide[];
  redoStack: Guide[];
  isDirty: boolean;
  
  setGuide: (guide: Guide) => void;
  selectStep: (stepId: string | null) => void;
  toggleStepSelection: (stepId: string) => void;
  clearSelection: () => void;
  
  updateStepTitle: (stepId: string, title: string) => void;
  updateStepDescription: (stepId: string, description: string) => void;
  updateGuideTitle: (title: string) => void;
  updateGuideDescription: (description: string) => void;
  
  deleteSelectedSteps: () => void;
  deleteStepById: (stepId: string) => void;
  reorderStep: (fromIndex: number, toIndex: number) => void;
  mergeSelectedSteps: (options?: { screenshotStrategy?: 'first' | 'last' | 'none' }) => void;
  
  addAnnotation: (stepId: string, annotation: Annotation) => void;
  removeAnnotation: (stepId: string, annotationId: string) => void;
  updateAnnotation: (stepId: string, annotationId: string, updates: Partial<Annotation>) => void;
  
  replaceScreenshot: (stepId: string, base64: string, mimeType?: string) => void;
  
  undo: () => void;
  redo: () => void;
  
  markClean: () => void;
}

function pushUndo(state: EditorState): Partial<EditorState> {
  if (!state.guide) return {};
  
  return {
    undoStack: [...state.undoStack.slice(-49), state.guide],
    redoStack: [],
    isDirty: true,
  };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  guide: null,
  selectedStepId: null,
  selectedStepIds: [],
  undoStack: [],
  redoStack: [],
  isDirty: false,
  
  setGuide: (guide) => set({ guide, undoStack: [], redoStack: [], isDirty: false }),
  
  selectStep: (stepId) => set({ 
    selectedStepId: stepId,
    selectedStepIds: stepId ? [stepId] : [],
  }),
  
  toggleStepSelection: (stepId) => set((state) => {
    const isSelected = state.selectedStepIds.includes(stepId);
    const newSelection = isSelected
      ? state.selectedStepIds.filter((id) => id !== stepId)
      : [...state.selectedStepIds, stepId];
    
    return {
      selectedStepIds: newSelection,
      selectedStepId: newSelection.length === 1 ? newSelection[0] : null,
    };
  }),
  
  clearSelection: () => set({ selectedStepId: null, selectedStepIds: [] }),
  
  updateStepTitle: (stepId, title) => {
    const state = get();
    if (!state.guide) return;
    
    set({
      ...pushUndo(state),
      guide: updateStep(state.guide, stepId, { title }),
    });
  },
  
  updateStepDescription: (stepId, description) => {
    const state = get();
    if (!state.guide) return;
    
    set({
      ...pushUndo(state),
      guide: updateStep(state.guide, stepId, { description }),
    });
  },
  
  updateGuideTitle: (title) => {
    const state = get();
    if (!state.guide) return;
    
    set({
      ...pushUndo(state),
      guide: { ...state.guide, title, updatedAt: new Date().toISOString() },
    });
  },
  
  updateGuideDescription: (description) => {
    const state = get();
    if (!state.guide) return;
    
    set({
      ...pushUndo(state),
      guide: { ...state.guide, description, updatedAt: new Date().toISOString() },
    });
  },
  
  deleteSelectedSteps: () => {
    const state = get();
    if (!state.guide || state.selectedStepIds.length === 0) return;
    
    let newGuide = state.guide;
    for (const stepId of state.selectedStepIds) {
      newGuide = deleteStep(newGuide, stepId);
    }
    
    set({
      ...pushUndo(state),
      guide: newGuide,
      selectedStepId: null,
      selectedStepIds: [],
    });
  },
  
  deleteStepById: (stepId) => {
    const state = get();
    if (!state.guide) return;
    
    set({
      ...pushUndo(state),
      guide: deleteStep(state.guide, stepId),
      selectedStepId: state.selectedStepId === stepId ? null : state.selectedStepId,
      selectedStepIds: state.selectedStepIds.filter((id) => id !== stepId),
    });
  },
  
  reorderStep: (fromIndex, toIndex) => {
    const state = get();
    if (!state.guide) return;
    
    set({
      ...pushUndo(state),
      guide: reorderSteps(state.guide, fromIndex, toIndex),
    });
  },
  
  mergeSelectedSteps: (options) => {
    const state = get();
    if (!state.guide || state.selectedStepIds.length < 2) return;
    
    set({
      ...pushUndo(state),
      guide: mergeSteps(state.guide, state.selectedStepIds, options),
      selectedStepId: null,
      selectedStepIds: [],
    });
  },
  
  addAnnotation: (stepId, annotation) => {
    const state = get();
    if (!state.guide) return;
    
    set({
      ...pushUndo(state),
      guide: addAnnotationToStep(state.guide, stepId, annotation),
    });
  },
  
  removeAnnotation: (stepId, annotationId) => {
    const state = get();
    if (!state.guide) return;
    
    set({
      ...pushUndo(state),
      guide: removeAnnotationFromStep(state.guide, stepId, annotationId),
    });
  },
  
  updateAnnotation: (stepId, annotationId, updates) => {
    const state = get();
    if (!state.guide) return;
    
    const step = state.guide.steps.find((s) => s.id === stepId);
    if (!step) return;
    
    const updatedAnnotations = step.annotations.map((a) =>
      a.id === annotationId ? { ...a, ...updates } : a
    );
    
    set({
      ...pushUndo(state),
      guide: updateStep(state.guide, stepId, { annotations: updatedAnnotations }),
    });
  },
  
  replaceScreenshot: (stepId, base64, mimeType = 'image/png') => {
    const state = get();
    if (!state.guide) return;
    
    set({
      ...pushUndo(state),
      guide: updateStepScreenshot(state.guide, stepId, base64, mimeType),
    });
  },
  
  undo: () => {
    const state = get();
    if (state.undoStack.length === 0 || !state.guide) return;
    
    const previous = state.undoStack[state.undoStack.length - 1];
    
    set({
      guide: previous,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, state.guide],
      isDirty: true,
    });
  },
  
  redo: () => {
    const state = get();
    if (state.redoStack.length === 0 || !state.guide) return;
    
    const next = state.redoStack[state.redoStack.length - 1];
    
    set({
      guide: next,
      undoStack: [...state.undoStack, state.guide],
      redoStack: state.redoStack.slice(0, -1),
      isDirty: true,
    });
  },
  
  markClean: () => set({ isDirty: false }),
}));
