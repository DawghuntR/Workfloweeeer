import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Guide } from '@workfloweeeer/core';

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  guide: Guide | null;
  stepCount: number;
}

function Popup() {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    guide: null,
    stepCount: 0,
  });
  const [title, setTitle] = useState('');
  const [maskInput, setMaskInput] = useState(false);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [view, setView] = useState<'main' | 'library'>('main');
  
  useEffect(() => {
    loadState();
  }, []);
  
  async function loadState() {
    const response = await chrome.runtime.sendMessage({ type: 'GET_RECORDING_STATE' });
    setState(response);
    
    const guidesResponse = await chrome.runtime.sendMessage({ type: 'GET_ALL_GUIDES' });
    setGuides(guidesResponse.guides || []);
  }
  
  async function startRecording() {
    await chrome.runtime.sendMessage({
      type: 'START_NEW_RECORDING',
      payload: { title: title || 'Untitled Guide', maskInput },
    });
    setTitle('');
    loadState();
  }
  
  async function stopRecording() {
    await chrome.runtime.sendMessage({ type: 'STOP_RECORDING' });
    loadState();
  }
  
  async function pauseRecording() {
    await chrome.runtime.sendMessage({ type: 'PAUSE_RECORDING' });
    loadState();
  }
  
  async function resumeRecording() {
    await chrome.runtime.sendMessage({ type: 'RESUME_RECORDING' });
    loadState();
  }
  
  async function undoLastStep() {
    await chrome.runtime.sendMessage({ type: 'UNDO_LAST_STEP' });
    loadState();
  }
  
  async function exportGuide(guideId: string) {
    const response = await chrome.runtime.sendMessage({
      type: 'EXPORT_GUIDE',
      payload: { guideId },
    });
    
    if (response.guide) {
      const blob = new Blob([JSON.stringify(response.guide, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${response.guide.title || 'guide'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
  
  async function deleteGuide(guideId: string) {
    await chrome.runtime.sendMessage({
      type: 'DELETE_GUIDE',
      payload: { guideId },
    });
    loaddebugging();
  }
  
  function loadDebugging() {
    loadState();
  }
  
  if (view === 'library') {
    return (
      <div className="popup">
        <header>
          <h1>Guide Library</h1>
          <button className="btn btn-secondary" onClick={() => setView('main')}>
            Back
          </button>
        </header>
        
        <div className="guide-list">
          {guides.length === 0 ? (
            <p className="empty-message">No guides recorded yet</p>
          ) : (
            guides.map((guide) => (
              <div key={guide.id} className="guide-item">
                <div className="guide-info">
                  <h3>{guide.title}</h3>
                  <p>{guide.steps.length} steps • {new Date(guide.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="guide-actions">
                  <button onClick={() => exportGuide(guide.id)}>Export</button>
                  <button className="btn-danger" onClick={() => deleteGuide(guide.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="popup">
      <header>
        <h1>Workfloweeeer</h1>
      </header>
      
      {!state.isRecording ? (
        <div className="start-section">
          <input
            type="text"
            placeholder="Guide title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="title-input"
          />
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={maskInput}
              onChange={(e) => setMaskInput(e.target.checked)}
            />
            Mask text input
          </label>
          
          <button className="btn btn-primary btn-large" onClick={startRecording}>
            Start Recording
          </button>
          
          <button className="btn btn-secondary" onClick={() => setView('library')}>
            View Library ({guides.length})
          </button>
        </div>
      ) : (
        <div className="recording-section">
          <div className={`status ${state.isPaused ? 'paused' : 'recording'}`}>
            {state.isPaused ? '⏸️ Paused' : '🔴 Recording'}
          </div>
          
          <div className="guide-info">
            <h3>{state.guide?.title || 'Untitled'}</h3>
            <p>{state.stepCount} steps captured</p>
          </div>
          
          <div className="controls">
            {state.isPaused ? (
              <button className="btn btn-primary" onClick={resumeRecording}>
                Resume
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={pauseRecording}>
                Pause
              </button>
            )}
            
            <button
              className="btn btn-secondary"
              onClick={undoLastStep}
              disabled={state.stepCount === 0}
            >
              Undo
            </button>
            
            <button className="btn btn-danger" onClick={stopRecording}>
              Stop
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}
