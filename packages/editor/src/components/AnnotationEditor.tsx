import React, { useRef, useEffect, useState } from 'react';
import { Annotation, createAnnotation } from '@workfloweeeer/core';
import { useEditorStore } from '../store/editorStore';

interface AnnotationEditorProps {
  stepId: string;
  screenshotBase64: string;
  screenshotMimeType: string;
  annotations: Annotation[];
}

type AnnotationTool = 'select' | 'arrow' | 'box' | 'circle' | 'highlight' | 'text';

export function AnnotationEditor({
  stepId,
  screenshotBase64,
  screenshotMimeType,
  annotations,
}: AnnotationEditorProps) {
  const { addAnnotation, removeAnnotation, updateAnnotation } = useEditorStore();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [tool, setTool] = useState<AnnotationTool>('select');
  const [color, setColor] = useState('#FF0000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
    };
    img.src = `data:${screenshotMimeType};base64,${screenshotBase64}`;
  }, [screenshotBase64, screenshotMimeType]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || imageSize.width === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (const annotation of annotations) {
      drawAnnotation(ctx, annotation, annotation.id === selectedAnnotationId);
    }
  }, [annotations, selectedAnnotationId, imageSize]);
  
  const drawAnnotation = (ctx: CanvasRenderingContext2D, annotation: Annotation, isSelected: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const scaleX = canvas.width / 100;
    const scaleY = canvas.height / 100;
    
    ctx.strokeStyle = annotation.color;
    ctx.lineWidth = annotation.strokeWidth;
    ctx.fillStyle = annotation.color;
    
    if (isSelected) {
      ctx.setLineDash([5, 5]);
    } else {
      ctx.setLineDash([]);
    }
    
    const x = annotation.x * scaleX;
    const y = annotation.y * scaleY;
    
    switch (annotation.type) {
      case 'box':
        ctx.strokeRect(
          x,
          y,
          (annotation.width || 10) * scaleX,
          (annotation.height || 10) * scaleY
        );
        break;
      
      case 'circle':
        ctx.beginPath();
        ctx.ellipse(
          x + ((annotation.width || 10) * scaleX) / 2,
          y + ((annotation.height || 10) * scaleY) / 2,
          ((annotation.width || 10) * scaleX) / 2,
          ((annotation.height || 10) * scaleY) / 2,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        break;
      
      case 'arrow':
        const endX = (annotation.endX || annotation.x + 10) * scaleX;
        const endY = (annotation.endY || annotation.y + 10) * scaleY;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        const angle = Math.atan2(endY - y, endX - x);
        const arrowLength = 15;
        
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowLength * Math.cos(angle - Math.PI / 6),
          endY - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowLength * Math.cos(angle + Math.PI / 6),
          endY - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        break;
      
      case 'highlight':
        ctx.fillStyle = annotation.color + '4D';
        ctx.fillRect(
          x,
          y,
          (annotation.width || 10) * scaleX,
          (annotation.height || 5) * scaleY
        );
        break;
      
      case 'text':
        ctx.font = `${annotation.fontSize || 16}px sans-serif`;
        ctx.fillText(annotation.text || '', x, y);
        break;
    }
    
    ctx.setLineDash([]);
  };
  
  const getCanvasCoordinates = (e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    return { x, y };
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (tool === 'select') {
      const point = getCanvasCoordinates(e);
      const clickedAnnotation = findAnnotationAtPoint(point.x, point.y);
      setSelectedAnnotationId(clickedAnnotation?.id || null);
      return;
    }
    
    setIsDrawing(true);
    setStartPoint(getCanvasCoordinates(e));
  };
  
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;
    
    const endPoint = getCanvasCoordinates(e);
    
    const newAnnotation = createAnnotation(
      tool as Annotation['type'],
      startPoint.x,
      startPoint.y,
      {
        width: Math.abs(endPoint.x - startPoint.x),
        height: Math.abs(endPoint.y - startPoint.y),
        endX: endPoint.x,
        endY: endPoint.y,
        color,
        strokeWidth,
        text: tool === 'text' ? 'Text' : undefined,
      }
    );
    
    addAnnotation(stepId, newAnnotation);
    
    setIsDrawing(false);
    setStartPoint(null);
  };
  
  const findAnnotationAtPoint = (x: number, y: number): Annotation | null => {
    for (const annotation of [...annotations].reverse()) {
      const ax = annotation.x;
      const ay = annotation.y;
      const aw = annotation.width || 10;
      const ah = annotation.height || 10;
      
      if (x >= ax && x <= ax + aw && y >= ay && y <= ay + ah) {
        return annotation;
      }
    }
    return null;
  };
  
  const handleDeleteSelected = () => {
    if (selectedAnnotationId) {
      removeAnnotation(stepId, selectedAnnotationId);
      setSelectedAnnotationId(null);
    }
  };
  
  return (
    <div className="annotation-editor" ref={containerRef}>
      <div className="annotation-toolbar">
        <div className="tool-group">
          <button
            className={`tool-btn ${tool === 'select' ? 'active' : ''}`}
            onClick={() => setTool('select')}
            title="Select (V)"
          >
            ↖
          </button>
          <button
            className={`tool-btn ${tool === 'arrow' ? 'active' : ''}`}
            onClick={() => setTool('arrow')}
            title="Arrow (A)"
          >
            →
          </button>
          <button
            className={`tool-btn ${tool === 'box' ? 'active' : ''}`}
            onClick={() => setTool('box')}
            title="Rectangle (R)"
          >
            □
          </button>
          <button
            className={`tool-btn ${tool === 'circle' ? 'active' : ''}`}
            onClick={() => setTool('circle')}
            title="Circle (C)"
          >
            ○
          </button>
          <button
            className={`tool-btn ${tool === 'highlight' ? 'active' : ''}`}
            onClick={() => setTool('highlight')}
            title="Highlight (H)"
          >
            ▬
          </button>
          <button
            className={`tool-btn ${tool === 'text' ? 'active' : ''}`}
            onClick={() => setTool('text')}
            title="Text (T)"
          >
            T
          </button>
        </div>
        
        <div className="tool-group">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            title="Color"
          />
          <select
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            title="Stroke width"
          >
            <option value={1}>Thin</option>
            <option value={2}>Medium</option>
            <option value={3}>Thick</option>
            <option value={5}>Extra thick</option>
          </select>
        </div>
        
        <div className="tool-group">
          <button
            className="tool-btn danger"
            onClick={handleDeleteSelected}
            disabled={!selectedAnnotationId}
            title="Delete selected"
          >
            🗑
          </button>
        </div>
      </div>
      
      <div className="canvas-container">
        <img
          src={`data:${screenshotMimeType};base64,${screenshotBase64}`}
          alt="Step screenshot"
          className="screenshot-image"
        />
        <canvas
          ref={canvasRef}
          width={imageSize.width || 800}
          height={imageSize.height || 600}
          className="annotation-canvas"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        />
      </div>
    </div>
  );
}
