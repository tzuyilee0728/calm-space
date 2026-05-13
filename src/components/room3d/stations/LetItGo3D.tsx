'use client';

import StationPlaceholder3D from './StationPlaceholder3D';

export default function LetItGo3D({ isActive }: { isActive?: boolean }) {
  return <StationPlaceholder3D color="#ffb08a" label="Let It Go" isActive={isActive} />;
}
