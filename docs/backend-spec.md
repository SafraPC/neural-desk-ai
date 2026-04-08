# Backend Specification

## Goal

Build a simple NestJS backend for NeuralDesk Lite with JWT auth, chat orchestration, local RAG, model fallback, PostgreSQL persistence, Swagger docs, and unit tests.

## Modules

- `AuthModule`
- `ChatModule`
- `AgentModule`
- `RagModule`
- `ModelModule`
- `LogModule`
- `PrismaModule`

## Endpoints

### `POST /auth/login`

Input:
- `username`
- `password`

Output:
- `accessToken`
- `user`

Rules:
- Authenticate against seeded users table.
- Return JWT signed with server secret.

### `POST /chat`

Auth:
- Bearer token required.

Input:
- `message`
- `conversationId` optional

Output:
- `conversationId`
- `agentType`
- `modelUsed`
- `fallbackUsed`
- `responseTimeMs`
- `message`
- `context`

Rules:
- If `conversationId` is missing, create a new conversation.
- If `conversationId` exists, it must belong to the authenticated user.
- Always return the AI response in English, regardless of the user input language.

## Chat Flow

1. Accept authenticated user input.
2. Load or create conversation.
3. Classify intent with `AgentService`.
4. Select agent prompt with `AgentService`.
5. Save user message.
6. Retrieve local context with `RagService`.
7. Build final prompt in `ChatService`.
8. Call primary model in `ModelService`.
9. If primary fails or returns invalid content, call fallback model.
10. Save AI message.
11. Save interaction log with `LogService`.
12. Return structured response.

## Services

### `AuthService`

- Validate username and password.
- Sign JWT payload with user id and username.

### `ChatService`

- Own orchestration flow.
- Persist conversations and messages.
- Delegate classification, retrieval, model execution, and logging.

### `AgentService`

- Classify user text as `SUPPORT` or `SALES`.
- Return agent config with label and base prompt.

### `RagService`

- Read local knowledge base.
- Use keyword overlap scoring.
- Return top relevant snippets for the selected agent.

### `ModelService`

- Read model configuration from env.
- Use OpenAI Chat Completions when API key exists.
- Use local deterministic fallback response when API key is missing.
- Return metadata:
  - `content`
  - `modelUsed`
  - `fallbackUsed`
  - `responseTimeMs`

### `LogService`

- Persist interaction log records.

## Persistence Rules

- `users` used for auth.
- `conversations` linked to authenticated user.
- `messages` store both `USER` and `AI` roles.
- `interaction_logs` store model and fallback metadata.
- `retrieved_context` stores RAG snippets for future analysis.

## Environment

- `PORT` default `3000`
- `JWT_SECRET` default local dev value
- `JWT_EXPIRES_IN` default `1d`
- `OPENAI_API_KEY` optional
- `OPENAI_BASE_URL` default `https://api.openai.com/v1`
- `MODEL_PRIMARY` default `gpt-4o-mini`
- `MODEL_FALLBACK` default `gpt-4.1-mini`

## Testing Scope

- `AuthService`
- `AgentService`
- `RagService`
- `ModelService`
- `ChatService`

## Constraints

- Keep modules simple.
- Keep files focused.
- No embeddings.
- No extra tables.
- No frontend work.
