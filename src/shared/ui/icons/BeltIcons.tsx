import type { SVGProps } from 'react';

export type BeltIconSize = 16 | 18 | 20 | 22 | 24 | 48;

export interface BeltIconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  size?: BeltIconSize;
}

function iconProps(size: BeltIconSize): SVGProps<SVGSVGElement> {
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

export function SearchIcon({ size = 20, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <circle cx="10.75" cy="10.75" r="6.25" />
      <path d="m15.35 15.35 1.15 1.15M17.25 17.25 20 20" />
    </svg>
  );
}

export function CloseIcon({ size = 16, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function MenuIcon({ size = 24, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M4 7h16M4 12h12M4 17h16" />
      <path d="M18 12h2" />
    </svg>
  );
}

export function Grid2x2Icon({ size = 20, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <rect height="6" rx="0.75" width="6" x="4" y="4" />
      <rect height="6" rx="0.75" width="6" x="14" y="4" />
      <rect height="6" rx="0.75" width="6" x="4" y="14" />
      <rect height="6" rx="0.75" width="6" x="14" y="14" />
    </svg>
  );
}

export function HomeIcon({ size = 24, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.5 9.5V20h13V9.5M9.5 20v-5.5h5V20" />
    </svg>
  );
}

export function CartIcon({ size = 22, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M2.5 4h2.25l2.4 11h11.7l1.5-7.25H6.1" />
      <path d="M6.55 9.75h2" />
      <circle cx="9" cy="19.5" r="1.5" />
      <circle cx="18" cy="19.5" r="1.5" />
    </svg>
  );
}

export function HeartIcon({ size = 22, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M20.25 5.25a5.2 5.2 0 0 0-7.35 0L12 6.15l-.9-.9a5.2 5.2 0 0 0-7.35 7.35L12 20.5l8.25-7.9a5.2 5.2 0 0 0 0-7.35Z" />
    </svg>
  );
}

export function UserIcon({ size = 22, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <circle cx="12" cy="8" r="3.75" />
      <path d="M4.5 20.5c.45-4 3.55-6.5 7.5-6.5s7.05 2.5 7.5 6.5" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 16, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M4.5 12h14M14 7.5l4.5 4.5-4.5 4.5" />
    </svg>
  );
}

export function ArrowLeftIcon({ size = 20, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M19.5 12h-14M10 7.5 5.5 12l4.5 4.5" />
    </svg>
  );
}

export function PlusIcon({ size = 16, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MinusIcon({ size = 16, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function CheckIcon({ size = 16, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="m5 12.5 4.25 4.25L19 7" />
    </svg>
  );
}

export function InfoIcon({ size = 16, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  );
}

export function AlertIcon({ size = 16, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M12 3.5 21 20H3L12 3.5Z" />
      <path d="M12 9v5M12 17h.01" />
    </svg>
  );
}

export function ImageIcon({ size = 48, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <rect height="18" rx="1.5" width="18" x="3" y="3" />
      <circle cx="8.25" cy="8.25" r="1.5" />
      <path d="m4.5 19 5.25-5.25 3.5 3.5 2.75-2.75 4.5 4.5" />
    </svg>
  );
}

export function SpinnerIcon({ size = 20, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    </svg>
  );
}

export function WrenchIcon({ size = 20, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M14.7 6.3a4.5 4.5 0 0 0-5.8 5.8L4 17a2.1 2.1 0 0 0 3 3l4.9-4.9a4.5 4.5 0 0 0 5.8-5.8l-2.8 2.8-3-3 2.8-2.8Z" />
      <path d="m9.75 14.25 1 1" />
    </svg>
  );
}

export function TruckIcon({ size = 20, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M3 6h11v10H3zM14 10h3l4 4v2h-7z" />
      <path d="M14 12.5h2" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  );
}

export function PhoneIcon({ size = 20, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M7.2 4.5 9.4 8 7.7 9.7a14.3 14.3 0 0 0 6.6 6.6l1.7-1.7 3.5 2.2v2.5a1.7 1.7 0 0 1-1.7 1.7A14.8 14.8 0 0 1 3 6.2a1.7 1.7 0 0 1 1.7-1.7h2.5Z" />
    </svg>
  );
}

export function MapPinIcon({ size = 20, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
      <path d="M10.75 10h2.5" />
    </svg>
  );
}

export function DiscountTagIcon({ size = 20, ...props }: BeltIconProps) {
  return (
    <svg {...props} {...iconProps(size)}>
      <path d="M4 5.5V12l7.75 7.75a1.75 1.75 0 0 0 2.5 0l5.5-5.5a1.75 1.75 0 0 0 0-2.5L12 4H5.5A1.5 1.5 0 0 0 4 5.5Z" />
      <circle cx="8" cy="8" r="1" />
      <path d="m11 15 4-4M11.25 11.25h.01M14.75 14.75h.01" />
    </svg>
  );
}
