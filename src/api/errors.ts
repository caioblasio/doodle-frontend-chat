import type { ApiErrorBody } from '../types/api'

export class ApiRequestError extends Error {
  readonly status: number
  readonly body?: ApiErrorBody

  constructor(status: number, message: string, body?: ApiErrorBody) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.body = body
  }
}

function getErrorMessage(status: number, body?: ApiErrorBody): string {
  if (status === 401) {
    return 'Authentication failed. Please try again.'
  }

  if (status === 400) {
    const detail = body?.details?.[0]?.msg

    if (detail) {
      return detail
    }

    if (typeof body?.error === 'string') {
      return body.error
    }

    return 'Invalid request. Please check your input and try again.'
  }

  if (status === 500) {
    const error = body?.error

    if (typeof error === 'object' && error?.message) {
      return error.message
    }

    return 'Something went wrong on the server. Please try again.'
  }

  return 'Something went wrong. Please try again.'
}

export async function createApiRequestError(
  response: Response,
): Promise<ApiRequestError> {
  let body: ApiErrorBody | undefined

  try {
    body = (await response.json()) as ApiErrorBody
  } catch {
    body = undefined
  }

  return new ApiRequestError(
    response.status,
    getErrorMessage(response.status, body),
    body,
  )
}

export function getRequestErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) {
    return error.message
  }

  return fallback
}
