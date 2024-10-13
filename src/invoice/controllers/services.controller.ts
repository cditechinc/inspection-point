import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    Req,
    UseGuards,
    HttpCode,
  } from '@nestjs/common';
  import { ServicesService } from './../services/services.service';
  import { CreateServiceFeeDto } from '../dto/create-services.dto';
  import { UpdateServiceFeeDto } from '../dto/update-services';
  import { AuthGuard } from '@nestjs/passport';
  import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
  
  @Controller('services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class ServiceFeeController {
    constructor(private readonly servicesService: ServicesService) {}
  
    @Post()
    async create(
      @Req() req: Request,
      @Body() createServiceFeeDto: CreateServiceFeeDto,
    ) {
      const clientId = req.user['client_id'];
      const serviceFee = await this.servicesService.createServiceFee(
        clientId,
        createServiceFeeDto,
      );
      return serviceFee;
    }
  
    @Get()
    async findAll(@Req() req: Request) {
      const clientId = req.user['client_id'];
      const serviceFees = await this.servicesService.findAll(clientId);
      return serviceFees;
    }
  
    @Get(':id')
    async findOne(@Req() req: Request, @Param('id') id: string) {
      const clientId = req.user['client_id'];
      const serviceFee = await this.servicesService.findOne(clientId, id);
      return serviceFee;
    }
  
    @Put(':id')
    async update(
      @Req() req: Request,
      @Param('id') id: string,
      @Body() updateServiceFeeDto: UpdateServiceFeeDto,
    ) {
      const clientId = req.user['client_id'];
      const serviceFee = await this.servicesService.updateServiceFee(
        clientId,
        id,
        updateServiceFeeDto,
      );
      return serviceFee;
    }
  
    @Delete(':id')
    @HttpCode(204)
    async remove(@Req() req: Request, @Param('id') id: string) {
      const clientId = req.user['client_id'];
      await this.servicesService.removeServiceFee(clientId, id);
    }
  
    @Post('sync')
    async syncServiceFees(@Req() req: Request) {
      const clientId = req.user['client_id'];
      await this.servicesService.syncServiceFees(clientId);
      return { message: 'Service fees synchronized successfully' };
    }
  }
  