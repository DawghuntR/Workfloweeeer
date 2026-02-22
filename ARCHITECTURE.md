# Architecture
How the system is assembled.

---

## Understand
The repo is a multi-package workspace that shares a common guide model.
Each package stays focused on one slice of capture, editing, storage, or export.

- `packages/core`: guide schema, helpers, LLM integration, exclusions
- `packages/storage`: local library, guide persistence, crash recovery
- `packages/export`: JSON, HTML, and PDF exporters
- `packages/extension`: Chrome capture for web workflows
- `packages/desktop`: Electron capture and desktop UI shell
- `packages/editor`: React components and editor state
- `packages/cli`: command-line tooling

---

## Trace
Captures become steps, steps become guides, guides become exports.
Storage and export reuse the same schema across surfaces.

1. Capture events from Chrome or desktop.
2. Translate events into `Step` objects.
3. Append steps to a `Guide` and persist locally.
4. Edit steps and annotations in the editor.
5. Export to JSON, HTML, or PDF.

---

## Decide
Core is the source of truth for the guide schema.
All packages validate against it to keep data consistent and portable.

Key decisions:

- Zod schemas ensure runtime validation for imports and exports
- Steps store screenshots as base64, with optional extraction in storage
- LLM summaries are optional and isolated in the core package
- Recovery sessions write to autosave files to avoid data loss

---

## Connect
Capture apps use the same guide helpers to keep behavior aligned.
Exports are stateless and work with any valid `Guide` object.

Related docs:

- [Core API](API.md)
- [Developer guide](DEVELOPMENT.md)
