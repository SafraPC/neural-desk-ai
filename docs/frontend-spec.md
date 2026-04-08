# Frontend Specification

## Goal

Provide a simple Next.js frontend for NeuralDesk Lite that authenticates against the NestJS backend, renders conversation history, sends chat messages, and displays response metadata.

## Route

- `/`
- `/login`

## UI Sections

### Login state

- Username input
- Password input
- Sign in button
- Error feedback

### Authenticated state

- Left sidebar:
  - conversation list
  - agent badge
  - fallback badge when present
  - logout action
- Center chat area:
  - message history
  - loading state
  - send message form
- Right context panel:
  - agent used
  - model used
  - response time
  - fallback used
  - message count
  - last update

## User Flow

1. User opens frontend.
2. If no stored session exists, frontend redirects user to `/login`.
3. User signs in with backend credentials.
4. Frontend stores JWT session in local storage.
5. Frontend redirects back to `/`.
6. Frontend loads conversations from backend.
7. User selects an existing conversation or sends a new message.
8. Frontend sends message to `POST /chat`.
9. Backend persists data and returns response.
10. Frontend reloads conversation list and conversation detail.
11. UI shows new history and latest response metadata.

## Backend Contracts Used

- `POST /auth/login`
- `GET /chat/conversations`
- `GET /chat/conversations/:conversationId`
- `POST /chat`

## State Rules

- Keep state in React only.
- Persist only auth session in local storage.
- Redirect unauthenticated users to `/login`.
- Redirect authenticated users away from `/login` back to `/`.
- Reload conversation data from backend after sending messages.
- Do not store chat history locally as source of truth.

## Design Rules

- Clean and minimal.
- Dark professional surface.
- Clear hierarchy.
- Fast to scan.
- No heavy component libraries.
