# Core
Shared data model and guide helpers.

---

## Explain
Define the schema and types that every package shares.
Provide guide utilities, LLM helpers, and capture exclusions.

---

## Use
Create guides and steps with typed helpers.

```ts
import {
  createGuide,
  createStep,
  addStepToGuide
} from '@workfloweeeer/core'

const guide = createGuide('Onboard a teammate', 'chrome')
const step = createStep('click', 'chrome', {
  title: 'Open the admin panel'
})

const updated = addStepToGuide(guide, step)
```

---

## Review
Key exports are grouped by schema, guide helpers, and LLM tools.

- Schemas: `GuideSchema`, `StepSchema`, `AnnotationSchema`
- Types: `Guide`, `Step`, `Annotation`, `ActionType`, `CaptureSource`
- Helpers: `createGuide`, `createStep`, `updateStep`, `mergeSteps`
- LLM: `generateAllSuggestions`, `applyGuideSuggestions`
- Exclusions: `shouldExcludeCapture`, `createExclusionConfig`

---

## Learn
Read the full API details in [API.md](../../API.md).
See the bigger system view in [ARCHITECTURE.md](../../ARCHITECTURE.md).
