import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    
    // Determine if this is an HTTP or RPC request
    const requestType = context.getType();
    let pattern: string;
    let data: any;

    if (requestType === 'http') {
      // Handle HTTP requests
      const httpContext = context.switchToHttp();
      const request = httpContext.getRequest();
      pattern = `${request.method} ${request.url}`;
      data = {
        method: request.method,
        url: request.url,
        query: request.query,
        params: request.params,
        body: request.body,
      };
    } else {
      // Handle RPC/microservice requests
      const rpcContext = context.switchToRpc();
      data = rpcContext.getData();
      try {
        pattern = rpcContext.getContext().getPattern();
      } catch (error) {
        pattern = 'unknown-pattern';
      }
    }

    this.logger.log(`Processing ${requestType} request: ${pattern}`, { data });

    return next.handle().pipe(
      tap({
        next: (result) => {
          const duration = Date.now() - startTime;
          this.logger.log(`Request completed successfully in ${duration}ms`, {
            pattern,
            duration,
            requestType,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(`Request failed after ${duration}ms`, {
            pattern,
            duration,
            requestType,
            error: error.message,
          });
        },
      }),
    );
  }
}
