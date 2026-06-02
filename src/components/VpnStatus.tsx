import React, { useState, useEffect, useCallback } from 'react'

interface VpnInfo {
  connected: boolean
  provider: string | null
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
    flexShrink: 0,
  },
}

export default function VpnStatus() {
  const [vpn, setVpn] = useState<VpnInfo>({ connected: false, provider: null })
  const [checking, setChecking] = useState(true)

  const check = useCallback(async () => {
    try {
      const api = (window as any).electronAPI
      if (api?.checkVPN) {
        const result = await api.checkVPN()
        setVpn(result)
      }
    } catch {}
    setChecking(false)
  }, [])

  useEffect(() => {
    check()
    const interval = setInterval(check, 5000)
    return () => clearInterval(interval)
  }, [check])

  const isOk = vpn.connected
  const dotColor = checking ? '#666' : isOk ? '#4caf50' : '#f44336'
  const bgColor = checking ? 'transparent' : isOk ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)'
  const borderColor = checking ? 'transparent' : isOk ? 'rgba(76,175,80,0.3)' : 'rgba(244,67,54,0.3)'

  return (
    <div style={{ ...styles.wrapper, background: bgColor, border: `1px solid ${borderColor}` }} title={checking ? 'Checking VPN...' : isOk ? `${vpn.provider} VPN is active` : 'VPN disconnected'}>
      <span style={{ ...styles.dot, background: dotColor }} />
      <span style={{ color: dotColor }}>
        VPN: {checking ? '...' : isOk ? vpn.provider || 'Connected' : 'Off'}
      </span>
    </div>
  )
}
