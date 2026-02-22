---
id: 025
name: Capture Exclusions and User Warnings
status: Planned
---

# 025 - Capture Exclusions and User Warnings

Provide simple controls to avoid capturing sensitive contexts (domain/app exclusions) and show clear warnings about what is being recorded.

## Impact

Reduces accidental capture of secrets while staying aligned with the POC constraint of “no automatic redaction.”

## Success Criteria

- User can define an exclusion list for:
  - website domains (extension), and/or
  - desktop apps/windows (desktop recorder)
- Recorder UI shows an always-visible indicator when recording.
- A pre-recording warning explains that text entry may be captured.

## Feedback

- For POC, exclusions can be a simple config file or settings screen.
