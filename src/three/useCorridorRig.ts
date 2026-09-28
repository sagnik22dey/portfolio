import { useEffect, useRef, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CORRIDOR_START_Z, bays, BAY_SPACING } from './corridorData';

type RigOptions = {
  onProgress?: (t: number) => void;
  enabled?: boolean;
};

const LOOP_LENGTH = bays.length * BAY_SPACING;
const START_DIST = 14;
const PEAK_DIST = 7;
const END_DIST = -1.5;
const MAX_SWIPE_GLANCE = 0.26;
const SCROLL_SPEED = 0.02;
const SMOOTHING = 0.035;
const PARALLAX_INTENSITY = 0.32;

/** Corridor walk-camera rig with weighted inertia, asymmetric door glance, mobile gyroscope, and blend-in transitions. */
export function useCorridorRig({ onProgress, enabled = true }: RigOptions) {
  const { camera } = useThree();

  const targetZ = useRef(CORRIDOR_START_Z);
  const currentZ = useRef(CORRIDOR_START_Z);
  const lastReportedBay = useRef(-1);
  const parallax = useRef({ x: 0, y: 0 });
  const targetParallax = useRef({ x: 0, y: 0 });
  const glanceOffset = useRef(0);
  const targetGlance = useRef(0);
  const swipeGlance = useRef(0);
  const targetSwipeGlance = useRef(0);
  const enabledRef = useRef(enabled);
  const blendInFrames = useRef(0);
  const savedRotation = useRef({ x: 0, y: 0, z: 0 });
  const touchStart = useRef({ x: 0, y: 0 });
  const useGyroscope = useRef(false);

  useEffect(() => {
    const wasEnabled = enabledRef.current;
    enabledRef.current = enabled;

    if (enabled && !wasEnabled) {
      savedRotation.current = {
        x: camera.rotation.x,
        y: camera.rotation.y,
        z: camera.rotation.z,
      };
      blendInFrames.current = 30;
      targetZ.current = camera.position.z;
      currentZ.current = camera.position.z;
      parallax.current = { x: camera.position.x, y: camera.position.y - 0.25 };
      targetParallax.current = { x: camera.position.x, y: camera.position.y - 0.25 };
    }
  }, [enabled, camera]);

  const onWheel = useCallback((e: WheelEvent) => {
    if (!enabledRef.current) return;
    e.preventDefault();
    targetZ.current -= e.deltaY * SCROLL_SPEED;
  }, []);

  const onKey = useCallback((e: KeyboardEvent) => {
    if (!enabledRef.current) return;
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    const map: Record<string, number> = {
      ArrowDown: 110,
      ArrowUp: -110,
      PageDown: 350,
      PageUp: -350,
      ' ': 180,
      w: 110,
      W: 110,
      s: -110,
      S: -110,
    };

    const d = map[e.key];
    if (d !== undefined) {
      e.preventDefault();
      targetZ.current -= d * SCROLL_SPEED;
    }

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      targetSwipeGlance.current = Math.max(-MAX_SWIPE_GLANCE, targetSwipeGlance.current - 0.08);
      e.preventDefault();
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      targetSwipeGlance.current = Math.min(MAX_SWIPE_GLANCE, targetSwipeGlance.current + 0.08);
      e.preventDefault();
    }
  }, []);

  const onMouse = useCallback((e: MouseEvent) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    targetParallax.current.x = nx * PARALLAX_INTENSITY;
    targetParallax.current.y = -ny * PARALLAX_INTENSITY * 0.5;
  }, []);

  const onTouchStart = useCallback((e: TouchEvent) => {
    touchStart.current.x = e.touches[0].clientX;
    touchStart.current.y = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!enabledRef.current) return;
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;

    const deltaY = (touchStart.current.y - y) * SCROLL_SPEED * 1.5;
    targetZ.current -= deltaY;

    const deltaX = (touchStart.current.x - x) * 0.003;
    targetSwipeGlance.current = Math.max(
      -MAX_SWIPE_GLANCE,
      Math.min(MAX_SWIPE_GLANCE, targetSwipeGlance.current + deltaX)
    );

    touchStart.current.x = x;
    touchStart.current.y = y;
  }, []);

  const onDeviceOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (!useGyroscope.current) return;
    if (e.gamma === null && e.beta === null) return;
    const gamma = THREE.MathUtils.clamp(e.gamma || 0, -45, 45);
    const beta = THREE.MathUtils.clamp(e.beta || 0, 0, 90) - 45;
    targetParallax.current.x = (gamma / 45) * PARALLAX_INTENSITY;
    targetParallax.current.y = -(beta / 45) * PARALLAX_INTENSITY * 0.5;
  }, []);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } })
        .DeviceOrientationEvent?.requestPermission === 'function'
    ) {
      useGyroscope.current = true;
      window.addEventListener('deviceorientation', onDeviceOrientation);
    } else if (typeof window !== 'undefined' && 'ondeviceorientation' in window) {
      useGyroscope.current = true;
      window.addEventListener('deviceorientation', onDeviceOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', onDeviceOrientation);
    };
  }, [onDeviceOrientation]);

  useEffect(() => {
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [onWheel, onKey, onMouse, onTouchStart, onTouchMove]);

  const calculateGlance = useCallback((z: number) => {
    let bestStrength = 0;
    let bestDir = 0;

    for (let i = 0; i < bays.length; i++) {
      const bayZpos = CORRIDOR_START_Z - (i + 1) * BAY_SPACING;
      let dist = (z - bayZpos) % LOOP_LENGTH;
      if (dist < -LOOP_LENGTH / 2) dist += LOOP_LENGTH;
      if (dist > LOOP_LENGTH / 2) dist -= LOOP_LENGTH;

      let strength = 0;
      if (dist > PEAK_DIST && dist < START_DIST) {
        strength = (START_DIST - dist) / (START_DIST - PEAK_DIST);
      } else if (dist <= PEAK_DIST && dist > END_DIST) {
        strength = (dist - END_DIST) / (PEAK_DIST - END_DIST);
      }

      if (strength > 0) {
        const easedStrength = strength * (2 - strength);
        const dir = bays[i].side === 'left' ? -1 : 1;
        if (easedStrength > bestStrength) {
          bestStrength = easedStrength;
          bestDir = dir;
        }
      }
    }

    return bestDir * bestStrength * 0.16 * 3.5;
  }, []);

  useFrame((_, delta) => {
    const d = Math.min(delta, 1 / 30);
    const zFactor = 1 - Math.pow(1 - SMOOTHING, d * 60);
    const pFactor = 1 - Math.pow(1 - SMOOTHING * 0.85, d * 60);
    const swipeFactor = 1 - Math.pow(1 - 0.08, d * 60);

    if (currentZ.current < CORRIDOR_START_Z - LOOP_LENGTH) {
      currentZ.current += LOOP_LENGTH;
      targetZ.current += LOOP_LENGTH;
    } else if (currentZ.current > CORRIDOR_START_Z) {
      currentZ.current -= LOOP_LENGTH;
      targetZ.current -= LOOP_LENGTH;
    }

    currentZ.current = THREE.MathUtils.lerp(currentZ.current, targetZ.current, zFactor);
    parallax.current.x = THREE.MathUtils.lerp(parallax.current.x, targetParallax.current.x, pFactor);
    parallax.current.y = THREE.MathUtils.lerp(parallax.current.y, targetParallax.current.y, pFactor);
    swipeGlance.current = THREE.MathUtils.lerp(swipeGlance.current, targetSwipeGlance.current, swipeFactor);

    targetGlance.current = calculateGlance(currentZ.current);
    const isReleasing = Math.abs(targetGlance.current) < Math.abs(glanceOffset.current);
    const glanceBase = isReleasing ? 0.08 : 0.03;
    const glanceLerpSpeed = 1 - Math.pow(1 - glanceBase, d * 60);
    glanceOffset.current = THREE.MathUtils.lerp(glanceOffset.current, targetGlance.current, glanceLerpSpeed);

    camera.position.set(parallax.current.x, 0.25 + parallax.current.y, currentZ.current);

    const lookX = parallax.current.x * 0.3 + glanceOffset.current * 3 + swipeGlance.current * 4;
    const lookY = 0.14 + parallax.current.y;
    const lookZ = currentZ.current - 10;

    if (blendInFrames.current > 0) {
      camera.lookAt(lookX, lookY, lookZ);
      const targetRotation = {
        x: camera.rotation.x,
        y: camera.rotation.y,
        z: camera.rotation.z,
      };
      const blendFactor = 1 - blendInFrames.current / 30;
      camera.rotation.x = THREE.MathUtils.lerp(savedRotation.current.x, targetRotation.x, blendFactor);
      camera.rotation.y = THREE.MathUtils.lerp(savedRotation.current.y, targetRotation.y, blendFactor);
      camera.rotation.z = THREE.MathUtils.lerp(savedRotation.current.z, targetRotation.z, blendFactor);
      blendInFrames.current--;
    } else {
      camera.lookAt(lookX, lookY, lookZ);
    }

    if (onProgress) {
      let norm = (CORRIDOR_START_Z - currentZ.current) % LOOP_LENGTH;
      if (norm < 0) norm += LOOP_LENGTH;
      const t = norm / LOOP_LENGTH;
      const bayIdx = Math.floor(t * bays.length);
      if (bayIdx !== lastReportedBay.current) {
        lastReportedBay.current = bayIdx;
        onProgress(t);
      }
    }
  });

  const jumpTo = useCallback((z: number) => {
    targetZ.current = z;
  }, []);

  return { jumpTo };
}
