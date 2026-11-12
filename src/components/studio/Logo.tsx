/** The Courtyard Studio mark: a doorway within an arch, standing on a threshold. */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg className="logo__mark" width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
      <path d="M9 40V21a15 15 0 0 1 30 0v19" stroke="currentColor" strokeWidth="1.6" />
      <path d="M17.5 40V22.5a6.5 6.5 0 0 1 13 0V40" stroke="var(--terracotta)" strokeWidth="1.6" />
      <path d="M5 40h38" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span className="logo__type">
        <span className="logo__name">The Courtyard</span>
        <span className="logo__sub">Studio</span>
      </span>
    </span>
  )
}
