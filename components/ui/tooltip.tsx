'use client';

import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({ content, children, side = 'top', delay = 400 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  function show() {
    timer.current = setTimeout(() => setVisible(true), delay);
  }
  function hide() {
    clearTimeout(timer.current);
    setVisible(false);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  const posClass = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[side];

  return (
    <span className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <span
          className={`pointer-events-none absolute z-[9999] whitespace-nowrap rounded-md bg-zinc-800 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200 shadow-xl ${posClass}`}
        >
          {content}
        </span>
      )}
    </span>
  );
}
