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

  @Roles(Role.ClientAdmin)
  @Post()
  create(@Body() createInspectionDto: CreateInspectionDTO) {
    return this.inspectionService.create(createInspectionDto);
  }

  @Roles(Role.ClientAdmin)
  @Get()
  findAll() {
    return this.inspectionService.findAll();
  }

  @Roles(Role.ClientAdmin)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.inspectionService.findOne(id);
  }

  @Roles(Role.ClientAdmin)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInspectionDto: UpdateInspectionDTO,
  ) {
    return this.inspectionService.update(id, updateInspectionDto);
  }

  // @Roles(Role.Client)
  // @Delete(':id')
  // remove(@Param('id', ParseUUIDPipe) id: string) {
  //   return this.inspectionService.remove(id);
  // }

  @Roles(Role.ClientAdmin)
  @Patch(':id/complete-and-bill')
  completeAndBillInspection(@Param('id', ParseUUIDPipe) id: string) {
    return this.inspectionService.completeAndBillInspection(id);
  }

  @Roles(Role.ClientAdmin)
  @Patch(':id/complete-without-billing')
  completeWithoutBilling(@Param('id', ParseUUIDPipe) id: string) {
    return this.inspectionService.completeInspectionWithoutBilling(id);
  }
}
