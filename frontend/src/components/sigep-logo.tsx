
interface SigepMarkProps {
  size?: number
  variant?: 'white' | 'amber'
}

export function SigepMark({ size = 18, variant = 'white' }: SigepMarkProps) {
  const c = {
    hi:   variant === 'white' ? 'rgba(255,255,255,1)'    : 'rgba(245,158,11,1)',
    mid:  variant === 'white' ? 'rgba(255,255,255,0.76)' : 'rgba(245,158,11,0.76)',
    lo:   variant === 'white' ? 'rgba(255,255,255,0.52)' : 'rgba(245,158,11,0.52)',
    arc:  variant === 'white' ? 'rgba(255,255,255,0.38)' : 'rgba(245,158,11,0.38)',
    dot:  variant === 'white' ? 'rgba(255,255,255,0.65)' : 'rgba(245,158,11,0.65)',
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="2.5"  y="9"  width="5" height="9"  rx="2.5" fill={c.lo}  />
      <rect x="9.5"  y="4"  width="5" height="14" rx="2.5" fill={c.hi}  />
      <rect x="16.5" y="7"  width="5" height="11" rx="2.5" fill={c.mid} />
      <path
        d="M2 20 Q12 23 22 20"
        stroke={c.arc}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="12" cy="2" r="1.25" fill={c.dot} />
    </svg>
  )
}

export function SigepWatermark({ size = 380 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="2.5"  y="9"  width="5" height="9"  rx="2.5" fill="rgba(245,158,11,0.06)" />
      <rect x="9.5"  y="4"  width="5" height="14" rx="2.5" fill="rgba(245,158,11,0.09)" />
      <rect x="16.5" y="7"  width="5" height="11" rx="2.5" fill="rgba(245,158,11,0.07)" />
      <path
        d="M2 20 Q12 23 22 20"
        stroke="rgba(245,158,11,0.05)"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="12" cy="2" r="1.25" fill="rgba(245,158,11,0.06)" />
    </svg>
  )
}
