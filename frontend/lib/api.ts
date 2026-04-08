import { ChatResponse, ConversationDetail, ConversationSummary, LoginResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const REQUEST_TIMEOUT_MS = 15000;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit, accessToken?: string): Promise<T> {
  const headers = new Headers(init?.headers);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeout);

    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("Request timed out", 408);
    }

    throw new ApiError("Network request failed", 0);
  }

  clearTimeout(timeout);

  if (!response.ok) {
    const text = await response.text();
    const errorMessage = extractErrorMessage(text);
    throw new ApiError(errorMessage, response.status);
  }

  return (await response.json()) as T;
}

function extractErrorMessage(text: string): string {
  if (!text) {
    return "Request failed";
  }

  try {
    const payload = JSON.parse(text) as { message?: string | string[] };
    if (Array.isArray(payload.message)) {
      return payload.message.join(", ");
    }

    if (typeof payload.message === "string") {
      return payload.message;
    }
  } catch {}

  return text;
}

export function login(username: string, password: string) {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
    }),
  });
}

export function getConversations(accessToken: string) {
  return request<ConversationSummary[]>("/chat/conversations", undefined, accessToken);
}

export function getConversation(accessToken: string, conversationId: string) {
  return request<ConversationDetail>(`/chat/conversations/${conversationId}`, undefined, accessToken);
}

export function sendMessage(accessToken: string, message: string, conversationId?: string) {
  return request<ChatResponse>(
    "/chat",
    {
      method: "POST",
      body: JSON.stringify({
        message,
        conversationId,
      }),
    },
    accessToken,
  );
}
