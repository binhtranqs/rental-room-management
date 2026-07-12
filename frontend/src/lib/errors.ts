import { AxiosError } from 'axios'

export function getErrorMessage(exception: unknown, fallback: string) {
  if (exception instanceof AxiosError) {
    const data = exception.response?.data

    if (isApiError(data)) {
      return data.message
    }
  }

  return fallback
}

function isApiError(data: unknown): data is { message: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof data.message === 'string'
  )
}
