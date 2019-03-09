import * as Sentry from '@sentry/browser'
import { ENV } from './types'

declare const process: {
  ['env']: ENV
}

function onStart() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      environment: process.env.ENVIRONMENT,
      dsn: process.env.SENTRY_DSN,
    })
  }
}

export default onStart
