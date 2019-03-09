import * as Sentry from '@sentry/browser'
import { ENV } from './types'

declare const process: {
  ["env"]: ENV;
};

function onStart() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
    })
  }
}

export default onStart
