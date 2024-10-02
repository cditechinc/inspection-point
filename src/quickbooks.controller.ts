import { Controller, Post, Get, Body, HttpException, HttpStatus, Param } from '@nestjs/common';
import { QuickBooksOAuthService } from './auth/quickbooks-oauth.service';

@Controller('quickbooks')
export class QuickBooksController {
  constructor(private readonly quickBooksService: QuickBooksOAuthService) {}

  // Endpoint to handle QuickBooks webhook
  @Post('webhook-handler')
  async handleWebhook(@Body() payload: any) {
    try {
      // Add your webhook processing logic here
      console.log('Webhook received:', payload);

      // Assuming you want to process the webhook data with a service method
      const result = await this.quickBooksService.processQuickBooksWebhook(payload);
      
      return { message: 'Webhook processed successfully', data: result };
    } catch (error) {
      console.error('Error processing webhook:', error.message);
      throw new HttpException('Error processing webhook', HttpStatus.BAD_REQUEST);
    }
  }

  // Endpoint to trigger the synchronization of customers
  @Get('sync/:clientId')
  async syncCustomers(@Param('clientId') clientId: string) {
    try {
      const customers = await this.quickBooksService.syncCustomers(clientId);
      return { message: 'Customers synced successfully', data: customers };
    } catch (error) {
      console.error('Error syncing customers:', error.message);
      throw new HttpException('Error syncing QuickBooks customers', HttpStatus.BAD_REQUEST);
    }
  }
}
