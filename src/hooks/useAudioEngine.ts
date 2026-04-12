'use client';

import { useState, useCallback, useRef } from 'react';
import { audioEngine } from '@/lib/audio/AudioEngine';

export function useAudioEngine() {
  const [isReady, setIsReady] = useState(false);
  const initializingRef = useRef(false);

  const initialize = useCallback(async () => {
    if (isReady || initializingRef.current) return;
    initializingRef.current = true;
    try {
      await audioEngine.initialize();
      setIsReady(true);
    } finally {
      initializingRef.current = false;
    }
  }, [isReady]);

  return { engine: audioEngine, isReady, initialize };
}
