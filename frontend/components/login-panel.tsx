"use client";

import { FormEvent, useState } from "react";
import styles from "./login-panel.module.css";

interface LoginPanelProps {
  error?: string | null;
  loading: boolean;
  onSubmit: (username: string, password: string) => Promise<void>;
}

export function LoginPanel({ error, loading, onSubmit }: LoginPanelProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(username, password);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.panel}>
        <p className={styles.kicker}>NeuralDesk Lite</p>
        <h1 className={styles.title}>AI support and sales workspace</h1>
        <p className={styles.subtitle}>
          Clean chat flow. Real conversations. Context, agent, model, and response timing in one place.
        </p>

        <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
          <label className={styles.field}>
            <span>Username</span>
            <input
              autoComplete="username"
              disabled={loading}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
              value={username}
            />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input
              autoComplete="current-password"
              disabled={loading}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              type="password"
              value={password}
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button className={styles.button} disabled={loading || username.trim().length < 3 || password.trim().length < 4} type="submit">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
