import { Guide, Step, updateStep } from '../guide.js';
import { GuideSchema } from '../schema.js';

export interface OllamaConfig {
  endpoint: string;
  model: string;
  enabled: boolean;
}

const DEFAULT_OLLAMA_CONFIG: OllamaConfig = {
  endpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL || 'qwen:3b',
  enabled: true,
};

export interface GenerationResult {
  success: boolean;
  error?: string;
}

export interface StepSuggestion {
  stepId: string;
  suggestedTitle: string;
  suggestedDescription: string;
}

export interface GuideSuggestions {
  summary: string;
  steps: StepSuggestion[];
}

async function callOllama(
  prompt: string,
  config: OllamaConfig = DEFAULT_OLLAMA_CONFIG
): Promise<string> {
  const response = await fetch(`${config.endpoint}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.response;
}

function buildStepContext(step: Step, index: number): string {
  const parts = [`Step ${index + 1}:`];
  
  if (step.actionType) {
    parts.push(`  Action: ${step.actionType}`);
  }
  
  if (step.target?.elementText) {
    parts.push(`  Element: "${step.target.elementText}"`);
  }
  
  if (step.target?.elementLabel) {
    parts.push(`  Label: "${step.target.elementLabel}"`);
  }
  
  if (step.inputValue && !step.inputMasked) {
    parts.push(`  Input: "${step.inputValue}"`);
  }
  
  if (step.target?.url) {
    parts.push(`  URL: ${step.target.url}`);
  }
  
  if (step.target?.windowTitle) {
    parts.push(`  Window: "${step.target.windowTitle}"`);
  }
  
  return parts.join('\n');
}

export async function generateGuideSummary(
  guide: Guide,
  config: OllamaConfig = DEFAULT_OLLAMA_CONFIG
): Promise<string> {
  if (!config.enabled) {
    throw new Error('LLM summarization is disabled');
  }

  const stepsContext = guide.steps
    .map((step, index) => buildStepContext(step, index))
    .join('\n\n');

  const prompt = `You are a technical writer. Based on the following workflow steps, write a brief summary (2-3 sentences) describing what this workflow accomplishes. Be concise and professional.

Title: ${guide.title}

Steps:
${stepsContext}

Write only the summary, no additional text:`;

  return callOllama(prompt, config);
}

export async function generateStepDescriptions(
  guide: Guide,
  config: OllamaConfig = DEFAULT_OLLAMA_CONFIG
): Promise<StepSuggestion[]> {
  if (!config.enabled) {
    throw new Error('LLM summarization is disabled');
  }

  const suggestions: StepSuggestion[] = [];

  for (const [index, step] of guide.steps.entries()) {
    const context = buildStepContext(step, index);
    
    const prompt = `You are a technical writer creating documentation. Based on this step information, provide:
1. A short title (5-10 words)
2. A clear description (1-2 sentences) explaining what the user should do

Step information:
${context}

Previous step context: ${index > 0 ? guide.steps[index - 1].title || 'N/A' : 'This is the first step'}

Respond in this exact format:
TITLE: [your title here]
DESCRIPTION: [your description here]`;

    try {
      const response = await callOllama(prompt, config);
      
      const titleMatch = response.match(/TITLE:\s*(.+)/i);
      const descMatch = response.match(/DESCRIPTION:\s*(.+)/i);
      
      suggestions.push({
        stepId: step.id,
        suggestedTitle: titleMatch?.[1]?.trim() || step.title || `Step ${index + 1}`,
        suggestedDescription: descMatch?.[1]?.trim() || step.description || '',
      });
    } catch (error) {
      suggestions.push({
        stepId: step.id,
        suggestedTitle: step.title || `Step ${index + 1}`,
        suggestedDescription: step.description || '',
      });
    }
  }

  return suggestions;
}

export async function generateAllSuggestions(
  guide: Guide,
  config: OllamaConfig = DEFAULT_OLLAMA_CONFIG
): Promise<GuideSuggestions> {
  const [summary, steps] = await Promise.all([
    generateGuideSummary(guide, config),
    generateStepDescriptions(guide, config),
  ]);

  return { summary, steps };
}

export async function applyGuideSuggestions(
  guide: Guide,
  suggestions: GuideSuggestions,
  options: {
    applySummary?: boolean;
    applyTitles?: boolean;
    applyDescriptions?: boolean;
  } = {}
): Promise<Guide> {
  const {
    applySummary = true,
    applyTitles = true,
    applyDescriptions = true,
  } = options;

  let updatedGuide = { ...guide };

  if (applySummary && suggestions.summary) {
    updatedGuide = {
      ...updatedGuide,
      aiSummary: suggestions.summary,
      description: updatedGuide.description || suggestions.summary,
      updatedAt: new Date().toISOString(),
    };
  }

  for (const suggestion of suggestions.steps) {
    const stepIndex = updatedGuide.steps.findIndex((s) => s.id === suggestion.stepId);
    if (stepIndex === -1) continue;

    const updates: Partial<Step> = {};

    if (applyTitles && suggestion.suggestedTitle) {
      updates.title = suggestion.suggestedTitle;
      updates.aiSummary = suggestion.suggestedTitle;
    }

    if (applyDescriptions && suggestion.suggestedDescription) {
      updates.description = suggestion.suggestedDescription;
      updates.aiDescription = suggestion.suggestedDescription;
    }

    if (Object.keys(updates).length > 0) {
      updatedGuide = updateStep(updatedGuide, suggestion.stepId, updates);
    }
  }

  return GuideSchema.parse(updatedGuide);
}

export async function checkOllamaConnection(
  config: OllamaConfig = DEFAULT_OLLAMA_CONFIG
): Promise<boolean> {
  try {
    const response = await fetch(`${config.endpoint}/api/tags`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function listOllamaModels(
  config: OllamaConfig = DEFAULT_OLLAMA_CONFIG
): Promise<string[]> {
  try {
    const response = await fetch(`${config.endpoint}/api/tags`);
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.models?.map((m: any) => m.name) || [];
  } catch {
    return [];
  }
}
