import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AgentType, InteractionLog, MessageRole, Prisma } from "@prisma/client";
import { AgentService } from "../agent/agent.service";
import { AuthenticatedUser } from "../auth/auth.types";
import { LogService } from "../log/log.service";
import { ModelService } from "../model/model.service";
import { PrismaService } from "../prisma/prisma.service";
import { RetrievedContextItem } from "../rag/rag.types";
import { RagService } from "../rag/rag.service";
import { ConversationDetailDto } from "./dto/conversation-detail.dto";
import { ConversationInteractionDto } from "./dto/conversation-interaction.dto";
import { ConversationSummaryDto } from "./dto/conversation-summary.dto";
import { CreateChatRequestDto } from "./dto/create-chat-request.dto";
import { ChatResponseDto } from "./dto/chat-response.dto";

@Injectable()
export class ChatService {
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService,
    @Inject(AgentService) private readonly agentService: AgentService,
    @Inject(RagService) private readonly ragService: RagService,
    @Inject(ModelService) private readonly modelService: ModelService,
    @Inject(LogService) private readonly logService: LogService,
  ) {}

  async chat(user: AuthenticatedUser, input: CreateChatRequestDto): Promise<ChatResponseDto> {
    const agentType = this.agentService.classifyIntent(input.message);
    const conversation = await this.resolveConversation(user.id, input.conversationId, agentType);
    const agent = this.agentService.getAgent(agentType);
    const context = this.ragService.retrieve(agentType, input.message);
    const prompt = this.buildPrompt(input.message, context);
    const modelResult = await this.modelService.generateResponse({
      agentType,
      systemPrompt: agent.basePrompt,
      prompt,
      context,
    });
    await this.persistConversationTurn({
      conversationId: conversation.id,
      userId: user.id,
      userMessage: input.message,
      aiMessage: modelResult.content,
      agentType,
      context,
      modelUsed: modelResult.modelUsed,
      fallbackUsed: modelResult.fallbackUsed,
      responseTimeMs: modelResult.responseTimeMs,
    });

    return {
      conversationId: conversation.id,
      agentType,
      modelUsed: modelResult.modelUsed,
      fallbackUsed: modelResult.fallbackUsed,
      responseTimeMs: modelResult.responseTimeMs,
      message: modelResult.content,
      context,
    };
  }

  async listConversations(user: AuthenticatedUser): Promise<ConversationSummaryDto[]> {
    const conversations = await this.prismaService.conversation.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        logs: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    return conversations.map((conversation) => ({
      id: conversation.id,
      agentType: conversation.logs[0]?.agentType ?? conversation.agentType,
      updatedAt: this.serializeDate(conversation.updatedAt),
      latestMessagePreview: conversation.messages[0]?.content,
      latestMessageRole: conversation.messages[0]?.role,
      latestInteraction: this.mapInteraction(conversation.logs[0]),
    }));
  }

  async getConversation(user: AuthenticatedUser, conversationId: string): Promise<ConversationDetailDto> {
    const conversation = await this.prismaService.conversation.findFirst({
      where: {
        id: conversationId,
        userId: user.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            logs: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        },
        logs: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    return {
      id: conversation.id,
      agentType: conversation.logs[0]?.agentType ?? conversation.agentType,
      createdAt: this.serializeDate(conversation.createdAt),
      updatedAt: this.serializeDate(conversation.updatedAt),
      messages: conversation.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: this.serializeDate(message.createdAt),
        interaction: this.mapInteraction(message.logs[0]),
      })),
      latestInteraction: this.mapInteraction(conversation.logs[0]),
    };
  }

  private async resolveConversation(userId: string, conversationId: string | undefined, agentType: AgentType) {
    if (!conversationId) {
      return this.prismaService.conversation.create({
        data: {
          userId,
          agentType,
        },
      });
    }

    const conversation = await this.prismaService.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    return conversation;
  }

  private buildPrompt(message: string, context: Array<{ title: string; content: string }>): string {
    const contextBlock =
      context.length > 0
        ? context.map((item) => `${item.title}: ${item.content}`).join("\n")
        : "No relevant local context found.";

    return [
      "Response rules:",
      "- Always respond in English.",
      "- Keep the answer in English even if the user writes in another language.",
      "",
      `User message: ${message}`,
      `Relevant context:\n${contextBlock}`,
    ].join("\n");
  }

  private async persistConversationTurn(input: {
    conversationId: string;
    userId: string;
    userMessage: string;
    aiMessage: string;
    agentType: AgentType;
    context: RetrievedContextItem[];
    modelUsed: string;
    fallbackUsed: boolean;
    responseTimeMs: number;
  }) {
    await this.prismaService.$transaction(async (transactionClient) => {
      await transactionClient.message.create({
        data: {
          conversationId: input.conversationId,
          userId: input.userId,
          role: MessageRole.USER,
          content: input.userMessage,
        },
      });

      const assistantMessage = await transactionClient.message.create({
        data: {
          conversationId: input.conversationId,
          role: MessageRole.AI,
          content: input.aiMessage,
        },
      });

      await this.logService.createInteractionLog(
        {
          conversationId: input.conversationId,
          messageId: assistantMessage.id,
          agentType: input.agentType,
          modelUsed: input.modelUsed,
          fallbackUsed: input.fallbackUsed,
          responseTimeMs: input.responseTimeMs,
          inputText: input.userMessage,
          outputText: input.aiMessage,
          retrievedContext: this.toRetrievedContext(input.context),
        },
        transactionClient,
      );

      await transactionClient.conversation.update({
        where: {
          id: input.conversationId,
        },
        data: {
          updatedAt: new Date(),
        },
      });
    });
  }

  private mapInteraction(log?: InteractionLog): ConversationInteractionDto | undefined {
    if (!log) {
      return undefined;
    }

    return {
      agentType: log.agentType,
      modelUsed: log.modelUsed,
      fallbackUsed: log.fallbackUsed,
      responseTimeMs: log.responseTimeMs,
      createdAt: this.serializeDate(log.createdAt),
    };
  }

  private serializeDate(value: Date) {
    return value.toISOString();
  }

  private toRetrievedContext(context: RetrievedContextItem[]): Prisma.InputJsonValue | undefined {
    if (context.length === 0) {
      return undefined;
    }

    return context.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      score: item.score,
    }));
  }
}
