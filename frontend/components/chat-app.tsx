"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getConversation, getConversations, sendMessage } from "../lib/api";
import { clearStoredSession, loadStoredSession } from "../lib/auth-storage";
import { getErrorMessage, isUnauthorizedError } from "../lib/errors";
import { ConversationDetail, ConversationSummary, StoredSession } from "../lib/types";
import styles from "./chat-app.module.css";
import screenStateStyles from "./screen-state.module.css";
import { ChatWindow } from "./chat-window";
import { ContextPanel } from "./context-panel";
import { ConversationsSidebar } from "./conversations-sidebar";
import { MessageComposer } from "./message-composer";

export function ChatApp() {
  const router = useRouter();
  const listRequestId = useRef(0);
  const detailRequestId = useRef(0);
  const [session, setSession] = useState<StoredSession | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversationDetail, setConversationDetail] = useState<ConversationDetail | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const storedSession = loadStoredSession();

    if (!storedSession) {
      router.replace("/login");
      setIsReady(true);
      return;
    }

    setSession(storedSession);
    setIsReady(true);
  }, [router]);

  const resetWorkspace = useCallback(() => {
    listRequestId.current += 1;
    detailRequestId.current += 1;
    setConversations([]);
    setSelectedConversationId(null);
    setConversationDetail(null);
    setPendingMessage(null);
    setIsLoadingConversations(false);
    setIsLoadingConversation(false);
    setIsSending(false);
  }, []);

  const handleLogout = useCallback(
    () => {
      clearStoredSession();
      resetWorkspace();
      setSession(null);
      setChatError(null);
      router.replace("/login");
    },
    [resetWorkspace, router],
  );

  const handleRequestError = useCallback(
    (error: unknown, onError: (message: string | null) => void) => {
      if (isUnauthorizedError(error)) {
        handleLogout();
        return;
      }

      onError(getErrorMessage(error));
    },
    [handleLogout],
  );

  const loadConversationList = useCallback(
    async (accessToken: string) => {
      const requestId = ++listRequestId.current;
      setIsLoadingConversations(true);

      try {
        const nextConversations = await getConversations(accessToken);

        if (requestId !== listRequestId.current) {
          return [];
        }

        setConversations(nextConversations);
        setChatError(null);
        return nextConversations;
      } catch (error) {
        if (requestId === listRequestId.current) {
          handleRequestError(error, setChatError);
        }

        return [];
      } finally {
        if (requestId === listRequestId.current) {
          setIsLoadingConversations(false);
        }
      }
    },
    [handleRequestError],
  );

  const loadConversationDetail = useCallback(
    async (accessToken: string, conversationId: string) => {
      const requestId = ++detailRequestId.current;
      setIsLoadingConversation(true);

      try {
        const nextConversation = await getConversation(accessToken, conversationId);

        if (requestId !== detailRequestId.current) {
          return null;
        }

        setSelectedConversationId(conversationId);
        setConversationDetail(nextConversation);
        setChatError(null);
        return nextConversation;
      } catch (error) {
        if (requestId === detailRequestId.current) {
          handleRequestError(error, setChatError);
        }

        return null;
      } finally {
        if (requestId === detailRequestId.current) {
          setIsLoadingConversation(false);
        }
      }
    },
    [handleRequestError],
  );

  useEffect(() => {
    if (!session) {
      resetWorkspace();
      return;
    }

    void (async () => {
      const nextConversations = await loadConversationList(session.accessToken);
      const nextConversationId = nextConversations[0]?.id ?? null;

      if (!nextConversationId) {
        setSelectedConversationId(null);
        setConversationDetail(null);
        return;
      }

      await loadConversationDetail(session.accessToken, nextConversationId);
    })();
  }, [loadConversationDetail, loadConversationList, resetWorkspace, session]);

  async function handleSelectConversation(conversationId: string) {
    if (!session) {
      return;
    }

    setChatError(null);
    setSelectedConversationId(conversationId);
    setConversationDetail(null);
    await loadConversationDetail(session.accessToken, conversationId);
  }

  async function handleSendMessage(message: string) {
    if (!session) {
      return false;
    }

    if (message.trim().length < 2) {
      setChatError("Message must contain at least 2 characters");
      return false;
    }

    if (message.length > 4000) {
      setChatError("Message must not exceed 4000 characters");
      return false;
    }

    setIsSending(true);
    setPendingMessage(message);
    setChatError(null);

    try {
      const response = await sendMessage(session.accessToken, message, selectedConversationId ?? undefined);

      await loadConversationList(session.accessToken);
      await loadConversationDetail(session.accessToken, response.conversationId);
      return true;
    } catch (error) {
      handleRequestError(error, setChatError);
      return false;
    } finally {
      setPendingMessage(null);
      setIsSending(false);
    }
  }

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  );

  if (!isReady || !session) {
    return <div className={screenStateStyles.loading}>Loading workspace...</div>;
  }

  return (
    <div className={styles.shell}>
      <div className={styles.layout}>
        <ConversationsSidebar
          conversations={conversations}
          loading={isLoadingConversations}
          onLogout={handleLogout}
          onSelectConversation={(conversationId) => void handleSelectConversation(conversationId)}
          selectedConversationId={selectedConversationId}
          session={session}
        />

        <section className={styles.main}>
          <div className={styles.mainHeader}>
            <div>
              <p className={styles.kicker}>Main chat</p>
              <h2 className={styles.title}>Operational conversation view</h2>
            </div>

            {selectedConversation?.latestInteraction?.fallbackUsed ? (
              <span className={styles.headerBadge}>Fallback used</span>
            ) : null}
          </div>

          <ChatWindow
            error={chatError}
            hasConversation={Boolean(selectedConversationId)}
            isLoading={isLoadingConversation}
            isSending={isSending}
            messages={conversationDetail?.messages ?? []}
            pendingMessage={pendingMessage}
          />

          <MessageComposer
            disabled={isSending || isLoadingConversation || isLoadingConversations}
            onSubmit={handleSendMessage}
          />
        </section>

        <ContextPanel
          agentType={conversationDetail?.agentType ?? selectedConversation?.agentType}
          interaction={conversationDetail?.latestInteraction ?? selectedConversation?.latestInteraction}
          messageCount={conversationDetail?.messages.length ?? 0}
          updatedAt={conversationDetail?.updatedAt ?? selectedConversation?.updatedAt}
        />
      </div>
    </div>
  );
}
