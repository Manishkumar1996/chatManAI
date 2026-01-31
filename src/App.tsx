import Layout from './components/Layout';
import ChatContainer from './components/ChatContainer';
import { useChat } from './hooks/useChat';

function App() {
  const {
    messages,
    isLoading,
    addMessage,
    stop,
    startNewChat,
    sessions,
    currentSessionId,
    loadSession,
    deleteSession
  } = useChat();

  return (
    <Layout
      onNewChat={startNewChat}
      sessions={sessions}
      currentSessionId={currentSessionId}
      onLoadSession={loadSession}
      onDeleteSession={deleteSession}
    >
      <ChatContainer
        messages={messages}
        isLoading={isLoading}
        onSend={addMessage}
        onStop={stop}
      />
    </Layout>
  );
}

export default App;
