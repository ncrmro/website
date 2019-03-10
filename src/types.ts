export interface PostType {
  id: number
  fileName: string
  body: string
  title: string
  datePosted: string
}

export interface ENV {
  SENTRY_DSN?: string
  ENVIRONMENT: 'production' | 'development'
  COMMIT_REF: string
}
