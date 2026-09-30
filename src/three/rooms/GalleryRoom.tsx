import {
  useRef,
  useState,
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
  memo,
} from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import PaperMaterial, { type PaperMaterialHandle } from './PaperMaterial';
import GalleryClouds from './GalleryClouds';
import type { PaintReveal } from './usePaintReveal';
import { galleryItems } from './roomData';
import { makeFace, drawFront, drawBack } from './galleryCardTextures';

export type GalleryCommand = { type: 'go' | 'open'; index: number; nonce: number };

const FALLBACK_SKETCH = '/images/sketches/gallery_corridor.webp';

const PROJECT_COUNT = galleryItems.length;
const GAP = 2.5;
const BIRD_WIDTH = 0.49;
const BIRD_HEIGHT = 0.35;
const RIGHT_CROP_AMOUNT = 0.2;
const RAILING_HEIGHT = 1.25;
const PIN_COLORS = ['#c2410c', '#6b7c5f', '#b08b3e', '#a8563a'];
const _tempScale = new THREE.Vector3();

function playPaperSound() {
  try {
    const audio = new Audio('/sounds/papersound.mp3');
    audio.volume = 0.45;
    audio.play().catch(() => {});
  } catch {}
}

type ProjectCardHandle = {
  openCard: () => Promise<void>;
  closeCard: () => Promise<void>;
};

type ProjectCardProps = {
  index: number;
  front: THREE.Texture;
  back: THREE.Texture;
  clothespinTexture: THREE.Texture;
  currentScroll: React.MutableRefObject<number>;
  curve: THREE.CatmullRomCurve3;
  isSelected: boolean;
  scrollToIndex: (index: number, onComplete?: () => void) => void;
  onClick: (index: number) => void;
  paintProgress?: { value: number };
  roomOrigin?: { value: THREE.Vector3 };
};

