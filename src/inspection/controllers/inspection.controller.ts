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
  UseInterceptors,
  UploadedFiles,
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
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inspections')
export class InspectionController {
  constructor(private readonly inspectionService: InspectionService) {}

  @Roles(Role.ClientAdmin, Role.Client)
  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'photos', maxCount: 10 }]))
  create(
    @Body() createInspectionDto: any,
    @UploadedFiles() files: { photos?: Express.Multer.File[] },
  ) {
    
    if (typeof createInspectionDto.checklists === 'string') {
      createInspectionDto.checklists = JSON.parse(
        createInspectionDto.checklists,
      );
    }
    console.log('Request body:', createInspectionDto); // Log the parsed body
    console.log('Files:', files);
    return this.inspectionService.create(
      createInspectionDto,
      files?.photos || [],
    );
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Get()
  findAll() {
    return this.inspectionService.findAll();
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.inspectionService.findOne(id);
  }

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
    return this.inspectionService.submitAndDontBillCustomer(inspectionId, serviceFee);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Post(':id/add-to-existing-invoice')
  async submitAndAddToExistingInvoice(
    @Param('id', ParseUUIDPipe) inspectionId: string,
    @Body()
    { invoiceId }: { invoiceId: string },
  ) {
    return this.inspectionService.submitAndAddToExistingInvoice(
      inspectionId,
      invoiceId,
    );
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Patch(':id/delay')
  delayInspection(@Param('id', ParseUUIDPipe) id: string) {
    return this.inspectionService.delayInspection(id);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Patch(':id/cancel')
  cancelInspection(@Param('id', ParseUUIDPipe) id: string) {
    return this.inspectionService.cancelInspection(id);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Patch(':id/hold')
  holdInspection(@Param('id', ParseUUIDPipe) id: string) {
    return this.inspectionService.holdInspection(id);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Patch(':id/begin')
  beginInspection(@Param('id', ParseUUIDPipe) id: string) {
    return this.inspectionService.beginInspection(id);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Get('/history/client/:clientId')
  getClientInspectionHistory(
    @Param('clientId', ParseUUIDPipe) clientId: string,
  ) {
    return this.inspectionService.getClientInspectionHistory(clientId);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Get('/history/customer/:customerId')
  getCustomerInspectionHistory(
    @Param('customerId', ParseUUIDPipe) customerId: string,
  ) {
    return this.inspectionService.getCustomerInspectionHistory(customerId);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Get('/history/asset/:assetId')
  getAssetInspectionHistory(@Param('assetId', ParseUUIDPipe) assetId: string) {
    return this.inspectionService.getAssetInspectionHistory(assetId);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Get('/history/asset-type/:assetTypeId')
  getAssetTypeInspectionHistory(
    @Param('assetTypeId', ParseUUIDPipe) assetTypeId: string,
  ) {
    return this.inspectionService.getAssetTypeInspectionHistory(assetTypeId);
  }
}
