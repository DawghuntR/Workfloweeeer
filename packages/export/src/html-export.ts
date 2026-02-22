import Handlebars from 'handlebars';
import { Guide, Annotation } from '@workfloweeeer/core';

export interface HtmlExportOptions {
  theme?: 'light' | 'dark';
  includeTableOfContents?: boolean;
  inlineStyles?: boolean;
  title?: string;
}

const DEFAULT_STYLES = `
  :root {
    --bg-primary: #ffffff;
    --bg-secondary: #f3f4f6;
    --text-primary: #1f2937;
    --text-secondary: #6b7280;
    --border-color: #e5e7eb;
    --accent-color: #3b82f6;
    --step-number-bg: #3b82f6;
    --step-number-text: #ffffff;
  }
  
  [data-theme="dark"] {
    --bg-primary: #1f2937;
    --bg-secondary: #111827;
    --text-primary: #f9fafb;
    --text-secondary: #9ca3af;
    --border-color: #374151;
    --accent-color: #60a5fa;
    --step-number-bg: #3b82f6;
    --step-number-text: #ffffff;
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    line-height: 1.6;
    padding: 2rem;
  }
  
  .container {
    max-width: 900px;
    margin: 0 auto;
    background-color: var(--bg-primary);
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .header {
    padding: 2rem;
    border-bottom: 1px solid var(--border-color);
  }
  
  .header h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  .header .description {
    color: var(--text-secondary);
    font-size: 1rem;
  }
  
  .header .meta {
    margin-top: 1rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
  
  .toc {
    padding: 1.5rem 2rem;
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
  }
  
  .toc h2 {
    font-size: 1.125rem;
    margin-bottom: 1rem;
  }
  
  .toc ol {
    list-style-position: inside;
    padding-left: 0;
  }
  
  .toc li {
    padding: 0.25rem 0;
  }
  
  .toc a {
    color: var(--accent-color);
    text-decoration: none;
  }
  
  .toc a:hover {
    text-decoration: underline;
  }
  
  .steps {
    padding: 2rem;
  }
  
  .step {
    margin-bottom: 2.5rem;
    padding-bottom: 2.5rem;
    border-bottom: 1px solid var(--border-color);
  }
  
  .step:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  
  .step-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .step-number {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    background-color: var(--step-number-bg);
    color: var(--step-number-text);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
  }
  
  .step-content h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .step-content .description {
    color: var(--text-secondary);
    margin-bottom: 1rem;
  }
  
  .step-content .action-type {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background-color: var(--bg-secondary);
    border-radius: 9999px;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    margin-bottom: 1rem;
  }
  
  .screenshot-container {
    position: relative;
    margin-top: 1rem;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border-color);
  }
  
  .screenshot {
    width: 100%;
    height: auto;
    display: block;
  }
  
  .annotation-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  
  .footer {
    padding: 1.5rem 2rem;
    background-color: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    text-align: center;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
`;

const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="en" data-theme="{{theme}}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    {{{styles}}}
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>{{guide.title}}</h1>
      {{#if guide.description}}
      <p class="description">{{guide.description}}</p>
      {{/if}}
      <div class="meta">
        <span>Created: {{formatDate guide.createdAt}}</span>
        {{#if guide.metadata.author}}
        <span> • Author: {{guide.metadata.author}}</span>
        {{/if}}
        <span> • {{guide.steps.length}} steps</span>
      </div>
    </header>
    
    {{#if showToc}}
    <nav class="toc">
      <h2>Table of Contents</h2>
      <ol>
        {{#each guide.steps}}
        <li>
          <a href="#step-{{@index}}">{{#if title}}{{title}}{{else}}Step {{add @index 1}}{{/if}}</a>
        </li>
        {{/each}}
      </ol>
    </nav>
    {{/if}}
    
    <main class="steps">
      {{#each guide.steps}}
      <article class="step" id="step-{{@index}}">
        <div class="step-header">
          <div class="step-number">{{add @index 1}}</div>
          <div class="step-content">
            <h3>{{#if title}}{{title}}{{else}}Step {{add @index 1}}{{/if}}</h3>
            {{#if description}}
            <p class="description">{{description}}</p>
            {{/if}}
            <span class="action-type">{{actionType}}</span>
          </div>
        </div>
        
        {{#if screenshotBase64}}
        <div class="screenshot-container">
          <img 
            class="screenshot" 
            src="data:{{screenshotMimeType}};base64,{{screenshotBase64}}" 
            alt="Screenshot for step {{add @index 1}}"
          />
          {{#if annotations.length}}
          <svg class="annotation-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
            {{#each annotations}}
            {{renderAnnotation this}}
            {{/each}}
          </svg>
          {{/if}}
        </div>
        {{/if}}
      </article>
      {{/each}}
    </main>
    
    <footer class="footer">
      <p>Generated by Workfloweeeer</p>
    </footer>
  </div>
</body>
</html>
`;

function renderAnnotationSvg(annotation: Annotation): string {
  const { type, x, y, width, height, endX, endY, color, strokeWidth, text } = annotation;
  
  switch (type) {
    case 'box':
      return `<rect x="${x}%" y="${y}%" width="${width || 10}%" height="${height || 10}%" 
        fill="none" stroke="${color}" stroke-width="${strokeWidth}" />`;
    
    case 'circle':
      return `<ellipse cx="${x}%" cy="${y}%" rx="${(width || 10) / 2}%" ry="${(height || 10) / 2}%" 
        fill="none" stroke="${color}" stroke-width="${strokeWidth}" />`;
    
    case 'arrow':
      return `<line x1="${x}%" y1="${y}%" x2="${endX || x + 10}%" y2="${endY || y + 10}%" 
        stroke="${color}" stroke-width="${strokeWidth}" marker-end="url(#arrowhead)" />`;
    
    case 'highlight':
      return `<rect x="${x}%" y="${y}%" width="${width || 10}%" height="${height || 5}%" 
        fill="${color}" fill-opacity="0.3" />`;
    
    case 'text':
      return `<text x="${x}%" y="${y}%" fill="${color}" font-size="${strokeWidth * 5}">${text || ''}</text>`;
    
    default:
      return '';
  }
}

export function exportToHtml(guide: Guide, options: HtmlExportOptions = {}): string {
  const {
    theme = 'light',
    includeTableOfContents = true,
    inlineStyles = true,
    title,
  } = options;
  
  Handlebars.registerHelper('add', (a: number, b: number) => a + b);
  Handlebars.registerHelper('formatDate', (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });
  Handlebars.registerHelper('renderAnnotation', renderAnnotationSvg);
  
  const template = Handlebars.compile(HTML_TEMPLATE);
  
  return template({
    guide,
    theme,
    showToc: includeTableOfContents && guide.steps.length > 3,
    styles: inlineStyles ? DEFAULT_STYLES : '',
    title: title || guide.title,
  });
}
