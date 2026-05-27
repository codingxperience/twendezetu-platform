'use client';

import { cloneElement } from 'react';

const PATHS = {
  search: <path d="M11 2a9 9 0 105.66 16.02l4.16 4.16 1.42-1.42-4.16-4.16A9 9 0 0011 2zm0 2a7 7 0 110 14 7 7 0 010-14z" />,
  pin: <path d="M12 2a8 8 0 00-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 00-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z" />,
  cal: <path d="M7 2v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2V2h-2v2H9V2H7zm-2 8h14v10H5V10z" />,
  users: <path d="M9 12a4 4 0 100-8 4 4 0 000 8zm0 2c-3.3 0-7 1.7-7 5v2h14v-2c0-3.3-3.7-5-7-5zm9-2a3 3 0 100-6 3 3 0 000 6zm.5 2h-1c1 .8 1.5 1.9 1.5 3v2h3v-2c0-1.7-2-3-3.5-3z" />,
  heart: <path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5 6 5c2 0 3.5 1 4 2 .5-1 2-2 4-2 3.5 0 5 4 3.5 7-2.5 4.5-9.5 9-9.5 9z" />,
  star: <path d="M12 2l3 6.5 7 .9-5 4.6 1.4 7L12 17.5 5.6 21l1.4-7-5-4.6 7-.9L12 2z" />,
  chev: <path d="M9 6l6 6-6 6" />,
  chevd: <path d="M6 9l6 6 6-6" />,
  arrow: <path d="M5 12h14m-6-6l6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M5 12l5 5L20 7" />,
  bell: <path d="M12 2a6 6 0 00-6 6v4l-2 3v1h16v-1l-2-3V8a6 6 0 00-6-6zm-2 16a2 2 0 104 0h-4z" />,
  msg: <path d="M3 4h18v13H7l-4 4V4zm4 4v2h10V8H7zm0 4v2h7v-2H7z" />,
  sliders: <path d="M3 6h12v2H3V6zm14 0h4v2h-4V6zm-6 5h10v2H11v-2zM3 11h6v2H3v-2zm6 5h12v2H9v-2zm-6 0h4v2H3v-2z" />,
  grid: <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />,
  map: <path d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2-6-2zm0 2.3l6 2v11.4l-6-2V5.3z" />,
  food: <path d="M11 2v9.5A2.5 2.5 0 008.5 14H8v8h2v-8h.5A4.5 4.5 0 0015 9.5V2h-1v6h-1V2h-1v6h-1V2h-1zm8 0c-2 0-4 2-4 5s2 5 4 5v10h2V2h-2z" />,
  music: <path d="M9 3v12.2A3.5 3.5 0 1011 18V7l8-2v8.2A3.5 3.5 0 1021 16V3l-12 2z" />,
  cam: <path d="M9 3l-2 3H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-3l-2-3H9zm3 5a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6z" />,
  flower: <path d="M12 2a3 3 0 00-3 3c0 1.3.8 2.4 2 2.8V9a3 3 0 00-3 3 3 3 0 00.2 1.1A3 3 0 005 16a3 3 0 005.8 1 3 3 0 002.4 0 3 3 0 105.8-1 3 3 0 00-1.2-2.9c.1-.3.2-.7.2-1.1a3 3 0 00-3-3v-1.2A3 3 0 0012 2zm0 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />,
  crown: <path d="M3 6l4 4 5-6 5 6 4-4v12H3V6zm2 14h14v-2H5v2z" />,
  car: <path d="M5 11l2-6h10l2 6h1v8h-3v-2H7v2H4v-8h1zm2.4-4l-1 4h11.2l-1-4H7.4zM7 14a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm10 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />,
  mic: <path d="M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3zM7 11a5 5 0 0010 0h-2a3 3 0 11-6 0H7zm5 7v3h-2v2h4v-2h-2v-3z" />,
  shield: <path d="M12 2L4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z" />,
  bolt: <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />,
  leaf: <path d="M17 8C8 8 4 13 4 20c8 0 13-4 13-13zM4 20s2-7 9-9" />,
  ext: <path d="M14 3v2h3.6l-7.3 7.3 1.4 1.4L19 6.4V10h2V3h-7zM5 5v14h14v-7h-2v5H7V7h5V5H5z" />,
  play: <path d="M8 5v14l11-7L8 5z" />,
  close: <path d="M18 6L6 18M6 6l12 12" />,
  share: <path d="M18 16a3 3 0 00-2.3 1.1l-6.5-3.6a3 3 0 000-3l6.5-3.6A3 3 0 1014 5l-6.5 3.6a3 3 0 100 6.8L14 19a3 3 0 104-3z" />,
  sparkle: <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zm7 10l.8 2.4L22 15l-2.2.6L19 18l-.8-2.4L16 15l2.2-.6L19 12zM5 14l.8 2.4L8 17l-2.2.6L5 20l-.8-2.4L2 17l2.2-.6L5 14z" />,
  instagram: <path d="M12 2c2.7 0 3 0 4.1.1 1 0 1.7.2 2.3.4.6.2 1.1.5 1.6 1 .5.5.8 1 1 1.6.2.6.4 1.3.4 2.3 0 1.1.1 1.4.1 4.1s0 3-.1 4.1c0 1-.2 1.7-.4 2.3a4.4 4.4 0 01-1 1.6c-.5.5-1 .8-1.6 1-.6.2-1.3.4-2.3.4-1.1 0-1.4.1-4.1.1s-3 0-4.1-.1c-1 0-1.7-.2-2.3-.4a4.4 4.4 0 01-1.6-1 4.4 4.4 0 01-1-1.6c-.2-.6-.4-1.3-.4-2.3-.1-1.1-.1-1.4-.1-4.1s0-3 .1-4.1c0-1 .2-1.7.4-2.3a4.4 4.4 0 011-1.6c.5-.5 1-.8 1.6-1 .6-.2 1.3-.4 2.3-.4C9 2 9.3 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm5.5-3.3a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z" />,
  whatsapp: <path d="M12 2a10 10 0 00-8.6 15l-1.4 5 5-1.4A10 10 0 1012 2zm5.4 13c-.2.6-1.2 1.2-1.6 1.3-.4 0-.9.2-2.7-.6-2.3-1-3.8-3.3-3.9-3.5-.1-.1-.9-1.2-.9-2.3 0-1 .6-1.6.8-1.8.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.7 1.7c.1.2.1.4 0 .6l-.4.5-.3.4c-.1.1-.2.2 0 .5.2.3 1 1.6 2.1 2.5 1.4 1.2 2.6 1.6 3 1.7.3.1.5 0 .7-.2l.7-.9c.2-.2.3-.2.6-.1l1.6.7c.3.2.4.3.5.4 0 .2 0 .8-.2 1.4z" />,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
};

const STROKE_NAMES = new Set(['chev', 'chevd', 'arrow', 'plus', 'check', 'close', 'menu']);

export function Icon({ name, size = 16, color = 'currentColor', style }) {
  const path = PATHS[name] || PATHS.sparkle;
  const isStroke = STROKE_NAMES.has(name);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      style={{ display: 'inline-block', verticalAlign: 'middle', flex: '0 0 auto', ...style }}
      aria-hidden="true"
    >
      {cloneElement(path, {
        fill: color,
        stroke: isStroke ? color : 'none',
        strokeWidth: isStroke ? 2 : 0,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      })}
    </svg>
  );
}
