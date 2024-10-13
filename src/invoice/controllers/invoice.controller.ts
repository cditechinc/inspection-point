import { Controller, Post, Body, Param, UseGuards, Get, ParseUUIDPipe, Patch, Delete } from '@nestjs/common';
import { InvoiceService } from './../services/invoice.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/role.enum';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Roles(Role.ClientAdmin)
  @Post(':inspectionId')
  createInvoice(@Param('inspectionId') inspectionId: string, @Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.createInvoice(inspectionId, createInvoiceDto);
  }

  @Roles(Role.ClientAdmin)
  @Get()
  async getAllInvoices() {
    return await this.invoiceService.findAllWithRelations();
  }

  // Route to get an invoice by ID
  @Roles(Role.ClientAdmin)
  @Get(':id')
  async getInvoiceById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.invoiceService.findOneWithRelations(id);
  }

  // Route to update an invoice by ID
  @Roles(Role.ClientAdmin)
  @Patch(':id')
  async updateInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return await this.invoiceService.update(id, updateInvoiceDto);
  }

  // Route to delete an invoice by ID
  @Roles(Role.ClientAdmin)
  @Delete(':id')
  async deleteInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return await this.invoiceService.remove(id);
  }
}
