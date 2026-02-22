---
id: 015
name: Export - JSON
status: Complete
---

# 015 - Export - JSON

Export the recorded and edited guide as JSON using the canonical schema.

## Impact

Enables downstream automation, integrations, and future features without requiring cloud storage.

## Success Criteria

- User can export a guide to JSON conforming to the schema (Feature 001).
- Export embeds screenshots as base64 inside the JSON (self-contained export).
- Export includes annotations in a portable form (e.g., vector overlay data) so HTML/PDF exports can reproduce them.
- Exported JSON can be re-imported (Feature 016 or a dedicated import flow) and matches the original guide.

## Feedback

- Keep the export self-contained for the POC; optionally add a “JSON + assets folder” mode later if file size becomes an issue.
