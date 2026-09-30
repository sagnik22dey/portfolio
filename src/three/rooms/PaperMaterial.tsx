import { forwardRef, useMemo, useRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export type PaperMaterialHandle = {
  bend: number;
  windStrength: number;
  uProgress: number;
};

type Props = {
  color?: string;
  roughness?: number;
  map?: THREE.Texture | null;
  mapBack?: THREE.Texture | null;
  mapPainted?: THREE.Texture | null;
  side?: THREE.Side;
  paintProgress?: { value: number };
  roomOrigin?: { value: THREE.Vector3 };
};

/** An unlit paper material with natural curvature, double-sided texturing, and wind flutter via vertex shader injection. */
const PaperMaterial = forwardRef<PaperMaterialHandle, Props>(
  (
    {
      color = '#ffffff',
      map,
      mapBack,
      mapPainted,
      side = THREE.DoubleSide,
      paintProgress,
      roomOrigin,
    },
    ref
  ) => {
    const materialRef = useRef<THREE.MeshBasicMaterial>(null);

    const onBeforeCompile = useMemo(
      () => (shader: THREE.WebGLProgramParametersWithUniforms) => {
        shader.uniforms.uBend = { value: 0 };
        shader.uniforms.uTime = { value: 0 };
        shader.uniforms.uWindStrength = { value: 0 };
        shader.uniforms.mapBack = { value: mapBack || null };
        shader.uniforms.mapPainted = { value: mapPainted || null };
        shader.uniforms.uProgress = { value: 0.0 };
        shader.uniforms.uPaintProgress = paintProgress || { value: 1.0 };
        shader.uniforms.uRoomOrigin = roomOrigin || { value: new THREE.Vector3(0, 0, 0) };

        shader.vertexShader =
          `
            uniform float uBend;
            uniform float uTime;
            uniform float uWindStrength;
            varying vec3 vWorldPositionColor;
        ` + shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
            #include <begin_vertex>
            vWorldPositionColor = (modelMatrix * vec4(position, 1.0)).xyz;
            float bendAmount = pow(transformed.y, 2.0) * uBend;
            transformed.z += bendAmount;

            float totalWind = 0.02 + uWindStrength;
            float flutter = sin(uTime * 2.0 + transformed.y * 2.0) * totalWind * (1.0 + abs(uBend * 3.0));
            transformed.z += flutter;
            `
        );

        shader.fragmentShader =
          `
            uniform sampler2D mapBack;
            uniform sampler2D mapPainted;
            uniform float uProgress;
            uniform float uPaintProgress;
            uniform vec3 uRoomOrigin;
            varying vec3 vWorldPositionColor;

            float revealRand(vec2 n) { 
                return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
            }

            float revealNoise(vec2 p){
                vec2 ip = floor(p);
                vec2 u = fract(p);
                u = u*u*(3.0-2.0*u);
                float res = mix(
                    mix(revealRand(ip),revealRand(ip+vec2(1.0,0.0)),u.x),
                    mix(revealRand(ip+vec2(0.0,1.0)),revealRand(ip+vec2(1.0,1.0)),u.x),u.y);
                return res*res;
            }
        ` + shader.fragmentShader;

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <map_fragment>',
          `
            #ifdef USE_MAP
                vec4 texColor = texture2D( map, vMapUv );
                if (gl_FrontFacing && uProgress > 0.001) {
                    vec4 paintedColor = texture2D(mapPainted, vMapUv);
                    float rn = revealNoise(vMapUv * 15.0) * 0.15;
                    float maskValue = (1.0 - vMapUv.y) + rn;
                    float threshold = uProgress * 1.5;
                    if (maskValue < threshold) {
                        texColor = paintedColor;
                    }
                }
                
                vec2 backUv = vec2(vMapUv.x, 1.0 - vMapUv.y);
                vec4 backColor = texture2D( mapBack, backUv );
                vec4 sampledDiffuseColor = gl_FrontFacing ? texColor : backColor;
                diffuseColor *= sampledDiffuseColor;
            #endif
            `
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <dithering_fragment>',
          `
            #include <dithering_fragment>
            vec3 localPos = vWorldPositionColor - uRoomOrigin;
            vec3 revealDir = normalize(vec3(-1.0, 0.0, 0.1));
            float targetDist = mix(-5.0, 55.0, uPaintProgress);
            float distFromPlane = targetDist - dot(localPos, revealDir);
            float n = revealNoise(localPos.yz * 2.0) * 2.0 + revealNoise(localPos.yz * 8.0) * 0.5;
            float boundary = distFromPlane + n;
            if (boundary < 0.0) discard;
            float glow = smoothstep(2.0, 0.0, boundary);
            if (uPaintProgress < 0.999 && boundary < 2.0) {
                gl_FragColor.rgb += vec3(glow * 0.4, glow * 0.35, glow * 0.2);
            }
            `
        );

        if (materialRef.current) {
          materialRef.current.userData.shader = shader;
        }

        if (mapBack && shader.uniforms.mapBack) {
          shader.uniforms.mapBack.value = mapBack;
        }
        if (mapPainted && shader.uniforms.mapPainted) {
          shader.uniforms.mapPainted.value = mapPainted;
        }
      },
      [mapBack, mapPainted, paintProgress, roomOrigin]
    );

    useImperativeHandle(ref, () => ({
      set bend(value: number) {
        if (materialRef.current?.userData?.shader) {
          materialRef.current.userData.shader.uniforms.uBend.value = value;
        }
      },
      get bend(): number {
        return materialRef.current?.userData?.shader?.uniforms.uBend?.value || 0;
      },
      set windStrength(value: number) {
        if (materialRef.current?.userData?.shader) {
          materialRef.current.userData.shader.uniforms.uWindStrength.value = value;
        }
      },
      get windStrength(): number {
        return materialRef.current?.userData?.shader?.uniforms.uWindStrength?.value || 0;
      },
      set uProgress(value: number) {
        if (materialRef.current?.userData?.shader) {
          materialRef.current.userData.shader.uniforms.uProgress.value = value;
        }
      },
      get uProgress(): number {
        return materialRef.current?.userData?.shader?.uniforms.uProgress?.value || 0;
      },
    }));

    useFrame((state) => {
      if (materialRef.current?.userData?.shader) {
        materialRef.current.userData.shader.uniforms.uTime.value = state.clock.elapsedTime;
      }
    });

    return (
      <meshBasicMaterial
        ref={materialRef}
        color={color}
        map={map || undefined}
        side={side}
        onBeforeCompile={onBeforeCompile}
      />
    );
  }
);

PaperMaterial.displayName = 'PaperMaterial';

export default PaperMaterial;
