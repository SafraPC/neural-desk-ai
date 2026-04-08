import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AgentModule } from "./agent/agent.module";
import { AuthModule } from "./auth/auth.module";
import { ChatModule } from "./chat/chat.module";
import { LogModule } from "./log/log.module";
import { ModelModule } from "./model/model.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RagModule } from "./rag/rag.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    AgentModule,
    RagModule,
    ModelModule,
    LogModule,
    ChatModule,
  ],
})
export class AppModule {}
