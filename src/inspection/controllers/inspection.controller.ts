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
  import { CreateInspectionDTO, UpdateInspectionDTO } from './../dto/inspection.dto';
  import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
  import { RolesGuard } from './../../auth/guards/roles.guard';
  import { Roles } from './../../auth/decorators/roles.decorator';
import { Role } from './../../auth/role.enum';
  
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Controller('inspections')
  export class InspectionController {
    constructor(private readonly inspectionService: InspectionService) {}
  
    @Roles(Role.Client)
    @Post()
    create(@Body() createInspectionDto: CreateInspectionDTO) {
      return this.inspectionService.create(createInspectionDto);
    }
  
    @Roles(Role.Client)
    @Get()
    findAll() {
      return this.inspectionService.findAll();
    }
  
    @Roles(Role.Client)
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.inspectionService.findOne(id);
    }
  
    @Roles(Role.Client)
    @Patch(':id')
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateInspectionDto: UpdateInspectionDTO,
    ) {
      return this.inspectionService.update(id, updateInspectionDto);
    }
  
    @Roles(Role.Client)
    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
      return this.inspectionService.remove(id);
    }
  }
  