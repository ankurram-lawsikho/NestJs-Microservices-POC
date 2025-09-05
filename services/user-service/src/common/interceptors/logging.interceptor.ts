import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const ctx = context.switchToRpc();
    const data = ctx.getData();
    const pattern = ctx.getContext().getPattern();

    this.logger.log(`Processing microservice request: ${pattern}`, { data });

    return next.handle().pipe(
      tap({
        next: (result) => {
          const duration = Date.now() - startTime;
          this.logger.log(`Request completed successfully in ${duration}ms`, {
            pattern,
            duration,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(`Request failed after ${duration}ms`, {
            pattern,
            duration,
            error: error.message,
          });
        },
      }),
    );
  }
}
