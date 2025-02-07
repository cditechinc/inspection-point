// src/routes/routes.service.ts
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Task } from '../task-management/entities/task.entity';

@Injectable()
export class RoutesService {
  private readonly logger = new Logger(RoutesService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  /**
   * Update the live location of the logged-in user.
   * The location is stored as a string in the format "lat,lng".
   */
  async updateUserLocation(
    userId: string,
    latitude: number,
    longitude: number,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    user.last_gps_location = `${latitude},${longitude}`;
    return await this.userRepository.save(user);
  }

  /**
   * Retrieves an optimized route for the logged-in user.
   * - Retrieves the current live location of the user.
   * - Finds tasks assigned to the user and extracts asset locations.
   * - Uses Google Directions API to get the best route.
   */
  async getOptimizedRoute(userId: string): Promise<any> {
    // Retrieve the user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.last_gps_location) {
      throw new Error('User location not found. Please update your location.');
    }
    let userLat: number;
    let userLng: number;

    const value = user.last_gps_location;

    // If the value is an object (e.g., { x: 31.9744, y: 74.2244 }), extract x and y.
    if (
      typeof value === 'object' &&
      value !== null &&
      'x' in value &&
      'y' in value
    ) {
      userLat = Number(value.x);
      userLng = Number(value.y);
    }
    // Otherwise, if it's a string, remove any unwanted characters.
    else if (typeof value === 'string') {
      // Remove any parentheses from the string.
      const cleaned = value.replace(/[()]/g, '');
      [userLat, userLng] = cleaned.split(',').map(Number);
    } else {
      throw new Error('Invalid user location format');
    }

    // Validate that we have valid numbers.
    if (isNaN(userLat) || isNaN(userLng)) {
      throw new Error('Invalid user location format');
    }

    const origin = `${userLat},${userLng}`;

    // Query tasks assigned to this user
    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignedUsers', 'user')
      .leftJoinAndSelect('task.assets', 'asset')
      .where('user.id = :userId', { userId })
      .getMany();

    // Collect waypoints from each task’s asset (if available)
    const waypoints: string[] = [];
    for (const task of tasks) {
      if (task.assets && task.assets.length > 0) {
        const asset = task.assets[0];
        if (asset.latitude && asset.longitude) {
          waypoints.push(`${asset.latitude},${asset.longitude}`);
        }
      }
    }

    if (waypoints.length === 0) {
      throw new BadRequestException('No task locations found for routing.');
    }

    // For the API call, use the user's location as both origin and destination,
    // with task locations as waypoints (using optimize:true)
    const waypointsParam = `optimize:true|${waypoints.join('|')}`;

    // Build the URL for the Google Directions API
    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API');
    const url =
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${origin}` +
      `&waypoints=${encodeURIComponent(waypointsParam)}&key=${apiKey}`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      this.logger.error(
        'Error fetching directions from Google Maps API',
        error,
      );
      throw new InternalServerErrorException('Failed to fetch directions');
    }
  }
}
