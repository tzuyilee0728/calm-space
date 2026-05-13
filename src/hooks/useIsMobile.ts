'use client';

import { useEffect, useState } from 'react';

// Treat anything with a coarse pointer OR a narrow viewport as "mobile".
// Coarse-pointer catches phones/tablets even at landscape widths; the width
// breakpoint covers narrow desktop windows where the right drawer would feel
// cramped.
const QUERY = '(pointer: coarse), (max-width: 768px)';

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(QUERY);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return isMobile;
}
