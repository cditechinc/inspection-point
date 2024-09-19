import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { InspectionService } from './../services/inspection.service';
import {
  CreateInspectionDTO,
  UpdateInspectionDTO,
} from './../dto/inspection.dto';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { Roles } from './../../auth/decorators/roles.decorator';
import { Role } from './../../auth/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inspections')
export class InspectionController {
  constructor(private readonly inspectionService: InspectionService) {}

  @Roles(Role.ClientAdmin, Role.Client)
  @Post()
  create(@Body() createInspectionDto: CreateInspectionDTO) {
    return this.inspectionService.create(createInspectionDto);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Get()
  findAll() {
    return this.inspectionService.findAll();
  }

  // @Roles(Role.ClientAdmin, Role.Client)
  // @Get(':id')
  // findOne(@Param('id', ParseUUIDPipe) id: string) {
  //   return this.inspectionService.findOne(id);
  // }

  @Roles(Role.ClientAdmin, Role.Client)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInspectionDto: UpdateInspectionDTO,
  ) {
    return this.inspectionService.update(id, updateInspectionDto);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Post(':id/submit-bill')
  async submitAndBill(
    @Param('id') inspectionId: string,
    @Body() { serviceFee }: { serviceFee: number },
  ) {
    return this.inspectionService.submitAndBillCustomer(
      inspectionId,
      serviceFee,
    );
  }

  // @Roles(Role.Client)
  // @Delete(':id')
  // remove(@Param('id', ParseUUIDPipe) id: string) {
  //   return this.inspectionService.remove(id);
  // }

  @Roles(Role.ClientAdmin, Role.Client)
  @Patch(':id/complete-and-bill')
  completeAndBillInspection(@Param('id', ParseUUIDPipe) id: string) {
    return this.inspectionService.completeAndBillInspection(id);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Patch(':id/complete-without-billing')
  completeWithoutBilling(@Param('id', ParseUUIDPipe) id: string) {
    return this.inspectionService.completeInspectionWithoutBilling(id);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Patch(':id/complete-and-add-to-invoice')
  completeAndAddToInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.inspectionService.completeAndAddToExistingInvoice(id);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Post(':id/submit-dont-bill')
  async submitAndDontBill(
    @Param('id', ParseUUIDPipe) inspectionId: string,
    @Body() { serviceFee }: { serviceFee: number },
  ) {
    return this.inspectionService.submitAndDontBillCustomer(
      inspectionId,
      serviceFee,
    );
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Post(':id/add-to-existing-invoice')
  async submitAndAddToExistingInvoice(
    @Param('id', ParseUUIDPipe) inspectionId: string,
    @Body()
    { invoiceId, serviceFee }: { invoiceId: string; serviceFee: number },
  ) {
    return this.inspectionService.submitAndAddToExistingInvoice(
      inspectionId,
      invoiceId,
      serviceFee,
    );
  }
}
