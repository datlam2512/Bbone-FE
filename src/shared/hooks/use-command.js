import { useRef, useState } from 'react'

// A retry of the same body retains its key; changing the request creates a new operation.
export function useCommand() {
  const [state, setState] = useState({ pending: false, error: null, notice: null })
  const flight = useRef(false)
  const operation = useRef(null)
  async function run(action, body = {}, success = 'Đã cập nhật.') {
    if (flight.current) return null
    flight.current = true
    const signature = JSON.stringify(body)
    if (operation.current?.signature !== signature)
      operation.current = { signature, key: crypto.randomUUID() }
    setState({ pending: true, error: null, notice: null })
    try {
      const result = await action(operation.current.key)
      operation.current = null
      setState({ pending: false, error: null, notice: success })
      return result ?? true
    } catch (error) {
      setState({ pending: false, error: error.message, notice: null })
      return null
    } finally {
      flight.current = false
    }
  }
  return { ...state, run }
}
