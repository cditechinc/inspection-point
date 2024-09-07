
import { Controller, Post, Body, Get, Param, Patch, Delete, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.enum';
import { CustomUser } from '../auth/interface/custom-user.interface';
import { QuickBooksTokenInterceptor } from './../auth/interceptor/quickbooks-token.interceptor';

@Controller('client/customers')
@UseInterceptors(QuickBooksTokenInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Roles(Role.ClientAdmin)
  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto, @Request() req) {
    const user: CustomUser = req.user;
    if (!user.clientId) {
      throw new Error('Client information is missing from the user object');
    }
    return this.customerService.create(createCustomerDto, user.clientId);
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
  async update(@Param('id') id: string, @Body() updateCustomerDto: Partial<CreateCustomerDto>, @Request() req) {
    const user: CustomUser = req.user;
    return this.customerService.update(id, updateCustomerDto, user.clientId);
  }

  @Roles(Role.ClientAdmin)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const user: CustomUser = req.user;
    return this.customerService.remove(id, user.clientId);
  }
}
