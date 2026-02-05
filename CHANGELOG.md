# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-02-06

### Added

- **Settings panel** — toggle dark/light theme, switch output mode (detailed/debug), pick marker accent color (6 presets). Settings persist to localStorage
- **Feedback list popup** — view all feedbacks in a scrollable panel with per-feedback copy button
- **Keyboard shortcuts** — full shortcut system:
  - `⌘⇧F` toggle toolbar, `⌘⇧I` toggle inspector, `⌘⇧C` copy all, `⌘⇧L` feedback list, `⌘⇧,` settings, `⌘⇧⌫` delete all
  - `⌘Z` undo last delete
  - `[` / `]` navigate between markers, `Enter` edit focused marker
  - `Escape` chain: closes popups → stops inspector → deselects marker → collapses toolbar
- **Editable feedback markers** — click or press Enter to edit existing feedback text in-place
- **Undo delete** — restore the last deleted feedback with `⌘Z`
- **Rich element metadata** — inspector now captures accessibility info (role, aria-label), computed styles, DOM paths (short + full), nearby elements, and bounding box
- **Two output modes** — `detailed` (compact markdown) and `debug` (full markdown with environment, DOM path, computed styles, annotation position)
- **Per-feedback copy** — hover any feedback in the list popup to copy its formatted output individually
- **Badge count** — collapsed toolbar trigger shows feedback count badge
- **SPA route awareness** — auto-resets inspector/popups on pathname change
- **`onFeedbackUpdate` callback** — fires when feedback content is edited
- **New exported types** — `ElementMetadata`, `ElementAccessibility`, `SerializedFeedbackItem`
- `pageX` / `pageY` fields on `FeedbackItem` for absolute page coordinates

### Changed

- `FeedbackItem.element.metadata` now contains rich `ElementMetadata` instead of basic tag info
- Copy button now formats output based on selected output mode (detailed or debug)

## [0.1.0] - 2025-02-05

### Added

- `ProUIFeedbacks` component — floating toolbar with expand/collapse animation
- Smart element inspector with hover highlight and selector + dimensions tooltip
- Feedback popover with textarea, Cmd+Enter submit, and Escape to close
- Numbered step markers pinned to annotated elements (follows scroll/resize)
- Dark and light theme support
- Configurable position (`bottom-right`, `bottom-left`, `top-right`, `top-left`)
- Keyboard navigation (arrow keys, Home, End, Escape)
- Full TypeScript types exported (`ProUIFeedbacksProps`, `InspectedElement`, `FeedbackItem`, `ToolbarPosition`, `ToolbarTheme`)
- ESM and CommonJS dual builds via tsup
