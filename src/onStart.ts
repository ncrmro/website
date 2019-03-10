import * as Sentry from '@sentry/browser'
import { ENV } from './types'
import ReactGA from 'react-ga'

declare const process: {
  ['env']: ENV
}

function onStart() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      environment: process.env.ENVIRONMENT,
      dsn: process.env.SENTRY_DSN,
      release: process.env.COMMIT_REF,
    })
  }
  if (process.env.GOOGLE_ANALYTICS) {
    ReactGA.initialize(process.env.GOOGLE_ANALYTICS)
  }
}

export default onStart
