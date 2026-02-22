import React, { useRef } from 'react';
import { useEditorStore } from '../store/editorStore';

interface ScreenshotReplacerProps {
  stepId: string;
  currentScreenshot?: string;
  mimeType?: string;
}

export function ScreenshotReplacer({
  stepId,
  currentScreenshot,
  mimeType = 'image/png',
}: ScreenshotReplacerProps) {
  const { replaceScreenshot } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.replace(/^data:image\/\w+;base64,/, '');
      const detectedMimeType = file.type || 'image/png';
      
      replaceScreenshot(stepId, base64, detectedMimeType);
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.replace(/^data:image\/\w+;base64,/, '');
      
      replaceScreenshot(stepId, base64, file.type);
    };
    reader.readAsDataURL(file);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  return (
    <div className="screenshot-replacer">
      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {currentScreenshot ? (
          <img
            src={`data:${mimeType};base64,${currentScreenshot}`}
            alt="Current screenshot"
            className="current-screenshot"
          />
        ) : (
          <div className="placeholder">No screenshot</div>
        )}
        
        <div className="overlay">
          <p>Drop an image here or click to replace</p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          onChange={handleFileSelect}
          className="file-input"
        />
      </div>
      
      <div className="screenshot-actions">
        <button
          className="btn btn-secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          Choose File
        </button>
        
        {currentScreenshot && (
          <button
            className="btn btn-danger"
            onClick={() => replaceScreenshot(stepId, '', '')}
          >
            Remove Screenshot
          </button>
        )}
      </div>
    </div>
  );
}
