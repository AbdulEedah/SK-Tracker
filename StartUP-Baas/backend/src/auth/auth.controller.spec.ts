import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  createMockRepository,
  createMockJwtService,
  createMockConfigService,
} from '../test/test-utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: createMockJwtService(),
        },
        {
          provide: ConfigService,
          useValue: createMockConfigService(),
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
