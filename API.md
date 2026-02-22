# Core API
Guides, steps, and helpers for integrations.

---

## Review
The guide schema is the contract across packages.
Use the types below when integrating new capture or export flows.

```ts
import type { Guide, Step, Annotation } from '@workfloweeeer/core'
```

Guide overview:

- `Guide`: top-level workflow container
- `Step`: single recorded action
- `Annotation`: markup for screenshots

---

## Create
Use helpers to create guides, steps, and annotations.

```ts
import {
  createGuide,
  createStep,
  createAnnotation,
  addStepToGuide
} from '@workfloweeeer/core'

const guide = createGuide('Deploy a release', 'desktop')
const step = createStep('click', 'desktop', {
  title: 'Open the release dashboard'
})
const annotation = createAnnotation('box', 12, 30, {
  width: 20,
  height: 10
})

const updated = addStepToGuide(guide, {
  ...step,
  annotations: [annotation]
})
```

---

## Update
Manipulate steps with pure helpers.

```ts
import { updateStep, deleteStep, reorderSteps, mergeSteps } from '@workfloweeeer/core'

const renamed = updateStep(updated, step.id, { title: 'Open releases' })
const reordered = reorderSteps(renamed, 0, 1)
const anotherStepId = reordered.steps[1]?.id ?? step.id
const merged = mergeSteps(reordered, [step.id, anotherStepId], {
  screenshotStrategy: 'first'
})
const cleaned = deleteStep(merged, step.id)
```

---

## Validate
Validate or deserialize guides safely.

```ts
import { validateGuide, serializeGuide, deserializeGuide } from '@workfloweeeer/core'

const json = serializeGuide(updated)
const result = validateGuide(JSON.parse(json))

if (result.success) {
  const loaded = deserializeGuide(json)
}
```

---

## Enrich
Generate summaries and step suggestions with Ollama.
Keep this optional so capture flows stay fast.

```ts
import { generateAllSuggestions, applyGuideSuggestions } from '@workfloweeeer/core'

const suggestions = await generateAllSuggestions(updated)
const withAi = await applyGuideSuggestions(updated, suggestions)
```

Tip: set `OLLAMA_ENDPOINT` and `OLLAMA_MODEL` for custom models.

---

## Protect
Use exclusions to avoid sensitive capture targets.

```ts
import { shouldExcludeCapture, createExclusionConfig } from '@workfloweeeer/core'

const config = createExclusionConfig({ domains: ['internal.company'] })
const blocked = shouldExcludeCapture({ url: 'https://bank.example' }, config)
```

Related docs:

- [Architecture](ARCHITECTURE.md)
- [Storage package](packages/storage/README.md)
