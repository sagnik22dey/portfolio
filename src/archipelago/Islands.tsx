import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { islands, islets, type IslandDef } from './data';
import {
  IslandRock, Trees, PaperHouse, Flag, SkillTowers, Lighthouse, Mailbox,
  Workshop, Windmill, Desk, Dock, Envelopes, Part,
} from './Landmarks';
import { OutlineContext } from './outline';
import { flightLock } from './useFlight';
import ProjectCards, { ProjectPedestal } from './ProjectCards';
import Portrait from './Portrait';
import { geom, makeLabel } from './paper';
import { skills } from '../data/portfolio';

type IslandsProps = {
  isletCount: number;
  cardCount: number;
  activeProject: number | null;
  onPickProject: (i: number) => void;
  onPickIsland: (stopIndex: number) => void;
  outlines: boolean;
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

/** The four content islands plus decorative islets. */
export default function Islands({ isletCount, cardCount, activeProject, onPickProject, onPickIsland, outlines }: IslandsProps) {
  const [about, proj, studio, contact] = islands;
  const towerHeights = useMemo(() => skills.map((s) => 0.6 + s.skills.length * 0.17), []);

  return (
    <OutlineContext.Provider value={outlines}>
    <group>
      <Island def={about} onPick={onPickIsland}>
        <PaperHouse />
        <Portrait position={[1.35, 0, 0.55]} />
        <Trees radius={about.radius} seed={about.seed} count={5} />
        <Flag position={[-2.0, 0, 1.0]} />
        <Sign text="About" sub="who I am" position={[-0.6, 3.2, 0.2]} />
      </Island>

      <Island def={proj} onPick={onPickIsland}>
        <ProjectPedestal />
        <ProjectCards count={cardCount} activeIndex={activeProject} onPick={onPickProject} />
        <Trees radius={proj.radius} seed={proj.seed} count={3} />
        <Sign text="Projects" sub="drag or tap a card" position={[0, 3.7, 0]} />
      </Island>

      <Island def={studio} onPick={onPickIsland}>
        <Workshop />
        <SkillTowers heights={towerHeights} />
        <Windmill position={[-2.1, 0, -0.6]} />
        <Desk position={[1.9, 0, 0.6]} />
        <Trees radius={studio.radius} seed={studio.seed} count={2} />
        <Flag color="#6b7c5f" position={[-1.4, 0, 1.5]} />
        <Sign text="Studio" sub="skills & experience" position={[0, 3.3, 0.4]} />
      </Island>

      <Island def={contact} onPick={onPickIsland}>
        <Lighthouse />
        <Envelopes />
        <Mailbox />
        <Dock />
        <Trees radius={contact.radius} seed={contact.seed} count={2} />
        <Sign text="Contact" sub="say hello" position={[-1.2, 2.5, 0.6]} />
      </Island>

      {islets.slice(0, isletCount).map((it, i) => (
        <group key={i} position={it.position}>
          <IslandRock radius={it.radius} seed={it.seed} />
          <Trees radius={it.radius} seed={it.seed} count={1} />
        </group>
      ))}
    </group>
    </OutlineContext.Provider>
  );
}
