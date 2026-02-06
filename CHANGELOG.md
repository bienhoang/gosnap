# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-02-06

### Added

- **Drag-to-select multi-element feedback** — click for single element, drag for area selection
  - Marker positioned at center of drag area, shows step number
  - Single feedback item with `elements` array containing all selected elements
  - Hover tooltip displays element count and tag names
  - Edit popup shows collapsible element list
  - Empty space annotation: drag on empty area to leave contextual feedback (isAreaOnly)
- **Element intersection detection** — TreeWalker-based DOM traversal finds all elements within drag area (max 50)
- **Area highlight overlay** — visual feedback during drag showing selection bounds
- **New types**: `AreaData`, `AreaBounds`, `InspectAreaEvent`, `SerializedElement`
- **FeedbackItem extensions**: `areaData`, `isAreaOnly`, `elements` optional fields

### Changed

- Copy/export format: multi-select outputs single grouped feedback with element descriptions
- Persistence: serialize/deserialize `elements` array for multi-select items
- Two-phase hydration: resolve each element independently on reload (partial orphan support)

## [0.2.1] - 2026-02-06

### Fixed

- **SSR-safe ID generation** — replaced shared module-level `idCounter` with `Date.now() + Math.random()` to prevent ID collisions across instances and SSR requests
- **`addFeedback` return value** — added `feedbacksRef` mirror for synchronous `stepNumber` computation; returned item now has correct step number instead of stale value
- **Centralized Escape handling** — removed duplicate Escape listener from inspector hook; all Escape logic now flows through `handleEscapeChain` for consistent one-press-at-a-time dismissal
- **Consistent element descriptions** — persistence layer now uses the shared metadata utility (24 tag names) instead of its own incomplete copy (8 tag names)

### Changed

- **Extracted `element-metadata.ts`** — shared utility for selector generation, metadata collection, and element inspection; used by both inspector hook and persistence layer (DRY)
- **Settings store initialization** — consolidated 3 separate `localStorage.getItem` + `JSON.parse` calls into a single load on mount
- Removed deprecated `rehydrateFeedbacks` export and unused `emptyMetadata` helper

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
