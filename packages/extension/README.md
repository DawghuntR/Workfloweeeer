# Extension
Capture web workflows in Chrome with context.

---

## Explain
Record browser actions into guide steps.
Group rapid events and capture screenshots for context.

---

## Use
Start the dev build and load the extension.

```bash
npm run dev --workspace=packages/extension
```

Open Chrome, load the unpacked extension from `packages/extension/dist`, and start recording.

---

## Review
Key modules:

- `background`: orchestrates recording and storage
- `content`: captures events in the page
- `capture`: translates DOM events to steps
- `grouping`: debounces input and click events

---

## Learn
Use the shared guide helpers from [Core](../core/README.md).
See the system flow in [ARCHITECTURE.md](../../ARCHITECTURE.md).
