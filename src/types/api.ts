export type ApiErrorBody = {
  error?: string | { message: string; createdAt?: string }
  details?: Array<{
    msg: string
    param?: string
    location?: string
  }>
}
