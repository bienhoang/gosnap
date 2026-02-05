# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
