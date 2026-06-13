# Doodle Chat UI

A responsive chat interface built with React, TypeScript, and CSS Modules for the Doodle frontend challenge. It loads recent messages, sends new ones, scrolls up for older history, and polls for incoming messages from other users.

## Prerequisites

You need the **chat backend API** running locally before starting the frontend:

```
http://localhost:3000
```

The frontend proxies `/api` requests to that server during development (see `vite.config.ts`). If the backend is not running, the app will show an error toast on load and sending will fail.

The API expects a Bearer token — configured in `src/constants/config.ts` as `super-secret-doodle-token`.

## Getting started

```bash
pnpm install
pnpm dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Other scripts

| Command        | Description                        |
| -------------- | ---------------------------------- |
| `pnpm build`   | Type-check and production build    |
| `pnpm preview` | Serve the production build locally |
| `pnpm lint`    | Run ESLint                         |

## Features

- **Initial load** — fetches the 10 most recent messages
- **Send messages** — POST to the API, append to the list, clear input
- **Infinite scroll** — scrolling to the top loads older messages (Intersection Observer)
- **Polling** — checks for new messages every 10 seconds while the tab is visible
- **Error handling** — toast notifications for load/send failures with retry on load
- **Accessibility** — live region for messages, labels, keyboard submit, focus management, reduced-motion support
- **Responsive** — works on mobile with safe-area insets and 44px touch targets

## Project structure

```
src/
  api/              HTTP client and typed errors
  components/       UI components (ChatArea, Message, MessageInputBar, Toast, …)
  hooks/            useMessages — fetch, send, poll, pagination state
  constants/        Auth token, page size, poll interval
  types/            Message and API error shapes
  utils/            Date formatting, HTML entity decoding
```

## How it talks to the backend

| Action       | Request                                                  |
| ------------ | -------------------------------------------------------- |
| Initial load | `GET /api/v1/messages?before={now}&limit=10`             |
| Load older   | `GET /api/v1/messages?before={oldestCreatedAt}&limit=10` |
| Poll for new | `GET /api/v1/messages?after={newestCreatedAt}&limit=10`  |
| Send         | `POST /api/v1/messages` with `{ message, author }`       |

All requests include `Authorization: Bearer super-secret-doodle-token`.

## Hot takes

**Incremental over big-bang.** The UI was built in vertical slices — layout and static messages first, then API wiring, send, infinite scroll, polling, errors, a11y, and performance. Each step left the app demoable. Easier to review, easier to debug.

**Polling is good enough here.** The API is REST-only, so I poll every 10s with `?after=` instead of adding WebSockets. It pauses when the tab is hidden and dedupes by `_id` so messages you just sent don't appear twice. Fine for a challenge; I'd push for SSE/WebSockets in production.

**Scroll logic was the trickiest part.** Chat needs three different scroll behaviors: jump to bottom on first load, preserve position when prepending older messages, and only auto-scroll on new messages if you're already near the bottom. That took a few iterations to get right without fighting the user.

**One hook holds all the data.** `useMessages` owns messages, loading states, errors, send, load-more, and polling. For an app this size that's simpler than context or multiple hooks. I'd split it if the feature set grew.

**No virtualization (yet).** Messages load in pages of 10, so the DOM stays small. I memoized the list and wrapped `Message` in `React.memo` instead of pulling in a virtualizer. Virtualization is the next step if users routinely load hundreds of messages.

**Toasts over inline errors.** Load and send failures show as dismissible toasts at the top. The chat area stays clean, and failed sends keep your draft text in the input.

**Background image gotcha.** `background-size: cover` on a growing container made the wallpaper look like it zoomed when messages loaded. Fixed with a fixed-position background layer and a WebP variant (~49 KB vs ~514 KB PNG).

---
