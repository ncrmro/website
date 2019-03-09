export interface PostType {
  id: number
  fileName: string
  body: string
  title: string
}

export interface ENV {
  SENTRY_DSN?: string
  ENVIRONMENT: 'production' | 'development'
}
