import { formatRelativeDate, formatResponseTime } from "../lib/format";
import { AgentType, ConversationInteraction } from "../lib/types";
import styles from "./context-panel.module.css";

interface ContextPanelProps {
  agentType?: AgentType;
  interaction?: ConversationInteraction;
  messageCount: number;
  updatedAt?: string;
}

export function ContextPanel({ agentType, interaction, messageCount, updatedAt }: ContextPanelProps) {
  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <p className={styles.kicker}>Response context</p>
        <h2 className={styles.title}>Conversation status</h2>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <span className={styles.label}>Agent</span>
          <strong className={styles.value}>{agentType?.toLowerCase() ?? "--"}</strong>
        </div>

        <div className={styles.card}>
          <span className={styles.label}>Model</span>
          <strong className={styles.value}>{interaction?.modelUsed ?? "--"}</strong>
        </div>

        <div className={styles.card}>
          <span className={styles.label}>Response time</span>
          <strong className={styles.value}>{formatResponseTime(interaction?.responseTimeMs)}</strong>
        </div>

        <div className={styles.card}>
          <span className={styles.label}>Fallback</span>
          <strong className={styles.value}>{interaction ? (interaction.fallbackUsed ? "Used" : "No") : "--"}</strong>
        </div>
      </div>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span>Messages</span>
          <strong>{messageCount}</strong>
        </div>
        <div className={styles.metric}>
          <span>Last update</span>
          <strong>{updatedAt ? formatRelativeDate(updatedAt) : "--"}</strong>
        </div>
      </div>
    </aside>
  );
}
