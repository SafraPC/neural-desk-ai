import { AgentType } from "@prisma/client";
import { RagService } from "../src/rag/rag.service";

describe("RagService", () => {
  let service: RagService;

  beforeEach(() => {
    service = new RagService();
  });

  it("returns support context for billing message", () => {
    const result = service.retrieve(AgentType.SUPPORT, "I have a billing payment issue");

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]?.title).toContain("Billing");
  });

  it("returns sales scoped documents", () => {
    const result = service.retrieve(AgentType.SALES, "I want a demo and pricing");

    expect(result.every((item) => item.title.length > 0)).toBe(true);
    expect(result.some((item) => item.title.includes("Pricing"))).toBe(true);
  });

  it("returns empty context when nothing matches", () => {
    const result = service.retrieve(AgentType.SUPPORT, "zebra nebula quantum mango");

    expect(result).toEqual([]);
  });
});
