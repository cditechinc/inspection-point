// auth.service.ts
import { ForbiddenException, forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { UserIP } from '../user/entities/user-ip.entity';
import { UserSession } from '../user/entities/user-session.entity';
import { Log } from '../logs/entities/log.entity';
import { ClientService } from '../client/client.service';
import { Client } from '../client/entities/client.entity';
import { JwtPayload } from './interface/jwt-payload.interface';
import { UserGroupPermissionService } from './../user-groups/services/user-group-permission.service';
import { UserGroupService } from './../user-groups/services/user-group.service';

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
    private readonly userGroupPermissionService: UserGroupPermissionService,
    private readonly userGroupService: UserGroupService,
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
        clientId: userOrClient.client?.id || null,
        iat: Math.floor(Date.now() / 1000),
      };
    } else if (userOrClient instanceof Client) {
      payload = {
        email: userOrClient.user.email,
        sub: userOrClient.user.id,
        role: userOrClient.user.role,
        clientId: userOrClient.id,
        iat: Math.floor(Date.now() / 1000),
      };
    }
  
    return this.jwtService.sign(payload);
  }
  

  async login(user: User, ipAddress: string, gpsLocation?: string) {
    const { accessToken, refreshToken } = await this.generateTokens(user);
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
      refresh_token: refreshToken,
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
    // Fetch the user entity based on the user ID to ensure proper type
    const user = await this.userService.findById(userId);
  
    
    const logEntry: DeepPartial<Log> = {
      action,
      logLevel: 'INFO', 
      details,
      timestamp: new Date(),
      user: user, 
    };
  
    const log = this.logRepository.create(logEntry);
    await this.logRepository.save(log);
  }

  async logClientAction(clientUserId: string, action: string, details: any) {
    // Fetch the user entity based on the client user's ID to ensure proper type
    const user = await this.userService.findById(clientUserId);
  
    // Create the log entry using a DeepPartial to ensure compatibility
    const logEntry: DeepPartial<Log> = {
      action,
      logLevel: 'INFO', // Adjust the log level if needed
      details,
      timestamp: new Date(),
      user: user, // Explicitly assign the user entity to the log entry
    };
  
    const log = this.logRepository.create(logEntry);
    await this.logRepository.save(log);
  }

  async saveQuickBooksTokens(
    clientId: string,
    accessToken: string,
    refreshToken: string,
    realmId: string,
  ): Promise<void> {
    const client = await this.clientService.findOne(clientId);
  
    if (!client) {
      throw new Error('Client not found');
    }
  
    const tokenExpirationDate = new Date(Date.now() + 3600 * 1000); // Assuming token expires in 1 hour
  
    console.log(`Saving QuickBooks tokens for client ${clientId}. Token expires at ${tokenExpirationDate.toISOString()}`);
  
    await this.clientService.update(clientId, {
      quickbooksAccessToken: accessToken,
      quickbooksRefreshToken: refreshToken,
      quickbooksRealmId: realmId,
      quickbooksTokenExpiresIn: tokenExpirationDate,
    });
  }

   // Generate both access and refresh tokens
   async generateTokens(userOrClient: User | Client): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.signToken(userOrClient);
    const refreshToken = await this.generateRefreshToken(userOrClient);

    return { accessToken, refreshToken };
  }

  // Sign a new refresh token (with a longer expiration time)
  async generateRefreshToken(userOrClient: User | Client): Promise<string> {
    let payload: JwtPayload;

    if (userOrClient instanceof User) {
      payload = {
        email: userOrClient.email,
        sub: userOrClient.id,
        role: userOrClient.role,
        clientId: userOrClient.client?.id,
      };
    } else {
      payload = {
        email: userOrClient.user.email,
        sub: userOrClient.user.id,
        role: userOrClient.user.role,
        clientId: userOrClient.id,
      };
    }

    // Set refresh token expiration time (e.g., 7 days)
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  // Verify the refresh token
  async verifyRefreshToken(refreshToken: string): Promise<User | Client> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      let userOrClient;
      
      // Check if the token is for a user or a client
      if (payload.clientId) {
        userOrClient = await this.clientService.findOne(payload.clientId);
      } else {
        userOrClient = await this.userService.findById(payload.sub);
      }
      
      if (!userOrClient) {
        throw new UnauthorizedException('Invalid refresh token');
      }
  
      return userOrClient;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
  
  // Method to check if user has permission to access a specific resource
  async checkUserPermissions(userId: string, resource: string, action: string): Promise<boolean> {
    // Step 1: Find the user by ID
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Step 2: Get all the groups the user belongs to
    const userGroups = await this.userGroupService.getUserGroups(user.id);

    // Step 3: Retrieve permissions for each group and check if any group has the required permission
    for (const group of userGroups) {
      const groupPermissions = await this.userGroupPermissionService.getGroupPermissions(group.id);

      for (const permission of groupPermissions) {
        const [resourceName, actionName] = permission.permissionName.split('_');
        
        // Step 4: Check if the resource and action match
        if (resourceName === resource && actionName === action) {
          return true; // User has the required permission
        }
      }
    }

    return false; // User doesn't have the required permission
  }
  
}
