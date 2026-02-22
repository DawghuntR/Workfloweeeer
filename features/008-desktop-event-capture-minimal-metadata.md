---
id: 008
name: Desktop App - Event Capture (Minimal Metadata)
status: Complete
---

# 008 - Desktop App - Event Capture (Minimal Metadata)

Capture minimal desktop interaction metadata to create step descriptions (e.g., click + focused app/window title), without deep OS-level inspection.

## Impact

Provides enough context to describe desktop steps while keeping the POC lightweight and local-first.

## Success Criteria

- Captures click events with timestamp and active window/app identifier (e.g., window title/process name where available).
- Captures key moments that map to steps (e.g., Enter key, hotkey usage) at a coarse level.
- Stores event metadata locally and associates it with step screenshots.

## Feedback

- Exact depth of event capture may vary by OS; document supported platforms and limitations.
