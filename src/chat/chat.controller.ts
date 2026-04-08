import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ChatService } from "./chat.service";
import { ConversationDetailDto } from "./dto/conversation-detail.dto";
import { ConversationSummaryDto } from "./dto/conversation-summary.dto";
import { ChatResponseDto } from "./dto/chat-response.dto";
import { CreateChatRequestDto } from "./dto/create-chat-request.dto";

@ApiTags("chat")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("chat")
export class ChatController {
  constructor(@Inject(ChatService) private readonly chatService: ChatService) {}

  @Get("conversations")
  @ApiOperation({ summary: "List conversations for the authenticated user" })
  @ApiOkResponse({ type: [ConversationSummaryDto] })
  listConversations(@CurrentUser() user: AuthenticatedUser) {
    return this.chatService.listConversations(user);
  }

  @Get("conversations/:conversationId")
  @ApiOperation({ summary: "Get conversation detail for the authenticated user" })
  @ApiOkResponse({ type: ConversationDetailDto })
  getConversation(
    @CurrentUser() user: AuthenticatedUser,
    @Param("conversationId", new ParseUUIDPipe()) conversationId: string,
  ) {
    return this.chatService.getConversation(user, conversationId);
  }

  @Post()
  @ApiOperation({ summary: "Run full chat orchestration flow" })
  @ApiOkResponse({ type: ChatResponseDto })
  createChat(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateChatRequestDto,
  ) {
    return this.chatService.chat(user, input);
  }
}
