import { useEffect, useRef } from 'react';

type Handlers = {
  onWheel?: (deltaY: number) => void;
  onDrag?: (dx: number, dy: number) => void;
};

/** Window-level wheel + canvas drag input; exposes drag distance so clicks after drags can be ignored. */
export function useRoomInput({ onWheel, onDrag }: Handlers) {
  const dragDist = useRef(0);
  const handlers = useRef({ onWheel, onDrag });
  handlers.current = { onWheel, onDrag };

  useEffect(() => {
    let down = false;
    let lastX = 0;
    let lastY = 0;

    const wheel = (e: WheelEvent) => handlers.current.onWheel?.(e.deltaY);
    const pdown = (e: PointerEvent) => {
      if (!(e.target instanceof HTMLCanvasElement)) return;
      down = true;
      lastX = e.clientX;
      lastY = e.clientY;
      dragDist.current = 0;
    };
    const pmove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      dragDist.current += Math.abs(dx) + Math.abs(dy);
      handlers.current.onDrag?.(dx, dy);
    };
    const pup = () => {
      down = false;
    };

    window.addEventListener('wheel', wheel, { passive: true });
    window.addEventListener('pointerdown', pdown);
    window.addEventListener('pointermove', pmove);
    window.addEventListener('pointerup', pup);
    window.addEventListener('pointercancel', pup);
    return () => {
      window.removeEventListener('wheel', wheel);
      window.removeEventListener('pointerdown', pdown);
      window.removeEventListener('pointermove', pmove);
      window.removeEventListener('pointerup', pup);
      window.removeEventListener('pointercancel', pup);
    };
  }, []);

  return { dragDist };
}

/** Apply a paint-reveal shader hook to a freshly created material. */
export function painted<T extends { onBeforeCompile: unknown; transparent: boolean }>(
  mat: T,
  onBeforeCompile: T['onBeforeCompile']
): T {
  mat.onBeforeCompile = onBeforeCompile;
  mat.transparent = true;
  return mat;
}
