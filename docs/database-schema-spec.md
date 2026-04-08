# Database Schema Specification

## Goal

Provide a simple PostgreSQL schema for NeuralDesk Lite MVP that supports chat history, AI interaction logging, agent routing, and future RAG context storage.

## ORM Choice

Use Prisma.

Reason:
- No ORM exists in current repository.
- Prisma keeps schema, migrations, and seed flow simple.
- Prisma `6.19.3` supports current Node `18.20.0`.

## Business Rules

- One user owns many conversations.
- One conversation owns many messages.
- One message belongs to one conversation.
- One message may reference one user.
- AI messages do not reference a user.
- User messages must reference a user.
- Logs belong to one conversation.
- Logs may reference one message.
- Each log stores input, output, chosen agent, model used, fallback usage, and response time.
- Conversations store the current agent assigned to that chat.
- Logs store the actual agent used in that interaction.
- Schema must keep room for future RAG context without adding new tables now.

## Tables

### `users`

- `id` UUID primary key
- `username` unique
- `password_hash`
- `role` (`ADMIN`, `USER`)
- `created_at`
- `updated_at`

### `conversations`

- `id` UUID primary key
- `user_id` foreign key to `users.id`
- `agent_type` (`SUPPORT`, `SALES`)
- `created_at`
- `updated_at`

### `messages`

- `id` UUID primary key
- `conversation_id` foreign key to `conversations.id`
- `user_id` nullable foreign key to `users.id`
- `role` (`USER`, `AI`)
- `content`
- `created_at`
- `updated_at`

### `interaction_logs`

- `id` UUID primary key
- `conversation_id` foreign key to `conversations.id`
- `message_id` nullable foreign key to `messages.id`
- `agent_type` (`SUPPORT`, `SALES`)
- `model_used`
- `fallback_used`
- `response_time_ms`
- `input_text`
- `output_text`
- `retrieved_context` JSONB nullable
- `created_at`
- `updated_at`

## Constraints

- All primary keys use UUID.
- All foreign keys are explicit.
- `username` is unique.
- `response_time_ms` must be zero or greater.
- `messages.role = USER` requires `user_id IS NOT NULL`.
- `messages.role = AI` requires `user_id IS NULL`.
- Delete a user cascades to conversations.
- Delete a conversation cascades to messages and logs.
- Delete a message sets `interaction_logs.message_id` to `NULL`.

## Indexes

- `users.username` unique index
- `conversations(user_id, updated_at)`
- `conversations(agent_type, updated_at)`
- `messages(conversation_id, created_at)`
- `messages(user_id, created_at)`
- `interaction_logs(conversation_id, created_at)`
- `interaction_logs(message_id, created_at)`
- `interaction_logs(agent_type, created_at)`

## Seed Rules

- Insert default admin user.
- Username: `admin`
- Password: hash of `admin`
- Role: `ADMIN`
- Seed must be idempotent.

## Future RAG Support

- `interaction_logs.retrieved_context` stores retrieved snippets, document ids, or metadata when RAG is introduced.
- No extra RAG tables are created in this MVP schema.
