import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Request,
  UseGuards,
  UseInterceptors,
  InternalServerErrorException,
  UploadedFiles,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.enum';
import { CustomUser } from '../auth/interface/custom-user.interface';
import { QuickBooksTokenInterceptor } from './../auth/interceptor/quickbooks-token.interceptor';
import { PermissionsGuard } from './../auth/guards/permissions.guard';
import { QuickBooksOAuthService } from './../auth/quickbooks-oauth.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('client/customers')
@UseInterceptors(QuickBooksTokenInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly quickBooksOAuthService: QuickBooksOAuthService,
  ) {}

  @Roles(Role.ClientAdmin)
  @Post(':clientId')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'photos', maxCount: 4 }]), // Allow up to 4 photos
  )
  async create(
    @Param('clientId') clientId: string,
    @Body() createCustomerDto: CreateCustomerDto,
    @UploadedFiles() files: { photos?: Express.Multer.File[] },
  ) {
    const photos = files.photos || []; // Get the uploaded photos
    return this.customerService.create(createCustomerDto, clientId, photos);
  }

  @Roles(Role.ClientAdmin)
  @Get()
  async findAll(@Request() req) {
    const user: CustomUser = req.user;
    return this.customerService.findAll(user.clientId);
  }

  @Roles(Role.ClientAdmin)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const user: CustomUser = req.user;
    return this.customerService.findOne(id, user.clientId);
  }

  @Roles(Role.ClientAdmin)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: Partial<CreateCustomerDto>,
    @Request() req,
  ) {
    const user: CustomUser = req.user;
    return this.customerService.update(id, updateCustomerDto, user.clientId);
  }

  @Roles(Role.ClientAdmin)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const user: CustomUser = req.user;
    return this.customerService.remove(id, user.clientId);
  }

  @Roles(Role.ClientAdmin)
  @Get('sync/:clientId')
  async syncCustomers(@Param('clientId') clientId: string) {
    try {
      const customers =
        await this.quickBooksOAuthService.syncCustomers(clientId);
      // You can store the customers in the database here if needed
      return { message: 'Customers synced successfully', customers };
    } catch (error) {
      console.error('Error syncing customers:', error.message);
      throw new InternalServerErrorException(
        'Failed to sync customers from QuickBooks',
      );
    }
  }
}
