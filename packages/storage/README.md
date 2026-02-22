# Storage
Local guide library and recovery tools.

---

## Explain
Persist guides and screenshots on disk.
Offer autosave and crash recovery for in-progress work.

---

## Use
Initialize storage and save a guide.

```ts
import { initializeStorage } from '@workfloweeeer/storage'
import { createGuide } from '@workfloweeeer/core'

const storage = await initializeStorage()
const guide = createGuide('Publish release notes', 'desktop')

await storage.saveGuide(guide)
```

---

## Review
Main exports:

- `GuideStorage`: CRUD for guides and library index
- `initializeStorage`: bootstraps storage path
- `CrashRecovery`: autosave and session recovery

---

## Learn
See guide structure in [API.md](../../API.md).
Learn how storage fits in [ARCHITECTURE.md](../../ARCHITECTURE.md).
