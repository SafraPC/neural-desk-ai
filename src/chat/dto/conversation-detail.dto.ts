import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AgentType } from "@prisma/client";
import { ConversationInteractionDto } from "./conversation-interaction.dto";
import { ConversationMessageDto } from "./conversation-message.dto";

export class ConversationDetailDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ enum: AgentType })
  agentType!: AgentType;

  @ApiProperty({ format: "date-time", type: String })
  createdAt!: string;

  @ApiProperty({ format: "date-time", type: String })
  updatedAt!: string;

  @ApiProperty({ type: () => [ConversationMessageDto] })
  messages!: ConversationMessageDto[];

  @ApiPropertyOptional({ type: () => ConversationInteractionDto })
  latestInteraction?: ConversationInteractionDto;
}
