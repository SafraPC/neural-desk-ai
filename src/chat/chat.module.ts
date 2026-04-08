import { Module } from "@nestjs/common";
import { AgentModule } from "../agent/agent.module";
import { AuthModule } from "../auth/auth.module";
import { LogModule } from "../log/log.module";
import { ModelModule } from "../model/model.module";
import { PrismaModule } from "../prisma/prisma.module";
import { RagModule } from "../rag/rag.module";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";

@Module({
  imports: [PrismaModule, AuthModule, AgentModule, RagModule, ModelModule, LogModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
