// auth.service.ts
import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserIP } from '../user/entities/user-ip.entity';
import { UserSession } from '../user/entities/user-session.entity';
import { Log } from '../user/entities/log.entity';
import { ClientService } from '../client/client.service';
import { Client } from '../client/entities/client.entity';
import { JwtPayload } from './interface/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    @Inject(forwardRef(() => ClientService))
    private clientService: ClientService,
    private jwtService: JwtService,
    @InjectRepository(UserIP)
    private userIPRepository: Repository<UserIP>,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
  ) {}

  async verifyPayload(payload: JwtPayload): Promise<User> {
    const { sub: userId } = payload;
    const user = await this.userService.findById(userId, { relations: ['client'] });
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email, { relations: ['client'] });
    if (user && await bcrypt.compare(pass, user.password_hash)) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async signToken(userOrClient: User | Client): Promise<string> {
    let payload: JwtPayload;

    if (userOrClient instanceof User) {
      payload = {
        email: userOrClient.email,
        sub: userOrClient.id,
        role: userOrClient.role,
        clientId: userOrClient.client?.id,
        iat: Math.floor(Date.now() / 1000),
        // exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
      };
    } else {
      payload = {
        email: userOrClient.user.email,
        sub: userOrClient.user.id,
        role: userOrClient.user.role,
        clientId: userOrClient.id,
        iat: Math.floor(Date.now() / 1000),
        // exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
      };
    }

    return this.jwtService.sign(payload);
  }

  async login(user: User, ipAddress: string, gpsLocation?: string) {
    const accessToken = await this.signToken(user);
    const sessionToken = await this.createSession(user, ipAddress);

    // Update the user's last login details
    await this.userService.update(user.id, {
      last_login: new Date(),
      last_login_ip: ipAddress,
      last_gps_location: gpsLocation,
    });

    // Record the user's IP address
    await this.recordUserIP(user.id, ipAddress);

    // Log the login action
    await this.logAction(user.id, 'login', { ipAddress });

    return {
      access_token: accessToken,
      session_token: sessionToken,
      user,
    };
  }

  async register(userDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userDto.password, salt);
    const user = await this.userService.create({
      ...userDto,
      password_hash: hashedPassword,
    });

    // Log the registration action
    await this.logAction(user.id, 'register', { email: userDto.email });

    return user;
  }

  generateJwtToken(payload: any): string {
    return this.jwtService.sign(payload);
  }

  generateTwoFactorAuthenticationSecret(user: User) {
    const secret = speakeasy.generateSecret({
      name: `InspectionPointApp (${user.email})`,
    });

    user.two_factor_authentication_secret = secret.base32;
    this.userService.update(user.id, {
      two_factor_authentication_secret: secret.base32,
    });

    return {
      secret: secret.base32,
      otpauth_url: secret.otpauth_url,
    };
  }

  async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return qrcode.toFileStream(stream, otpauthUrl);
  }

  isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: User,
  ) {
    return speakeasy.totp.verify({
      secret: user.two_factor_authentication_secret,
      encoding: 'base32',
      token: twoFactorAuthenticationCode,
    });
  }

  async createSession(user: User, ipAddress: string): Promise<string> {
    const sessionToken = this.jwtService.sign({ userId: user.id, ipAddress });
    const expiresAt = new Date(new Date().getTime() + 60 * 60 * 1000); // 1 hour expiration
    const session = this.userSessionRepository.create({
      user,
      ip_address: ipAddress,
      session_token: sessionToken,
      expires_at: expiresAt,
    });
    await this.userSessionRepository.save(session);
    return sessionToken;
  }

  async createClientSession(
    client: Client,
    ipAddress: string,
  ): Promise<string> {
    const sessionToken = this.jwtService.sign({
      clientId: client.id,
      ipAddress,
    });
    const expiresAt = new Date(new Date().getTime() + 60 * 60 * 1000); // 1 hour expiration
    const session = this.userSessionRepository.create({
      user: { id: client.user.id } as User, // Ensure UserSession can accommodate clients
      ip_address: ipAddress,
      session_token: sessionToken,
      expires_at: expiresAt,
    });
    await this.userSessionRepository.save(session);
    return sessionToken;
  }

  async validateSession(token: string, ipAddress: string): Promise<User> {
    const session = await this.userSessionRepository.findOne({
      where: { session_token: token },
      relations: ['user'],
    });
    if (
      !session ||
      session.ip_address !== ipAddress ||
      new Date() > session.expires_at
    ) {
      throw new UnauthorizedException('Invalid session or IP address mismatch');
    }
    return session.user;
  }

  async recordUserIP(userId: string, ipAddress: string) {
    const userIP = this.userIPRepository.create({
      user: { id: userId } as User,
      ip_address: ipAddress,
    });
    await this.userIPRepository.save(userIP);
  }

  async recordClientIP(userId: string, ipAddress: string) {
    const userIP = this.userIPRepository.create({
      user: { id: userId } as User,
      ip_address: ipAddress,
    });
    await this.userIPRepository.save(userIP);
  }

  async logAction(userId: string, action: string, details: any) {
    const log = this.logRepository.create({
      user: { id: userId } as User,
      action,
      details,
    });
    await this.logRepository.save(log);
  }

  async logClientAction(userId: string, action: string, details: any) {
    const log = this.logRepository.create({
      user: { id: userId } as User,
      action,
      details,
    });
    await this.logRepository.save(log);
  }

  async saveQuickBooksTokens(clientId: string, accessToken: string, refreshToken: string, realmId: string): Promise<void> {
    const client = await this.clientService.findOne(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    await this.clientService.update(clientId, {
      quickbooksAccessToken: accessToken,
      quickbooksRefreshToken: refreshToken,
      quickbooksRealmId: realmId,
      quickbooksTokenExpiresIn: new Date(Date.now() + 3600 * 1000), // Assuming token expires in 1 hour
    });
  }
  
}
