import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, JwtFromRequestFunction } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from './../interface/jwt-payload.interface';
import { CustomUser } from './../interface/custom-user.interface';

const extractJwtFromCookie: JwtFromRequestFunction = request => {
  if (request && request.signedCookies) {
    return request.signedCookies['token'];
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractJwtFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<CustomUser> {
    const user = await this.authService.verifyPayload(payload);
    return {
      id: user.id,
      email: user.email,
      role: payload.role, // Use role from payload
      clientId: payload.clientId, // Use clientId from payload
    };
  }
}