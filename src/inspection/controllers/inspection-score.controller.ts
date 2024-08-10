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
  import { InspectionScoreService } from './../services/inspection-score.service';
  import { InspectionScoreDTO, UpdateInspectionScoreDTO } from './../dto/inspection-score.dto';
  import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
  import { RolesGuard } from './../../auth/guards/roles.guard';
  import { Roles } from './../../auth/decorators/roles.decorator';
  import { Role } from './../../auth/role.enum';
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Controller('inspection-scores')
  export class InspectionScoreController {
    constructor(private readonly inspectionScoreService: InspectionScoreService) {}
  
    @Roles(Role.Client)
    @Post()
    create(@Body() inspectionScoreDto: InspectionScoreDTO) {
      return this.inspectionScoreService.create(inspectionScoreDto);
    }
  
    @Roles(Role.Client)
    @Get()
    findAll() {
      return this.inspectionScoreService.findAll();
    }
  
    @Roles(Role.Client)
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.inspectionScoreService.findOne(id);
    }
  
    @Roles(Role.Client)
    @Put(':id')
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateInspectionScoreDto: UpdateInspectionScoreDTO,
    ) {
      return this.inspectionScoreService.update(id, updateInspectionScoreDto);
    }
  
    @Roles(Role.Client)
    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
      return this.inspectionScoreService.remove(id);
    }
  }
  