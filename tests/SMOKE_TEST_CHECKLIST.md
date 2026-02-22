# Smoke Test Checklist for Workfloweeeer

This document provides a repeatable checklist for verifying core functionality of Workfloweeeer.

## Pre-requisites

- [ ] Node.js 18+ installed
- [ ] All packages built successfully (`npm run build`)
- [ ] Chrome browser installed (for extension testing)

---

## 1. Core Data Model Tests

### 1.1 Guide Creation
- [ ] Create a new guide using `createGuide()`
- [ ] Verify guide has valid UUID
- [ ] Verify `schemaVersion` is "1.0"
- [ ] Verify `createdAt` and `updatedAt` are valid timestamps

### 1.2 Step Management
- [ ] Add a step using `addStepToGuide()`
- [ ] Update step title and description using `updateStep()`
- [ ] Delete a step using `deleteStep()`
- [ ] Reorder steps using `reorderSteps()`
- [ ] Merge multiple steps using `mergeSteps()`

### 1.3 Schema Validation
- [ ] Valid guide passes `validateGuide()`
- [ ] Invalid guide fails `validateGuide()` with appropriate errors
- [ ] Sample JSON files pass validation

---

## 2. Chrome Extension Tests

### 2.1 Installation
- [ ] Extension loads in Chrome without errors
- [ ] Extension icon appears in toolbar
- [ ] Popup opens when clicking icon

### 2.2 Recording
- [ ] Start recording from popup
- [ ] Recording indicator visible
- [ ] Click events captured
- [ ] Text input captured
- [ ] Navigation events captured
- [ ] Screenshots captured per step
- [ ] Stop recording successfully
- [ ] Guide saved with all steps

### 2.3 Session Management
- [ ] Pause recording works
- [ ] Resume recording works
- [ ] Undo last step works

---

## 3. Desktop App Tests

### 3.1 Launch
- [ ] App starts without errors
- [ ] Main window displays
- [ ] System tray icon appears (if applicable)

### 3.2 Recording
- [ ] Start recording via UI
- [ ] Start recording via hotkey (Ctrl+Shift+R)
- [ ] Capture screenshot via hotkey (Ctrl+Shift+S)
- [ ] Recording indicator visible
- [ ] Stop recording works
- [ ] Guide saved with steps

### 3.3 Window Selection
- [ ] List available windows
- [ ] Select specific window for capture
- [ ] Full screen capture works

---

## 4. Step Editor Tests

### 4.1 Guide Loading
- [ ] Load guide from storage
- [ ] Guide title displays correctly
- [ ] Steps list displays correctly

### 4.2 Step Editing
- [ ] Select a step
- [ ] Edit step title
- [ ] Edit step description
- [ ] Changes persist after save

### 4.3 Step Manipulation
- [ ] Drag and drop to reorder
- [ ] Delete step (single)
- [ ] Multi-select steps (Ctrl+Click)
- [ ] Delete multiple steps
- [ ] Merge selected steps

### 4.4 Screenshot Management
- [ ] View step screenshot
- [ ] Replace screenshot from file
- [ ] Add annotations (arrow, box, highlight, text)
- [ ] Remove annotations

### 4.5 Undo/Redo
- [ ] Undo last action (Ctrl+Z)
- [ ] Redo action (Ctrl+Shift+Z)
- [ ] Undo stack preserves history

### 4.6 Keyboard Navigation
- [ ] Navigate steps with arrow keys
- [ ] Delete with Delete key
- [ ] Save with Ctrl+S

---

## 5. Export Tests

### 5.1 JSON Export
- [ ] Export guide to JSON
- [ ] JSON includes all steps
- [ ] Screenshots embedded as base64
- [ ] Annotations included
- [ ] Re-import JSON matches original

### 5.2 HTML Export
- [ ] Export guide to HTML
- [ ] HTML renders in browser
- [ ] All steps visible
- [ ] Screenshots display
- [ ] Annotations render
- [ ] Works offline (no external resources)

### 5.3 PDF Export
- [ ] Export guide to PDF
- [ ] PDF opens in reader
- [ ] Title and steps present
- [ ] Screenshots included
- [ ] Page numbers correct

---

## 6. CLI Tests

```bash
# List guides
workfloweeeer list

# Export to JSON
workfloweeeer export <guide-id> -o output.json -f json

# Export to HTML
workfloweeeer export <guide-id> -o output.html -f html

# Export to PDF
workfloweeeer export <guide-id> -o output.pdf -f pdf

# Validate JSON file
workfloweeeer validate samples/sample-web-workflow.json

# Import a guide
workfloweeeer import samples/sample-web-workflow.json

# Show guide info
workfloweeeer info <guide-id>

# Delete guide
workfloweeeer delete <guide-id> --yes
```

- [ ] `list` shows all guides
- [ ] `export` creates valid files
- [ ] `validate` correctly validates/rejects files
- [ ] `import` adds guide to storage
- [ ] `info` shows guide details
- [ ] `delete` removes guide

---

## 7. Storage Tests

### 7.1 Local Storage
- [ ] Guides save to correct directory
- [ ] Guide metadata file created
- [ ] Images extracted to separate folder
- [ ] Library index updated

### 7.2 Recovery
- [ ] Autosave creates session file
- [ ] Session recoverable after crash simulation
- [ ] Clear session after successful save

---

## 8. Cross-App Workflow Tests

### 8.1 Mixed Recording
- [ ] Start recording in browser
- [ ] Switch to desktop app
- [ ] Continue recording desktop actions
- [ ] Switch back to browser
- [ ] Stop recording
- [ ] Guide shows steps from both sources
- [ ] Source metadata preserved for each step

---

## 9. Performance Tests

### 9.1 Large Guide Handling
- [ ] Create guide with 50 steps
- [ ] Create guide with 100 steps
- [ ] Editor remains responsive
- [ ] No memory leaks observed
- [ ] Export completes in reasonable time

---

## Test Results

| Test Category | Passed | Failed | Notes |
|---------------|--------|--------|-------|
| Core Data Model | | | |
| Chrome Extension | | | |
| Desktop App | | | |
| Step Editor | | | |
| Export | | | |
| CLI | | | |
| Storage | | | |
| Cross-App | | | |
| Performance | | | |

**Total: ___/___**

**Tested By:** _______________  
**Date:** _______________  
**Version:** 0.1.0
