import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const ACCESS_TOKEN_KEY = 'rental_room_access_token'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export function saveAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}
