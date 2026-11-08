const values = import.meta.env ?? {}

export const env = Object.freeze({
  apiBaseUrl: (values.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, ''),
  appName: values.VITE_APP_NAME || 'BBONE',
})
