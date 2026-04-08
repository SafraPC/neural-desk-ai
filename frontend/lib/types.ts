export type AgentType = "SUPPORT" | "SALES";

export type MessageRole = "USER" | "AI";

export interface AuthUser {
  id: string;
  username: string;
  role: "ADMIN" | "USER";
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface ConversationInteraction {
  agentType: AgentType;
  modelUsed: string;
  fallbackUsed: boolean;
  responseTimeMs: number;
  createdAt: string;
}

export interface ConversationMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  interaction?: ConversationInteraction;
}

export interface ConversationSummary {
  id: string;
  agentType: AgentType;
  updatedAt: string;
  latestMessagePreview?: string;
  latestMessageRole?: MessageRole;
  latestInteraction?: ConversationInteraction;
}

export interface ConversationDetail {
  id: string;
  agentType: AgentType;
  createdAt: string;
  updatedAt: string;
  messages: ConversationMessage[];
  latestInteraction?: ConversationInteraction;
}

export interface ChatResponse {
  conversationId: string;
  agentType: AgentType;
  modelUsed: string;
  fallbackUsed: boolean;
  responseTimeMs: number;
  message: string;
  context: Array<{
    id: string;
    title: string;
    content: string;
    score: number;
  }>;
}

export interface StoredSession {
  accessToken: string;
  user: AuthUser;
}
