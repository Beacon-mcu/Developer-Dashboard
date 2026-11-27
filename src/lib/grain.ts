// Static grain: SVG noise thresholded to hard dots. Used as a CSS mask over a flat colour (usually the brand
// colour), so the colour shows only as speckles. Shared by the sign-in page and the dashboard frame.
export const NOISE = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 7 -3'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;

// Mask styles: speckles everywhere, or speckles cut to a gradient shape (both masks must pass).
export const grainMask = (shape?: string) =>
  shape
    ? {
        maskImage: `${NOISE}, ${shape}`,
        WebkitMaskImage: `${NOISE}, ${shape}`,
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
      }
    : { maskImage: NOISE, WebkitMaskImage: NOISE };
