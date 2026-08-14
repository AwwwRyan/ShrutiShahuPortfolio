type MotifType = 'blob' | 'sparkle' | 'ring' | 'dots';
type MotifTone = 'chartreuse' | 'paper' | 'olive-sage' | 'near-black-olive';

const TONE_VARS: Record<MotifTone, string> = {
  chartreuse: 'var(--color-chartreuse)',
  paper: 'var(--color-paper)',
  'olive-sage': 'var(--color-olive-sage)',
  'near-black-olive': 'var(--color-near-black-olive)',
};

type MotifProps = {
  type: MotifType;
  size?: number;
  tone?: MotifTone;
  opacity?: number;
  /** Parallax intensity — higher reads as "nearer" and moves more. Plain 0/undefined means static. */
  depth?: number;
  className?: string;
};

/**
 * Shared accent shape — organic blob, four-point sparkle, thin ring, or a small dot grid.
 * No client-side JS of its own: the parallax motion comes entirely from CSS reading the
 * `--parallax-x`/`--parallax-y` custom properties that <ParallaxController> maintains, so
 * this stays a plain server-renderable component. When those vars are unset (reduced-motion,
 * touch, or the controller never mounted) they fall back to 0 and the motif simply sits still.
 */
export function Motif({
  type,
  size = 64,
  tone = 'chartreuse',
  opacity = 0.5,
  depth = 1,
  className = '',
}: MotifProps) {
  const color = TONE_VARS[tone];
  const shiftX = depth * 10;
  const shiftY = depth * 8;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={`pointer-events-none absolute transition-transform duration-300 ease-out ${className}`}
      style={{
        opacity,
        transform: `translate(calc(var(--parallax-x, 0) * ${shiftX}px), calc(var(--parallax-y, 0) * ${shiftY}px))`,
      }}
    >
      {type === 'blob' && (
        <path
          d="M50 8C68 6 90 22 92 45C94 68 76 90 52 92C28 94 8 78 6 54C4 30 24 10 50 8Z"
          fill={color}
        />
      )}
      {type === 'sparkle' && (
        <path d="M50 4 L58 40 L96 50 L58 60 L50 96 L42 60 L4 50 L42 40 Z" fill={color} />
      )}
      {type === 'ring' && <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="4" />}
      {type === 'dots' && (
        <g fill={color}>
          {Array.from({ length: 4 }).map((_, row) =>
            Array.from({ length: 4 }).map((_, col) => (
              <circle key={`${row}-${col}`} cx={14 + col * 24} cy={14 + row * 24} r="4" />
            )),
          )}
        </g>
      )}
    </svg>
  );
}
