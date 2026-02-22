---
id: 026
name: Crash Recovery and Autosave
status: Complete
---

# 026 - Crash Recovery and Autosave

Autosave in-progress recordings and editor changes to minimize data loss if the app or system crashes.

## Impact

Builds trust and makes the tool viable for longer SOP capture sessions.

## Success Criteria

- In-progress sessions are periodically saved locally.
- On restart, the app can recover the last session state (or offer to discard it).
- Autosave does not noticeably degrade capture performance.

## Feedback

- Define autosave interval and what constitutes “in progress” for both capture and editor.
