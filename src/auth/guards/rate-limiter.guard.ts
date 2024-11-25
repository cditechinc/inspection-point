import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RateLimiterMemory } from 'rate-limiter-flexible';

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private rateLimiter = new RateLimiterMemory({
    points: 5, // 5 points
    duration: 60, // Per 60 seconds
  });

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const ip = req.ip;

    try {
      await this.rateLimiter.consume(ip);
      return true;
    } catch (err) {
      throw new Error('Too many requests');
    }
  }
}