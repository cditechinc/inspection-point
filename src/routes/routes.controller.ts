// src/routes/routes.controller.ts
import { Controller, Post, Body, Req, Get, UseGuards } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { RolesGuard } from './../auth/guards/roles.guard';

@Controller('routes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  /**
   * Update the live location for the logged-in user.
   * Expected body: { latitude: number, longitude: number }
   */
  @Post('location')
  async updateLocation(
    @Body() body: { latitude: number; longitude: number },
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    const { latitude, longitude } = body;
    return this.routesService.updateUserLocation(userId, latitude, longitude);
  }

  /**
   * Get an optimized route based on the user’s current location and assigned task locations.
   */
  @Get()
  async getRoute(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.routesService.getOptimizedRoute(userId);
  }
}
