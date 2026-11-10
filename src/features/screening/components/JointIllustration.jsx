// Decorative atlas artwork only; highlights do not represent a patient's diagnosis.
const atlasCells = {
  shoulder: [0, 0],
  spine: [1, 0],
  elbow: [2, 0],
  knee: [0, 1],
  hip: [1, 1],
  ankle: [2, 1],
}
export default function JointIllustration({ region = 'knee', large = false }) {
  const cell = atlasCells[region]
  if (!cell)
    return (
      <svg
        viewBox="0 0 180 90"
        aria-hidden="true"
        className={large ? 'h-48 w-full text-brand-600' : 'h-24 w-full text-brand-600'}
      >
        <path
          d="M50 0 L65 0 L86 36 L114 60 L144 80 L134 90 L96 70 L72 51 Z"
          fill="currentColor"
          opacity=".2"
        />
        <path d="M57 2 L80 42 M93 55 L137 84" stroke="currentColor" strokeWidth="4" fill="none" />
        <circle cx="86" cy="46" r="16" className="fill-orange-300" opacity=".7" />
        <circle cx="86" cy="46" r="6" className="fill-orange-400" />
      </svg>
    )
  const [column, row] = cell
  return (
    <svg
      viewBox="0 0 512 512"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={large ? 'h-56 w-full rounded-xl' : 'h-24 w-full rounded-lg'}
    >
      <image
        href="/images/screening/joint-atlas.png"
        x={-column * 512}
        y={-row * 512}
        width="1536"
        height="1024"
      />
    </svg>
  )
}
