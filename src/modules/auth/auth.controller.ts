import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @ApiBody({ type: CreateUserDto })
  async signUp(@Body() dto: CreateUserDto) {
    return this.authService.signUp(dto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'User signed in successfully, tokens returned' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginUserDto })
  async signIn(@Body() dto: LoginUserDto) {
    return this.authService.signIn(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user and delete session' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized access or invalid session' })
  @ApiBody({ schema: {
    type: 'object',
    properties: {
      sessionId: { type: 'string', example: 'session-id-from-client' },
    },
    required: ['sessionId'],
  }})
  async logout(@Req() req, @Body('sessionId') sessionId: string) {
    const email = req.user.email; 
    return this.authService.logout({ email, sessionId });
  }

  
}
