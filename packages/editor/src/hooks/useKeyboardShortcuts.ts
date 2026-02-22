import { useEffect, useCallback } from 'react';
import { useEditorStore } from '../store/editorStore';

export function useKeyboardShortcuts() {
  const {
    undo,
    redo,
    deleteSelectedSteps,
    selectedStepIds,
    guide,
    selectStep,
    selectedStepId,
  } = useEditorStore();
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isEditing = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName);
    
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'z':
          if (e.shiftKey) {
            e.preventDefault();
            redo();
          } else if (!isEditing) {
            e.preventDefault();
            undo();
          }
          break;
        
        case 'y':
          e.preventDefault();
          redo();
          break;
        
        case 's':
          e.preventDefault();
          break;
      }
    }
    
    if (!isEditing) {
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedStepIds.length > 0) {
            e.preventDefault();
            deleteSelectedSteps();
          }
          break;
        
        case 'Escape':
          useEditorStore.getState().clearSelection();
          break;
        
        case 'ArrowUp':
          e.preventDefault();
          navigateSteps(-1);
          break;
        
        case 'ArrowDown':
          e.preventDefault();
          navigateSteps(1);
          break;
      }
    }
  }, [undo, redo, deleteSelectedSteps, selectedStepIds]);
  
  const navigateSteps = (direction: number) => {
    const state = useEditorStore.getState();
    if (!state.guide || state.guide.steps.length === 0) return;
    
    const currentIndex = state.selectedStepId
      ? state.guide.steps.findIndex((s) => s.id === state.selectedStepId)
      : -1;
    
    let newIndex = currentIndex + direction;
    
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= state.guide.steps.length) newIndex = state.guide.steps.length - 1;
    
    selectStep(state.guide.steps[newIndex].id);
  };
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
