'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import { Perf } from 'r3f-perf';
import { MOUSE, TOUCH } from 'three';
import GroundPlane from './GroundPlane';
import RoomShell from './RoomShell';
import StationLayer3D, { type PreviewCells } from './StationLayer3D';
import DragHandler3D from './DragHandler3D';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useStation } from '@/hooks/useStation';

// On mobile, single-finger touches must fall through to mesh pointer events
// (station drag wins). Setting touches.ONE to a value not in the TOUCH enum
// causes OrbitControls's switch-case to no-op for one-finger gestures.
const NO_TOUCH = -1 as unknown as TOUCH;

// True 45° isometric view — camera offset from target by equal x/y/z so the
// view direction is (-1, -1, -1). Target is the cube's mid-height so the room
// centers as a diamond in the frame.
const ISO_CAMERA_POS: [number, number, number] = [13, 17.7, 13];
const ISO_TARGET: [number, number, number] = [0, 4.7, 0];

// Minimal duck-type for the bits of OrbitControls we need to touch imperatively.
type OrbitControlsHandle = {
  object: { position: { set: (x: number, y: number, z: number) => void } };
  target: { set: (x: number, y: number, z: number) => void };
  update: () => void;
};

export default function Scene3D() {
  const isMobile = useIsMobile();
  const { toolboxOpen } = useStation();
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const [preview, setPreview] = useState<PreviewCells>(null);
  const [occupied, setOccupied] = useState<Set<string>>(new Set());
  const [panMode, setPanMode] = useState(false);
  const controlsRef = useRef<OrbitControlsHandle>(null);

  // Hold Space to pan — standard 3D-modeling convention. Skip when typing in an input.
  useEffect(() => {
    const isEditable = (el: EventTarget | null): boolean => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      if (isEditable(e.target)) return;
      e.preventDefault();
      setPanMode(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      setPanMode(false);
    };
    const onBlur = () => setPanMode(false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  const resetView = () => {
    const c = controlsRef.current;
    if (!c) return;
    c.object.position.set(...ISO_CAMERA_POS);
    c.target.set(...ISO_TARGET);
    c.update();
  };

  return (
    <div
      data-scene-3d
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        cursor: panMode ? 'grab' : 'default',
      }}
    >
      <Canvas
        shadows="soft"
        dpr={[1, isMobile ? 1.5 : 2]}
        camera={{ position: ISO_CAMERA_POS, fov: 35 }}
        gl={{ toneMappingExposure: 1.15 }}
        style={{
          width: '100%',
          height: '100%',
          // Sunset / paper-lantern sky — warm cream fading to peachy glow
          background:
            'radial-gradient(ellipse at 50% 35%, #fff4dc 0%, #ffdcb3 45%, #ffb798 85%, #f79c8a 100%)',
        }}
      >
        {/* Image-based lighting via Drei's `sunset` preset — provides ambient,
            rim, and environment reflection in a single probe. Replaces the
            previous ambient + hemisphere + rim-directional + 2 point lights.
            Materials with non-zero `envMapIntensity` will pick up warm tones. */}
        <Environment preset="sunset" environmentIntensity={0.6} />

        {/* Single key light — kept for hard shadow casting (IBL alone cannot cast
            shadow maps). shadow-normalBias offsets along the surface normal to
            prevent acne without the peter-panning (detached shadow) that plain
            shadow-bias causes; bias near zero keeps shadows anchored. */}
        <directionalLight
          position={[6, 12, 4]}
          intensity={1.2}
          color="#fff1c9"
          castShadow
          shadow-mapSize-width={isMobile ? 1024 : 2048}
          shadow-mapSize-height={isMobile ? 1024 : 2048}
          shadow-camera-near={0.5}
          shadow-camera-far={30}
          shadow-camera-left={-7}
          shadow-camera-right={7}
          shadow-camera-top={8}
          shadow-camera-bottom={-7}
          shadow-bias={-0.00005}
          shadow-normalBias={0.04}
          shadow-radius={3}
        />

        <OrbitControls
          ref={controlsRef as unknown as React.Ref<never>}
          target={ISO_TARGET}
          enabled={orbitEnabled}
          enablePan
          mouseButtons={{
            LEFT: panMode ? MOUSE.PAN : MOUSE.ROTATE,
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.PAN,
          }}
          touches={{
            // Mobile: ONE disabled so single-finger lets station pointer events
            // win. Two-finger handles pan + pinch-zoom.
            ONE: isMobile ? NO_TOUCH : TOUCH.ROTATE,
            TWO: TOUCH.DOLLY_PAN,
          }}
          minDistance={8}
          maxDistance={30}
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI / 2 - 0.05}
        />

        <Suspense fallback={null}>
          <RoomShell />
          <GroundPlane preview={preview} occupied={occupied} dragging={preview !== null || !orbitEnabled} />
          <StationLayer3D
            setOrbitEnabled={setOrbitEnabled}
            setPreview={setPreview}
            setOccupied={setOccupied}
            panMode={panMode}
          />
          <DragHandler3D />
          {/* Dev-only perf overlay: FPS, draw calls, triangle count, GPU memory.
              Next strips the falsy branch from production builds via dead-code
              elimination, so r3f-perf does not ship to prod. */}
          {process.env.NODE_ENV === 'development' && <Perf position="top-left" />}
          {/* Soft contact shadows — a tight darker pool where each object meets
              the floor. Positioned just above the rug tile planes (y=0.005) so
              the contact darkness reads over the rug. Short `far` so only the
              near-floor portion of each object contributes (walls/upper geometry
              don't get baked in), keeping the pool tight to the footprint. */}
          <ContactShadows
            position={[0, 0.007, 0]}
            opacity={0.5}
            scale={12}
            blur={1.4}
            far={1.5}
            resolution={1024}
            color="#4a3420"
          />
        </Suspense>
      </Canvas>

      <button
        type="button"
        onClick={resetView}
        aria-label="Reset view to isometric angle"
        style={{
          position: 'absolute',
          // Track the mobile sheet state: clear the expanded sheet (~140px) or
          // sit just above the collapsed handle (~36px). Desktop always uses
          // the safe-area-inset offset to clear the iOS home indicator.
          bottom: isMobile
            ? (toolboxOpen
                ? 'calc(150px + env(safe-area-inset-bottom))'
                : 'calc(48px + env(safe-area-inset-bottom))')
            : 'calc(16px + env(safe-area-inset-bottom))',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          padding: '8px 18px',
          background: 'rgba(255, 255, 255, 0.92)',
          border: '2px solid #ff8ab8',
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 600,
          color: '#e64d8b',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          backdropFilter: 'blur(6px)',
          userSelect: 'none',
        }}
      >
        Reset view
      </button>
    </div>
  );
}
