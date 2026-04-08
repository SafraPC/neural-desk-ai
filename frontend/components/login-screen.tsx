"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { login } from "../lib/api";
import { loadStoredSession, saveStoredSession } from "../lib/auth-storage";
import { getErrorMessage } from "../lib/errors";
import { LoginPanel } from "./login-panel";
import screenStateStyles from "./screen-state.module.css";

export function LoginScreen() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const storedSession = loadStoredSession();

    if (storedSession) {
      router.replace("/");
      return;
    }

    setIsReady(true);
  }, [router]);

  async function handleLogin(username: string, password: string) {
    setIsLoggingIn(true);
    setAuthError(null);

    try {
      const nextSession = await login(username, password);
      saveStoredSession(nextSession);
      router.replace("/");
    } catch (error) {
      setAuthError(getErrorMessage(error));
    } finally {
      setIsLoggingIn(false);
    }
  }

  if (!isReady) {
    return <div className={screenStateStyles.loading}>Loading login...</div>;
  }

  return <LoginPanel error={authError} loading={isLoggingIn} onSubmit={handleLogin} />;
}
