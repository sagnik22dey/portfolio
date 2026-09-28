import { useState } from 'react';
import { useCorridorRig } from './useCorridorRig';
import Corridor from './Corridor';
import Bays from './Bays';
import WallFrames from './WallFrames';
import Particles from './Particles';
import { bays, bayZ, type Bay } from './corridorData';

type SceneProps = {
  onProgress: (t: number) => void;
  onOpen: (bay: Bay) => void;
  enabled: boolean;
  registerJump: (fn: (z: number) => void) => void;
  particleScale?: number;
};

/** In-canvas corridor scene: lighting, geometry, bays, wall exhibits and the walk-camera rig. */
export default function Scene({ onProgress, onOpen, enabled, registerJump, particleScale = 1 }: SceneProps) {
  const { jumpTo } = useCorridorRig({ onProgress, enabled });
  const [registered, setRegistered] = useState(false);

  if (!registered) {
    registerJump(jumpTo);
    setRegistered(true);
  }

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 5, 6]} intensity={0.55} color="#fff6e6" />
      <pointLight position={[0, 1.5, 0]} intensity={0.35} distance={18} color="#ffe9c9" />
      <pointLight position={[0, 1, bayZ(bays.length - 2)]} intensity={0.45} distance={20} color="#ffd9a8" />

      <Corridor />
      <Bays onOpen={onOpen} />
      <WallFrames onOpen={onOpen} />
      <Particles scale={particleScale} />
    </>
  );
}
