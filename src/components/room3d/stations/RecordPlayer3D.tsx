'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { CanvasTexture, type Group } from 'three';

// Memphis-style playful palette — bright saturated primaries + cream
const CORAL = '#ff6f59';        // main cabinet — bright warm coral/orange
const CREAM = '#fff2dc';        // top plate, soft bone
const OUTLINE = '#2a2420';      // near-black outline / shadow line
const VINYL = '#181311';        // record base color

const SUNSHINE = '#ffd23f';     // cheerful yellow
const BUBBLEGUM = '#ff8ab8';    // bright pink
const MINT = '#5cc9b2';         // mint/teal
const COBALT = '#3a86ff';       // playful cobalt blue
const APPLE = '#8ac926';        // apple green
const CHERRY = '#e63946';       // cherry red

/**
 * Procedurally generate a vinyl-record surface texture:
 * dark base + many concentric grooves + soft radial sheen.
 * Applied to a flat disc on top of the record body.
 */
function useVinylTexture(): CanvasTexture | null {
  return useMemo(() => {
    if (typeof document === 'undefined') return null;
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const cx = size / 2;
    const cy = size / 2;

    // Dark vinyl base
    ctx.fillStyle = '#181311';
    ctx.fillRect(0, 0, size, size);

    // Subtle sheen — as if a warm light reflects off the grooves
    const sheen = ctx.createRadialGradient(cx * 0.7, cy * 0.7, 8, cx, cy, size * 0.52);
    sheen.addColorStop(0, 'rgba(180, 150, 140, 0.18)');
    sheen.addColorStop(0.6, 'rgba(80, 65, 60, 0.06)');
    sheen.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, size, size);

    // Concentric grooves — many thin rings give the characteristic vinyl look
    for (let r = 28; r < size / 2 - 4; r += 2) {
      // Light groove highlight
      ctx.strokeStyle = 'rgba(160, 135, 128, 0.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      // Darker groove valley just next to it
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 0.9, 0, Math.PI * 2);
      ctx.stroke();
    }

    const tex = new CanvasTexture(canvas);
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

export default function RecordPlayer3D({ isActive = false }: { isActive?: boolean }) {
  const recordRef = useRef<Group>(null);
  const vinylTexture = useVinylTexture();

  useFrame((_, delta) => {
    if (!recordRef.current) return;
    const speed = isActive ? 1.8 : 0.25;
    recordRef.current.rotation.y += speed * delta;
  });

  return (
    <group>
      {/* Cabinet body — chunky rounded box, like a kid's toy */}
      <RoundedBox
        args={[1.7, 1.0, 1.3]}
        radius={0.22}
        smoothness={6}
        position={[0, 0.5, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={CORAL} roughness={0.55} />
      </RoundedBox>

      {/* Turntable platter — soft cream disc */}
      <mesh position={[0, 1.04, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.64, 0.64, 0.04, 48]} />
        <meshStandardMaterial color={CREAM} roughness={0.65} />
      </mesh>

      {/* Vinyl record — spins */}
      <group ref={recordRef} position={[0, 1.07, 0]}>
        {/* Record body — slightly thick dark disc */}
        <mesh castShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.025, 64]} />
          <meshStandardMaterial color={VINYL} roughness={0.3} metalness={0.25} />
        </mesh>
        {/* Real groove texture — thin disc on top of the record body */}
        <mesh position={[0, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.55, 64]} />
          <meshStandardMaterial
            map={vinylTexture ?? undefined}
            color={VINYL}
            roughness={0.25}
            metalness={0.3}
          />
        </mesh>
        {/* Center label — sunny yellow */}
        <mesh position={[0, 0.018, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.005, 32]} />
          <meshStandardMaterial color={SUNSHINE} roughness={0.4} />
        </mesh>
        {/* Inner pink dot */}
        <mesh position={[0, 0.021, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.003, 24]} />
          <meshStandardMaterial color={BUBBLEGUM} roughness={0.4} />
        </mesh>
        {/* Spindle */}
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.04, 16]} />
          <meshStandardMaterial color={OUTLINE} />
        </mesh>
      </group>

      {/* Tonearm base — bright mint, like a Memphis knob */}
      <mesh position={[0.58, 1.1, -0.48]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.1, 24]} />
        <meshStandardMaterial color={MINT} roughness={0.5} />
      </mesh>
      <mesh position={[0.58, 1.15, -0.48]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.03, 24]} />
        <meshStandardMaterial color={CREAM} roughness={0.5} />
      </mesh>

      {/* Tonearm rod — tilted toward record center */}
      <group position={[0.58, 1.13, -0.48]} rotation={[0, -Math.PI / 3.2, 0]}>
        <mesh position={[-0.32, 0, 0]} castShadow>
          <boxGeometry args={[0.6, 0.04, 0.05]} />
          <meshStandardMaterial color={CREAM} roughness={0.55} />
        </mesh>
        {/* Needle head */}
        <mesh position={[-0.62, -0.02, 0]} castShadow>
          <boxGeometry args={[0.12, 0.07, 0.09]} />
          <meshStandardMaterial color={CHERRY} roughness={0.5} />
        </mesh>
      </group>

      {/* Front speaker grill — bright bubblegum panel with proper depth so the
          rounded edges read as soft corners, not a floating pill. Centered
          within the flat front face (x:[-0.63,0.63], y:[0.22,0.78]). */}
      <RoundedBox
        args={[0.44, 0.32, 0.06]}
        radius={0.025}
        smoothness={4}
        position={[-0.4, 0.4, 0.635]}
        castShadow
      >
        <meshStandardMaterial color={BUBBLEGUM} roughness={0.75} />
      </RoundedBox>
      {/* Tiny grill dots — sit flush on the grill's front face (z = 0.635 + 0.03 = 0.665) */}
      {[
        [-0.52, 0.5], [-0.4, 0.5], [-0.28, 0.5],
        [-0.52, 0.4], [-0.4, 0.4], [-0.28, 0.4],
        [-0.52, 0.3], [-0.4, 0.3], [-0.28, 0.3],
      ].map(([x, y], i) => (
        <mesh key={`dot-${i}`} position={[x, y, 0.672]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.01, 16]} />
          <meshStandardMaterial color={CREAM} roughness={0.5} />
        </mesh>
      ))}

      {/* Knobs — primary-color trio (red / yellow / blue), like children's blocks */}
      {[
        { x: -0.05, color: CHERRY },
        { x: 0.25, color: SUNSHINE },
        { x: 0.55, color: COBALT },
      ].map((k, i) => (
        <group key={i} position={[k.x, 0.42, 0.67]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.075, 0.075, 0.06, 24]} />
            <meshStandardMaterial color={k.color} roughness={0.45} />
          </mesh>
          {/* Knob cap highlight */}
          <mesh position={[0, 0, 0.035]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.005, 16]} />
            <meshStandardMaterial color={CREAM} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Multicolor feet — like the kid's chair legs */}
      {[
        { pos: [-0.72, 0.05, -0.52], color: CHERRY },
        { pos: [0.72, 0.05, -0.52], color: SUNSHINE },
        { pos: [-0.72, 0.05, 0.52], color: APPLE },
        { pos: [0.72, 0.05, 0.52], color: COBALT },
      ].map((f, i) => (
        <mesh key={i} position={f.pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.12, 16]} />
          <meshStandardMaterial color={f.color} roughness={0.55} />
        </mesh>
      ))}

    </group>
  );
}
