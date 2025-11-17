import { cn } from "@/lib/utils";

interface LogoSVGProps {
  className?: string;
  width?: number;
  height?: number;
}

/**
 * SVG version of the Capt.today logo
 * Use this for exports, favicons, or when you need a static logo without React
 */
export function LogoSVG({ className, width = 120, height = 40 }: LogoSVGProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "rgb(154, 103, 255)", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "rgb(255, 255, 255)", stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* "Capt" text */}
      <text
        x="0"
        y="28"
        fontFamily="Plus Jakarta Sans, sans-serif"
        fontSize="28"
        fontWeight="700"
        fill="url(#textGradient)"
      >
        Capt
      </text>

      {/* Star icon (LucideStars path) */}
      <g transform="translate(68, 8)">
        <path
          d="M12 2L9.5 8.5L3 9L7.5 13L6 19.5L12 16L18 19.5L16.5 13L21 9L14.5 8.5L12 2Z"
          fill="white"
          transform="scale(0.6)"
        />
      </g>

      {/* "today" text */}
      <text
        x="82"
        y="28"
        fontFamily="Plus Jakarta Sans, sans-serif"
        fontSize="12"
        fontWeight="700"
        fill="url(#textGradient)"
        opacity="0.9"
      >
        today
      </text>
    </svg>
  );
}

/**
 * Export function to download the logo as SVG
 */
export function downloadLogoSVG() {
  const svgContent = `<svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:rgb(154, 103, 255);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(255, 255, 255);stop-opacity:1" />
    </linearGradient>
  </defs>
  <text x="0" y="28" font-family="Plus Jakarta Sans, sans-serif" font-size="28" font-weight="700" fill="url(#textGradient)">Capt</text>
  <g transform="translate(68, 8)">
    <path d="M12 2L9.5 8.5L3 9L7.5 13L6 19.5L12 16L18 19.5L16.5 13L21 9L14.5 8.5L12 2Z" fill="white" transform="scale(0.6)"/>
  </g>
  <text x="82" y="28" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="url(#textGradient)" opacity="0.9">today</text>
</svg>`;

  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "capt-today-logo.svg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
