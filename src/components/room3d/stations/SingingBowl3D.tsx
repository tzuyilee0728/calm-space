'use client';

import StationPlaceholder3D from './StationPlaceholder3D';

export default function SingingBowl3D({ isActive }: { isActive?: boolean }) {
  return <StationPlaceholder3D color="#c9b8ff" label="Singing Bowls" isActive={isActive} />;
}
