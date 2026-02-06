<p align="center">
  <img src="assets/images/logo/og-image.png" alt="pro-ui-feedbacks" width="480" />
</p>

<p align="center">
  A lightweight floating toolbar for collecting visual UI feedback on any website.<br/>
  Works with React, Next.js, or as a standalone embed for HTML, WordPress, Vue, Angular, and more.<br/>
  Click any element, leave a note, and gather structured annotations — perfect for design reviews, QA, and stakeholder feedback.
</p>

![npm version](https://img.shields.io/npm/v/pro-ui-feedbacks)
![bundle size](https://img.shields.io/bundlephobia/minzip/pro-ui-feedbacks)
![license](https://img.shields.io/npm/l/pro-ui-feedbacks)

## Features

- **Smart Element Inspector** — hover to highlight any DOM element with selector + dimensions tooltip, click to annotate. Captures rich metadata: accessibility attributes, computed styles, DOM paths, and nearby elements
- **Feedback Annotations** — numbered step markers pinned to elements, surviving scroll and resize. Click a marker to edit its text in-place
- **Floating Toolbar** — collapsible pill UI with start/stop, feedback list, copy, delete, settings, and close actions. Shows a badge count when collapsed
- **Settings Panel** — toggle dark/light theme, switch output mode (detailed or debug), and pick marker accent color from 6 presets. Settings persist across sessions
- **Feedback List** — scrollable popup listing all feedbacks with per-item copy button
- **Keyboard Shortcuts** — `⌘⇧F` toolbar, `⌘⇧I` inspector, `⌘⇧C` copy, `⌘⇧L` list, `⌘⇧,` settings, `⌘⇧⌫` delete all, `⌘Z` undo, `[`/`]` navigate markers, `Enter` edit
- **Two Output Modes** — `detailed` (compact markdown) or `debug` (full markdown with environment, DOM path, computed styles, annotation position)
- **Undo Delete** — restore the last deleted feedback with `⌘Z`
- **Dark & Light Themes** — built-in theme support, zero CSS required (all styles are inline)
- **Fully Typed** — written in TypeScript with exported types for every prop and callback
- **Tiny Footprint** — ~14 kB minified, zero runtime dependencies (only `react`, `react-dom`, and `lucide-react` as peer deps)
- **Portal-Based** — renders via `createPortal` so it never conflicts with your app's layout or z-index
- **Persistent Feedbacks** — opt-in `localStorage` persistence so feedbacks survive page reload, with orphan detection for missing elements
- **SPA Aware** — auto-resets inspector and popups on route changes

## Install

```bash
npm install pro-ui-feedbacks lucide-react
```

> `react` and `react-dom` (v18 or v19) are required as peer dependencies.

## Quick Start

```tsx
import { ProUIFeedbacks } from 'pro-ui-feedbacks'

function App() {
  return (
    <>
      {/* your app */}
      <ProUIFeedbacks
        onFeedbackSubmit={(fb) => console.log('New feedback:', fb)}
        onFeedbackDelete={(id) => console.log('Deleted:', id)}
      />
    </>
  )
}
```

The toolbar appears as a collapsed floating button (bottom-right by default). Click it to expand, hit **Start** to activate the inspector, then click any element to leave feedback.

## Embed (Non-React)

For non-React sites (HTML, WordPress, Vue, Angular, etc.), use the self-contained embeddable script:

### Web Component

```html
<script src="https://unpkg.com/pro-ui-feedbacks/dist/embed.global.js"></script>
<pro-ui-feedbacks position="bottom-right" theme="dark" persist></pro-ui-feedbacks>
```

### Imperative API

```html
<script src="https://unpkg.com/pro-ui-feedbacks/dist/embed.global.js"></script>
<script>
  const widget = ProUIFeedbacks.init({
    position: 'bottom-right',
    theme: 'dark',
    persist: 'my-session'
  });

  // Later: widget.destroy();
</script>
```

### Custom Element Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `position` | `string` | `'bottom-right'` | Toolbar position |
| `theme` | `string` | `'dark'` | Color theme (`'dark'` or `'light'`) |
| `z-index` | `number` | `9999` | Base z-index |
| `collapsed` | `boolean` | `true` | Start collapsed |
| `persist` | `boolean\|string` | — | Enable localStorage persistence |

### Events (Custom Element)

```javascript
const widget = document.querySelector('pro-ui-feedbacks');

widget.addEventListener('toggle', (e) => console.log('Active:', e.detail.active));
widget.addEventListener('feedback-submit', (e) => console.log('Feedback:', e.detail.feedback));
widget.addEventListener('feedback-delete', (e) => console.log('Deleted:', e.detail.feedbackId));
widget.addEventListener('copy', () => console.log('Copied'));
```

### WordPress Integration

```html
<!-- Add to theme footer or Custom HTML widget -->
<script src="https://unpkg.com/pro-ui-feedbacks/dist/embed.global.js"></script>
<script>
  ProUIFeedbacks.init({
    position: 'bottom-right',
    theme: 'dark',
    persist: 'wp-feedback'
  });
</script>
```

> **Bundle size:** ~76KB gzip (includes React runtime, fully self-contained)

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | Toolbar position on the viewport |
| `theme` | `'dark' \| 'light'` | `'dark'` | Color theme |
| `defaultCollapsed` | `boolean` | `true` | Start with toolbar collapsed |
| `zIndex` | `number` | `9999` | Base z-index for all layers |
| `triggerIcon` | `ReactNode` | `<Menu />` | Custom icon for the trigger button |
| `style` | `CSSProperties` | — | Additional inline styles for the container |
| `persist` | `boolean \| string` | — | Enable localStorage persistence. `true` = per-page key, string = custom key |

### Callbacks

| Prop | Type | Description |
|------|------|-------------|
| `onToggle` | `(active: boolean) => void` | Inspector started or stopped |
| `onInspect` | `(element: InspectedElement) => void` | Element selected via inspector |
| `onFeedbackSubmit` | `(feedback: FeedbackItem) => void` | Feedback annotation submitted |
| `onFeedbackDelete` | `(feedbackId: string) => void` | Feedback marker deleted |
| `onFeedbackUpdate` | `(feedbackId: string, content: string) => void` | Feedback text edited |
| `onFeedback` | `() => void` | "Feedbacks" toolbar button clicked |
| `onCopy` | `() => void` | "Copy" toolbar button clicked |
| `onDelete` | `() => void` | "Delete All" toolbar button clicked |
| `onSettings` | `() => void` | "Settings" toolbar button clicked |

## Types

```ts
interface ElementAccessibility {
  role?: string
  label?: string
  description?: string
}

interface ElementMetadata {
  accessibility: ElementAccessibility
  boundingBox: { x: number; y: number; width: number; height: number }
  computedStyles: Record<string, string>
  cssClasses: string[]
  elementDescription: string   // e.g. `paragraph: "Some text..."`
  elementPath: string          // short class-based CSS path
  fullPath: string             // full tag+class CSS path
  isFixed: boolean
  nearbyElements: string
  nearbyText: string
}

interface InspectedElement {
  element: HTMLElement
  tagName: string
  className: string
  id: string
  selector: string             // generated CSS selector
  rect: DOMRect
  dimensions: { width: number; height: number }
  metadata: ElementMetadata    // rich element metadata
}

interface FeedbackItem {
  id: string
  stepNumber: number           // 1-based
  content: string              // user-entered text
  selector: string             // CSS selector of target element
  offsetX: number              // offset from element's top-left
  offsetY: number
  pageX: number                // absolute page X coordinate
  pageY: number                // absolute page Y coordinate
  targetElement: HTMLElement | null
  element: InspectedElement | null
  createdAt: number            // timestamp
  orphan?: boolean             // true when element not found after reload
  areaData?: AreaData          // area metadata for multi-select
  isAreaOnly?: boolean         // true if annotation on empty space
  elements?: InspectedElement[] // all elements in multi-select group
}

interface AreaData {
  centerX: number              // absolute page X of area center
  centerY: number              // absolute page Y of area center
  width: number                // area width in pixels
  height: number               // area height in pixels
  elementCount: number         // total elements in group
}

type ToolbarPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
type ToolbarTheme = 'dark' | 'light'
```

All types are exported from the package entry point, including `ElementMetadata`, `ElementAccessibility`, `SerializedFeedbackItem`, `AreaData`, `AreaBounds`, and `InspectAreaEvent`.

## How It Works

1. **Expand** the floating toolbar by clicking the trigger button
2. **Start** the inspector — your cursor becomes a crosshair, and elements highlight on hover with a selector + dimensions tooltip
3. **Click** an element to open a feedback popover anchored at the click position
4. **Type** your note and press <kbd>Cmd</kbd>+<kbd>Enter</kbd> (or click Submit)
5. A **numbered marker** appears pinned to that element — it follows scroll and resize
6. Hover a marker to preview the note, click it to edit
7. **Stop** the inspector or **Close** the toolbar when done

### Area Selection (Multi-Element)

Drag to select multiple elements and annotate them as a group:

1. **Start** the inspector
2. **Drag** across multiple elements (or empty space)
3. **Release** to open feedback popover
4. **Submit** — a single marker appears at the area center showing element count

**Features:**
- Marker shows step number (same as single-element markers)
- Hover marker to see element count and tag names
- Click to edit — shows collapsible element list in edit popup
- Delete removes the entire group as one feedback item
- Partial orphan support: elements that disappear after reload are excluded from the resolved list
- Empty space annotation: drag on empty area to leave contextual feedback (no element data)

**Limits:**
- Max 50 elements per selection (for performance)
- All elements share the same feedback text

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘⇧F` | Toggle toolbar |
| `⌘⇧I` | Toggle inspector |
| `⌘⇧C` | Copy all feedbacks |
| `⌘⇧L` | Open feedback list |
| `⌘⇧,` | Open settings |
| `⌘⇧⌫` | Delete all feedbacks |
| `⌘Z` | Undo last delete |
| `[` / `]` | Navigate between markers |
| `Enter` | Edit focused marker |
| `Escape` | Close popups → stop inspector → deselect marker → collapse toolbar |

> On Windows/Linux, use `Ctrl` instead of `⌘`.

## Examples

### Light theme, top-left

```tsx
<ProUIFeedbacks position="top-left" theme="light" />
```

### Collect all feedbacks on submit

```tsx
function ReviewPage() {
  const feedbacks = useRef<FeedbackItem[]>([])

  return (
    <>
      <ProUIFeedbacks
        onFeedbackSubmit={(fb) => feedbacks.current.push(fb)}
        onCopy={() => {
          const data = feedbacks.current.map((fb) => ({
            step: fb.stepNumber,
            note: fb.content,
            selector: fb.selector,
          }))
          navigator.clipboard.writeText(JSON.stringify(data, null, 2))
        }}
      />
    </>
  )
}
```

### Persist feedbacks across reloads

```tsx
// Auto per-page key (based on pathname)
<ProUIFeedbacks persist />

// Custom storage key
<ProUIFeedbacks persist="my-review-session" />
```

When `persist` is enabled, feedbacks are saved to `localStorage` and restored on page reload. If a target element can no longer be found in the DOM, its marker is displayed as an orphan with a warning indicator.

### Custom trigger icon

```tsx
import { Bug } from 'lucide-react'

<ProUIFeedbacks triggerIcon={<Bug size={18} />} />
```

## Compatibility

**React Package:**
- React 18 or 19
- Works with Next.js (App Router & Pages Router), Vite, CRA, Remix, and any React setup
- ESM and CommonJS builds included
- TypeScript declarations included

**Embeddable Script:**
- Any website (no build tools required)
- Chrome 80+, Firefox 75+, Safari 13.1+, Edge 80+
- Shadow DOM for style isolation
- ~76KB gzip (includes React runtime)

## Development

```bash
git clone https://github.com/bienhoang/pro-ui-feedbacks.git
cd pro-ui-feedbacks
npm install

npm run dev      # watch mode
npm run build    # production build
npm run typecheck
```

## License

[MIT](./LICENSE)
