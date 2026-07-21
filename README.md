# Questlog

Demo: https://questlog-tan-seven.vercel.app/

A productivity tool built on a flat node architecture, inspired by Notion. 
Any node can be a page or a task, enabling recursive nesting and shareable public links.
Built as a daily-iterated React project with Firebase as the backend.

## Features

- Google OAuth authentication.
- Full CRUD for nodes (pages and tasks).
- Flat node collection with parentId relationships, hydrated client-side.
- Network error handling for list creation, edits and deletion.
- Shareable public node URLs, visibility toggle per node.
- Ownership gating — actions hidden from non-owners.
- Dark/light theme with persistence.
- Responsive layout for desktop and mobile devices.
- Drag-and-drop reordering for lists and list items.
- Unit Tests for utility functions.
- Skeleton loading states replacing plain text loading.
- Reusable input validation system:
    - Empty input validation.
    - Maximum length validation.
- Pin, archive, restore.
- Pinned lists with automatic next-task highlighting.
- Dynamic list sorting:
    - Recently created.
    - Custom order.
    - Recently updated.
    - Alphabetical
    - Archived
- Route-guarded navigation with auth-aware redirects.
- Dev-only network latency simulation.
- Build-time changelog generated from git commit history.

## How to run it locally

```
git clone https://github.com/valentinpetrov420/questlog.git
cd questlog
npm install
npm run generate:changelog
npm run dev
```

# Future ideas

## Reliability & UX

- Expand network error handling to all CRUD operations.
- Simulated network failure in DevPanel (latency exists, failure does not).
- Better offline and reconnection handling.
- Streaks of completed tasks.
- Untouched nodes for a few days prompt a suggestion to break tasks down.

## Architecture

- Firestore offline persistence to reduce refresh traffic.
- Parent node updatedAt propagation when children are mutated.

## Navigation

- Sidebar replacing dashboard grid when nested pages land.
- Breadcrumb navigation for nested nodes.
- Any task node promotable to a page with its own /:nodeId.

## Features

- Nested page nodes (any task can become a page).
- Search and filtering.
- Multiple node types beyond todo (heading, note, image, code block).

## DevPanel

- Simulated network failures.
- Test data generation.