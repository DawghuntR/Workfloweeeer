import React from 'react';
import { Step } from '@workfloweeeer/core';
import { useEditorStore } from '../store/editorStore';

interface StepListProps {
  onDragStart?: (index: number) => void;
  onDragEnd?: () => void;
  onDrop?: (fromIndex: number, toIndex: number) => void;
}

export function StepList({ onDragStart, onDragEnd, onDrop }: StepListProps) {
  const { guide, selectedStepId, selectedStepIds, selectStep, toggleStepSelection, deleteStepById, reorderStep } = useEditorStore();
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [dropIndex, setDropIndex] = React.useState<number | null>(null);
  
  if (!guide) {
    return <div className="step-list-empty">No guide loaded</div>;
  }
  
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(index);
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropIndex(index);
  };
  
  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== toIndex) {
      reorderStep(dragIndex, toIndex);
      onDrop?.(dragIndex, toIndex);
    }
    setDragIndex(null);
    setDropIndex(null);
    onDragEnd?.();
  };
  
  const handleDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
    onDragEnd?.();
  };
  
  const handleClick = (e: React.MouseEvent, step: Step) => {
    if (e.ctrlKey || e.metaKey) {
      toggleStepSelection(step.id);
    } else {
      selectStep(step.id);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, step: Step, index: number) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      deleteStepById(step.id);
    } else if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      selectStep(guide.steps[index - 1].id);
    } else if (e.key === 'ArrowDown' && index < guide.steps.length - 1) {
      e.preventDefault();
      selectStep(guide.steps[index + 1].id);
    }
  };
  
  return (
    <div className="step-list" role="list" aria-label="Workflow steps">
      {guide.steps.map((step, index) => {
        const isSelected = selectedStepIds.includes(step.id);
        const isDragging = dragIndex === index;
        const isDropTarget = dropIndex === index && dragIndex !== index;
        
        return (
          <div
            key={step.id}
            className={`step-item ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isDropTarget ? 'drop-target' : ''}`}
            draggable
            role="listitem"
            tabIndex={0}
            aria-selected={isSelected}
            onClick={(e) => handleClick(e, step)}
            onKeyDown={(e) => handleKeyDown(e, step, index)}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div className="step-number">{index + 1}</div>
            
            <div className="step-content">
              <div className="step-header">
                <span className="step-title">{step.title || `Step ${index + 1}`}</span>
                <span className="step-action-type">{step.actionType}</span>
              </div>
              
              {step.description && (
                <p className="step-description">{step.description}</p>
              )}
            </div>
            
            {step.screenshotBase64 && (
              <div className="step-thumbnail">
                <img
                  src={`data:${step.screenshotMimeType};base64,${step.screenshotBase64}`}
                  alt={`Screenshot for step ${index + 1}`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
