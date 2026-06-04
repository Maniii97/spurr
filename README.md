# Spur – AI Customer Support Live Chat Agent (ManiiiHeist Commerce)

A full-stack, real-time AI customer support chat widget built for **ManiiiHeist Commerce**. Powered by Google Gemini and backed by Neon PostgreSQL (with Drizzle ORM), the application provides a modern, responsive, and seamless multi-conversation chat experience matching the workflows of ChatGPT, Gemini, and Claude.

---

## 🚀 How to Run Locally (Step-by-Step)

### Prerequisites
- **Node.js** (v20 or higher)
- **npm** (v9 or higher)
- A **Neon** account (free tier PostgreSQL database)
- A **Google AI Studio** account (free Gemini API key)

### Step 1: Clone and Enter the Directory
```bash
git clone [spurr](https://github.com/Maniii97/spurr)
cd spurr
```

### Step 2: Set Up Environment Variables
We use decoupled env files for the backend and frontend to ensure safety and modularity.

1. **Backend Environment Configuration**:
   Create a `.env` file inside the `backend/` directory:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Open `backend/.env` and fill in your credentials:
   ```env
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   GEMINI_API_KEY=AIzaSyC... # Your Google Gemini API Key
   DATABASE_URL="postgresql://..." # Your Neon Connection String
   NODE_ENV=development
   ```

2. **Frontend Environment Configuration**:
   Create a `.env` file inside the `frontend/` directory:
   ```bash
   cp frontend/.env.example frontend/.env
   ```
   Open `frontend/.env` and verify the API endpoint is correct:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

### Step 3: Initialize Database Schema (Migrations & Push)
We use Drizzle ORM to maintain schemas and handle migrations.

1. Install dependencies inside the backend folder:
   ```bash
   cd backend
   npm install
   ```
2. Push the schema design directly to your Neon PostgreSQL instance:
   ```bash
   npm run db:push
   ```
   *Note: This creates the `conversations` and `messages` tables with appropriate indexes.*

### Step 4: Run the Development Servers
Open two terminal windows to run both services:

- **Terminal 1 (Backend)**:
  ```bash
  cd backend
  npm run dev
  ```
  *Launches the Express API server on `http://localhost:3001`.*

- **Terminal 2 (Frontend)**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
  *Launches the Vite React application on `http://localhost:5173`.*

Open your web browser and navigate to `http://localhost:5173` to test the chat widget.

---

## 🗄️ Database Schema & Seeding Details

