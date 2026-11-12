const PATHS = {
  'arrow-left': 'M14.5 5.5 8 12l6.5 6.5',
  'arrow-right': 'M9.5 5.5 16 12l-6.5 6.5',
  'arrow-up-right': 'M8 16 16 8M9 8h7v7',
  close: 'M6 6l12 12M18 6 6 18',
  plus: 'M12 5.5v13M5.5 12h13',
  minus: 'M5.5 12h13',
  reset: 'M5 12a7 7 0 1 0 2.2-5.1M5 5.5v4h4',
  grid: 'M5 5h5.5v5.5H5zM13.5 5H19v5.5h-5.5zM5 13.5h5.5V19H5zM13.5 13.5H19V19h-5.5z',
  expand: 'M5 10V5h5M19 10V5h-5M5 14v5h5M19 14v5h-5',
  menu: 'M4.5 8h15M4.5 16h15',
  chevron: 'M6.5 14.5 12 9l5.5 5.5',
} as const

export type IconName = keyof typeof PATHS

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
