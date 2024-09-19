import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
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

  async refreshTokenIfNeeded(clientId: string): Promise<void> {
    const client = await this.clientService.findOne(clientId);

    if (!client || !client.quickbooksAccessToken || !client.quickbooksRealmId) {
      throw new Error('Client is not authorized with QuickBooks');
    }

    const currentTime = new Date().getTime();
    const tokenExpirationTime = new Date(
      client.quickbooksTokenExpiresIn,
    ).getTime();

    // Refresh the token if it will expire in the next 5 minutes
    if (currentTime >= tokenExpirationTime - 5 * 60 * 1000) {
      try {
        const tokenResponse = await this.oauthClient.refreshUsingToken(
          client.quickbooksRefreshToken,
        );

        // Update the client with the new token details
        const updateClientDto = {
          quickbooksAccessToken: tokenResponse.token.access_token,
          quickbooksRefreshToken: tokenResponse.token.refresh_token,
          quickbooksTokenExpiresIn: new Date(
            currentTime + tokenResponse.token.expires_in * 1000,
          ),
        };

        await this.clientService.update(client.id, updateClientDto);
      } catch (error) {
        throw new InternalServerErrorException(
          `Failed to refresh QuickBooks token: ${error.message}`,
        );
      }
    }
  }

  async createCustomer(clientId: string, customerData: any) {
    await this.refreshTokenIfNeeded(clientId);
  
    const client = await this.clientService.findOne(clientId);
  
    if (!client || !client.quickbooksAccessToken || !client.quickbooksRealmId) {
      throw new InternalServerErrorException('Client is not authorized with QuickBooks');
    }
  
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
        throw new InternalServerErrorException('Failed to create customer in QuickBooks');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.Fault) {
        const fault = error.response.data.Fault;
        if (fault.Error[0].code === '6240') {
          console.error(`Duplicate customer name error: ${fault.Error[0].Message}`);
          throw new ConflictException(`Customer with name "${customerData.DisplayName}" already exists in QuickBooks.`);
        }
      }
  
      console.error('Error creating customer in QuickBooks:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
      throw new InternalServerErrorException(`QuickBooks API error: ${error.message}`);
    }
  }
  
}
