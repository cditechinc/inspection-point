import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  Response,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from '../user/services/user.service';
import { ClientService } from '../client/client.service';
import * as qrcode from 'qrcode';

import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private clientService: ClientService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    console.log('Logged In User:', req.user);
    const user = req.user;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const gpsLocation = req.body.gpsLocation;

    const context = {
      ipAddress,
      userAgent,
      gpsLocation,
    };

    // Use the AuthService to handle login logic
    const loginResponse = await this.authService.login(user, context);

    return loginResponse;
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('client/login')
  async loginClient(
    @Body() body: { email: string; password: string; gpsLocation?: string },
    @Request() req,
  ) {
    const client = await this.clientService.findOneByEmail(body.email, {
      relations: ['user'],
    });
    console.log('Client:', client);
    if (
      !client ||
      !client.user ||
      !(await bcrypt.compare(body.password, client.user.password_hash))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const gpsLocation = body.gpsLocation;

    const context = {
      ipAddress,
      userAgent,
      gpsLocation,
    };

    // Use the AuthService to handle login logic
    const loginResponse = await this.authService.loginClient(client, context);

    return loginResponse;
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  async registerTwoFactorAuthentication(@Request() req) {
    const user = await this.userService.findById(req.user.id);
    const { otpauth_url } =
      this.authService.generateTwoFactorAuthenticationSecret(user);

    const qrCodeDataURL = await qrcode.toDataURL(otpauth_url);

    return {
      qrCode: qrCodeDataURL,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify')
  async verifyTwoFactorAuthentication(
    @Request() req,
    @Body() body: { code: string },
  ) {
    const user = await this.userService.findById(req.user.id);
    const isValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.code,
      user,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }
    // Update the user to enable 2FA
    await this.userService.update(user.id, { two_factor_enabled: true });
    return { message: '2FA verified successfully' };
  }

  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const userOrClient =
      await this.authService.verifyRefreshToken(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.generateTokens(userOrClient);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('employee')
  // @Post('employee')
  // getEmployeeResource(@Request() req) {
  //   return 'This is an employee resource';
  // }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('client')
  // @Post('client')
  // getClientResource(@Request() req) {
  //   return 'This is a client resource';
  // }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  // @Post('admin/register')
  // async registerAdmin(@Body() createUserDto: CreateUserDto) {
  //   if (createUserDto.role !== 'admin') {
  //     throw new UnauthorizedException('Only admin role can be created through this route');
  //   }
  //   return this.authService.register(createUserDto);
  // }
}
