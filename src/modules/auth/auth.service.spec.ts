import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './../../data/schemas/user.schema';
import { AppConfig } from './../../config/app.config';
import { SessionRepository } from './../../data/repositories/session.repository';
import * as bcrypt from 'bcrypt';
import {
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let sessionRepository: SessionRepository;

  const mockUser = {
    _id: 'userId',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPass',
  };

  const mockJwtService = {
    sign: jest.fn(),
    decode: jest.fn(),
  };

  const mockSessionRepository = {
    createSession: jest.fn(),
    deleteSession: jest.fn(),
  };

  const mockAppConfig = {
    Config: {
      Auth: {
        Jwt: {
          Key: 'secret',
          AccessTokenExpiration: '1h',
          RefreshTokenExpiration: '7d',
        },
      },
    },
  };

  // ✅ Mock class for user model
  class MockUserModel {
    constructor(private data) {}

    save = jest.fn().mockResolvedValue(this.data);

    static findOne = jest.fn();
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: MockUserModel },
        { provide: JwtService, useValue: mockJwtService },
        { provide: AppConfig, useValue: mockAppConfig },
        { provide: SessionRepository, useValue: mockSessionRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    sessionRepository = module.get<SessionRepository>(SessionRepository);

    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should register a user successfully', async () => {
      (MockUserModel.findOne as jest.Mock).mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPass');

      const result = await service.signUp({
        email: 'test@example.com',
        password: 'pass',
        name: 'Test User',
      });

      expect(result.success).toBe(true);
      expect(result.data.email).toBe('test@example.com');
    });

    it('should throw conflict if user exists', async () => {
      (MockUserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        service.signUp({
          email: 'test@example.com',
          password: 'pass',
          name: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('signIn', () => {
    it('should sign in user with valid credentials', async () => {
      (MockUserModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      // Mock JWT methods
      (mockJwtService.sign as jest.Mock).mockReturnValue('token');
      (mockJwtService.decode as jest.Mock).mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      const result = await service.signIn({
        email: 'test@example.com',
        password: 'pass',
      });

      expect(result.success).toBe(true);
      expect(result.data.accessToken).toBe('token');
      expect(result.data.refreshToken).toBe('token');
      expect(sessionRepository.createSession).toHaveBeenCalled();
    });

    it('should throw unauthorized if user not found', async () => {
      (MockUserModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.signIn({
          email: 'wrong@example.com',
          password: 'pass',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw unauthorized if password does not match', async () => {
      (MockUserModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(
        service.signIn({
          email: 'test@example.com',
          password: 'wrongpass',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // Mock session deletion
      (mockSessionRepository.deleteSession as jest.Mock).mockResolvedValue({
        deletedCount: 1,
      });

      const result = await service.logout({
        email: 'test@example.com',
        sessionId: '123',
      });

      expect(result.success).toBe(true);
    });

    it('should throw if session not found', async () => {
      (mockSessionRepository.deleteSession as jest.Mock).mockResolvedValue({
        deletedCount: 0,
      });

      await expect(
        service.logout({
          email: 'test@example.com',
          sessionId: '123',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
