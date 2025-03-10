// app/[locale]/admin-check/page.tsx
'use client'

import { useEffect, useState } from 'react'

export default function AdminCheckPage() {
  const [status, setStatus] = useState("Loading...")
  const [data, setData] = useState<any>(null)
  
  useEffect(() => {
    fetch('/api/admin-check')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setStatus(data.isAdmin ? 'You have admin access' : 'You do not have admin access')
      })
      .catch(err => {
        setStatus("Error: " + err.message)
      })
  }, [])
  
  return (
    <div style={{padding: '20px'}}>
      <h1>Admin Status Check</h1>
      <div style={{margin: '10px 0'}}>Status: {status}</div>
      
      {data && (
        <pre style={{
          background: '#f0f0f0', 
          padding: '10px', 
          borderRadius: '4px'
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
      
      <div style={{marginTop: '20px'}}>
        <p>If you see your role is 'admin' but still can't access the dashboard:</p>
        <ol>
          <li>Your session might be corrupted - sign out and back in</li>
          <li>Try clearing browser cache and cookies</li>
          <li>The middleware might have a bug - try accessing /admin directly</li>
        </ol>
      </div>
    </div>
  )
}