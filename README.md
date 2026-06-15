# Questlog

Demo: https://questlog-tan-seven.vercel.app/

Questlog is a lightweight list management app written with React and Vite.
It focuses on simplicity and minimalism. Fast task entry and tracking without overcomplicating design.

## Features

- User authentication and account-specific data storage (google oath + firebase).
- Create, edit, delete, archive, restore, and pin lists.
- Create, edit, delete, and complete list items.
- Hierarchical data model using list documents and item subcollections
- Dynamic list sorting:
    - Recently created.
    - Recently updated.
    - Alphabetical
    - Archived
- Pinned lists view with automatic next-task highlighting.
- Inline editing for list titles and list items.
- Reusable input validation system:
    - Empty input validation.
    - Maximum length validation.
- Reusable StatusMessage component for contextual feedback
- Network error handling for list creation, edits and deletion.
- Responsive layout for desktop and mobile devices.
- Local development tools for state seeding and reset testing.
- Includes a utility script that generates a .json changelog from the project's Git commit history.
- The generated file is consumed by the in-app Patch Notes modal, allowing recent project changes to be displayed directly within the application.

## How to run it locally

```
git clone https://github.com/valentinpetrov420/questlog.git
cd questlog
npm install
npm run dev
```

## Project goals

This project is very early stage prototype focused on relearning React and also building a stable and quick productivity tool. Core functionality is prioritized but UI/UX is evolving over time.

# Future ideas

## Reliability & UX

- Expand network error handling to all CRUD operations.
- Simulated network failure and latency testing tools (DevPanel).
- Improved loading and pending request states.
- Better offline and reconnection handling.
- Consistent success/error response contracts across handlers.
- Streaks of completed tasks every day.
- Untouched lists for a few days get a notifying suggestion to break down tasks into smaller steps.
- Click and drag to re-arrange.

## Architecture

- State management refactor using useReducer.
- Further normalization of list/item state structure.
- Firestore service refactor and response standardization.
- Improved separation between UI, business logic, and data layers.

## Navigation

- Client-side routing.
- Dedicated list pages.
- Shareable URLs for specific lists.

## List Item Types

- Support for multiple item types beyond standard todos.
- Extensible item rendering based on type.
- Future nested content structures.

## Features

- Search and filtering.
- Drag-and-drop reordering.
- Custom list organization tools.

## DevPanel 

- Simulated network failures.
- Simulated latency.
- State inspection.
- Test data generation.