import { AgentType, Prisma } from "@prisma/client";

export interface CreateInteractionLogInput {
  conversationId: string;
  messageId: string;
  agentType: AgentType;
  modelUsed: string;
  fallbackUsed: boolean;
  responseTimeMs: number;
  inputText: string;
  outputText: string;
  retrievedContext?: Prisma.InputJsonValue;
}
