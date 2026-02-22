---
id: 024
name: Sample Workflows and Smoke Tests
status: Planned
---

# 024 - Sample Workflows and Smoke Tests

Create a small set of sample workflows and smoke tests to validate core capture/edit/export behaviors.

## Impact

Ensures the POC remains stable as new features are added by different agents.

## Success Criteria

- At least 3 sample workflows are documented (web-only, desktop-only, mixed).
- A repeatable smoke-test checklist exists (start/stop capture, edit step, export HTML/PDF/JSON).
- One automated test (or script) verifies that exported JSON conforms to the schema (Feature 001).

## Feedback

- If the tech stack supports it, add a CI job later; out of scope for POC.