/** A project sheet pegged to the clothesline; flips over to reveal its brief. */
const ProjectCard = memo(
  forwardRef<ProjectCardHandle, ProjectCardProps>(
    (
      {
        index,
        front,
        back,
        clothespinTexture,
        currentScroll,
        curve,
        isSelected,
        scrollToIndex,
        onClick,
        paintProgress,
        roomOrigin,
      },
      ref
    ) => {
      const cardRef = useRef<THREE.Group>(null);
      const paperRef = useRef<THREE.Group>(null);
      const hoverRef = useRef<THREE.Group>(null);
      const materialRef = useRef<PaperMaterialHandle>(null);
      const [hovered, setHovered] = useState(false);
      const [isAnimating, setIsAnimating] = useState(false);
      const swaySpeed = useRef(Math.random() * 0.2 + 0.3);
      const swayOffset = useRef(Math.random() * 100);
      const localBaseY = -1.1;

      useImperativeHandle(ref, () => ({
        closeCard: () =>
          new Promise<void>((resolve) => {
            if (!paperRef.current) {
              resolve();
              return;
            }
            setIsAnimating(true);
            playPaperSound();
            const tl = gsap.timeline({
              onComplete: () => {
                setIsAnimating(false);
                resolve();
              },
            });
            tl.to(paperRef.current.position, { y: localBaseY + 0.6, x: 0, z: 1, duration: 0.35, ease: 'power2.in' });
            tl.to(paperRef.current.rotation, { x: 0.5, z: -0.05, y: 0, duration: 0.35, ease: 'power2.in' }, '<');
            if (materialRef.current) tl.to(materialRef.current, { bend: 0.6, duration: 0.3, ease: 'power2.in' }, '<');
            tl.to(paperRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.3, ease: 'sine.inOut' }, '<');
            tl.to(paperRef.current.position, { y: localBaseY, x: 0, z: 0, duration: 0.25, ease: 'power3.out' });
            tl.to(paperRef.current.rotation, { x: 0, y: 0, z: 0, duration: 0.25, ease: 'power3.out' }, '<');
            if (materialRef.current) tl.to(materialRef.current, { bend: 0, duration: 0.3, ease: 'power2.out' }, '<');
          }),

        openCard: () =>
          new Promise<void>((resolve) => {
            scrollToIndex(index, () => {
              if (!paperRef.current || !cardRef.current) {
                resolve();
                return;
              }
              setIsAnimating(true);
              playPaperSound();
              const isMobile = window.innerWidth < 768;
              const hasPanel = window.innerWidth >= 1024;
              const parentPos = cardRef.current.position;
              const targetX = (hasPanel ? -1.35 : 0) - parentPos.x;
              const targetY = (isMobile ? -0.2 : 0.15) - parentPos.y;
              const targetZ = (isMobile ? 0.5 : 1.35) - parentPos.z;
              const tl = gsap.timeline({
                onComplete: () => {
                  setIsAnimating(false);
                  resolve();
                },
              });
              tl.to(cardRef.current.rotation, { x: 0, y: 0, z: 0, duration: 0.3, ease: 'power2.out' }, 0);
              if (materialRef.current) materialRef.current.bend = 0;
              tl.to(paperRef.current.position, { y: localBaseY - 0.5, duration: 0.15, ease: 'power2.out' });
              tl.to(paperRef.current.rotation, { x: 0.5, z: -0.05, duration: 0.15, ease: 'power2.out' }, '<');
              if (materialRef.current) tl.to(materialRef.current, { bend: 0.8, duration: 0.15, ease: 'power2.out' }, '<');
              tl.to(paperRef.current.position, { y: localBaseY + 1.5, x: targetX * 0.2, z: targetZ * 0.2, duration: 0.4, ease: 'power1.out' });
              tl.to(paperRef.current.rotation, { x: Math.PI * 0.8, z: 0.05, y: -0.02, duration: 0.4, ease: 'power1.inOut' }, '<');
              if (materialRef.current) tl.to(materialRef.current, { bend: -0.3, duration: 0.4, ease: 'power1.inOut' }, '<');
              tl.to(paperRef.current.position, { y: targetY, x: targetX, z: targetZ, duration: 0.4, ease: 'power3.out' });
              tl.to(paperRef.current.rotation, { x: Math.PI, y: 0, z: 0, duration: 0.4, ease: 'power3.out' }, '<');
              if (materialRef.current) tl.to(materialRef.current, { bend: 0, duration: 0.5, ease: 'power2.out' }, '<');
              tl.to(paperRef.current.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.3, ease: 'sine.out' }, '-=0.4');
            });
          }),
      }));

      useEffect(() => {
        document.body.style.cursor = hovered ? 'pointer' : 'auto';
        return () => {
          document.body.style.cursor = 'auto';
        };
      }, [hovered]);

      useFrame((state) => {
        if (!cardRef.current) return;
        if (hoverRef.current) {
          const s = hovered && !isSelected ? 1.05 : 1;
          hoverRef.current.scale.lerp(_tempScale.set(s, s, 1), 0.15);
        }
        if (isAnimating || isSelected) return;

        const totalWidth = PROJECT_COUNT * GAP;
        const rawX = index * GAP - currentScroll.current;
        const halfWidth = totalWidth / 2;
        const displayX = ((((rawX + halfWidth) % totalWidth) + totalWidth) % totalWidth) - halfWidth;
        const safeU = THREE.MathUtils.clamp((displayX + 16) / 32, 0, 1);
        const p = curve.getPointAt(safeU);
        cardRef.current.position.set(p.x, p.y, p.z);

        const t = state.clock.getElapsedTime();
        cardRef.current.rotation.z = Math.sin(t * swaySpeed.current + swayOffset.current) * 0.05;
        cardRef.current.rotation.x = 0;
        cardRef.current.scale.setScalar(THREE.MathUtils.clamp(1 - Math.abs(displayX) / 50, 0.7, 1));
      });

      return (
        <group
          ref={cardRef}
          onClick={(e) => {
            e.stopPropagation();
            onClick(index);
          }}
          onPointerEnter={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerLeave={(e) => {
            e.stopPropagation();
            setHovered(false);
          }}
        >
          <mesh position={[0, -0.08, 0.15]} rotation={[0, 0, Math.PI]}>
            <planeGeometry args={[0.3, 0.2]} />
            <meshBasicMaterial
              color={PIN_COLORS[index % PIN_COLORS.length]}
              map={clothespinTexture}
              transparent
              alphaTest={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
          <group ref={hoverRef}>
            <group ref={paperRef} position={[0, localBaseY, 0]}>
              <mesh position={[0.07, -0.08, -0.04]} visible={!isSelected && !isAnimating}>
                <planeGeometry args={[1.52, 2.02]} />
                <meshBasicMaterial color="#2b2620" transparent opacity={0.22} depthWrite={false} />
              </mesh>
              <mesh>
                <planeGeometry args={[1.5, 2, 16, 16]} />
                <PaperMaterial
                  ref={materialRef}
                  color="#ffffff"
                  map={front}
                  mapBack={back}
                  side={THREE.DoubleSide}
                  roughness={0.6}
                  paintProgress={paintProgress}
                  roomOrigin={roomOrigin}
                />
              </mesh>
            </group>
          </group>
        </group>
      );
    }
  )
);

