# Contributing

Thanks for your interest in contributing to **pro-ui-feedbacks**!

## Getting Started

```bash
git clone https://github.com/bienhoang/pro-ui-feedbacks.git
cd pro-ui-feedbacks
npm install
npm run dev
```

The `example-app/` directory contains a Vite app that imports the library from the parent — use it to test changes locally.

## Project Structure

```
src/
├── index.ts                          # package entry point
├── types.ts                          # shared TypeScript types
├── styles.ts                         # all inline style helpers
├── components/
│   ├── pro-ui-feedbacks.tsx          # main component
│   ├── toolbar-button.tsx            # individual toolbar button
│   ├── smart-inspector-overlay.tsx   # hover highlight + tooltip
│   ├── feedback-popover.tsx          # annotation input form
│   ├── feedback-markers.tsx          # numbered step markers
│   ├── feedback-list-popup.tsx       # feedback list panel
│   ├── settings-popup.tsx            # settings panel
│   └── index.ts
├── hooks/
│   ├── use-smart-inspector.ts        # DOM inspection logic
│   ├── use-feedback-store.ts         # feedback state management
│   ├── use-settings-store.ts         # settings persistence
│   ├── use-keyboard-shortcuts.ts     # global keyboard shortcuts
│   └── use-pathname.ts               # SPA pathname tracking
└── utils/
    ├── feedback-persistence.ts       # localStorage serialization
    └── format-feedbacks.ts           # output formatters (detailed/debug)
```

## Guidelines

- **No CSS files** — all styles are inline via helper functions in `styles.ts`. This keeps the package zero-config.
- **Peer dependencies only** — `react`, `react-dom`, and `lucide-react` must remain peer deps, not bundled deps.
- **TypeScript strict mode** — the codebase uses `strict: true`. All types must be explicit.
- **Accessible** — maintain ARIA attributes and keyboard navigation in toolbar components.

## Pull Requests

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Run `npm run typecheck` to verify types
4. Run `npm run build` to verify the build succeeds
5. Open a PR with a clear description of the change

## Reporting Issues

Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- React version and bundler (Vite, Next.js, etc.)
