import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: any): Promise<any> {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  async login(@Body() loginDto: any): Promise<any> {
    const user = await this.authService.validateUser(
      loginDto.email as string,
      loginDto.password as string,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req: any): Promise<any> {
    return this.authService.logout(req.user.sub as string);
  }

  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string): Promise<any> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }
    return this.authService.refresh(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req: any, @Body() body: any): Promise<any> {
    return this.authService.changePassword(
      req.user.sub as string,
      body.current_password as string,
      body.new_password as string,
    );
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string): Promise<any> {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: { token: string; new_password: string },
  ): Promise<any> {
    return this.authService.resetPassword(body.token, body.new_password);
  }

  @Post('verify-email')
  async verifyEmail(@Body('token') token: string): Promise<any> {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  async resendVerification(@Body('email') email: string): Promise<any> {
    return this.authService.resendVerificationEmail(email);
  }
}
