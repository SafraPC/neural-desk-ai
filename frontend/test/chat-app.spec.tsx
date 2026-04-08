import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { ChatApp } from "../components/chat-app";
import { clearStoredSession, loadStoredSession } from "../lib/auth-storage";
import { getConversation, getConversations, sendMessage } from "../lib/api";

jest.mock("../lib/api", () => ({
  getConversation: jest.fn(),
  getConversations: jest.fn(),
  sendMessage: jest.fn(),
}));

jest.mock("../lib/auth-storage", () => ({
  clearStoredSession: jest.fn(),
  loadStoredSession: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockedUseRouter = jest.mocked(useRouter);
const mockedGetConversations = jest.mocked(getConversations);
const mockedGetConversation = jest.mocked(getConversation);
const mockedSendMessage = jest.mocked(sendMessage);
const mockedLoadStoredSession = jest.mocked(loadStoredSession);
const mockedClearStoredSession = jest.mocked(clearStoredSession);
const mockedReplace = jest.fn();

describe("ChatApp", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      replace: mockedReplace,
    } as unknown as ReturnType<typeof useRouter>);
    mockedLoadStoredSession.mockReturnValue(null);
    mockedClearStoredSession.mockReturnValue(undefined);
  });

  it("redirects to login when no session exists", async () => {
    render(<ChatApp />);

    await waitFor(() => {
      expect(mockedReplace).toHaveBeenCalledWith("/login");
    });

    expect(mockedGetConversations).not.toHaveBeenCalled();
  });

  it("renders chat response data when session exists", async () => {
    const user = userEvent.setup();

    mockedLoadStoredSession.mockReturnValue({
      accessToken: "token-1",
      user: {
        id: "user-1",
        username: "admin",
        role: "ADMIN",
      },
    });

    mockedGetConversations
      .mockResolvedValueOnce([])
      .mockResolvedValue([
        {
          id: "conversation-1",
          agentType: "SALES",
          updatedAt: "2026-04-08T10:05:00.000Z",
          latestMessagePreview: "Sales reply",
          latestMessageRole: "AI",
          latestInteraction: {
            agentType: "SALES",
            modelUsed: "gpt-4o-mini",
            fallbackUsed: false,
            responseTimeMs: 320,
            createdAt: "2026-04-08T10:05:00.000Z",
          },
        },
      ]);

    mockedSendMessage.mockResolvedValue({
      conversationId: "conversation-1",
      agentType: "SALES",
      modelUsed: "gpt-4o-mini",
      fallbackUsed: false,
      responseTimeMs: 320,
      message: "Sales reply",
      context: [],
    });

    mockedGetConversation.mockResolvedValue({
      id: "conversation-1",
      agentType: "SALES",
      createdAt: "2026-04-08T10:00:00.000Z",
      updatedAt: "2026-04-08T10:05:00.000Z",
      latestInteraction: {
        agentType: "SALES",
        modelUsed: "gpt-4o-mini",
        fallbackUsed: false,
        responseTimeMs: 320,
        createdAt: "2026-04-08T10:05:00.000Z",
      },
      messages: [
        {
          id: "message-1",
          role: "USER",
          content: "Show pricing",
          createdAt: "2026-04-08T10:00:00.000Z",
        },
        {
          id: "message-2",
          role: "AI",
          content: "Sales reply",
          createdAt: "2026-04-08T10:05:00.000Z",
          interaction: {
            agentType: "SALES",
            modelUsed: "gpt-4o-mini",
            fallbackUsed: false,
            responseTimeMs: 320,
            createdAt: "2026-04-08T10:05:00.000Z",
          },
        },
      ],
    });

    render(<ChatApp />);

    const input = await screen.findByPlaceholderText("Type a support or sales message...");
    await user.type(input, "Show pricing");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => {
      expect(mockedSendMessage).toHaveBeenCalledWith("token-1", "Show pricing", undefined);
    });

    expect((await screen.findAllByText("Sales reply")).length).toBeGreaterThan(0);
    expect((await screen.findAllByText("gpt-4o-mini")).length).toBeGreaterThan(0);
    expect((await screen.findAllByText("sales")).length).toBeGreaterThan(0);
  });

  it("clears session on unauthorized conversation load", async () => {
    mockedLoadStoredSession.mockReturnValue({
      accessToken: "expired-token",
      user: {
        id: "user-1",
        username: "admin",
        role: "ADMIN",
      },
    });

    mockedGetConversations.mockRejectedValue({
      message: "Invalid token",
      status: 401,
    });

    render(<ChatApp />);

    await waitFor(() => {
      expect(mockedClearStoredSession).toHaveBeenCalled();
    });

    expect(mockedReplace).toHaveBeenCalledWith("/login");
  });

  it("logs out back to the login screen", async () => {
    const user = userEvent.setup();

    mockedLoadStoredSession.mockReturnValue({
      accessToken: "token-1",
      user: {
        id: "user-1",
        username: "admin",
        role: "ADMIN",
      },
    });

    mockedGetConversations.mockResolvedValue([]);

    render(<ChatApp />);

    await user.click(await screen.findByRole("button", { name: "Logout" }));

    expect(mockedClearStoredSession).toHaveBeenCalled();
    expect(mockedReplace).toHaveBeenCalledWith("/login");
  });
});
