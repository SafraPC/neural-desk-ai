import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreateChatRequestDto {
  @ApiProperty({ example: "I need help with a billing issue." })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  message!: string;

  @ApiPropertyOptional({
    example: "9b2a8485-c964-4414-82d8-29c1ee5cc42e",
  })
  @IsOptional()
  @IsUUID()
  conversationId?: string;
}
