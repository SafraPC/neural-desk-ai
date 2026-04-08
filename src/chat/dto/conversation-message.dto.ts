import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MessageRole } from "@prisma/client";
import { ConversationInteractionDto } from "./conversation-interaction.dto";

export class ConversationMessageDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ enum: MessageRole })
  role!: MessageRole;

  @ApiProperty({ type: String })
  content!: string;

  @ApiProperty({ format: "date-time", type: String })
  createdAt!: string;

  @ApiPropertyOptional({ type: () => ConversationInteractionDto })
  interaction?: ConversationInteractionDto;
}
