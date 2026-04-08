import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AgentType, MessageRole } from "@prisma/client";
import { ConversationInteractionDto } from "./conversation-interaction.dto";

export class ConversationSummaryDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ enum: AgentType })
  agentType!: AgentType;

  @ApiProperty({ format: "date-time", type: String })
  updatedAt!: string;

  @ApiPropertyOptional({ type: String })
  latestMessagePreview?: string;

  @ApiPropertyOptional({ enum: MessageRole })
  latestMessageRole?: MessageRole;

  @ApiPropertyOptional({ type: () => ConversationInteractionDto })
  latestInteraction?: ConversationInteractionDto;
}
