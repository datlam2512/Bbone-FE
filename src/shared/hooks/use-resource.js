import { useEffect, useState } from 'react'

/** load must have stable identity (module-level function or useCallback). */
export function useResource(load) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    let active = true
    Promise.resolve()
      .then(() => {
        if (active) setState({ data: null, error: null, loading: true })
        return load(controller.signal)
      })
      .then((data) => {
        if (active) setState({ data, error: null, loading: false })
      })
      .catch((error) => {
        if (active && error.name !== 'AbortError') setState({ data: null, error, loading: false })
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [load, revision])
  return { ...state, retry: () => setRevision((value) => value + 1) }
}
