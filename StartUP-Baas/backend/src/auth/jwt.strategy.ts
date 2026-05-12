import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // We can also verify if the user still exists or is active
    const user = await this.usersService
      .findById(payload.sub)
      .catch(() => null);
    if (!user || user.is_active === false) {
      throw new UnauthorizedException('User is blocked or deleted');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
