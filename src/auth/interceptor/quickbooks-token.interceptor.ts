import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { QuickBooksOAuthService } from './../quickbooks-oauth.service';
  
  @Injectable()
  export class QuickBooksTokenInterceptor implements NestInterceptor {
    constructor(private readonly quickBooksOAuthService: QuickBooksOAuthService) {}
  
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const request = context.switchToHttp().getRequest();
      const clientId = request.params.clientId;
  
      await this.quickBooksOAuthService.refreshTokenIfNeeded(clientId);
  
      return next.handle();
    }
  }
  