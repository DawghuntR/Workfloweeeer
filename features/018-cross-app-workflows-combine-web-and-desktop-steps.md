---
id: 018
name: Cross-App Workflows - Combine Web and Desktop Steps
status: Planned
---

# 018 - Cross-App Workflows - Combine Web and Desktop Steps

Allow a single guide to include steps captured from both the Chrome extension and the desktop app, in one ordered timeline.

## Impact

Supports end-to-end SOPs that span browser + native tools (common in consulting and engineering workflows).

## Success Criteria

- A single guide session can accept steps from both capture sources.
- Steps retain their source metadata (web vs desktop) and render correctly in the editor and exports.
- Ordering is stable and based on timestamps, with user override in the editor.

## Feedback

- Define the coupling between extension and desktop app (e.g., local websocket, file drop, deep link).
