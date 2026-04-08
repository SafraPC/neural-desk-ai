# NeuralDesk Lite

NeuralDesk Lite is an AI-based intelligent service system, designed as an MVP to study and apply modern software engineering concepts with artificial intelligence.

The goal of the project is not to be a complete product, but a practical basis for learning:

- RAG (Retrieval-Augmented Generation)
- Agent orchestration
- Fallback between AI models
- Observability in AI applications
- Scalable backend architecture
- Integration between systems

---

## 🎯 Objective

Build a simple but functional system that simulates a real automated service environment with multiple AI agents.

---

## 🧠 Concepts covered

### 1. RAG (Retrieval-Augmented Generation)

The system consults a knowledge base (FAQ/local) to enrich AI responses.

### 2. Multi-agents

Two specialized agents:

- Technical support
- Sales

### 3. Orchestration

A central flow decides:

- Which agent to use
- If you should use RAG
- Which model to call

### 4. Model fallback

System first tries a cheaper model and, in case of failure or low quality, uses a more advanced model.

### 5. Observability

Structured logs for analysis:

- User input
- Chosen agent
- Model used
- Response time
- Fallback use

### 6. Python for applied AI

Possibility of integration with simple scripts (e.g. classification or sentiment analysis)

---

## 🖥️ Features

- Chat with AI

- Automatic intention classification (support/sales)
- Context-based answers (RAG)
- Automatic fallback between models
- Interaction logs
- Simple visualization of metrics
- Agent behavior configuration

---

## 🏗️ Architecture

### Overview

The system follows a simple, centralized, but organized architecture for future evolution.

Frontend (React/Vue)

↓

Backend (Spring Boot)

↓

| AI Orchestrator |

| - Intention classification |

| - Agent choice |

| - Prompt assembly |

| - Fallback control |

↓

Internal services:

• RAG (local base)
• Model Service (LLM)
• Logger

↓

Database (SQLite/Postgres)

---

## 🔧 Suggested technologies

### Backend

- Java + Spring Boot

### Frontend

- React or Vue

### Database

- SQLite (initial)
- Postgres (evolution)

### IA/LLM

- OpenAI API (or equivalent)

### RAG

- Home: search by plain text
- Evolution: embeddings (pgvector)

### Observability

- Structured logs (JSON)

### Python (optional)

- Simple applied AI scripts

---

## 🔄 Application flow

1. User sends message
2. Backend receives request
3. System classifies intention
4. Choose agent (support or sales)
5. Search context (RAG)
6. Mount prompt
7. Call AI model
8. Applies fallback (if necessary)
9. Returns answer
10. Save logs

---

## 🚀 Suggested roadmap

### Phase 1

- Chat working
- Integration with AI model

### Phase 2

- Implementation of agents
- Intention classification

### Phase 3

- Simple RAG

### Phase 4

- Model fallback

### Phase 5

- Observability and logs

---

## 📌 Observations

This project must be kept simple. The focus is on practical learning and incremental evolution.

Avoid overengineering.

Prioritize clarity and functioning.

---

## 🧠 Expected result

At the end of the project, you will have:

- A functional AI system
- Practical knowledge of AI architecture
- Base to evolve to more complex systems
