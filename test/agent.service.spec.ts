import { AgentType } from "@prisma/client";
import { AgentService } from "../src/agent/agent.service";

describe("AgentService", () => {
  let service: AgentService;

  beforeEach(() => {
    service = new AgentService();
  });

  it("classifies sales intent from pricing keywords", () => {
    const result = service.classifyIntent("Can you show pricing and plan options?");

    expect(result).toBe(AgentType.SALES);
  });

  it("defaults to support intent", () => {
    const result = service.classifyIntent("I cannot log in to my account");

    expect(result).toBe(AgentType.SUPPORT);
  });

  it("returns agent config", () => {
    const result = service.getAgent(AgentType.SUPPORT);

    expect(result.type).toBe(AgentType.SUPPORT);
    expect(result.basePrompt).toContain("support");
  });
});
