import { Body, Controller, Inject, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { LoginResponseDto } from "./dto/login-response.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post("login")
  @ApiOperation({ summary: "Authenticate user and return JWT" })
  @ApiOkResponse({ type: LoginResponseDto })
  login(@Body() input: LoginDto) {
    return this.authService.login(input);
  }
}
