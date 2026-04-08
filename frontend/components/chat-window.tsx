import { formatRelativeDate, formatResponseTime } from "../lib/format";
import { ConversationMessage } from "../lib/types";
import styles from "./chat-window.module.css";

interface ChatWindowProps {
  error?: string | null;
  hasConversation: boolean;
  isLoading: boolean;
  isSending: boolean;
  messages: ConversationMessage[];
  pendingMessage?: string | null;
}

export function ChatWindow({
  error,
  hasConversation,
  isLoading,
  isSending,
  messages,
  pendingMessage,
}: ChatWindowProps) {
  if (!hasConversation && !pendingMessage) {
    return (
      <div className={styles.emptyState}>
        <h2>Start a conversation</h2>
        <p>Ask for support or sales help. NeuralDesk will classify the intent and answer through the backend flow.</p>
      </div>
    );
  }

  return (
    <div className={styles.window}>
      {error ? <p className={styles.error}>{error}</p> : null}
      {isLoading ? <p className={styles.status}>Loading conversation...</p> : null}

      <div className={styles.messages}>
        {messages.map((message) => {
          const isUser = message.role === "USER";

          return (
            <article className={isUser ? `${styles.message} ${styles.user}` : styles.message} key={message.id}>
              <div className={styles.metaRow}>
                <span className={styles.role}>{isUser ? "You" : "AI"}</span>
                <span className={styles.date}>{formatRelativeDate(message.createdAt)}</span>
              </div>

              <p className={styles.content}>{message.content}</p>

              {message.interaction ? (
                <div className={styles.interaction}>
                  <span>{message.interaction.agentType.toLowerCase()}</span>
                  <span>{message.interaction.modelUsed}</span>
                  <span>{formatResponseTime(message.interaction.responseTimeMs)}</span>
                  <span>{message.interaction.fallbackUsed ? "fallback" : "primary"}</span>
                </div>
              ) : null}
            </article>
          );
        })}

        {pendingMessage ? (
          <>
            <article className={`${styles.message} ${styles.user}`}>
              <div className={styles.metaRow}>
                <span className={styles.role}>You</span>
                <span className={styles.date}>Sending...</span>
              </div>
              <p className={styles.content}>{pendingMessage}</p>
            </article>

            <article className={styles.message}>
              <div className={styles.metaRow}>
                <span className={styles.role}>AI</span>
                <span className={styles.date}>{isSending ? "Thinking..." : "Queued"}</span>
              </div>
              <p className={styles.content}>Preparing response...</p>
            </article>
          </>
        ) : null}
      </div>
    </div>
  );
}
