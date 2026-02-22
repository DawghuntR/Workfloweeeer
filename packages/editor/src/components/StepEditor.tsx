import React from 'react';
import { useEditorStore } from '../store/editorStore';

export function StepEditor() {
  const {
    guide,
    selectedStepId,
    selectedStepIds,
    updateStepTitle,
    updateStepDescription,
    updateGuideTitle,
    updateGuideDescription,
    deleteSelectedSteps,
    mergeSelectedSteps,
  } = useEditorStore();
  
  const selectedStep = guide?.steps.find((s) => s.id === selectedStepId);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedStepId) {
      updateStepTitle(selectedStepId, e.target.value);
    }
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (selectedStepId) {
      updateStepDescription(selectedStepId, e.target.value);
    }
  };
  
  if (!guide) {
    return (
      <div className="step-editor-empty">
        <p>Load a guide to start editing</p>
      </div>
    );
  }
  
  if (selectedStepIds.length > 1) {
    return (
      <div className="step-editor-multi">
        <h3>{selectedStepIds.length} steps selected</h3>
        
        <div className="multi-actions">
          <button
            className="btn btn-primary"
            onClick={() => mergeSelectedSteps({ screenshotStrategy: 'first' })}
          >
            Merge Steps
          </button>
          
          <button
            className="btn btn-danger"
            onClick={deleteSelectedSteps}
          >
            Delete Selected
          </button>
        </div>
        
        <div className="merge-options">
          <h4>Merge Options</h4>
          <div className="option-group">
            <label>Screenshot strategy:</label>
            <select
              onChange={(e) => {
                const strategy = e.target.value as 'first' | 'last' | 'none';
                mergeSelectedSteps({ screenshotStrategy: strategy });
              }}
            >
              <option value="first">Keep first screenshot</option>
              <option value="last">Keep last screenshot</option>
              <option value="none">No screenshot</option>
            </select>
          </div>
        </div>
      </div>
    );
  }
  
  if (!selectedStep) {
    return (
      <div className="step-editor">
        <div className="guide-meta-editor">
          <h3>Guide Settings</h3>
          
          <div className="form-group">
            <label htmlFor="guide-title">Title</label>
            <input
              id="guide-title"
              type="text"
              value={guide.title}
              onChange={(e) => updateGuideTitle(e.target.value)}
              placeholder="Guide title..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="guide-description">Description</label>
            <textarea
              id="guide-description"
              value={guide.description}
              onChange={(e) => updateGuideDescription(e.target.value)}
              placeholder="Guide description..."
              rows={3}
            />
          </div>
          
          <div className="guide-info">
            <p><strong>Steps:</strong> {guide.steps.length}</p>
            <p><strong>Source:</strong> {guide.source}</p>
            <p><strong>Created:</strong> {new Date(guide.createdAt).toLocaleString()}</p>
            <p><strong>Updated:</strong> {new Date(guide.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="step-editor">
      <div className="step-meta">
        <span className="step-index">
          Step {guide.steps.findIndex((s) => s.id === selectedStep.id) + 1} of {guide.steps.length}
        </span>
        <span className="step-source">{selectedStep.source}</span>
      </div>
      
      <div className="form-group">
        <label htmlFor="step-title">Title</label>
        <input
          id="step-title"
          type="text"
          value={selectedStep.title}
          onChange={handleTitleChange}
          placeholder="Step title..."
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="step-description">Description</label>
        <textarea
          id="step-description"
          value={selectedStep.description}
          onChange={handleDescriptionChange}
          placeholder="Describe this step..."
          rows={4}
        />
      </div>
      
      <div className="step-details">
        <div className="detail-row">
          <span className="detail-label">Action Type</span>
          <span className="detail-value">{selectedStep.actionType}</span>
        </div>
        
        {selectedStep.target?.elementText && (
          <div className="detail-row">
            <span className="detail-label">Element</span>
            <span className="detail-value">{selectedStep.target.elementText}</span>
          </div>
        )}
        
        {selectedStep.inputValue && (
          <div className="detail-row">
            <span className="detail-label">Input Value</span>
            <span className="detail-value">
              {selectedStep.inputMasked ? '••••••••' : selectedStep.inputValue}
            </span>
          </div>
        )}
        
        <div className="detail-row">
          <span className="detail-label">Timestamp</span>
          <span className="detail-value">
            {new Date(selectedStep.timestamp).toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="step-actions">
        <button
          className="btn btn-danger"
          onClick={deleteSelectedSteps}
        >
          Delete Step
        </button>
      </div>
    </div>
  );
}
