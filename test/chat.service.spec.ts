import { NotFoundException } from "@nestjs/common";
import { AgentType, MessageRole, UserRole } from "@prisma/client";
import { AgentService } from "../src/agent/agent.service";
import { AuthenticatedUser } from "../src/auth/auth.types";
import { ChatService } from "../src/chat/chat.service";
import { LogService } from "../src/log/log.service";
import { ModelService } from "../src/model/model.service";
import { PrismaService } from "../src/prisma/prisma.service";
import { RagService } from "../src/rag/rag.service";

describe("ChatService", () => {
  const transactionClient = {
    conversation: {
      update: jest.fn(),
    },
    message: {
      create: jest.fn(),
    },
  };

  const prismaService = {
    $transaction: jest.fn(),
    conversation: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
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
    jest
      .spyOn(prismaService, "$transaction")
      .mockImplementation(async (callback) => callback(transactionClient as never));
    service = new ChatService(prismaService, agentService, ragService, modelService, logService);
  });

  it("orchestrates full chat flow for a new conversation", async () => {
    jest.spyOn(agentService, "classifyIntent").mockReturnValue(AgentType.SUPPORT);
    jest.spyOn(agentService, "getAgent").mockReturnValue({
      type: AgentType.SUPPORT,
      name: "Support Agent",
      basePrompt: "Always respond in English. support prompt",
      keywords: [],
    });

    jest.spyOn(prismaService.conversation, "create").mockResolvedValue({
      id: "conversation-1",
      userId: user.id,
      agentType: AgentType.SUPPORT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    jest
      .spyOn(transactionClient.message, "create")
      .mockResolvedValueOnce({
        id: "message-user-1",
        conversationId: "conversation-1",
        userId: user.id,
        role: MessageRole.USER,
        content: "Need billing help",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .mockResolvedValueOnce({
        id: "message-ai-1",
        conversationId: "conversation-1",
        userId: null,
        role: MessageRole.AI,
        content: "Here is the support answer",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    jest.spyOn(transactionClient.conversation, "update").mockResolvedValue({
      id: "conversation-1",
    } as never);

    jest.spyOn(ragService, "retrieve").mockReturnValue([
      {
        id: "support-billing-help",
        title: "Billing support",
        content: "Confirm billing period and payment status.",
        score: 4,
      },
    ]);

    jest.spyOn(modelService, "generateResponse").mockResolvedValue({
      content: "Here is the support answer",
      modelUsed: "gpt-4o-mini",
      fallbackUsed: false,
      responseTimeMs: 120,
    });

    jest.spyOn(logService, "createInteractionLog").mockResolvedValue(undefined as never);

    const result = await service.chat(user, {
      message: "Need billing help",
    });

    expect(result.conversationId).toBe("conversation-1");
    expect(result.agentType).toBe(AgentType.SUPPORT);
    expect(result.modelUsed).toBe("gpt-4o-mini");
    expect(result.message).toBe("Here is the support answer");
    expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
    expect(transactionClient.message.create).toHaveBeenCalledTimes(2);
    expect(transactionClient.conversation.update).toHaveBeenCalledTimes(1);
    expect(logService.createInteractionLog).toHaveBeenCalledTimes(1);
    expect(modelService.generateResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        systemPrompt: expect.stringContaining("Always respond in English"),
        prompt: expect.stringContaining("Always respond in English"),
      }),
    );
  });

  it("throws when conversation does not belong to user", async () => {
    jest.spyOn(agentService, "classifyIntent").mockReturnValue(AgentType.SUPPORT);
    jest.spyOn(prismaService.conversation, "findFirst").mockResolvedValue(null);

    await expect(
      service.chat(user, {
        message: "Need help",
        conversationId: "conversation-1",
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it("keeps existing conversation agent type stable", async () => {
    jest.spyOn(agentService, "classifyIntent").mockReturnValue(AgentType.SALES);
    jest.spyOn(agentService, "getAgent").mockReturnValue({
      type: AgentType.SALES,
      name: "Sales Agent",
      basePrompt: "Always respond in English. sales prompt",
      keywords: [],
    });

    jest.spyOn(prismaService.conversation, "findFirst").mockResolvedValue({
      id: "conversation-1",
      userId: user.id,
      agentType: AgentType.SUPPORT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    jest.spyOn(transactionClient.message, "create").mockResolvedValue({
      id: "message-1",
      conversationId: "conversation-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    jest.spyOn(transactionClient.conversation, "update").mockResolvedValue({
      id: "conversation-1",
    } as never);

    jest.spyOn(ragService, "retrieve").mockReturnValue([]);
    jest.spyOn(modelService, "generateResponse").mockResolvedValue({
      content: "Sales answer",
      modelUsed: "gpt-4o-mini",
      fallbackUsed: false,
      responseTimeMs: 120,
    });
    jest.spyOn(logService, "createInteractionLog").mockResolvedValue(undefined as never);

    await service.chat(user, {
      message: "Show pricing",
      conversationId: "conversation-1",
    });

    expect(prismaService.conversation.update).not.toHaveBeenCalled();
  });
});
