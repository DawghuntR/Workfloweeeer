---
id: 023
name: CLI Export and Conversion Tools
status: Planned
---

# 023 - CLI Export and Conversion Tools

Provide a small CLI for exporting/converting guides (e.g., JSON to HTML/PDF) for automation and testing.

## Impact

Enables batch processing and makes it easier for subsequent agents to verify outputs without using the GUI.

## Success Criteria

- CLI can list available local guides.
- CLI can export a selected guide to JSON, HTML, and PDF.
- CLI exits with non-zero codes on failure and logs actionable errors.

## Feedback

- POC can treat CLI as optional if time is constrained.
