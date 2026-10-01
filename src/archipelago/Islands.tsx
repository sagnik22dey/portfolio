import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { islands, islets, type IslandDef } from './data';
import {
  IslandRock, Trees, SkillTowers, LighthouseBeam, Mailbox,
  Windmill, Desk, Dock, Envelopes, Part,
} from './Landmarks';
import { OutlineContext } from './outline';
import { flightLock } from './useFlight';
import ProjectCards, { ProjectPedestal } from './ProjectCards';
import Portrait from './Portrait';
import Model from './Model';
import { SkyShip, Balloon } from './Flyers';
import { geom, makeLabel } from './paper';
import { skills } from '../data/portfolio';

const TORII_TINT = { '*': '#d2361e' };

type IslandsProps = {
  isletCount: number;
  cardCount: number;
  activeProject: number | null;
  onPickProject: (i: number) => void;
  onPickIsland: (stopIndex: number) => void;
  outlines: boolean;
  models: 'full' | 'lite';
  night: boolean;
};

/** Paper sign board on two posts naming the island, drawn once into a canvas texture. */
function Sign({ text, sub, position }: { text: string; sub: string; position: [number, number, number] }) {
  const tex = useMemo(() => makeLabel(text, { sub }), [text, sub]);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <group position={position}>
      <Part geo={geom('box', 2.1, 0.72, 0.06)} color="#2b2620" position={[0, 0, -0.04]} ink={0} />
      <mesh>
        <planeGeometry args={[2.0, 0.63]} />
        <meshBasicMaterial map={tex} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.55, 0.52, -0.04]} rotation={[0, 0, 0.5]} geometry={geom('box', 0.02, 0.5, 0.02)}>
        <meshBasicMaterial color="#2b2620" />
      </mesh>
      <mesh position={[0.55, 0.52, -0.04]} rotation={[0, 0, -0.5]} geometry={geom('box', 0.02, 0.5, 0.02)}>
        <meshBasicMaterial color="#2b2620" />
      </mesh>
    </group>
  );
}

/** Island group with a gentle bob; click anywhere on it to fly there. */
function Island({ def, children, onPick }: { def: IslandDef; children: React.ReactNode; onPick: (i: number) => void }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.position.y = def.position[1] + Math.sin(state.clock.elapsedTime * 0.5 + def.seed) * 0.12;
  });
  return (
    <group
      ref={ref}
      position={def.position}
      onClick={(e) => {
        e.stopPropagation();
        if (performance.now() - flightLock.dragEnd < 300) return;
        onPick(def.stopIndex);
      }}
    >
      <IslandRock radius={def.radius} seed={def.seed} decor />
      {children}
    </group>
  );
}

/** The four content islands plus decorative islets, dressed with optimized CC0 / procedural GLB buildings. */
export default function Islands({ isletCount, cardCount, activeProject, onPickProject, onPickIsland, outlines, models, night }: IslandsProps) {
  const [about, proj, studio, contact] = islands;
  const towerHeights = useMemo(() => skills.map((s) => 0.6 + s.skills.length * 0.17), []);
  const full = models === 'full';

  return (
    <OutlineContext.Provider value={outlines}>
    <group>
      <Island def={about} onPick={onPickIsland}>
        <Model url="/models/japanese_house.glb" height={1.9} position={[-0.7, 0, -0.7]} rotation={[0, 0.25, 0]} night={night} lift={1.7} />
        <Portrait position={[1.45, 0, 0.6]} />
        <Model url="/models/sakura.glb" height={2.1} position={[-2.1, 0, 0.6]} night={night} />
        {full && <Model url="/models/sakura.glb" height={1.6} position={[1.9, 0, -1.6]} rotation={[0, 1.4, 0]} night={night} />}
        <Model url="/models/lantern.glb" height={0.75} position={[0.3, 0, 1.4]} night={night} />
        {full && <Model url="/models/lantern.glb" height={0.75} position={[-1.3, 0, 1.6]} night={night} />}
        <Trees radius={about.radius} seed={about.seed} count={full ? 3 : 2} />
        <Sign text="About" sub="who I am" position={[-0.6, 3.2, 0.2]} />
        {full && (
          <>
            <Model url="/models/bridge.glb" height={0.75} position={[3.37, -0.18, 1.26]} rotation={[0, -0.36, 0]} night={night} />
            <group position={[4.8, -0.05, 1.8]}>
              <IslandRock radius={0.9} seed={41} />
              <Model url="/models/lantern.glb" height={0.7} position={[0.1, 0, 0]} night={night} />
            </group>
          </>
        )}
      </Island>

      <Island def={proj} onPick={onPickIsland}>
        <ProjectPedestal />
        <ProjectCards count={cardCount} activeIndex={activeProject} onPick={onPickProject} />
        <Model url="/models/sakura.glb" height={1.8} position={[-2.2, 0, -1.4]} night={night} />
        {full && <Model url="/models/lantern.glb" height={0.7} position={[1.5, 0, 1.6]} night={night} />}
        <Trees radius={proj.radius} seed={proj.seed} count={2} />
        <Sign text="Projects" sub="drag or tap a card" position={[0, 3.7, 0]} />
      </Island>

      <Island def={studio} onPick={onPickIsland}>
        <Model url="/models/pagoda.glb" height={3.6} position={[-0.3, 0, -1.7]} night={night} />
        <SkillTowers heights={towerHeights} />
        <Windmill position={[-2.3, 0, -0.2]} />
        <Desk position={[1.9, 0, 0.6]} />
        {full && <Model url="/models/lantern.glb" height={0.7} position={[1.4, 0, -1.4]} night={night} />}
        <Trees radius={studio.radius} seed={studio.seed} count={2} />
        <Sign text="Studio" sub="skills & experience" position={[1.6, 3.5, 0.5]} />
      </Island>

      <Island def={contact} onPick={onPickIsland}>
        <Model url="/models/lighthouse.glb" height={4.6} position={[0.6, 0, -0.5]} night={night} />
        <LighthouseBeam position={[0.6, 3.95, -0.5]} night={night} />
        <Model url="/models/torii.glb" height={1.7} position={[1.5, 0, 1.6]} rotation={[0, -0.5, 0]} tint={TORII_TINT} night={night} />
        <Envelopes />
        <Mailbox />
        <Dock />
        <Trees radius={contact.radius} seed={contact.seed} count={2} />
        <Sign text="Contact" sub="say hello" position={[-1.2, 2.5, 0.6]} />
      </Island>

      <SkyShip night={night} />
      <Balloon position={[-6, 4.5, -4]} night={night} />
      {full && <Balloon position={[22, 6, -36]} phase={2} night={night} />}

      {islets.slice(0, isletCount).map((it, i) => (
        <group key={i} position={it.position}>
          <IslandRock radius={it.radius} seed={it.seed} />
          {full && i % 3 === 0 ? (
            <Model url="/models/sakura.glb" height={it.radius * 1.4} night={night} />
          ) : (
            <Trees radius={it.radius} seed={it.seed} count={1} />
          )}
        </group>
      ))}
    </group>
    </OutlineContext.Provider>
  );
}
