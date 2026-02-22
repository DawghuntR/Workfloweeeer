# Workfloweeeer
Capture workflows, polish steps, ship shareable guides.

---

## Setup
Install dependencies and build the workspace with npm.

```bash
npm install
npm run build
```

Run the editor, desktop app, or extension in dev mode.

```bash
npm run dev:editor
npm run dev:desktop
npm run dev:extension
```

---

## Explore
Record workflows from the browser or desktop.
Edit steps, annotations, and screenshots in the React editor.

- Export guides to JSON, HTML, or PDF
- Validate guides with a shared schema
- Add LLM summaries and step suggestions
- Recover in-progress captures after crashes

---

## Understand
Each package handles capture, storage, editing, or export.
See the data flow and design rationale in [ARCHITECTURE.md](ARCHITECTURE.md).

- Core: schema, guide helpers, LLM tools
- Storage: local library and recovery
- Export: JSON, HTML, PDF outputs
- Capture: Chrome extension and Electron desktop app
- Editor: React step editor
- CLI: automation and validation

---

## Use
The CLI ships common automation tasks like export and validation.

```bash
npm run cli -- list
npm run cli -- export <guideId> --format html --output ./guide.html
```

---

## Learn
Get started with the core types in [API.md](API.md).
Developer setup and contributing are in [DEVELOPMENT.md](DEVELOPMENT.md).

- [Core package](packages/core/README.md)
- [Storage package](packages/storage/README.md)
- [Export package](packages/export/README.md)
- [Chrome extension](packages/extension/README.md)
- [Desktop app](packages/desktop/README.md)
- [Editor](packages/editor/README.md)
- [CLI](packages/cli/README.md)