ProjectCard.displayName = 'ProjectCard';


type RightSideHousesProps = {
  texture: THREE.Texture;
  baseWidth: number;
  baseHeight: number;
  cropAmount: number;
};

/** Cropped right-side architectural town silhouette matching the corridor aperture. */
function RightSideHouses({
  texture,
  baseWidth,
  baseHeight,
  cropAmount,
}: RightSideHousesProps) {
  const croppedTexture = useMemo(() => {
    const t = texture.clone();
    t.offset.x = cropAmount;
    t.repeat.x = 1 - cropAmount;
    t.needsUpdate = true;
    return t;
  }, [texture, cropAmount]);

  const newWidth = baseWidth * (1 - cropAmount);
  const newX = 7.5 + newWidth / 2;

  return (
    <mesh position={[newX, -1, -9]} scale={[-1, 1, 1]}>
      <planeGeometry args={[newWidth, baseHeight]} />
      <meshBasicMaterial
        color="#e0e0e0"
        map={croppedTexture}
        transparent
        alphaTest={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** Animated flying bird soaring gracefully across the cavernous valley backdrop. */
function FlyingBird({ texture }: { texture: THREE.Texture }) {
  const birdRef = useRef<THREE.Mesh>(null);
  const startX = -25;
  const endX = 25;
  const speed = 2.5;

  const velocityY = useRef(0);
  const gravity = -12.0;
  const jumpStrength = 5.5;
  const jumpInterval = useRef(0);

  useFrame((_, delta) => {
    if (!birdRef.current) return;
    const safeDelta = Math.min(delta, 0.05);

    birdRef.current.position.x += speed * safeDelta;

    if (birdRef.current.position.x > endX) {
      birdRef.current.position.x = startX;
      birdRef.current.position.y = 4.5;
      velocityY.current = 0;
      jumpInterval.current = 0;
      birdRef.current.rotation.z = 0;
    }

    velocityY.current += gravity * safeDelta;
    birdRef.current.position.y += velocityY.current * safeDelta;

    jumpInterval.current -= safeDelta;
    if (jumpInterval.current <= 0 || birdRef.current.position.y < 3.2) {
      velocityY.current = jumpStrength;
      jumpInterval.current = 0.9 + Math.random() * 0.3;
    }

    if (birdRef.current.position.y < 3.0) {
      birdRef.current.position.y = 3.0;
      velocityY.current = jumpStrength;
    }

    if (birdRef.current.position.y > 6.5) {
      birdRef.current.position.y = 6.5;
      velocityY.current = 0;
    }

    const targetRotationZ = THREE.MathUtils.clamp(
      velocityY.current * 0.05,
      -Math.PI / 6,
      Math.PI / 8
    );
    birdRef.current.rotation.z = THREE.MathUtils.lerp(
      birdRef.current.rotation.z,
      targetRotationZ,
      safeDelta * 8
    );
  });

  return (
    <mesh
      ref={birdRef}
      position={[startX, 4.5, -10]}
      scale={[BIRD_WIDTH, BIRD_HEIGHT, 1]}
    >
      <planeGeometry args={[1.5, 1.5]} />
      <meshBasicMaterial
        color="#e0e0e0"
        map={texture}
        transparent
        alphaTest={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

const _lookTarget = new THREE.Vector3();

/** Frames the clothesline instead of the empty floor, with a soft pointer parallax. */
function GalleryCameraRig({ focused }: { focused: boolean }) {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3(0, 1.2, -8));
  useFrame((state, delta) => {
    const k = Math.min(1, delta * 3);
    const mobile = size.width < 768;
    const px = focused ? 0 : state.pointer.x * 0.35;
    const py = focused ? 0 : state.pointer.y * 0.12;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, px, k);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.35 + py, k);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 1.2, k);
    look.current.lerp(_lookTarget.set(px * 0.3, focused ? 0.9 : mobile ? 1.0 : 1.25, -8), k);
    camera.lookAt(look.current);
  });
  return null;
}

type GalleryRoomProps = {
  paint?: PaintReveal;
  flipped?: number | null;
  onFlip?: (idx: number | null) => void;
  onSelect?: (idx: number | null) => void;
  onActive?: (idx: number) => void;
  command?: GalleryCommand | null;
};

/** Builds paper card faces for every project and repaints them once sketches and web fonts load. */
function useCardFaces() {
  const faces = useMemo(
    () => galleryItems.map(() => ({ front: makeFace(), back: makeFace() })),
    []
  );
  useEffect(() => {
    let alive = true;
    const total = galleryItems.length;
    const paint = (i: number, img?: HTMLImageElement) => {
      if (!alive) return;
      drawFront(faces[i].front.canvas, galleryItems[i], i, total, img);
      drawBack(faces[i].back.canvas, galleryItems[i], i);
      faces[i].front.texture.needsUpdate = true;
      faces[i].back.texture.needsUpdate = true;
    };
    const imgs: (HTMLImageElement | undefined)[] = [];
    galleryItems.forEach((item, i) => {
      paint(i);
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        imgs[i] = img;
        paint(i, img);
      };
      img.src = item.image ?? FALLBACK_SKETCH;
    });
    document.fonts?.ready.then(() => galleryItems.forEach((_, i) => paint(i, imgs[i])));
    return () => {
      alive = false;
    };
  }, [faces]);
  useEffect(
    () => () =>
      faces.forEach((f) => {
        f.front.texture.dispose();
        f.back.texture.dispose();
      }),
    [faces]
  );
  return faces;
}

/** The Gallery: an open veranda with every project pegged on a clothesline. */
export default function GalleryRoom({
  paint,
  flipped,
  onFlip,
  onSelect,
  onActive,
  command,
}: GalleryRoomProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetScroll = useRef(0);
  const currentScroll = useRef(0);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [globalIsAnimating, setGlobalIsAnimating] = useState(false);
  const cardRefs = useRef<Array<ProjectCardHandle | null>>([]);
  const lastTouchX = useRef(0);
  const lastActive = useRef(-1);
  const faces = useCardFaces();

  useEffect(() => {
    if (flipped === null && selectedCard !== null && !globalIsAnimating) {
      cardRefs.current[selectedCard]?.closeCard();
      setSelectedCard(null);
    }
  }, [flipped, selectedCard, globalIsAnimating]);

  const floorTexture = useTexture('/textures/gallery/floor.webp');
  const railingTexture = useTexture('/textures/gallery/railing.webp');
  const housesTexture = useTexture('/textures/gallery/domki.webp');
  const cityTexture = useTexture('/textures/gallery/miastotlo.webp');
  const birdTexture = useTexture('/textures/gallery/bird_gray.webp');
  const clothespinTexture = useTexture('/textures/gallery/klamerka.webp');
  const thresholdTexture = useTexture('/textures/corridor/texturadoprogow.webp');

  useEffect(() => {
    if (floorTexture) {
      floorTexture.wrapS = THREE.MirroredRepeatWrapping;
      floorTexture.wrapT = THREE.MirroredRepeatWrapping;
      floorTexture.repeat.set(0.5, 0.5 * 1.835);
      floorTexture.needsUpdate = true;
    }
    if (railingTexture) {
      railingTexture.wrapS = THREE.RepeatWrapping;
      railingTexture.wrapT = THREE.RepeatWrapping;
      railingTexture.repeat.set(7, 1);
      railingTexture.needsUpdate = true;
    }
    if (thresholdTexture) {
      thresholdTexture.wrapS = THREE.RepeatWrapping;
      thresholdTexture.wrapT = THREE.RepeatWrapping;
      thresholdTexture.repeat.set(15 / 2.524, 1);
      thresholdTexture.needsUpdate = true;
    }
  }, [floorTexture, railingTexture, thresholdTexture]);

  const scrollToIndex = (index: number, onComplete?: () => void) => {
    const totalWidth = PROJECT_COUNT * GAP;
    const targetScrollValue = index * GAP;
    const currentScrollValue = currentScroll.current;

    let diff = targetScrollValue - currentScrollValue;
    const halfWidth = totalWidth / 2;
    while (diff > halfWidth) diff -= totalWidth;
    while (diff < -halfWidth) diff += totalWidth;

    const finalTarget = currentScrollValue + diff;

    gsap.to(targetScroll, {
      current: finalTarget,
      duration: 0.5,
      ease: 'power2.inOut',
    });

    gsap.to(currentScroll, {
      current: finalTarget,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete,
    });
  };

  const handleCardClick = async (clickedIndex: number) => {
    if (globalIsAnimating) return;

    if (selectedCard === clickedIndex) {
      setGlobalIsAnimating(true);
      await cardRefs.current[clickedIndex]?.closeCard();
      setSelectedCard(null);
      onSelect?.(null);
      onFlip?.(null);
      setGlobalIsAnimating(false);
    } else if (selectedCard !== null) {
      setGlobalIsAnimating(true);
      await cardRefs.current[selectedCard]?.closeCard();
      setSelectedCard(null);
      await cardRefs.current[clickedIndex]?.openCard();
      setSelectedCard(clickedIndex);
      onSelect?.(clickedIndex);
      onFlip?.(clickedIndex);
      setGlobalIsAnimating(false);
    } else {
      setGlobalIsAnimating(true);
      await cardRefs.current[clickedIndex]?.openCard();
      setSelectedCard(clickedIndex);
      onSelect?.(clickedIndex);
      onFlip?.(clickedIndex);
      setGlobalIsAnimating(false);
    }
  };

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (selectedCard !== null || globalIsAnimating) return;
      e.preventDefault();
      targetScroll.current += e.deltaY * 0.005;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (selectedCard !== null || globalIsAnimating) return;
      if (e.touches && e.touches.length === 1) {
        lastTouchX.current = e.touches[0].clientX;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (selectedCard !== null || globalIsAnimating) return;
      if (e.touches && e.touches.length === 1) {
        const deltaX = lastTouchX.current - e.touches[0].clientX;
        lastTouchX.current = e.touches[0].clientX;
        targetScroll.current += deltaX * 0.008;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (selectedCard !== null || globalIsAnimating) return;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        targetScroll.current += 1.2;
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        targetScroll.current -= 1.2;
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedCard, globalIsAnimating]);

  useEffect(() => {
    if (!command) return;
    const i = ((command.index % PROJECT_COUNT) + PROJECT_COUNT) % PROJECT_COUNT;
    if (command.type === 'open') {
      if (selectedCard !== i) handleCardClick(i);
    } else if (selectedCard === null && !globalIsAnimating) {
      scrollToIndex(i);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command]);

  useFrame((_, delta) => {
    currentScroll.current = THREE.MathUtils.lerp(
      currentScroll.current,
      targetScroll.current,
      Math.min(1, delta * 5)
    );
    if (paint && groupRef.current) {
      paint.setOrigin(groupRef.current);
    }
    const active =
      ((Math.round(currentScroll.current / GAP) % PROJECT_COUNT) + PROJECT_COUNT) % PROJECT_COUNT;
    if (active !== lastActive.current) {
      lastActive.current = active;
      onActive?.(active);
    }
  });

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-16, 3.5, -6),
      new THREE.Vector3(-8, 2.5, -4.5),
      new THREE.Vector3(0, 1.8, -3),
      new THREE.Vector3(8, 2.5, -4.5),
      new THREE.Vector3(16, 3.5, -6),
    ]);
  }, []);

  const ropeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 64, 0.015, 8, false);
  }, [curve]);

  const floorShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-1.1, -2.0);
    shape.lineTo(1.1, -2.0);
    shape.lineTo(7.5, 4);
    shape.lineTo(-7.5, 4);
    shape.lineTo(-1.1, -2.0);
    return shape;
  }, []);

  const materials = useMemo(() => {
    const floorMat = new THREE.MeshBasicMaterial({
      map: floorTexture,
      color: '#e0e0e0',
      side: THREE.DoubleSide,
      transparent: true,
    });
    const ropeMat = new THREE.MeshBasicMaterial({
      color: '#666666',
      transparent: true,
    });
    const thresholdMat = new THREE.MeshBasicMaterial({
      color: '#e0e0e0',
      map: thresholdTexture,
      side: THREE.DoubleSide,
      transparent: true,
    });

    if (paint?.onBeforeCompile) {
      floorMat.onBeforeCompile = paint.onBeforeCompile;
      ropeMat.onBeforeCompile = paint.onBeforeCompile;
      thresholdMat.onBeforeCompile = paint.onBeforeCompile;
    }

    return { floor: floorMat, rope: ropeMat, threshold: thresholdMat };
  }, [floorTexture, thresholdTexture, paint]);

  const floorOutline = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute(
      'position',
      new THREE.Float32BufferAttribute([7.5, 4, 0, -7.5, 4, 0], 3)
    );
    const mat = new THREE.LineBasicMaterial({ color: '#999999', transparent: true });
    const l = new THREE.Line(geom, mat);
    l.rotation.x = -Math.PI / 2;
    l.position.set(0, 0.01, 0);
    return l;
  }, []);

  return (
    <group ref={groupRef}>
      <GalleryCameraRig focused={selectedCard !== null} />
      <group position={[0, -0.7, -2]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <shapeGeometry args={[floorShape]} />
          <primitive object={materials.floor} />
        </mesh>

        <primitive object={floorOutline} />

        <mesh position={[0, RAILING_HEIGHT / 2, -3.9]}>
          <planeGeometry args={[20, RAILING_HEIGHT]} />
          <meshBasicMaterial
            color="#e0e0e0"
            map={railingTexture}
            transparent
            side={THREE.DoubleSide}
            alphaTest={0.1}
          />
        </mesh>

        <mesh position={[0, 0.01, -3.9]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[15, 0.15]} />
          <primitive object={materials.threshold} />
        </mesh>

        <group position={[0, 1.6, -4]}>
          <mesh geometry={ropeGeometry} material={materials.rope} />

          {faces.map((face, i) => (
            <ProjectCard
              key={galleryItems[i].title}
              index={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              front={face.front.texture}
              back={face.back.texture}
              clothespinTexture={clothespinTexture}
              currentScroll={currentScroll}
              curve={curve}
              isSelected={selectedCard === i}
              scrollToIndex={scrollToIndex}
              onClick={handleCardClick}
              paintProgress={paint?.uniforms?.uPaint}
              roomOrigin={paint?.uniforms?.uOrigin}
            />
          ))}
        </group>

        <mesh position={[0, -1, -9]}>
          <planeGeometry args={[15, 15 / 2.357]} />
          <meshBasicMaterial
            color="#e0e0e0"
            map={housesTexture}
            transparent
            alphaTest={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh position={[-15, -1, -9]} scale={[-1, 1, 1]}>
          <planeGeometry args={[15, 15 / 2.357]} />
          <meshBasicMaterial
            color="#e0e0e0"
            map={housesTexture}
            transparent
            alphaTest={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        <RightSideHouses
          texture={housesTexture}
          baseWidth={15}
          baseHeight={15 / 2.357}
          cropAmount={RIGHT_CROP_AMOUNT}
        />

        <mesh position={[0, 3.4, -17]}>
          <planeGeometry args={[30, 30 / 2.357]} />
          <meshBasicMaterial
            color="#e0e0e0"
            map={cityTexture}
            transparent
            alphaTest={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh position={[-30, 3.4, -17]} scale={[-1, 1, 1]}>
          <planeGeometry args={[30, 30 / 2.357]} />
          <meshBasicMaterial
            color="#e0e0e0"
            map={cityTexture}
            transparent
            alphaTest={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh position={[30, 3.4, -17]} scale={[-1, 1, 1]}>
          <planeGeometry args={[30, 30 / 2.357]} />
          <meshBasicMaterial
            color="#e0e0e0"
            map={cityTexture}
            transparent
            alphaTest={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        <FlyingBird texture={birdTexture} />

        <GalleryClouds count={32} seed={123} />

        <mesh position={[0, 5, -20]}>
          <sphereGeometry args={[40, 32, 32]} />
          <meshBasicMaterial
            color="#ede9df"
            side={THREE.BackSide}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>
    </group>
  );
}
