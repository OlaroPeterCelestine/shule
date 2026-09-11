import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class JsonExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    if (res.headersSent) return;

    const err = exception instanceof HttpException ? exception : null;
    const status = err?.getStatus() ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const raw = err?.getResponse();
    const payload = typeof raw === 'object' && raw ? (raw as Record<string, unknown>) : {};
    const message = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : typeof payload.message === 'string'
        ? payload.message
        : typeof raw === 'string'
          ? raw
          : exception instanceof Error
            ? exception.message
            : 'Request failed';

    res.status(status).json({
      ok: false,
      statusCode: status,
      error: typeof payload.error === 'string' ? payload.error : HttpStatus[status] || 'Error',
      message,
    });
  }
}
