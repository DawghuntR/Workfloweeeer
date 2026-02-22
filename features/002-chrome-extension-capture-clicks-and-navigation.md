---
id: 002
name: Chrome Extension Capture - Clicks and Navigation
status: Planned
---

# 002 - Chrome Extension Capture - Clicks and Navigation

Implement a Chrome extension that records user interactions in the browser, including clicks and navigation events, to generate step candidates.

## Impact

Enables low-friction recording of SOPs and how-to docs for web-based workflows, which is a primary target environment for engineering consultants.

## Success Criteria

- User can start/stop a recording from the extension UI.
- Click events are captured with enough context to describe the action (e.g., element text/label, role, CSS selector or XPath fallback).
- Navigation changes (URL changes, SPA route changes where possible) are recorded as steps.
- Recorded events are stored locally in the guide model (Feature 001).

## Feedback

- POC scope: no cloud sync; all capture data stays on the local machine.
