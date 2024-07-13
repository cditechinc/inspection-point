import { Controller, Request, Post, UseGuards, Body, Response, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    return this.authService.login(req.user, ipAddress);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  async registerTwoFactorAuthentication(@Request() req, @Response() res) {
    const user = await this.userService.findById(req.user.id);
    const { otpauth_url } = this.authService.generateTwoFactorAuthenticationSecret(user);
    return this.authService.pipeQrCodeStream(res, otpauth_url);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify')
  async verifyTwoFactorAuthentication(@Request() req, @Body() body) {
    const user = await this.userService.findById(req.user.id);
    const isValid = this.authService.isTwoFactorAuthenticationCodeValid(body.code, user);
    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }
    return { message: '2FA verified successfully' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employee')
  @Post('employee')
  getEmployeeResource(@Request() req) {
    return 'This is an employee resource';
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @Post('client')
  getClientResource(@Request() req) {
    return 'This is a client resource';
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admin/register')
  async registerAdmin(@Body() createUserDto: CreateUserDto) {
    if (createUserDto.role !== 'admin') {
      throw new UnauthorizedException('Only admin role can be created through this route');
    }
    return this.authService.register(createUserDto);
  }
}
