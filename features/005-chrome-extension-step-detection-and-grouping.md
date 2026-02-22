---
id: 005
name: Chrome Extension - Step Detection and Grouping
status: Planned
---

# 005 - Chrome Extension - Step Detection and Grouping

Convert raw browser events into human-usable step boundaries (e.g., group multiple keystrokes into a single "Enter X" step).

## Impact

Improves guide readability and reduces editor workload by producing a cleaner initial draft.

## Success Criteria

- Keystrokes within a short time window on the same field are grouped into a single "Enter" step.
- Repeated clicks on the same element within a short window are de-duplicated.
- Step grouping rules are documented and deterministic.

## Feedback

- Keep grouping rules simple for POC; advanced heuristics can be added later.
