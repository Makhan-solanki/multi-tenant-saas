// src/components/RemoteApps/SupportCenterLoader.jsx
import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'

const SupportCenterLoader = () => {
  useEffect(() => {
    const mountRemoteApp = async () => {
      const container = document.getElementById('remote-app-container')
      if (!container) return

      try {
        const mod = await import('supportTickets/App')
        const RemoteApp = mod.default
        const root = createRoot(container)
        root.render(<RemoteApp />)
      } catch (err) {
        console.error('Failed to load supportTickets remote app:', err)
      }
    }

    mountRemoteApp()
  }, [])

  return <div id="remote-app-container" className="min-h-[500px] bg-white rounded-lg shadow" />
}

export default SupportCenterLoader
