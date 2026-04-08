import { render, screen } from "@testing-library/react";
import { ContextPanel } from "../components/context-panel";

describe("ContextPanel", () => {
  it("renders conversation metadata", () => {
    render(
      <ContextPanel
        agentType="SUPPORT"
        interaction={{
          agentType: "SUPPORT",
          modelUsed: "gpt-4o-mini",
          fallbackUsed: true,
          responseTimeMs: 245,
          createdAt: "2026-04-08T10:00:00.000Z",
        }}
        messageCount={4}
        updatedAt="2026-04-08T10:10:00.000Z"
      />,
    );

    expect(screen.getByText("support")).toBeInTheDocument();
    expect(screen.getByText("gpt-4o-mini")).toBeInTheDocument();
    expect(screen.getByText("245 ms")).toBeInTheDocument();
    expect(screen.getByText("Used")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });
});
