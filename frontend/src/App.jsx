import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || '/api'

function App() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then(setHealth)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">TransportOps</h1>
        {health && (
          <p className="text-green-600">
            API: {health.status} ({health.db ?? 'db status n/a'})
          </p>
        )}
        {error && <p className="text-red-600">API unreachable: {error}</p>}
      </div>
    </div>
  )
}

export default App
