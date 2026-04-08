import { AgentType } from "@prisma/client";
import { AgentDefinition } from "../agent.types";

export const AGENT_DEFINITIONS: Record<AgentType, AgentDefinition> = {
  [AgentType.SUPPORT]: {
    type: AgentType.SUPPORT,
    name: "Support Agent",
    basePrompt:
      "You are the NeuralDesk support agent. Always respond in English, even if the user writes in another language. Give clear, practical, and calm technical help. Use the provided context when it is relevant.",
    keywords: [
      "support",
      "error",
      "issue",
      "bug",
      "problem",
      "login",
      "billing",
      "broken",
      "fail",
      "failed",
      "trouble",
      "help",
      "reset",
      "account",
    ],
  },
  [AgentType.SALES]: {
    type: AgentType.SALES,
    name: "Sales Agent",
    basePrompt:
      "You are the NeuralDesk sales agent. Always respond in English, even if the user writes in another language. Focus on value, pricing, onboarding, and next steps. Use the provided context when it is relevant.",
    keywords: [
      "sales",
      "price",
      "pricing",
      "plan",
      "plans",
      "buy",
      "purchase",
      "trial",
      "quote",
      "demo",
      "upgrade",
      "contract",
      "proposal",
      "features",
    ],
  },
};
