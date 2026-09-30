import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { stops } from './data';

export type FlightApi = {
  goTo: (index: number) => void;
  step: (dir: 1 | -1) => void;
};

type Options = {
  enabled: boolean;
  onStop: (index: number) => void;
  register: (api: FlightApi) => void;
  onProgress?: (p: number) => void;
};

const MAX = stops.length - 1;
const tmp = {
  a: new THREE.Vector3(),
  b: new THREE.Vector3(),
  look: new THREE.Vector3(),
  lookB: new THREE.Vector3(),
  pos: new THREE.Vector3(),
};

/** Camera flight between island stops driven by wheel / touch / keys, snapping to the nearest stop when idle. */
export function useFlight({ enabled, onStop, register, onProgress }: Options) {
  const { camera, size } = useThree();
  const target = useRef(0);
  const current = useRef(0);
  const lastStop = useRef(-1);
  const lastInput = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const portrait = size.width < size.height;

  useEffect(() => {
    register({
      goTo: (i) => {
        target.current = THREE.MathUtils.clamp(i, 0, MAX);
        lastInput.current = 0;
      },
      step: (dir) => {
        target.current = THREE.MathUtils.clamp(Math.round(target.current) + dir, 0, MAX);
        lastInput.current = 0;
      },
    });
  }, [register]);

  useEffect(() => {
    const nudge = (d: number) => {
      if (!enabledRef.current) return;
      target.current = THREE.MathUtils.clamp(target.current + d, 0, MAX);
      lastInput.current = performance.now();
    };
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement)?.closest?.('[data-scrollable]')) return;
      nudge(THREE.MathUtils.clamp(e.deltaY, -120, 120) * 0.0022);
    };
    let touchY = 0;
    let touchX = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
      touchX = e.touches[0].clientX;
    };
    const onTouchMove = (e: TouchEvent) => {
      if ((e.target as HTMLElement)?.closest?.('[data-scrollable]')) return;
      const y = e.touches[0].clientY;
      const x = e.touches[0].clientX;
      const d = Math.abs(touchY - y) > Math.abs(touchX - x) ? touchY - y : touchX - x;
      touchY = y;
      touchX = x;
      nudge(d * 0.006);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!enabledRef.current) return;
      if ((e.target as HTMLElement)?.closest?.('input, textarea, [contenteditable]')) return;
      if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)) {
        target.current = THREE.MathUtils.clamp(Math.round(target.current) + 1, 0, MAX);
        lastInput.current = 0;
      } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
        target.current = THREE.MathUtils.clamp(Math.round(target.current) - 1, 0, MAX);
        lastInput.current = 0;
      }
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    if (lastInput.current && performance.now() - lastInput.current > 420) {
      target.current = Math.round(target.current);
      lastInput.current = 0;
    }
    current.current += (target.current - current.current) * (1 - Math.pow(0.04, delta));
    if (Math.abs(target.current - current.current) < 1e-4) current.current = target.current;

    const p = current.current;
    const i = Math.min(Math.floor(p), MAX - 1);
    const t = p - i;
    const e = t * t * (3 - 2 * t);
    const from = stops[i];
    const to = stops[i + 1];
    const zoom = portrait ? 1.45 : 1;

    tmp.a.set(from.focus[0] + from.offset[0], from.focus[1] + from.offset[1] * zoom, from.focus[2] + from.offset[2] * zoom);
    tmp.b.set(to.focus[0] + to.offset[0], to.focus[1] + to.offset[1] * zoom, to.focus[2] + to.offset[2] * zoom);
    tmp.pos.lerpVectors(tmp.a, tmp.b, e);
    tmp.pos.y += Math.sin(t * Math.PI) * 3.5;
    tmp.look.set(...from.focus).lerp(tmp.lookB.set(...to.focus), e);
    if (portrait) tmp.look.y -= 3.2;

    const bob = Math.sin(state.clock.elapsedTime * 0.6) * 0.08;
    tmp.pos.x += pointer.current.x * 0.6;
    tmp.pos.y += -pointer.current.y * 0.35 + bob;

    camera.position.lerp(tmp.pos, 1 - Math.pow(0.02, delta));
    camera.lookAt(tmp.look);

    onProgress?.(p / MAX);
    const nearest = Math.round(p);
    if (Math.abs(p - nearest) < 0.08 && nearest !== lastStop.current) {
      lastStop.current = nearest;
      onStop(nearest);
    }
  });
}
