export function queryString(values = {}) {
  const parameters = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') parameters.set(key, String(value))
  })
  const text = parameters.toString()
  return text ? '?' + text : ''
}
