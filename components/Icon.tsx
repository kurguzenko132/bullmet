import type { SVGProps } from 'react';

type IconName = 'search' | 'cart' | 'user' | 'factory' | 'custom' | 'materials' | 'truck' | 'arrow' | 'shield' | 'tools' | 'spark' | 'file' | 'phone' | 'mail' | 'pin' | 'clock' | 'instagram' | 'telegram' | 'request' | 'ruler' | 'calculator' | 'hammer' | 'package';

const common = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
} as const;

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      {name === 'search' && <><circle cx="10.7" cy="10.7" r="6.6" {...common}/><path d="m16 16 5 5" {...common}/></>}
      {name === 'cart' && <><path d="M4 5h2l2 11h10l2-8H7" {...common}/><circle cx="10" cy="20" r="1.4" {...common}/><circle cx="18" cy="20" r="1.4" {...common}/></>}
      {name === 'user' && <><circle cx="12" cy="8" r="4" {...common}/><path d="M4.5 21a7.5 7.5 0 0 1 15 0" {...common}/></>}
      {name === 'factory' && <><path d="M3 21V9l6 4V9l6 4V6h6v15H3Z" {...common}/><path d="M7 17h2m4 0h2m4 0h1" {...common}/></>}
      {name === 'custom' && <><path d="M4 18 16.5 5.5a2.2 2.2 0 0 1 3.1 3.1L7 21H4v-3Z" {...common}/><path d="m14.5 7.5 3 3" {...common}/></>}
      {name === 'materials' && <><path d="M5 19 19 5M5 5l14 14" {...common}/><path d="M8 3h8M8 21h8" {...common}/></>}
      {name === 'truck' && <><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" {...common}/><circle cx="7" cy="18" r="2" {...common}/><circle cx="18" cy="18" r="2" {...common}/></>}
      {name === 'arrow' && <><path d="M5 12h14M13 6l6 6-6 6" {...common}/></>}
      {name === 'shield' && <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" {...common}/><path d="m9 12 2 2 4-5" {...common}/></>}
      {name === 'tools' && <><path d="M14 6a4 4 0 0 0 4 4l3-3a7 7 0 0 1-9 9l-7 7-4-4 7-7a7 7 0 0 1 9-9l-3 3Z" {...common}/></>}
      {name === 'spark' && <><path d="M12 2v7M12 15v7M2 12h7M15 12h7M5 5l5 5M14 14l5 5M19 5l-5 5M10 14l-5 5" {...common}/></>}
      {name === 'file' && <><path d="M6 2h8l4 4v16H6z" {...common}/><path d="M14 2v5h5M9 12h6M9 16h6" {...common}/></>}
      {name === 'phone' && <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" {...common}/></>}
      {name === 'mail' && <><path d="M4 5h16v14H4z" {...common}/><path d="m4 7 8 6 8-6" {...common}/></>}
      {name === 'pin' && <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" {...common}/><circle cx="12" cy="10" r="2.5" {...common}/></>}
      {name === 'clock' && <><circle cx="12" cy="12" r="9" {...common}/><path d="M12 7v5l3 2" {...common}/></>}
      {name === 'instagram' && <><rect x="4" y="4" width="16" height="16" rx="4" {...common}/><circle cx="12" cy="12" r="3" {...common}/><path d="M17 7.5h.01" {...common}/></>}
      {name === 'telegram' && <><path d="m21 4-4 17-6-5-4 3 1-5L3 11l18-7Z" {...common}/></>}

      {name === 'request' && <><path d="M5 4h14v14H8l-3 3V4Z" {...common}/><path d="M8 8h8M8 12h5" {...common}/></>}
      {name === 'ruler' && <><path d="M4 17 17 4l3 3L7 20l-3-3Z" {...common}/><path d="M9 18 6 15M12 15l-2-2M15 12l-3-3M18 9l-2-2" {...common}/></>}
      {name === 'calculator' && <><rect x="5" y="3" width="14" height="18" rx="2" {...common}/><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" {...common}/></>}
      {name === 'hammer' && <><path d="M14 5 19 10M13 4l2-2 7 7-2 2" {...common}/><path d="M14 9 5 18a2 2 0 0 0 3 3l9-9" {...common}/></>}
      {name === 'package' && <><path d="M21 8v10l-9 4-9-4V8l9-4 9 4Z" {...common}/><path d="M3 8l9 4 9-4M12 22V12M7.5 6 16.5 10" {...common}/></>}
    </svg>
  );
}
