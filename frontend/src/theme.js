export const C = {
  bg: '#0a0a0a',
  sidebar: '#111111',
  card: '#161616',
  cardHover: '#1a1a1a',
  border: '#222222',
  borderSubtle: '#1f1f1f',
  accent: '#f59e0b',
  accentDim: 'rgba(245,158,11,0.10)',
  accentBorder: 'rgba(245,158,11,0.20)',
  accentHover: '#d97706',
  textPrimary: '#ffffff',
  textSecondary: '#a3a3a3',
  textMuted: '#737373',
  textDim: '#525252',
  success: '#22c55e',
  successDim: 'rgba(34,197,94,0.10)',
  error: '#ef4444',
  errorDim: 'rgba(239,68,68,0.10)',
  blue: '#3b82f6',
  blueDim: 'rgba(59,130,246,0.10)',
  purple: '#a855f7',
  purpleDim: 'rgba(168,85,247,0.10)',
}

export const card = (extra = {}) => ({
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  ...extra,
})

export const input = (extra = {}) => ({
  width: '100%',
  padding: '13px 16px',
  background: '#111',
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  color: C.textPrimary,
  fontSize: 14,
  outline: 'none',
  ...extra,
})

export const btn = (extra = {}) => ({
  background: C.accent,
  color: '#000',
  fontWeight: 700,
  fontSize: 14,
  border: 'none',
  borderRadius: 10,
  padding: '13px 20px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  ...extra,
})

export const tag = (color, bg) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '3px 10px',
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600,
  color,
  background: bg,
})
