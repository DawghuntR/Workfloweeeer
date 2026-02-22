# Export
Turn guides into shareable formats.

---

## Explain
Convert guides to JSON, HTML, and PDF.
Keep exports stateless and reusable across apps.

---

## Use
Export a guide to HTML.

```ts
import { exportToHtml } from '@workfloweeeer/export'
import { createGuide } from '@workfloweeeer/core'

const guide = createGuide('Ship a patch', 'desktop')
const html = exportToHtml(guide, { theme: 'light' })
```

---

## Review
Main exports:

- `exportToJson(guide, options)`
- `exportToHtml(guide, options)`
- `exportToPdf(guide, options)`

---

## Learn
Pair this with [Storage](../storage/README.md) for file outputs.
See schema details in [API.md](../../API.md).
