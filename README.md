<p align="center">
  <img src="assets/images/logo/logo-full.png" alt="pro-ui-feedbacks" width="480" />
</p>

<p align="center">
  A lightweight floating toolbar for collecting visual UI feedback directly on your React or Next.js app.<br/>
  Click any element, leave a note, and gather structured annotations — perfect for design reviews, QA, and stakeholder feedback.
</p>

![npm version](https://img.shields.io/npm/v/pro-ui-feedbacks)
![bundle size](https://img.shields.io/bundlephobia/minzip/pro-ui-feedbacks)
![license](https://img.shields.io/npm/l/pro-ui-feedbacks)

## Features

- **Smart Element Inspector** — hover to highlight any DOM element with selector + dimensions tooltip, click to annotate
- **Feedback Annotations** — numbered step markers pinned to elements, surviving scroll and resize
- **Floating Toolbar** — collapsible pill UI with start/stop, feedback list, copy, delete, settings, and close actions
- **Dark & Light Themes** — built-in theme support, zero CSS required (all styles are inline)
- **Fully Typed** — written in TypeScript with exported types for every prop and callback
- **Tiny Footprint** — ~14 kB minified, zero runtime dependencies (only `react`, `react-dom`, and `lucide-react` as peer deps)
- **Portal-Based** — renders via `createPortal` so it never conflicts with your app's layout or z-index
- **Keyboard Accessible** — roving tabindex, arrow key navigation, Escape to close

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

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | Toolbar position on the viewport |
| `theme` | `'dark' \| 'light'` | `'dark'` | Color theme |
| `defaultCollapsed` | `boolean` | `true` | Start with toolbar collapsed |
| `zIndex` | `number` | `9999` | Base z-index for all layers |
| `triggerIcon` | `ReactNode` | `<Menu />` | Custom icon for the trigger button |
| `style` | `CSSProperties` | — | Additional inline styles for the container |

### Callbacks

| Prop | Type | Description |
|------|------|-------------|
| `onToggle` | `(active: boolean) => void` | Inspector started or stopped |
| `onInspect` | `(element: InspectedElement) => void` | Element selected via inspector |
| `onFeedbackSubmit` | `(feedback: FeedbackItem) => void` | Feedback annotation submitted |
| `onFeedbackDelete` | `(feedbackId: string) => void` | Feedback marker deleted |
| `onFeedback` | `() => void` | "Feedbacks" toolbar button clicked |
| `onCopy` | `() => void` | "Copy" toolbar button clicked |
| `onDelete` | `() => void` | "Delete All" toolbar button clicked |
| `onSettings` | `() => void` | "Settings" toolbar button clicked |

## Types

```ts
interface InspectedElement {
  element: HTMLElement
  tagName: string
  className: string
  id: string
  selector: string        // generated CSS selector
  rect: DOMRect
  dimensions: { width: number; height: number }
}

interface FeedbackItem {
  id: string
  stepNumber: number      // 1-based
  content: string         // user-entered text
  selector: string        // CSS selector of target element
  offsetX: number         // offset from element's top-left
  offsetY: number
  targetElement: HTMLElement
  element: InspectedElement
  createdAt: number       // timestamp
}

type ToolbarPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
type ToolbarTheme = 'dark' | 'light'
```

All types are exported from the package entry point.

## How It Works

1. **Expand** the floating toolbar by clicking the trigger button
2. **Start** the inspector — your cursor becomes a crosshair, and elements highlight on hover with a selector + dimensions tooltip
3. **Click** an element to open a feedback popover anchored at the click position
4. **Type** your note and press <kbd>Cmd</kbd>+<kbd>Enter</kbd> (or click Submit)
5. A **numbered marker** appears pinned to that element — it follows scroll and resize
6. Hover a marker to preview the note, click it to delete
7. **Stop** the inspector or **Close** the toolbar when done

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

### Custom trigger icon

```tsx
import { Bug } from 'lucide-react'

<ProUIFeedbacks triggerIcon={<Bug size={18} />} />
```

## Compatibility

- React 18 or 19
- Works with Next.js (App Router & Pages Router), Vite, CRA, Remix, and any React setup
- ESM and CommonJS builds included
- TypeScript declarations included

## Development

```bash
git clone https://github.com/user/pro-ui-feedbacks.git
cd pro-ui-feedbacks
npm install

npm run dev      # watch mode
npm run build    # production build
npm run typecheck
```

## License

[MIT](./LICENSE)
