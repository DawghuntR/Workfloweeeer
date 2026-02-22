# Development
Setup, build, test, and contribute.

---

## Prepare
Use Node.js 18+ and npm.
Install workspace dependencies from the repo root.

```bash
npm install
```

---

## Build
Build everything or a single workspace.

```bash
npm run build
npm run build:core
npm run build:export
```

---

## Run
Start the editor, desktop app, or extension in watch mode.

```bash
npm run dev:editor
npm run dev:desktop
npm run dev:extension
```

---

## Test
Run tests or lint checks for all packages.

```bash
npm run test
npm run lint
```

---

## Contribute
Keep changes scoped to the package you touch.
Add or update docs when you change public APIs.

- Follow the existing code style and scripts
- Include examples for new CLI flags or APIs
- Run tests and lint before opening a PR

Related docs:

- [Architecture](ARCHITECTURE.md)
- [Core API](API.md)
