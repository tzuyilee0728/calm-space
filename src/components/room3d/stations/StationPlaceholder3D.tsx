'use client';

import { RoundedBox, Html } from '@react-three/drei';

type Props = {
  color: string;
  label: string;
  isActive?: boolean;
};

export default function StationPlaceholder3D({ color, label, isActive = false }: Props) {
  return (
    <group>
      <RoundedBox
        args={[1.4, 1.2, 1.4]}
        radius={0.18}
        smoothness={4}
        position={[0, 0.6, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} roughness={0.6} emissive={isActive ? color : '#000000'} emissiveIntensity={isActive ? 0.25 : 0} />
      </RoundedBox>
      <Html center position={[0, 1.7, 0]} distanceFactor={12} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            border: '2px solid #2a2420',
            borderRadius: 999,
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            color: '#2a2420',
            userSelect: 'none',
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}
