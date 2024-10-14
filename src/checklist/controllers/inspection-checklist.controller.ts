import {
    Controller,
    Post,
    Body,
    Param,
    Get,
    ParseUUIDPipe,
    UseGuards,
  } from '@nestjs/common';
  import { InspectionChecklistService } from '../services/inspection-checklist.service';
  import { SubmitInspectionChecklistDTO } from '../dto/submit-inspection-checklist.dto';
  import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../../auth/guards/roles.guard';
  import { Roles } from '../../auth/decorators/roles.decorator';
  import { Role } from '../../auth/role.enum';
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Controller('inspection-checklists')
  export class InspectionChecklistController {
    constructor(private readonly inspectionChecklistService: InspectionChecklistService) {}
  
    @Roles(Role.ClientAdmin)
    @Post()
    submitChecklist(@Body() dto: SubmitInspectionChecklistDTO) {
      return this.inspectionChecklistService.createInspectionChecklist(dto);
    }
  
    @Roles(Role.ClientAdmin)
    @Get(':id')
    getChecklist(@Param('id', ParseUUIDPipe) id: string) {
      return this.inspectionChecklistService.getInspectionChecklist(id);
    }
  }