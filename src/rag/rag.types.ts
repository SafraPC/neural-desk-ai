import { AgentType } from "@prisma/client";

export interface KnowledgeDocument {
  id: string;
  agentType: AgentType;
  title: string;
  content: string;
  keywords: string[];
}

export interface RetrievedContextItem {
  id: string;
  title: string;
  content: string;
  score: number;
}
