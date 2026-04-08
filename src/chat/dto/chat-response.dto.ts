import { ApiProperty } from "@nestjs/swagger";
import { AgentType } from "@prisma/client";

export class ChatContextItemDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  title!: string;

  @ApiProperty({ type: String })
  content!: string;

  @ApiProperty({ type: Number })
  score!: number;
}

export class ChatResponseDto {
  @ApiProperty({ type: String })
  conversationId!: string;

  @ApiProperty({ enum: AgentType })
  agentType!: AgentType;

  @ApiProperty({ type: String })
  modelUsed!: string;

  @ApiProperty({ type: Boolean })
  fallbackUsed!: boolean;

  @ApiProperty({ type: Number })
  responseTimeMs!: number;

  @ApiProperty({ type: String })
  message!: string;

  @ApiProperty({ type: () => [ChatContextItemDto] })
  context!: ChatContextItemDto[];
}
