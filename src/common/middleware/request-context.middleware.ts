import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req['context'] = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      // You can add more context data here if needed
    };
    next();
  }
}