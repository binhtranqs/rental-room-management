import { AxiosError } from 'axios'

export function getErrorMessage(exception: unknown, fallback: string) {
  if (exception instanceof AxiosError) {
    const data = exception.response?.data

    if (isApiError(data)) {
      return data.message
    }

    if (exception.code === 'ERR_NETWORK' || !exception.response) {
      return 'Cannot reach the API server. Check that the backend is running or set VITE_API_BASE_URL.'
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
