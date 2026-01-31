# ChatMan AI - Setup & Architecture

**ChatMan AI** is a modern, responsive AI chat interface built with React, TypeScript, and Vite. It supports multiple AI providers (OpenAI, Gemini) with real-time streaming, persistent history, and a polished UI.

## 🚀 Setup Instructions

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Manishkumar1996/chatManAI.git
    cd chatManAI
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Locally**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173/](http://localhost:5173/) (or the port shown in your terminal).

4.  **Configuration**
    *   Click the **Settings** (gear icon) in the top-right.
    *   The app includes a default **Gemini API Key**, so you can start chatting immediately.
    *   (Optional) Enter your own **OpenAI API Key** or **Gemini API Key**.

---

## 🏗️ Architecture Decisions

### **Tech Stack**
*   **Vite**: Chosen for instant server start and lightning-fast HMR (Hot Module Replacement).
*   **React + TypeScript**: Ensures strict type safety, reducing runtime errors and improving maintainability.
*   **SCSS Modules**: Provides scoped styling to prevent CSS conflicts while maintaining the power of SASS mixins and variables.

### **Core Components**
*   **Services Layer (`src/services/`)**: abstracts the complexity of different API providers. The UI doesn't know *how* `OpenAIService` or `GeminiService` works; it just consumes a standardized stream.
*   **Custom Hooks (`useChat`)**: Encapsulates the complex state machine (loading, streaming, error handling) separate from the UI components.
*   **Context API (`SettingsContext`)**: Manages global configuration (API keys, themes, provider choices) to avoid prop drilling.

---

## 🌊 How Streaming is Handled

Streaming is implemented using **Generator Functions** (`async function*`) to provide a clean, iterable interface for real-time data.

1.  **Service Abstraction**:
    *   Both `OpenAIService` and `GeminiService` implement a `streamCompletion` static method.
    *   They use the native `fetch` API and `ReadableStream` to process the server response chunk by chunk.
    *   `GeminiService` specifically handles the complex JSON-stream parsing required by Google's API.

2.  **The Consumption Loop** (`useChat.ts`):
    ```typescript
    const stream = selectedService.streamCompletion(...);
    for await (const chunk of stream) {
        fullContent += chunk;
        // Updates state incrementally, triggering a re-render for every token
        setState(prev => ({ ...updates }));
    }
    ```
    This ensures the user sees the message appearing in real-time, just like typing.

---

## 🎨 AI-Specific UX Choices

*   **Optimistic UI with "Stop" Control**: The UI immediately acknowledges the user's input. A dedicated "Stop" button (via `AbortController`) gives users control to cancel run-away generations.
*   **Smart History Persistence**: 
    *   Chat sessions are automatically saved to `localStorage` to prevent data loss on refresh.
    *   The **Active Session** logic ensures that refreshing the page restores the *exact* conversation context the user was viewing, rather than resetting to a blank screen.
*   **Markdown Rendering**: `react-markdown` and `remark-gfm` are used to render code blocks, tables, and formatted text, essential for coding assistance interactions.
*   **Model Agnostic Design**: The UI adapts to different providers (OpenAI/Gemini) seamlessly, fetching their specific model lists dynamically.

---

## 🌍 Production Scaling Considerations

To take this application from a local demo to a production-scale product, the following changes would be recommended:

1.  **Backend Proxy**:
    *   *Current*: API calls are made directly from the browser (Keys stored in LocalStorage).
    *   *Production*: Move API calls to a Node.js/Python backend. Store API keys securely on the server. The frontend validates a user session and calls the backend proxy.

2.  **Database for History**:
    *   *Current*: `localStorage` limits data size and is device-specific.
    *   *Production*: Use **PostgreSQL** or **MongoDB** to persist conversation history. This allows users to access their chats across multiple devices.

3.  **State Management**:
    *   *Current*: React Context + Local State is sufficient.
    *   *Production*: If features expand (e.g., file uploads, multi-modal inputs, team collaboration), migrating to **Zustand** or **Redux Toolkit** might offer better performance and debuggability.

4.  **Asset Optimization**:
    *   Implement **Code Splitting** (React.lazy) for heavy components (like Settings Modal or Markdown Parsers) to improve initial load time.
