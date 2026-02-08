<p align="center">
  <img src="assets/images/logo/og-image.png" alt="gosnap" width="480" />
</p>

<p align="center">
  <strong>Annotate any UI. AI understands the rest.</strong><br/>
  Click elements, leave notes, copy AI-ready markdown — works with Claude, ChatGPT, Cursor, or any AI tool.<br/>
  Lightweight widget for any website: React, Next.js, Vue, HTML, WordPress, and more.
</p>

![npm version](https://img.shields.io/npm/v/@optimo/gosnap)
![bundle size](https://img.shields.io/bundlephobia/minzip/@optimo/gosnap)
![license](https://img.shields.io/npm/l/@optimo/gosnap)

## Why GoSnap?

Screenshots lack context. Text descriptions are ambiguous. AI agents need **structured data** to act on your UI feedback.

| Method | What AI gets | What's missing |
|--------|-------------|----------------|
| Screenshot | Pixels | No selectors, no DOM structure — AI guesses |
| Copy HTML from DevTools | Raw markup | Too much noise, no annotations |
| Text description | "the blue button on the right" | Ambiguous, no coordinates |
| **GoSnap** | **CSS selector + DOM path + metadata + annotation + order** | **Nothing — structured & actionable** |

## How It Works

1. **Annotate** — click any element on your page. The tool captures its CSS selector, DOM path, bounding box, accessibility data, and nearby context. Type your feedback note.
2. **Copy** — press `⌘⇧C`. All annotations are formatted as structured markdown and copied to your clipboard.
3. **Paste to AI** — paste into Claude, ChatGPT, Cursor, or any AI agent. It knows *exactly* which elements you're referring to, their properties, and what you want changed. No guessing.

## Output Example

When you copy feedbacks, AI receives structured markdown like this:

```markdown
## Page Feedback: /dashboard

**Viewport:** 1440×900

### 1. button: "Submit Order"
**Location:** .checkout-form > .actions > button.btn-primary
**Position:** 892px, 1247px (120×40px)
**Feedback:** Change button color from blue to green for better conversion

### 2. heading: "Order Summary"
**Location:** .sidebar > h2.summary-title
**Position:** 1080px, 200px (300×32px)
**Feedback:** Font size too small on mobile — increase to 18px
```

Switch to **debug mode** for even richer output: full DOM paths, computed styles, annotation coordinates, viewport info, and device pixel ratio.

## Features

- **AI-Ready Element Capture** — hover to highlight any DOM element, click to annotate. Captures CSS selectors, DOM paths, accessibility attributes, computed styles, bounding boxes, and nearby elements — so AI knows *exactly* which element you mean
- **Ordered Annotations** — numbered step markers pinned to elements. AI follows your feedback in sequence. Markers survive scroll and resize; click to edit in-place
- **AI-Optimized Output** — two modes: `detailed` (compact markdown with selector, location, position) or `debug` (full markdown with environment, DOM path, computed styles, annotation coordinates)
- **Multi-Element Selection** — drag to select multiple elements and annotate as a group. Describe component-level issues to AI with one annotation
- **Lightweight Widget** — collapsible floating toolbar with start/stop, feedback list, copy, delete, settings, and close. Shows badge count when collapsed
- **Session Persistence** — opt-in `localStorage` persistence so feedbacks survive page reload, with orphan detection for missing elements
- **Keyboard-First Workflow** — `⌘⇧F` toolbar, `⌘⇧I` inspector, `⌘⇧C` copy, `⌘⇧L` list, `[`/`]` navigate markers, and more
- **Built-in Themes** — dark and light themes, zero CSS required (all styles are inline)
- **Tiny Footprint** — ~14 kB minified React package, ~76 kB standalone embed. Zero runtime dependencies
- **Fully Typed** — written in TypeScript with exported types for every prop and callback
- **SPA Aware** — auto-resets inspector and popups on route changes
- **Portal-Based** — renders via `createPortal` so it never conflicts with your app's layout or z-index

## Get Started — React

```bash
npm install @optimo/gosnap lucide-react
```

> `react` and `react-dom` (v18 or v19) are required as peer dependencies.

```tsx
import { GoSnap } from '@optimo/gosnap'

function App() {
  return (
    <>
      {/* your app */}
      <GoSnap
        onFeedbackSubmit={(fb) => console.log('New feedback:', fb)}
        onFeedbackDelete={(id) => console.log('Deleted:', id)}
      />
    </>
  )
}
```

The toolbar appears as a collapsed floating button (bottom-right by default). Click it to expand, hit **Start** to activate the inspector, then click any element to leave feedback.

## Get Started — Any Website

Drop a single script tag on any site — HTML, WordPress, Vue, Angular, or anything else. No build tools required.

### Web Component

```html
<script src="https://unpkg.com/@optimo/gosnap/dist/embed.global.js"></script>
<go-snap position="bottom-right" theme="dark" persist></go-snap>
```

### Imperative API

```html
<script src="https://unpkg.com/@optimo/gosnap/dist/embed.global.js"></script>
<script>
  const widget = GoSnap.init({
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
const widget = document.querySelector('go-snap');

widget.addEventListener('toggle', (e) => console.log('Active:', e.detail.active));
widget.addEventListener('feedback-submit', (e) => console.log('Feedback:', e.detail.feedback));
widget.addEventListener('feedback-delete', (e) => console.log('Deleted:', e.detail.feedbackId));
widget.addEventListener('copy', () => console.log('Copied'));
```

### WordPress Integration

```html
<!-- Add to theme footer or Custom HTML widget -->
<script src="https://unpkg.com/@optimo/gosnap/dist/embed.global.js"></script>
<script>
  GoSnap.init({
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

## Detailed Usage

### Step-by-step

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
<GoSnap position="top-left" theme="light" />
```

### Collect all feedbacks on submit

```tsx
function ReviewPage() {
  const feedbacks = useRef<FeedbackItem[]>([])

  return (
    <>
      <GoSnap
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
<GoSnap persist />

// Custom storage key
<GoSnap persist="my-review-session" />
```

When `persist` is enabled, feedbacks are saved to `localStorage` and restored on page reload. If a target element can no longer be found in the DOM, its marker is displayed as an orphan with a warning indicator.

### Custom trigger icon

```tsx
import { Bug } from 'lucide-react'

<GoSnap triggerIcon={<Bug size={18} />} />
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

## Vibe Kanban Sync

Auto-sync feedbacks to [Vibe Kanban](https://github.com/BloopAI/vibe-kanban) as tasks. Every time you submit a feedback annotation, it automatically becomes a task on your Vibe Kanban board.

### How It Works

```
Browser (your app)                CLI bridge (your terminal)           Vibe Kanban
┌──────────────────┐  HTTP POST  ┌──────────────────────┐  MCP stdio  ┌────────┐
│  Widget with      │ ────────→  │  npx @optimo/gosnap   │ ──────────→ │  Board  │
│  syncUrl prop     │  :3456     │  --sync-vk            │             │  Tasks  │
└──────────────────┘             └──────────────────────┘             └────────┘
```

The widget **cannot** talk to Vibe Kanban directly (MCP requires a Node.js process). A lightweight CLI bridge runs in your terminal to relay feedbacks.

### Prerequisites

1. **Vibe Kanban** installed and at least one project created:
   ```bash
   npx vibe-kanban@latest
   ```

### Setup (3 steps)

**Step 1 — Start the bridge** (keep this terminal open):

```bash
npx @optimo/gosnap --sync-vk
```

You should see:
```
[vk-sync] Connecting to Vibe Kanban MCP...
[vk-sync] Auto-detected project: My Project (abc123)
[vk-sync] Listening on http://localhost:3456/webhook
```

> If you have multiple VK projects, specify one: `--project <id>`
> Custom port: `--port 4000`

**Step 2 — Add `syncUrl` to your widget:**

<details>
<summary><strong>React</strong></summary>

```tsx
<GoSnap syncUrl="http://localhost:3456/webhook" />
```
</details>

<details>
<summary><strong>Web Component</strong></summary>

```html
<go-snap sync-url="http://localhost:3456/webhook"></go-snap>
```
</details>

<details>
<summary><strong>Imperative API</strong></summary>

```html
<script src="https://unpkg.com/@optimo/gosnap/dist/embed.global.js"></script>
<script>
  GoSnap.init({ syncUrl: 'http://localhost:3456/webhook' });
</script>
```
</details>

**Step 3 — Annotate your UI.** Each feedback you submit appears as a task `[UI] your feedback text` on the Vibe Kanban board with selector, position, and element metadata.

### Sync Modes

| Mode | Behavior | When to use |
|------|----------|-------------|
| `each` (default) | Syncs immediately after each feedback submit | Real-time tracking |
| `batch` | Queues feedbacks, syncs all at once on **Copy** (⌘⇧C) or after 5s | Batch review sessions |

```tsx
// Batch mode: feedbacks sync when you hit Copy
<GoSnap syncUrl="http://localhost:3456/webhook" syncMode="batch" />
```

### Optional: Sync Deletes & Edits

By default, only new feedbacks sync. Enable delete/edit sync with flags:

```tsx
<GoSnap
  syncUrl="http://localhost:3456/webhook"
  syncDelete  // deleting a feedback also deletes the VK task
  syncUpdate  // editing a feedback updates the VK task title
/>
```

### All Sync Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `syncUrl` | `string` | — | Webhook URL (required for sync) |
| `syncMode` | `'each' \| 'batch'` | `'each'` | When to sync (see above) |
| `syncDelete` | `boolean` | `false` | Delete VK task when feedback is deleted |
| `syncUpdate` | `boolean` | `false` | Update VK task when feedback is edited |
| `syncHeaders` | `Record<string, string>` | — | Custom HTTP headers for webhook |
| `onSyncSuccess` | `(payload) => void` | — | Callback after successful sync |
| `onSyncError` | `(error, payload) => void` | — | Callback on sync failure (after 2 retries) |

### Troubleshooting

| Problem | Solution |
|---------|----------|
| `Failed to fetch` in console | Bridge not running. Start it: `npx @optimo/gosnap --sync-vk` |
| `No Vibe Kanban projects found` | Create a VK project first: `npx vibe-kanban@latest` |
| Wrong project selected | Specify project: `npx @optimo/gosnap --sync-vk --project <id>` |
| Port conflict | Use a different port: `--port 4000` and update `syncUrl` accordingly |

## MCP Server Sync

Auto-sync feedbacks to the **[gosnap-mcp](https://github.com/bienhoang/gosnap-mcp)** server so AI agents (Claude, Cursor, Copilot, Windsurf) can read, acknowledge, and resolve feedbacks directly.

### How It Works

```
Browser (your app)                          MCP Server
┌──────────────────┐  HTTP POST :4747  ┌──────────────────────┐    stdio     ┌───────────┐
│  Widget with      │ ────────────────→ │  gosnap-mcp │ ←──────────→ │  AI Agent  │
│  syncUrl prop     │  /api/webhook    │  (HTTP + MCP)         │   JSON-RPC   │  (Claude)  │
└──────────────────┘                   └──────────────────────┘              └───────────┘
```

The widget posts feedbacks to the MCP server's webhook endpoint. AI agents connect to the same server via MCP stdio protocol to read and act on feedbacks.

### Setup (2 steps)

**Step 1 — Start the MCP server:**

```bash
npx gosnap-mcp server
```

You should see:
```
HTTP server listening on http://127.0.0.1:4747
MCP server ready (stdio)
```

**Step 2 — Point your widget to the server:**

<details>
<summary><strong>React</strong></summary>

```tsx
<GoSnap
  syncUrl="http://localhost:4747/api/webhook"
  syncDelete
  syncUpdate
/>
```
</details>

<details>
<summary><strong>Web Component</strong></summary>

```html
<go-snap
  sync-url="http://localhost:4747/api/webhook"
  sync-delete
  sync-update
></go-snap>
```
</details>

<details>
<summary><strong>Imperative API</strong></summary>

```html
<script src="https://unpkg.com/@optimo/gosnap/dist/embed.global.js"></script>
<script>
  GoSnap.init({
    syncUrl: 'http://localhost:4747/api/webhook',
    syncDelete: true,
    syncUpdate: true
  });
</script>
```
</details>

That's it — feedbacks now flow to the MCP server. Configure your AI agent to connect to `gosnap-mcp` and it can list, acknowledge, resolve, and dismiss feedbacks.

### AI Agent Configuration

Run the init command to auto-configure your AI agents:

```bash
npx gosnap-mcp init
```

This adds the MCP server to Claude Desktop, Cursor, Windsurf, and other supported agents.

### MCP vs Vibe Kanban Sync

| | MCP Server Sync | Vibe Kanban Sync |
|---|---|---|
| **Purpose** | AI agents read & act on feedbacks | Feedbacks become kanban tasks |
| **Bridge needed** | No (direct HTTP) | Yes (`--sync-vk` CLI) |
| **Port** | `4747` | `3456` |
| **AI access** | Native MCP tools | Via Vibe Kanban MCP |
| **Best for** | AI-driven UI fixes | Project management |

Both can be used simultaneously with different `syncUrl` values or by running the VK bridge alongside the MCP server.

## Roadmap

- [x] MCP (Model Context Protocol) server — AI agents read feedbacks directly
- [x] Webhook integration — push feedbacks to any endpoint
- [ ] JSON output format — alongside markdown
- [x] CLI tool — capture feedbacks from terminal

## Development

```bash
git clone https://github.com/bienhoang/gosnap.git
cd gosnap
npm install

npm run dev      # watch mode
npm run build    # production build
npm run typecheck
```

## License

[MIT](./LICENSE)
