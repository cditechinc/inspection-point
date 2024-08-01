import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { RegisterClientDto } from './dto/register-client.dto';
import { Client } from './entities/client.entity';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './../auth/auth.service';
import * as crypto from 'crypto';
import { QuickBooksOAuthService } from './../auth/quickbooks-oauth.service';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';

@Controller('clients')
export class ClientController {
  constructor(
    private readonly clientService: ClientService,
    private readonly authService: AuthService,
    private readonly quickBooksOAuthService: QuickBooksOAuthService,
  ) {}

  @Post('register')
  async create(@Body() registerClientDto: RegisterClientDto): Promise<Client> {
    return this.clientService.create(registerClientDto);
  }

  @Get()
  async findAll(): Promise<Client[]> {
    return this.clientService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Client> {
    return this.clientService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: Partial<Client>,
  ): Promise<Client> {
    return this.clientService.update(id, updateClientDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.clientService.remove(id);
  }

  @Get('quickbooks/authorize')
  @UseGuards(JwtAuthGuard)
  async authorizeQuickBooks(@Req() req, @Res() res) {
    const state = crypto.randomBytes(16).toString('hex'); // Generate a random state string
    const clientId = req.user.clientId; // Assuming you have clientId in the request user object
    await this.clientService.update(clientId, { quickbooksState: state });
    const quickbooksAuthUrl = this.quickBooksOAuthService.getAuthUri(state);
    res.json({ url: quickbooksAuthUrl, state });
  }

  @Get('quickbooks/callback')
  async quickbooksCallback(@Query('code') code: string, @Query('state') state: string, @Req() req, @Res() res) {
    try {
      const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      const authResponse = await this.quickBooksOAuthService.handleCallback(url);
      const { access_token, refresh_token, realmId, x_refresh_token_expires_in } = authResponse;

      const client = await this.clientService.findOneByState(state);

      if (!client) {
        throw new Error('Client not found');
      }

      const clientId = client.id;

      // Save QuickBooks tokens in the database
      await this.authService.saveQuickBooksTokens(clientId, access_token, refresh_token, realmId);

      res.redirect(`${process.env.CORS_ALLOWED_ORIGINS}/client-dashboard`); // Redirect to the dashboard or any other route
    } catch (error) {
      res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
  }
}
