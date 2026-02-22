---
id: 022
name: Local LLM Step Description Summarization (Ollama)
status: Planned
---

# 022 - Local LLM Step Description Summarization (Ollama)

Add optional AI assistance to generate human-friendly step descriptions and a guide summary using a local, dockerized Ollama model (e.g., qwen3b).

## Impact

Reduces manual writing effort while keeping data local (no cloud dependency).

## Success Criteria

- User can click “Generate descriptions” to propose:
  - a guide summary, and
  - rewritten step titles/descriptions
- The feature runs against a local Ollama endpoint and can be disabled.
- Generated text is editable and never overwrites user text without confirmation.
- Model configuration (endpoint, model name) is documented.

## Feedback

- POC can start with summarizing existing captured metadata (no OCR required).
