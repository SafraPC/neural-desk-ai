import { Inject, Injectable } from "@nestjs/common";
import { InteractionLog, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInteractionLogInput } from "./log.types";

@Injectable()
export class LogService {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  createInteractionLog(
    input: CreateInteractionLogInput,
    prismaClient: Pick<Prisma.TransactionClient, "interactionLog"> | PrismaService = this.prismaService,
  ): Promise<InteractionLog> {
    return prismaClient.interactionLog.create({
      data: {
        conversationId: input.conversationId,
        messageId: input.messageId,
        agentType: input.agentType,
        modelUsed: input.modelUsed,
        fallbackUsed: input.fallbackUsed,
        responseTimeMs: input.responseTimeMs,
        inputText: input.inputText,
        outputText: input.outputText,
        retrievedContext: input.retrievedContext,
      },
    });
  }
}
