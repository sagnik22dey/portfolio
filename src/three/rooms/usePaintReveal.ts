import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

type PaintRevealOptions = {
  dirX?: number;
  dirY?: number;
  dirZ?: number;
  startDist?: number;
  endDist?: number;
  noiseAxes?: 'yz' | 'xz' | 'xy';
};

export type PaintReveal = {
  onBeforeCompile: (shader: THREE.WebGLProgramParametersWithUniforms) => void;
  uniforms: { uPaint: { value: number }; uOrigin: { value: THREE.Vector3 } };
  play: (delay?: number, duration?: number) => void;
  reset: () => void;
  setOrigin: (group: THREE.Object3D | null) => void;
};

/** Position-independent "wet paint" material reveal via onBeforeCompile shader injection. */
export function usePaintReveal(options: PaintRevealOptions = {}): PaintReveal {
  const {
    dirX = -1.0,
    dirY = 0.0,
    dirZ = 0.1,
    startDist = -5.0,
    endDist = 55.0,
    noiseAxes = 'yz',
  } = options;

  const uniforms = useMemo(
    () => ({
      uPaint: { value: 0.0 },
      uOrigin: { value: new THREE.Vector3(0, 0, 0) },
    }),
    []
  );

  const axis = noiseAxes === 'xz' ? 'localPos.xz' : noiseAxes === 'xy' ? 'localPos.xy' : 'localPos.yz';

  const onBeforeCompile = useMemo(
    () => (shader: THREE.WebGLProgramParametersWithUniforms) => {
      shader.uniforms.uPaint = uniforms.uPaint;
      shader.uniforms.uOrigin = uniforms.uOrigin;

      shader.vertexShader = `varying vec3 vPaintWorld;\n${shader.vertexShader}`.replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>\nvPaintWorld = (modelMatrix * vec4(position, 1.0)).xyz;`
      );

      shader.fragmentShader = `
        uniform float uPaint;
        uniform vec3 uOrigin;
        varying vec3 vPaintWorld;
        ${shader.fragmentShader}
      `
        .replace(
          '#include <common>',
          `#include <common>
          float prHash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
          float prNoise(vec2 x){
            vec2 i=floor(x); vec2 f=fract(x);
            float a=prHash(i); float b=prHash(i+vec2(1.0,0.0));
            float c=prHash(i+vec2(0.0,1.0)); float d=prHash(i+vec2(1.0,1.0));
            vec2 u=f*f*(3.0-2.0*f);
            return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
          }`
        )
        .replace(
          '#include <dithering_fragment>',
          `#include <dithering_fragment>
          vec3 localPos = vPaintWorld - uOrigin;
          vec3 revealDir = normalize(vec3(${dirX.toFixed(2)}, ${dirY.toFixed(2)}, ${dirZ.toFixed(2)}));
          float targetDist = mix(${startDist.toFixed(1)}, ${endDist.toFixed(1)}, uPaint);
          float distFromPlane = targetDist - dot(localPos, revealDir);
          float n = prNoise(${axis} * 2.0) * 2.0 + prNoise(${axis} * 8.0) * 0.5;
          float boundary = distFromPlane + n;
          if (boundary < 0.0) discard;
          float glow = smoothstep(2.0, 0.0, boundary);
          if (uPaint < 0.999 && boundary < 2.0) {
            gl_FragColor.rgb += vec3(glow * 0.35, glow * 0.28, glow * 0.16);
          }`
        );
    },
    [uniforms, dirX, dirY, dirZ, startDist, endDist, axis]
  );

  const raf = useRef(0);

  return useMemo<PaintReveal>(
    () => ({
      onBeforeCompile,
      uniforms,
      play: (delay = 0, duration = 2.5) => {
        cancelAnimationFrame(raf.current);
        const start = performance.now() + delay * 1000;
        const ease = gsap.parseEase('power2.inOut');
        const tick = (now: number) => {
          const t = Math.min(1, Math.max(0, (now - start) / (duration * 1000)));
          uniforms.uPaint.value = ease(t);
          if (t < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
      },
      reset: () => {
        cancelAnimationFrame(raf.current);
        uniforms.uPaint.value = 0.0;
      },
      setOrigin: (group: THREE.Object3D | null) => {
        if (group) group.getWorldPosition(uniforms.uOrigin.value);
      },
    }),
    [onBeforeCompile, uniforms]
  );
}
