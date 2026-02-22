---
id: 001
name: Guide Data Model and JSON Schema
status: Complete
---

# 001 - Guide Data Model and JSON Schema

Define the canonical, versioned data model for a recorded workflow guide (steps, screenshots, metadata) and a JSON schema that can be exported/imported locally.

## Impact

Provides a stable contract between capture, editing, and export components so subsequent agents can implement features independently without breaking compatibility.

## Success Criteria

- A documented JSON schema exists (with a `schemaVersion` field) covering:
  - Guide-level metadata (id, title, createdAt, updatedAt, source, app/environment)
  - Ordered steps (step id, action type, timestamp, selector/target metadata where applicable)
  - Screenshot data embedded as base64 (to keep JSON exports self-contained)
  - Optional fields for later AI summaries (e.g., `aiSummary`, `aiStepDescriptions`)
- At least one real recorded guide can be serialized to JSON and re-hydrated into the editor with no data loss.
- Schema changes are versioned and backward-compatible (or include a migration note).

## Feedback

- JSON exports should embed images as base64.
