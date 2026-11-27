import { cn } from "@/lib/utils";

// Beacon's logo. The PNGs in /public are white on transparent; here they are used as a mask over the text colour,
// so one file reads dark in the light theme and white in the dark theme (and follows any text-* class).
//   full: the mark and the word "beacon" (public/logo.png, 1562x459)
//   mark: the mark alone, for tight spots like the collapsed sidebar (public/logo-mark.png, 330x459)
const FILES = {
  full: { src: "/logo.png", ratio: 1562 / 459 },
  mark: { src: "/logo-mark.png", ratio: 330 / 459 },
} as const;

export function Logo({ variant = "full", className }: { variant?: keyof typeof FILES; className?: string }) {
  const { src, ratio } = FILES[variant];
  const mask = `url(${src}) left center / contain no-repeat`;
  return (
    <span
      role="img"
      aria-label="Beacon"
      className={cn("inline-block h-6 shrink-0 bg-current", className)}
      style={{ aspectRatio: ratio, mask, WebkitMask: mask }}
    />
  );
}
