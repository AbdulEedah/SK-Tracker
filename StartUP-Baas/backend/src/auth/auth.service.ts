import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      type: 'access',
    };

    await this.usersService.setLastLogin(user.id);

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '30d',
      },
    );

    await this.refreshTokenRepo.save({
      user_id: user.id,
      token_hash: await bcrypt.hash(refreshToken, 10),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
        token: accessToken,
        refresh_token: refreshToken,
      },
    };
  }

  async signup(data: any) {
    const existing = await this.usersService.findByEmail(data.email);
    if (existing) {
      throw new BadRequestException('User already exists');
    }

    const saltRounds = parseInt(
      this.configService.get<string>('BCRYPT_ROUNDS') || '12',
      10,
    );
    const password_hash = await bcrypt.hash(data.password, saltRounds);

    const user = await this.usersService.create({
      email: data.email,
      full_name: data.name, // Map 'name' to 'full_name'
      phone_number: data.phone_number,
      password_hash,
      role: data.role || 'member',
    });

    return this.login(user);
  }

  async logout(userId: string) {
    await this.refreshTokenRepo.update(
      { user_id: userId },
      { is_revoked: true },
    );
    return { success: true };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const dbTokens = await this.refreshTokenRepo.find({
        where: { user_id: decoded.sub, is_revoked: false },
      });
      let validDbToken = null;
      for (const t of dbTokens) {
        if (await bcrypt.compare(refreshToken, t.token_hash)) {
          validDbToken = t;
          break;
        }
      }

      if (!validDbToken || validDbToken.expires_at < new Date()) {
        throw new UnauthorizedException('Refresh token invalid or expired');
      }

      const user = await this.usersService.findById(decoded.sub);
      if (!user || !user.is_active) {
        throw new UnauthorizedException('User is inactive');
      }

      const payload = {
        email: user.email,
        sub: user.id,
        role: user.role,
        type: 'access',
      };
      const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });

      return {
        success: true,
        data: { token: accessToken },
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.usersService.findById(userId);
    if (!(await bcrypt.compare(currentPass, user.password_hash))) {
      throw new BadRequestException('Invalid current password');
    }

    const saltRounds = parseInt(
      this.configService.get<string>('BCRYPT_ROUNDS') || '12',
      10,
    );
    const password_hash = await bcrypt.hash(newPass, saltRounds);
    await this.usersService.update(userId, { password_hash });

    return {
      success: true,
      data: { message: 'Password updated successfully' },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Security: don't reveal if email exists
      return {
        success: true,
        data: { message: 'If email exists, password reset link has been sent' },
      };
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'password-reset', email: user.email },
      { secret: this.configService.get<string>('JWT_SECRET'), expiresIn: '1h' },
    );

    // TODO: Send email with reset link
    // const resetLink = `${this.configService.get('FRONTEND_URL')}/auth/reset-password?token=${resetToken}`;
    // await emailService.sendPasswordResetEmail(user.email, resetLink);

    return {
      success: true,
      data: { message: 'If email exists, password reset link has been sent' },
    };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (decoded.type !== 'password-reset') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.usersService.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const saltRounds = parseInt(
        this.configService.get<string>('BCRYPT_ROUNDS') || '12',
        10,
      );
      const password_hash = await bcrypt.hash(newPassword, saltRounds);
      await this.usersService.update(user.id, { password_hash });

      return {
        success: true,
        data: { message: 'Password has been reset successfully' },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  async verifyEmail(token: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (decoded.type !== 'email-verification') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.usersService.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      await this.usersService.update(user.id, { email_verified: true });

      return {
        success: true,
        data: { message: 'Email verified successfully' },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Security: don't reveal if email exists
      return {
        success: true,
        data: { message: 'If email exists, verification email has been sent' },
      };
    }

    if (user.email_verified) {
      return { success: true, data: { message: 'Email already verified' } };
    }

    // Generate verification token (valid for 24 hours)
    const verificationToken = this.jwtService.sign(
      { sub: user.id, type: 'email-verification', email: user.email },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '24h',
      },
    );

    // TODO: Send email with verification link
    // const verificationLink = `${this.configService.get('FRONTEND_URL')}/auth/verify-email?token=${verificationToken}`;
    // await emailService.sendVerificationEmail(user.email, verificationLink);

    return {
      success: true,
      data: { message: 'If email exists, verification email has been sent' },
    };
  }
}