### Schema Setup
The project defines two primary PostgreSQL tables inside [schema.ts](file:///Users/maniii/projects/spurr/backend/src/db/schema.ts):
- **`conversations`**: Stores session data including `id` (UUID), `title` (auto-generated from first message), `createdAt`, `updatedAt` (Unix timestamps for fast sorting), and optional `metadata`.
- **`messages`**: Stores message logs, including `id`, `conversationId` (FK referencing conversations with Cascade Delete), `sender` ('user' or 'ai'), `text` (raw content), and `createdAt` timestamp. An index is established on the `conversationId` column to optimize conversation history fetch operations.

### Knowledge Base Injection (Seeding)
The FAQ knowledge base for **ManiiiHeist Commerce** is stored in [seed.ts](file:///Users/maniii/projects/spurr/backend/src/db/seed.ts) as the `STORE_FAQ` constant.
- Rather than running heavy database lookups on every request, the FAQ serves as a highly optimized static "seed" injected directly into the Gemini LLM system prompt.
- This provides instant context to the LLM about shipping rates (₹999 / $15 free limit), support hours (9 AM – 6 PM IST, Mon–Sat), payments (UPI, PayPal, cards), and refunds.

---

## 🏗️ Architecture Overview

### Backend Structure
The backend is structured into clear layers of responsibility to ensure modularity and ease of maintainability:
```
backend/src/
├── config/
│   └── env.ts            # Configuration: Zod validation of env vars at runtime
├── db/
│   ├── client.ts         # DB setup: Connects to Neon Serverless Postgres via Drizzle
│   ├── schema.ts         # ORM schema models
│   └── seed.ts           # Store FAQ/Persona declarations
├── middleware/
│   ├── validate.ts       # Zod validation middleware for HTTP request schemas
│   └── errorHandler.ts   # Global central middleware to sanitize Express errors
├── routes/
│   └── chat.ts           # Route Handlers: Mounting chat endpoints
├── services/
│   ├── llm.service.ts    # Integration with Gemini SDK (strictly isolated)
│   ├── conversation.service.ts # Data Access Layer: CRUD operations for DB tables
│   └── chat.service.ts   # Orchestration Layer: Controls the flow of incoming chat requests
└── index.ts              # Entry point: Server boot, CORS setup, and middleware bindings
```

### Frontend Structure
The React client operates on a hook-driven architecture, separating presentation from state:
```
frontend/src/
├── hooks/
│   ├── useChat.ts        # Coordinates message history, input state, and optimistic inserts
│   └── useConversations.ts # Controls session switching, local storage persistence, and sidebar lists
├── components/
│   ├── Sidebar.tsx       # Sidebar containing chronological session groups and "New Chat" button
│   ├── ChatWidget.tsx    # Widget container (Header, Scrollable list, Input form)
│   ├── MessageList.tsx   # Displays messages, loading states, and typing indicator
│   ├── MessageBubble.tsx # Stylized user/AI message elements with avatars and timestamps
│   ├── ChatInput.tsx     # Handles submit, characters counter, and loading spinners
│   └── TypingIndicator.tsx # Three bouncing dots for "AI typing..." animation
├── lib/
│   ├── api.ts            # Typed HTTP fetch wrappers
│   └── utils.ts          # Utility functions (cn tailwind-merge helper, relative time formatter)
└── App.tsx               # Main layout mounting Sidebar and ChatWidget
```

---

## ✨ Interesting Design Decisions

1. **Frontend-Generated UUIDs (Optimistic Sidebar Addition)**
   In standard implementations, the sidebar won't show a new conversation until the API completes and returns a DB-generated session ID. To deliver an instantaneous UX, the frontend generates a unique UUID (`crypto.randomUUID()`) immediately when you hit send on a new chat, adding it to the sidebar list before the network request is fired.

2. **Timing-Based Server Sync**
   Because the first request takes a few seconds (as Gemini generates a reply), calling `refreshConversations()` immediately would clear the optimistic entry (since the DB hasn't saved it yet). To resolve this, the frontend skips the initial refresh, letting the optimistic entry sit with the user's prompt as a temporary title, and calls `refreshConversations()` only *after* the Gemini response is returned.

3. **Bypassing Redundant History Reloads**
   When `useChat` detects that a session ID was just created locally, it bypasses the `useEffect` trigger that usually fetches historical messages from the backend (`getSession()`). This prevents clearing the optimistic message currently shown in the chat feed.

4. **Graceful Large Message Handling**
   To avoid breaking the user interface or crashing the DB, incoming messages above 2000 characters are safely truncated to 2000 characters at the backend service layer, returning a successful response instead of a throwing an HTTP 500 error.

---

## 🤖 LLM Integration & Prompting

- **Provider**: Google Gemini (`gemini-2.5-flash`) via the `@google/generative-ai` SDK.
- **System Instructions**:
  The model is initialized with a robust system prompt defining:
  - Persona (friendly customer support agent for ManiiiHeist Commerce).
  - Scope boundaries (refusal to answer questions unrelated to the store policies or products).
  - Reference knowledge base (`STORE_FAQ` injection).
  - Explicit directives to never make up information and refer customers to `support@maniiiheistcommerce.com` if unsure.
- **Sliding History Window**:
  To avoid context bloating and control latency/token costs, only the last **10 messages** from the conversation are sent as chat history context to the model.

---

## ⚖️ Trade-offs & "If I had more time..."

- **Streaming (Server-Sent Events / WebSockets)**: Currently, the reply is buffered and returned in one package. Adding stream support would allow words to type out dynamically, giving a faster, more responsive feel.
- **Caching Layer (Redis)**: Storing recent session messages in Redis would prevent querying PostgreSQL on every user message, significantly scaling up maximum concurrent user limits.
- **Semantic Search (RAG)**: For larger stores, injecting a huge FAQ document into the prompt is inefficient. We would generate embeddings for policy sections, store them in a vector DB (like pgvector), and retrieve the top-K relevant contexts for the prompt.
- **Rate Limiting**: Implementing IP or session rate limiting (e.g. via `express-rate-limit`) would protect the Gemini quota from abuse and denial-of-service attempts.
- **User Authentication**: Standardizing sessions using JWT/OAuth rather than anonymous client-supplied local UUIDs to allow cross-device sync.
