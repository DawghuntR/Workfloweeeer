---
id: 003
name: Chrome Extension Capture - Text Input
status: Complete
---

# 003 - Chrome Extension Capture - Text Input

Record text entry actions in the browser (typing into inputs/textareas) as steps, capturing intent without requiring later manual reconstruction.

## Impact

Makes guides more faithful and reduces editing time for workflows that involve form entry.

## Success Criteria

- Text input actions are recorded as steps with target element context (label/placeholder/name/id when available).
- Capture supports common input patterns (typing, paste, select dropdown changes).
- A user-configurable mode exists for how to represent entered text in the guide:
  - Full text, or
  - Masked (e.g., "••••") (POC can default to full text)
- Data is persisted locally (Feature 016).

## Feedback

- Even though redaction isn’t required, masking mode reduces accidental secret capture.
