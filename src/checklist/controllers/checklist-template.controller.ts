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
  } from '@nestjs/common';
  import { ChecklistTemplateService } from '../services/checklist-template.service';
  import { CreateChecklistTemplateDTO } from '../dto/create-checklist-template.dto';
  import { UpdateChecklistTemplateDTO } from '../dto/update-checklist-template.dto';
  import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../../auth/guards/roles.guard';
  import { Roles } from '../../auth/decorators/roles.decorator';
  import { Role } from '../../auth/role.enum';
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Controller('checklist-templates')
  export class ChecklistTemplateController {
    constructor(private readonly templateService: ChecklistTemplateService) {}
  
    @Roles(Role.ClientAdmin)
    @Post()
    create(@Body() dto: CreateChecklistTemplateDTO) {
      return this.templateService.createTemplate(dto);
    }
  
    @Roles(Role.ClientAdmin)
    @Get()
    findAll() {
      return this.templateService.findAll();
    }
  
    @Roles(Role.ClientAdmin)
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.templateService.findOne(id);
    }
  
    @Roles(Role.ClientAdmin)
    @Put(':id')
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: UpdateChecklistTemplateDTO,
    ) {
      return this.templateService.updateTemplate(id, dto);
    }
  
    @Roles(Role.ClientAdmin)
    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
      return this.templateService.removeTemplate(id);
    }
  }