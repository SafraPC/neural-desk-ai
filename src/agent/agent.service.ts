import { Injectable } from "@nestjs/common";
import { AgentType } from "@prisma/client";
import { AGENT_DEFINITIONS } from "./config/agent-config";
import { AgentDefinition } from "./agent.types";

@Injectable()
export class AgentService {
  classifyIntent(message: string): AgentType {
    const normalizedMessage = this.normalize(message);
    const supportScore = this.score(normalizedMessage, AGENT_DEFINITIONS[AgentType.SUPPORT].keywords);
    const salesScore = this.score(normalizedMessage, AGENT_DEFINITIONS[AgentType.SALES].keywords);

    if (salesScore > supportScore) {
      return AgentType.SALES;
    }

    return AgentType.SUPPORT;
  }

  getAgent(type: AgentType): AgentDefinition {
    return AGENT_DEFINITIONS[type];
  }

  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }

  private score(message: string, keywords: string[]): number {
    return keywords.reduce((total, keyword) => {
      return message.includes(keyword) ? total + 1 : total;
    }, 0);
  }
}
