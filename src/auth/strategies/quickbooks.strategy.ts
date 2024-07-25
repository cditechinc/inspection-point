import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QuickBooksStrategy extends PassportStrategy(Strategy, 'quickbooks') {
  constructor(private readonly configService: ConfigService) {
    super({
      authorizationURL: 'https://appcenter.intuit.com/connect/oauth2',
      tokenURL: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      clientID: configService.get('QUICKBOOKS_CLIENT_ID'),
      clientSecret: configService.get('QUICKBOOKS_CLIENT_SECRET'),
      callbackURL: configService.get('QUICKBOOKS_CALLBACK_URL'),
      scope: ['com.intuit.quickbooks.accounting'],
      // sandbox: configService.get('QUICKBOOKS_ENV') === 'sandbox',
      state: true
    } as StrategyOptions);
  }

  async validate(accessToken: string, refreshToken: string, params: any, profile: any, done: Function) {
    const realmId = params.realmId;
    done(null, { accessToken, refreshToken, profile, realmId });
  }
}
