// auth.service.ts
import { ForbiddenException, forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './../user/services/user.service';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import * as useragent from 'useragent';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { UserIP } from '../user/entities/user-ip.entity';
import { UserSession } from '../user/entities/user-session.entity';
import { Logs } from '../logs/entities/log.entity';
import { ClientService } from '../client/client.service';
import { Client } from '../client/entities/client.entity';
import { JwtPayload } from './interface/jwt-payload.interface';
import { UserGroupPermissionService } from './../user-groups/services/user-group-permission.service';
import { UserGroupService } from './../user-groups/services/user-group.service';
import { IpGeolocationService } from './../common/services/ip-geolocation.service';

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
    @InjectRepository(Logs)
    private logRepository: Repository<Logs>,
    private readonly userGroupPermissionService: UserGroupPermissionService,
    private readonly userGroupService: UserGroupService,
    private readonly ipGeolocationService: IpGeolocationService,
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

    if (this.isUser(userOrClient)) {
      const user = userOrClient;
      payload = {
        email: user.email,
        sub: user.id,
        role: user.role,
        clientId: user.client?.id || null,
        iat: Math.floor(Date.now() / 1000),
      };
    } else if (this.isClient(userOrClient)) {
      const client = userOrClient;
      payload = {
        email: client.user.email,
        sub: client.user.id,
        role: client.user.role,
        clientId: client.id,
        iat: Math.floor(Date.now() / 1000),
      };
    } else {
      console.error('Invalid user or client object:', userOrClient);
      throw new Error('Invalid user or client object');
    }

    return this.jwtService.sign(payload);
  }
  
  async login(user: User, context: any) {
    const { ipAddress, userAgent, gpsLocation } = context;
    const { accessToken, refreshToken } = await this.generateTokens(user);
    const sessionToken = await this.createSession(user, ipAddress, userAgent, gpsLocation);

    // Update the user's last login details
    await this.userService.update(user.id, {
      last_login: new Date(),
      last_login_ip: ipAddress,
      last_gps_location: gpsLocation,
    });

    // Record the user's IP address
    await this.recordUserIP(user.id, ipAddress);

    // Log the login action
    await this.logAction(user.id, 'user_login', { ipAddress, logLevel: 'INFO', details: `User login for email: ${user.email}` });


    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      session_token: sessionToken,
      user,
    };
  }

  async loginClient(client: Client, context: any) {
    const { ipAddress, userAgent, gpsLocation } = context;

    const { accessToken, refreshToken } = await this.generateTokens(client);
    const sessionToken = await this.createClientSession(client, ipAddress, userAgent, gpsLocation);

    // Update the client's last login details
    await this.userService.update(client.user.id, {
      last_login: new Date(),
      last_login_ip: ipAddress,
      last_gps_location: gpsLocation,
    });

    // Record the client's IP address
    await this.recordClientIP(client.user.id, ipAddress);

    // Log the login action
    await this.logClientAction(client.user.id, 'client_login', { ipAddress, logLevel: 'INFO', details: `Client login for email: ${client.user.email}` });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      session_token: sessionToken,
      client,
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

  // Modified createSession method to capture enhanced session details
  async createSession(user: User, ipAddress: string, userAgent: string, gpsLocation?: string): Promise<string> {
    const sessionToken = this.jwtService.sign({ userId: user.id, ipAddress });
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1-hour expiration

    const ipType = this.getIpType(ipAddress);
    const deviceType = this.getDeviceType(userAgent);
    const browserType = this.getBrowserType(userAgent);
    const ipLocation = await this.getIpLocation(ipAddress);

    const session = this.userSessionRepository.create({
      user,
      ip_address: ipAddress,
      ip_type: ipType,
      device_type: deviceType,
      browser_type: browserType,
      gps_location: gpsLocation,
      ip_location: ipLocation,
      session_token: sessionToken,
      expires_at: expiresAt,
    });
    await this.userSessionRepository.save(session);
    return sessionToken;
  }

  // async createClientSession(
  //   client: Client,
  //   ipAddress: string,
  // ): Promise<string> {
  //   const sessionToken = this.jwtService.sign({
  //     clientId: client.id,
  //     ipAddress,
  //   });
  //   const expiresAt = new Date(new Date().getTime() + 60 * 60 * 1000); // 1 hour expiration
  //   const session = this.userSessionRepository.create({
  //     user: { id: client.user.id } as User, // Ensure UserSession can accommodate clients
  //     ip_address: ipAddress,
  //     session_token: sessionToken,
  //     expires_at: expiresAt,
  //   });
  //   await this.userSessionRepository.save(session);
  //   return sessionToken;
  // }

  // Modified createClientSession method to capture enhanced session details
  async createClientSession(client: Client, ipAddress: string, userAgent: string, gpsLocation?: string): Promise<string> {
    const sessionToken = this.jwtService.sign({ clientId: client.id, ipAddress });
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1-hour expiration

    const ipType = this.getIpType(ipAddress);
    const deviceType = this.getDeviceType(userAgent);
    const browserType = this.getBrowserType(userAgent);
    const ipLocation = await this.getIpLocation(ipAddress);

    const session = this.userSessionRepository.create({
      user: { id: client.user.id } as User,
      ip_address: ipAddress,
      ip_type: ipType,
      device_type: deviceType,
      browser_type: browserType,
      gps_location: gpsLocation,
      ip_location: ipLocation,
      session_token: sessionToken,
      expires_at: expiresAt,
    });
    await this.userSessionRepository.save(session);
    return sessionToken;
  }

  // Helper method to determine IP type
  getIpType(ipAddress: string): string {
    return ipAddress.includes(':') ? 'IPv6' : 'IPv4';
  }

  // Helper method to determine device type from user agent
  getDeviceType(userAgentString: string): string {
    const agent = useragent.parse(userAgentString);
    if (agent.device.family === 'Other') {
      return 'Desktop';
    }
    return agent.device.family;
  }

  // Helper method to determine browser type from user agent
  getBrowserType(userAgentString: string): string {
    const agent = useragent.parse(userAgentString);
    return agent.toAgent();
  }

  // Helper method to get IP location using a geolocation service
  async getIpLocation(ipAddress: string): Promise<string> {
    return await this.ipGeolocationService.getLocation(ipAddress);
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
  
    
    const logEntry: DeepPartial<Logs> = {
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
    const logEntry: DeepPartial<Logs> = {
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
  
    if (this.isUser(userOrClient)) {
      const user = userOrClient;
      payload = {
        email: user.email,
        sub: user.id,
        role: user.role,
        clientId: user.client?.id || null,
      };
    } else if (this.isClient(userOrClient)) {
      const client = userOrClient;
      payload = {
        email: client.user.email,
        sub: client.user.id,
        role: client.user.role,
        clientId: client.id,
      };
    } else {
      console.error('Invalid user or client object in generateRefreshToken:', userOrClient);
      throw new Error('Invalid user or client object in generateRefreshToken');
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

  // Type Guard Functions
  private isUser(obj: any): obj is User {
    return obj && typeof obj.email === 'string' && !('user' in obj);
  }

  private isClient(obj: any): obj is Client {
    return obj && obj.user && typeof obj.user.email === 'string';
  }
}
