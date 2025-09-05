import { Injectable, Logger } from '@nestjs/common';
import { Observable, throwError, timer } from 'rxjs';
import { mergeMap, retryWhen, take } from 'rxjs/operators';

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  retryWithBackoff<T>(
    operation: () => Observable<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
  ): Observable<T> {
    return operation().pipe(
      retryWhen((errors) =>
        errors.pipe(
          mergeMap((error, index) => {
            const retryAttempt = index + 1;
            
            if (retryAttempt > maxRetries) {
              this.logger.error(`Max retries (${maxRetries}) exceeded`);
              return throwError(() => error);
            }

            const delay = baseDelay * Math.pow(2, retryAttempt - 1);
            this.logger.warn(`Retry attempt ${retryAttempt}/${maxRetries} after ${delay}ms`);
            
            return timer(delay);
          }),
          take(maxRetries),
        ),
      ),
    );
  }
}
