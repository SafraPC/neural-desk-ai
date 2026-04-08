import { AgentType } from "@prisma/client";

export interface AgentDefinition {
  type: AgentType;
  name: string;
  basePrompt: string;
  keywords: string[];
}
