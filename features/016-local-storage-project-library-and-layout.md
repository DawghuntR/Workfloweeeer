---
id: 016
name: Local Storage - Project Library and Layout
status: Planned
---

# 016 - Local Storage - Project Library and Layout

Store recordings, screenshots, and guide metadata on the local machine in a clear filesystem layout.

## Impact

Supports the POC requirement of local-only storage and makes debugging/exporting straightforward.

## Success Criteria

- A documented local storage directory structure exists (e.g., per-guide folder containing JSON plus a working images cache).
- The app can list existing guides and open them in the editor.
- Storage is resilient to app restarts and supports safe file naming.


## Feedback

- Decide whether storage location is configurable; POC can default to a standard user directory.
