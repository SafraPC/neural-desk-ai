import { NotFoundException } from "@nestjs/common";
import { AgentType, MessageRole, UserRole } from "@prisma/client";
import { AgentService } from "../src/agent/agent.service";
import { AuthenticatedUser } from "../src/auth/auth.types";
import { ChatService } from "../src/chat/chat.service";
import { LogService } from "../src/log/log.service";
import { ModelService } from "../src/model/model.service";
import { PrismaService } from "../src/prisma/prisma.service";
import { RagService } from "../src/rag/rag.service";

describe("ChatService reads", () => {
  const prismaService = {
    conversation: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    message: {
      create: jest.fn(),
    },
  } as unknown as PrismaService;

  const agentService = {
    classifyIntent: jest.fn(),
    getAgent: jest.fn(),
  } as unknown as AgentService;

  const ragService = {
    retrieve: jest.fn(),
  } as unknown as RagService;

  const modelService = {
    generateResponse: jest.fn(),
  } as unknown as ModelService;

  const logService = {
    createInteractionLog: jest.fn(),
  } as unknown as LogService;

  let service: ChatService;

  const user: AuthenticatedUser = {
    id: "user-1",
    username: "admin",
    role: UserRole.ADMIN,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ChatService(prismaService, agentService, ragService, modelService, logService);
  });

  it("maps conversation summaries", async () => {
    jest.spyOn(prismaService.conversation, "findMany").mockResolvedValue([
      {
        id: "conversation-1",
        userId: user.id,
        agentType: AgentType.SUPPORT,
        createdAt: new Date("2026-04-08T10:00:00.000Z"),
        updatedAt: new Date("2026-04-08T10:05:00.000Z"),
        messages: [
          {
            id: "message-1",
            role: MessageRole.AI,
            content: "Latest assistant reply",
          },
        ],
        logs: [
          {
            id: "log-1",
            agentType: AgentType.SALES,
            modelUsed: "gpt-4o-mini",
            fallbackUsed: false,
            responseTimeMs: 120,
            createdAt: new Date("2026-04-08T10:05:00.000Z"),
          },
        ],
      },
    ] as never);

    const result = await service.listConversations(user);

    expect(result).toEqual([
      expect.objectContaining({
        id: "conversation-1",
        agentType: AgentType.SALES,
        latestMessagePreview: "Latest assistant reply",
        latestMessageRole: MessageRole.AI,
        updatedAt: "2026-04-08T10:05:00.000Z",
        latestInteraction: expect.objectContaining({
          modelUsed: "gpt-4o-mini",
        }),
      }),
    ]);
  });

  it("maps conversation detail and message interaction", async () => {
    jest.spyOn(prismaService.conversation, "findFirst").mockResolvedValue({
      id: "conversation-1",
      userId: user.id,
      agentType: AgentType.SALES,
      createdAt: new Date("2026-04-08T10:00:00.000Z"),
      updatedAt: new Date("2026-04-08T10:10:00.000Z"),
      messages: [
        {
          id: "message-1",
          role: MessageRole.USER,
          content: "Need pricing",
          createdAt: new Date("2026-04-08T10:00:00.000Z"),
          logs: [],
        },
        {
          id: "message-2",
          role: MessageRole.AI,
          content: "Here are the plans",
          createdAt: new Date("2026-04-08T10:01:00.000Z"),
          logs: [
            {
              id: "log-1",
              agentType: AgentType.SALES,
              modelUsed: "gpt-4o-mini",
              fallbackUsed: true,
              responseTimeMs: 240,
              createdAt: new Date("2026-04-08T10:01:00.000Z"),
            },
          ],
        },
      ],
      logs: [
        {
          id: "log-1",
          agentType: AgentType.SALES,
          modelUsed: "gpt-4o-mini",
          fallbackUsed: true,
          responseTimeMs: 240,
          createdAt: new Date("2026-04-08T10:01:00.000Z"),
        },
      ],
    } as never);

    const result = await service.getConversation(user, "conversation-1");

    expect(result.messages).toHaveLength(2);
    expect(result.messages[1]?.interaction?.fallbackUsed).toBe(true);
    expect(result.latestInteraction?.agentType).toBe(AgentType.SALES);
    expect(result.createdAt).toBe("2026-04-08T10:00:00.000Z");
  });

  it("throws when conversation detail is missing", async () => {
    jest.spyOn(prismaService.conversation, "findFirst").mockResolvedValue(null);

    await expect(service.getConversation(user, "conversation-1")).rejects.toThrow(NotFoundException);
  });
});
