
import { ConflictException, HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
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
      throw new InternalServerErrorException('Client is not authorized with QuickBooks');
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

        if (!tokenResponse.token.access_token || !tokenResponse.token.refresh_token) {
          throw new Error('Missing token in the refresh response from QuickBooks');
        }
  
        // Calculate new expiration time
        const tokenExpirationDate = new Date(currentTime + tokenResponse.token.expires_in * 1000);
        console.log(`New token expires at: ${tokenExpirationDate.toISOString()}`);
  
        // Update client with new token and expiration
        const updateClientDto = {
          quickbooksAccessToken: tokenResponse.token.access_token,
          quickbooksRefreshToken: tokenResponse.token.refresh_token,
          quickbooksTokenExpiresIn: tokenExpirationDate,
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

    // Define base URL for sandbox or production
    const quickBooksBaseUrl = this.oauthClient.environment == 'sandbox'
      ? 'https://sandbox-quickbooks.api.intuit.com'
      : 'https://quickbooks.api.intuit.com';
  
    try {
      const response = await this.oauthClient.makeApiCall({
        url: `${quickBooksBaseUrl}/v3/company/${client.quickbooksRealmId}/customer`,
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

  async syncCustomers(clientId: string) {
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
        url: `${this.oauthClient.environment === 'sandbox' ? 'https://sandbox-quickbooks.api.intuit.com' : 'https://quickbooks.api.intuit.com'}/v3/company/${client.quickbooksRealmId}/customer`,
        method: 'GET',
      });

      if (response.json && response.json.QueryResponse && response.json.QueryResponse.Customer) {
        return response.json.QueryResponse.Customer; // List of customers
      } else {
        throw new InternalServerErrorException('Failed to fetch customers from QuickBooks');
      }
    } catch (error) {
      console.error('Error syncing customers:', error.message);
      throw new InternalServerErrorException(`QuickBooks API error: ${error.message}`);
    }
  }


  async processQuickBooksWebhook(payload: any) {
    try {
      console.log('Processing QuickBooks Webhook:', JSON.stringify(payload, null, 2));

      // Loop through eventNotifications
      for (const notification of payload.eventNotifications) {
        const { dataChangeEvent } = notification;

        // Loop through entities in dataChangeEvent
        for (const entity of dataChangeEvent.entities) {
          const { name, operation, id } = entity;

          // Handle Customer creation
          if (name === 'Customer' && operation === 'Create') {
            console.log(`Customer created with ID: ${id}`);
            // Add your logic to fetch customer details and store in your database
            await this.handleCustomerCreation(notification.realmId, id);
          }

          // Handle Invoice creation
          if (name === 'Invoice' && operation === 'Create') {
            console.log(`Invoice created with ID: ${id}`);
            // Add your logic to fetch invoice details and store in your database
            await this.handleInvoiceCreation(notification.realmId, id);
          }
        }
      }

      return { message: 'Webhook processed successfully' };
    } catch (error) {
      console.error('Error processing QuickBooks webhook:', error.message);
      throw new HttpException('Error processing webhook', HttpStatus.BAD_REQUEST);
    }
  }

  // Method to handle customer creation
  async handleCustomerCreation(realmId: string, customerId: string) {
    try {
      const customer = await this.fetchCustomerFromQuickBooks(realmId, customerId);
      console.log('Fetched customer details:', customer);
      
      // You can now save the customer to your database
      // Example: await this.customerService.create(customer);
      
    } catch (error) {
      console.error('Error fetching customer:', error.message);
      throw new InternalServerErrorException(`Failed to fetch customer from QuickBooks: ${error.message}`);
    }
  }

  // Method to handle invoice creation
  async handleInvoiceCreation(realmId: string, invoiceId: string) {
    try {
      const invoice = await this.fetchInvoiceFromQuickBooks(realmId, invoiceId);
      console.log('Fetched invoice details:', invoice);

      // You can now save the invoice to your database
      // Example: await this.invoiceService.create(invoice);

    } catch (error) {
      console.error('Error fetching invoice:', error.message);
      throw new InternalServerErrorException(`Failed to fetch invoice from QuickBooks: ${error.message}`);
    }
  }

  // Method to fetch customer details from QuickBooks
  async fetchCustomerFromQuickBooks(realmId: string, customerId: string) {
    try {
      const url = `${this.oauthClient.environment === 'sandbox'
        ? 'https://sandbox-quickbooks.api.intuit.com'
        : 'https://quickbooks.api.intuit.com'}/v3/company/${realmId}/customer/${customerId}`;

      const response = await this.oauthClient.makeApiCall({
        url,
        method: 'GET',
      });

      if (response.json) {
        return response.json.Customer;
      } else {
        throw new InternalServerErrorException('Failed to fetch customer from QuickBooks');
      }
    } catch (error) {
      console.error('Error fetching customer from QuickBooks:', error.message);
      throw new InternalServerErrorException('QuickBooks API error');
    }
  }

  // Method to fetch invoice details from QuickBooks
  async fetchInvoiceFromQuickBooks(realmId: string, invoiceId: string) {
    try {
      const url = `${this.oauthClient.environment === 'sandbox'
        ? 'https://sandbox-quickbooks.api.intuit.com'
        : 'https://quickbooks.api.intuit.com'}/v3/company/${realmId}/invoice/${invoiceId}`;

      const response = await this.oauthClient.makeApiCall({
        url,
        method: 'GET',
      });

      if (response.json) {
        return response.json.Invoice;
      } else {
        throw new InternalServerErrorException('Failed to fetch invoice from QuickBooks');
      }
    } catch (error) {
      console.error('Error fetching invoice from QuickBooks:', error.message);
      throw new InternalServerErrorException('QuickBooks API error');
    }
  }

  // Add this method to fetch service fees
  async fetchServiceFees(realmId: string, accessToken: string) {
    try {
      const url = `${this.oauthClient.environment === 'sandbox'
        ? 'https://sandbox-quickbooks.api.intuit.com'
        : 'https://quickbooks.api.intuit.com'}/v3/company/${realmId}/item/service`;

      const response = await this.oauthClient.makeApiCall({
        url,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.json) {
        return response.json.QueryResponse.Item;
      } else {
        throw new InternalServerErrorException('Failed to fetch service fees from QuickBooks');
      }
    } catch (error) {
      console.error('Error fetching service fees from QuickBooks:', error.message);
      throw new InternalServerErrorException('QuickBooks API error');
    }
  }  

  // Add the createService method
  async createService(realmId: string, accessToken: string, serviceData: any) {
    try {
      const quickBooksBaseUrl = this.oauthClient.environment === 'sandbox'
        ? 'https://sandbox-quickbooks.api.intuit.com'
        : 'https://quickbooks.api.intuit.com';
  
      const response = await this.oauthClient.makeApiCall({
        url: `${quickBooksBaseUrl}/v3/company/${realmId}/item`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          Name: serviceData.Name,
          Description: serviceData.Description,
          UnitPrice: serviceData.UnitPrice,
          IncomeAccountRef: serviceData.IncomeAccountRef,
          Type: 'Service',
          Taxable: serviceData.Taxable || false, 
        }),
      });
  
      if (response.json) {
        return response.json.Item;
      } else {
        throw new InternalServerErrorException('Failed to create service in QuickBooks');
      }
  
    } catch (error) {
      // Capture QuickBooks-specific errors
      if (error.response && error.response.data && error.response.data.Fault) {
        const fault = error.response.data.Fault;
        const quickBooksErrorMessage = fault.Error[0].Message;
  
        // Example of catching duplicate service errors (Code 6240)
        if (fault.Error[0].code === '6240') {
          console.error(`Duplicate service error: ${quickBooksErrorMessage}`);
          throw new ConflictException(`Service with name "${serviceData.Name}" already exists in QuickBooks.`);
        }
  
        // Log the error for debugging purposes
        console.error(`QuickBooks Error: ${quickBooksErrorMessage}`);
        throw new InternalServerErrorException(`QuickBooks API error: ${quickBooksErrorMessage}`);
      }
  
      // Log generic errors or unexpected issues
      console.error('Error creating service in QuickBooks:', error.message);
      throw new InternalServerErrorException(`QuickBooks API error: ${error.message}`);
    }
  }
  

}
