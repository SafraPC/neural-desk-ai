import { formatRelativeDate } from "../lib/format";
import { ConversationSummary, StoredSession } from "../lib/types";
import styles from "./conversations-sidebar.module.css";

interface ConversationsSidebarProps {
  conversations: ConversationSummary[];
  loading: boolean;
  onLogout: () => void;
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId: string | null;
  session: StoredSession;
}

export function ConversationsSidebar({
  conversations,
  loading,
  onLogout,
  onSelectConversation,
  selectedConversationId,
  session,
}: ConversationsSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div>
          <p className={styles.brand}>NeuralDesk Lite</p>
          <h2 className={styles.title}>Conversations</h2>
        </div>
        <button className={styles.logoutButton} onClick={() => onLogout()} type="button">
          Logout
        </button>
      </div>

      <div className={styles.userCard}>
        <span className={styles.userLabel}>Signed in</span>
        <div className={styles.userMeta}>
          <strong className={styles.userName}>{session.user.username}</strong>
          <span className={styles.userRole}>{session.user.role.toLowerCase()}</span>
        </div>
      </div>

      <div className={styles.list}>
        {loading ? <p className={styles.placeholder}>Loading conversations...</p> : null}

        {!loading && conversations.length === 0 ? (
          <p className={styles.placeholder}>Send the first message to create a conversation.</p>
        ) : null}

        {conversations.map((conversation) => {
          const isActive = conversation.id === selectedConversationId;

          return (
            <button
              aria-pressed={isActive}
              className={isActive ? `${styles.item} ${styles.itemActive}` : styles.item}
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              type="button"
            >
              <div className={styles.itemTop}>
                <span className={styles.agentBadge}>{conversation.agentType.toLowerCase()}</span>
                <span className={styles.date}>{formatRelativeDate(conversation.updatedAt)}</span>
              </div>

              <p className={styles.preview}>
                {conversation.latestMessagePreview?.trim() || "New conversation"}
              </p>

              {conversation.latestInteraction?.fallbackUsed ? (
                <span className={styles.fallbackBadge}>fallback</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
