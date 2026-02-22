# CLI
Automate guide workflows from the terminal.

---

## Explain
List, validate, import, and export guides.
Support automation for teams and CI flows.

---

## Use
Run the CLI via npm scripts.

```bash
npm run cli -- list
npm run cli -- export <guideId> --format pdf --output ./guide.pdf
```

---

## Review
Commands:

- `list`
- `export <guideId>`
- `import <filePath>`
- `validate <filePath>`
- `delete <guideId>`
- `info <guideId>`
- `storage-path`

---

## Learn
Exports are powered by [Export](../export/README.md).
Storage paths come from [Storage](../storage/README.md).
