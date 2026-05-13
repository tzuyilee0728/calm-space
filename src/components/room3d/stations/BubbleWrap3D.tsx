'use client';

import StationPlaceholder3D from './StationPlaceholder3D';

export default function BubbleWrap3D({ isActive }: { isActive?: boolean }) {
  return <StationPlaceholder3D color="#5cc9b2" label="Bubble Wrap" isActive={isActive} />;
}
