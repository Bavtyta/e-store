import type { SVGProps } from 'react';

export interface SearchIconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  size?: 16 | 18 | 20;
}

function iconProps(size: 16 | 18 | 20): SVGProps<SVGSVGElement> {
  return {
    'aria-hidden': true,
    fill: 'none',
    focusable: 'false',
    height: size,
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 1.75,
    viewBox: '0 0 24 24',
    width: size,
  };
}

export function SearchIcon({ size = 20, ...props }: SearchIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function CloseIcon({ size = 16, ...props }: SearchIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function Grid2x2Icon({ size = 20, ...props }: SearchIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <rect height="6" rx="1" width="6" x="4" y="4" />
      <rect height="6" rx="1" width="6" x="14" y="4" />
      <rect height="6" rx="1" width="6" x="4" y="14" />
      <rect height="6" rx="1" width="6" x="14" y="14" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 16, ...props }: SearchIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  );
}

export function ArrowLeftIcon({ size = 20, ...props }: SearchIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M19 12H5M10 7l-5 5 5 5" />
    </svg>
  );
}

export function SpinnerIcon({ size = 20, ...props }: SearchIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    </svg>
  );
}

export function WrenchIcon({ size = 20, ...props }: SearchIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M14.7 6.3a4.5 4.5 0 0 0-5.8 5.8L4 17a2.1 2.1 0 0 0 3 3l4.9-4.9a4.5 4.5 0 0 0 5.8-5.8l-2.8 2.8-3-3 2.8-2.8Z" />
    </svg>
  );
}

export function TruckIcon({ size = 20, ...props }: SearchIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M3 6h11v10H3zM14 10h3l4 4v2h-7z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  );
}

export function PhoneIcon({ size = 20, ...props }: SearchIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M7.2 4.5 9.4 8 7.7 9.7a14.3 14.3 0 0 0 6.6 6.6l1.7-1.7 3.5 2.2v2.5a1.7 1.7 0 0 1-1.7 1.7A14.8 14.8 0 0 1 3 6.2a1.7 1.7 0 0 1 1.7-1.7h2.5Z" />
    </svg>
  );
}

export function MapPinIcon({ size = 20, ...props }: SearchIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
