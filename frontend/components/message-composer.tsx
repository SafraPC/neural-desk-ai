"use client";

import { KeyboardEvent, useState } from "react";
import styles from "./message-composer.module.css";

interface MessageComposerProps {
  disabled: boolean;
  onSubmit: (message: string) => Promise<boolean>;
}

export function MessageComposer({ disabled, onSubmit }: MessageComposerProps) {
  const [value, setValue] = useState("");

  async function handleSend() {
    const trimmedValue = value.trim();

    if (!trimmedValue || disabled) {
      return;
    }

    const sent = await onSubmit(trimmedValue);

    if (sent) {
      setValue("");
    }
  }

  async function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await handleSend();
    }
  }

  return (
    <div className={styles.composer}>
      <textarea
        aria-label="Message input"
        className={styles.input}
        disabled={disabled}
        maxLength={4000}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => void handleKeyDown(event)}
        placeholder="Type a support or sales message..."
        rows={3}
        value={value}
      />

      <button
        aria-label={disabled ? "Sending message" : "Send message"}
        className={styles.button}
        disabled={disabled || value.trim().length === 0}
        onClick={() => void handleSend()}
        type="button"
      >
        {disabled ? (
          <span className={styles.buttonText}>Sending</span>
        ) : (
          <>
            <span className={styles.buttonText}>Send</span>
            <svg aria-hidden="true" className={styles.icon} fill="none" viewBox="0 0 24 24">
              <path d="M5 12H19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              <path d="M12 5L19 12L12 19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
}
