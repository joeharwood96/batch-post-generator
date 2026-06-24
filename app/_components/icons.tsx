import type { SVGProps } from "react";

function Base({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconProduct = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
    <path d="M4 7l8 4 8-4M12 11v10" />
  </Base>
);

export const IconDoc = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M6 3h7l5 5v13H6V3Z" />
    <path d="M13 3v5h5M9 13h6M9 17h6" />
  </Base>
);

export const IconCode = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="m9 8-4 4 4 4M15 8l4 4-4 4" />
  </Base>
);

export const IconSparkle = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M12 3c.6 4 1.4 4.8 5.4 5.4-4 .6-4.8 1.4-5.4 5.4-.6-4-1.4-4.8-5.4-5.4 4-.6 4.8-1.4 5.4-5.4Z" />
    <path d="M18 14c.3 2 .7 2.4 2.7 2.7-2 .3-2.4.7-2.7 2.7-.3-2-.7-2.4-2.7-2.7 2-.3 2.4-.7 2.7-2.7Z" />
  </Base>
);
