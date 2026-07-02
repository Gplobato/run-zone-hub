// Vertical bone-conduction line: splits into two waves ("your sound" and
// "the world") and recombines. Only used on the home and on the fone PDP.

export function SignatureTrail() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute right-4 top-0 hidden h-full w-8 md:right-8 md:block lg:right-12"
      viewBox="0 0 32 1000"
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        d="M16 0 L16 220 C16 240, 6 250, 6 280 C 6 320, 26 330, 26 370 C 26 400, 16 410, 16 440 L 16 640 C 16 670, 4 680, 4 710 C 4 750, 28 760, 28 800 C 28 830, 16 840, 16 870 L 16 1000"
        stroke="var(--sage)"
        strokeWidth="1"
        strokeDasharray="2 6"
      />
    </svg>
  );
}
