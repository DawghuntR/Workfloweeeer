---
id: 009
name: Step Editor - Reorder, Merge, Delete
status: Planned
---

# 009 - Step Editor - Reorder, Merge, Delete

Provide an editor UI to clean up a recorded guide by reordering steps, merging multiple steps into one, and deleting incorrect steps.

## Impact

Ensures users can produce accurate SOPs even when capture is imperfect.

## Success Criteria

- User can reorder steps via drag-and-drop.
- User can merge multiple selected steps into a single step (with combined text and chosen screenshot behavior).
- User can delete steps, with undo support (can be basic).
- Changes update the underlying guide model (Feature 001).

## Feedback

- Define merge behavior for screenshots (keep first, keep last, or choose).
