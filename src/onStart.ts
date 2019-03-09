import * as Sentry from '@sentry/browser'
import { ENV } from './types'

declare const env: ENV

function onStart() {
  if (env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
    })
  }
}

export default onStart
