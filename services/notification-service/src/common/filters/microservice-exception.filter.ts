import { Catch, RpcExceptionFilter, ArgumentsHost, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class MicroserviceExceptionFilter implements RpcExceptionFilter<RpcException> {
  private readonly logger = new Logger(MicroserviceExceptionFilter.name);

  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    try {
      const ctx = host.switchToRpc();
      const data = ctx.getData();
      
      // Safely serialize data to avoid circular reference issues
      const safeData = this.safeStringify(data);
      
      this.logger.error(`Microservice exception: ${exception.message}`, {
        data: safeData,
        stack: exception.stack,
      });
    } catch (logError) {
      // If logging fails, just log the basic error message
      this.logger.error(`Microservice exception: ${exception.message}`);
      this.logger.error(`Logging error: ${logError.message}`);
    }

    return throwError(() => exception);
  }

  private safeStringify(obj: any): any {
    try {
      const seen = new WeakSet();
      return JSON.parse(JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular Reference]';
          }
          seen.add(value);
        }
        // Handle functions, undefined, symbols, etc.
        if (typeof value === 'function') {
          return '[Function]';
        }
        if (typeof value === 'undefined') {
          return '[Undefined]';
        }
        if (typeof value === 'symbol') {
          return '[Symbol]';
        }
        return value;
      }));
    } catch (error) {
      return `[Error serializing object: ${error.message}]`;
    }
  }
}
