import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './../../data/schemas/user.schema';
import { AppConfig } from './../../config/app.config';
import { SessionRepository } from './../../data/repositories/session.repository';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly appConfig: AppConfig,
    private readonly sessionRepository: SessionRepository,
  ) {}

  private async validateUser(dto: LoginUserDto): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async signUp(dto: CreateUserDto) {
    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (existingUser) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({ ...dto, password: hashedPassword });
    await user.save();

    return {
      success: true,
      message: 'User registered successfully',
      data: { email: user.email, name: user.name },
    };
  }

  async signIn(dto: LoginUserDto) {
    const user = await this.validateUser(dto);
    const sessionId = uuidv4();

    const [accessToken, refreshToken] = [
      this.getSignedToken(user.email, sessionId, this.appConfig.Config.Auth.Jwt.AccessTokenExpiration),
      this.getSignedToken(user.email, sessionId, this.appConfig.Config.Auth.Jwt.RefreshTokenExpiration),
    ];

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const decodedRefreshToken = this.jwtService.decode(refreshToken);
    const expiresAt = new Date((decodedRefreshToken as any)?.exp * 1000);

    await this.sessionRepository.createSession({
      email: user.email,
      refreshToken: hashedRefreshToken,
      sessionId,
      expiresAt,
    });

    return {
      success: true,
      message: 'Logged in successfully',
      data: {
        currentUser: {
          email: user.email,
          name: user.name,
        },
        accessToken,
        refreshToken,
        sessionId,
      },
    };
  }

  async logout(session: { email: string; sessionId: string }) {
    const result = await this.sessionRepository.deleteSession(session);

    if (result.deletedCount > 0) {
      return { success: true, message: 'Logged out successfully' };
    }

    throw new NotFoundException('Session not found or already logged out');
  }


  private getSignedToken(email: string, sessionId: string, expiresIn: string) {

    return this.jwtService.sign(
      { email, sessionId },
      {
        algorithm: 'HS512',
        secret: this.appConfig.Config.Auth.Jwt.Key,
        expiresIn,
      },
    );
  }

 
}
