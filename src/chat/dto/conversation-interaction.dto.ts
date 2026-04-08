import { ApiProperty } from "@nestjs/swagger";
import { AgentType } from "@prisma/client";

export class ConversationInteractionDto {
  @ApiProperty({ enum: AgentType })
  agentType!: AgentType;

  @ApiProperty({ type: String })
  modelUsed!: string;

  @ApiProperty({ type: Boolean })
  fallbackUsed!: boolean;

  @ApiProperty({ type: Number })
  responseTimeMs!: number;

  @ApiProperty({ format: "date-time", type: String })
  createdAt!: string;
}
