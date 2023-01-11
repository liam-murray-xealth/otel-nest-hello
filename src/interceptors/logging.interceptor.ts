import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { logger } from '../instrument'

// TODO better way: (use annotation @HealthCheck()?)
const ignoreList = ['getLiveStatus', 'getReadyStatus']

/**
 * Intercepts every request and logs
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now()
    return next.handle().pipe(
      tap(() => {
        const name = context.getHandler().name
        if (ignoreList.includes(name)) {
          return
        }
        const dur = Date.now() - now
        logger.info({ name, dur }, 'Request')
      })
    )
  }
}
