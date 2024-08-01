import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OAuthClient from 'intuit-oauth';
import { ClientService } from './../client/client.service';

@Injectable()
export class QuickBooksOAuthService {
  private oauthClient: OAuthClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly clientService: ClientService,
  ) {
    this.oauthClient = new OAuthClient({
      clientId: this.configService.get<string>('QUICKBOOKS_CLIENT_ID'),
      clientSecret: this.configService.get<string>('QUICKBOOKS_CLIENT_SECRET'),
      environment: this.configService.get<string>('QUICKBOOKS_ENV'), // 'sandbox' or 'production'
      redirectUri: this.configService.get<string>('QUICKBOOKS_CALLBACK_URL'),
    });
  }

  getAuthUri(state: string): string {
    return this.oauthClient.authorizeUri({
      scope: [OAuthClient.scopes.Accounting],
      state: state,
    });
  }

  async handleCallback(url: string) {
    const authResponse = await this.oauthClient.createToken(url);

    // Log the authResponse to see its structure
    console.log('authResponse:', authResponse);

    // Extract the necessary data from the authResponse
    const { access_token, refresh_token, realmId, x_refresh_token_expires_in } =
      authResponse.token;

    return {
      access_token,
      refresh_token,
      realmId,
      x_refresh_token_expires_in,
    };
  }

  getClient() {
    return this.oauthClient;
  }

  async createCustomer(clientId: string, customerData: any) {
    const client = await this.clientService.findOne(clientId);

    if (!client || !client.quickbooksAccessToken || !client.quickbooksRealmId) {
      throw new Error('Client is not authorized with QuickBooks');
    }

    // Set the OAuth 2.0 token
    this.oauthClient.setToken({
      token_type: 'bearer',
      access_token: client.quickbooksAccessToken,
      refresh_token: client.quickbooksRefreshToken,
      realmId: client.quickbooksRealmId,
    });

    try {
      const response = await this.oauthClient.makeApiCall({
        url: `${this.oauthClient.environment == 'sandbox' ? 'https://sandbox-quickbooks.api.intuit.com' : 'https://quickbooks.api.intuit.com'}/v3/company/${client.quickbooksRealmId}/customer`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (response.json) {
        return response.json;
      } else {
        throw new Error('Failed to create customer in QuickBooks');
      }
    } catch (error) {
      throw new Error(`QuickBooks API error: ${error.message}`);
    }
  }
}
