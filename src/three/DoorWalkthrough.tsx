import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { bays, bayZ, type Bay } from './corridorData';
import { playSound } from '../utils/audio';

type Props = {
  activeBay: Bay | null;
  phase: 'idle' | 'entering' | 'exiting';
  onEntered: () => void;
  onExited: () => void;
};

/** First-person camera walkthrough rig: aligns to the portal, swings door, dollys straight through the doorway into the chamber. */
export default function DoorWalkthrough({
  activeBay,
  phase,
  onEntered,
  onExited,
}: Props) {
  const { camera } = useThree();
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!activeBay) return;

    const bayIndex = bays.findIndex((b) => b.id === activeBay.id);
    const doorZ = bayZ(bayIndex >= 0 ? bayIndex : 0);
    const side = activeBay.side;
    const alignX = side === 'left' ? -0.8 : 0.8;
    const targetRotY = side === 'left' ? -Math.PI / 2 : Math.PI / 2;
    const targetWalkX = side === 'left' ? -3.5 : 3.5;

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    if (phase === 'entering') {
      playSound('/sounds/uchyleniedrzwi.mp3', 0.6);

      const tl = gsap.timeline();
      timelineRef.current = tl;

      tl.to(camera.position, {
        x: alignX,
        y: 0.25,
        z: doorZ,
        duration: 0.65,
        ease: 'power2.inOut',
      });

      tl.to(
        camera.rotation,
        {
          x: 0,
          y: targetRotY,
          z: 0,
          duration: 0.65,
          ease: 'power2.inOut',
        },
        '<'
      );

      tl.call(
        () => {
          playSound('/sounds/otwarciedrzwi.mp3', 0.5);
        },
        undefined,
        0.3
      );

      tl.to(camera.position, {
        x: targetWalkX,
        y: 0.22,
        duration: 1.05,
        ease: 'power2.inOut',
        onComplete: onEntered,
      });
    } else if (phase === 'exiting') {
      const tl = gsap.timeline();
      timelineRef.current = tl;

      tl.to(camera.position, {
        x: alignX,
        y: 0.25,
        z: doorZ,
        duration: 0.85,
        ease: 'power2.inOut',
      });

      tl.call(
        () => {
          playSound('/sounds/zamknieciedrzwi.mp3', 0.5);
        },
        undefined,
        0.5
      );

      tl.to(camera.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: onExited,
      });
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [activeBay, phase, camera, onEntered, onExited]);

  return null;
}
