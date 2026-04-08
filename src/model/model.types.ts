import { AgentType } from "@prisma/client";
import { RetrievedContextItem } from "../rag/rag.types";

export interface GenerateModelInput {
  agentType: AgentType;
  systemPrompt: string;
  prompt: string;
  context: RetrievedContextItem[];
}

export interface ModelExecutionResult {
  content: string;
  modelUsed: string;
  fallbackUsed: boolean;
  responseTimeMs: number;
}
