import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { LogService } from "./log.service";

@Module({
  imports: [PrismaModule],
  providers: [LogService],
  exports: [LogService],
})
export class LogModule {}
