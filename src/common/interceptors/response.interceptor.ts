// src/interceptors/response.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data: any) => {
        const message =
          typeof data === 'object' && 'message' in data
            ? data.message
            : 'Request successfully processed';

        const responseData =
          typeof data === 'object' && 'data' in data ? data.data : data;

        return {
          success: true,
          statusCode,
          message,
          data: responseData,
        };
      }),
    );
  }
}
