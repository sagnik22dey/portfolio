import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { islands, islets, type IslandDef } from './data';
import { IslandRock, Trees, PaperHouse, Flag, SkillTowers, Lighthouse, Mailbox } from './Landmarks';
import ProjectCards from './ProjectCards';
import { makeLabel } from './paper';
import { skills } from '../data/portfolio';

type IslandsProps = {
  isletCount: number;
  cardCount: number;
  activeProject: number | null;
  onPickProject: (i: number) => void;
  onPickIsland: (stopIndex: number) => void;
};

/** Hanging paper sign that names the island, drawn once into a canvas texture. */
function Sign({ text, sub, position }: { text: string; sub: string; position: [number, number, number] }) {
  const tex = useMemo(() => makeLabel(text, { sub }), [text, sub]);
  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[1.9, 0.6]} />
        <meshBasicMaterial map={tex} toneMapped={false} side={THREE.DoubleSide} />
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
        onPick(def.stopIndex);
      }}
    >
      <IslandRock radius={def.radius} seed={def.seed} />
      {children}
    </group>
  );
}

/** The four content islands plus decorative islets. */
export default function Islands({ isletCount, cardCount, activeProject, onPickProject, onPickIsland }: IslandsProps) {
  const [about, proj, studio, contact] = islands;
  const towerHeights = useMemo(() => skills.map((s) => 0.5 + s.skills.length * 0.16), []);

  return (
    <group>
      <Island def={about} onPick={onPickIsland}>
        <PaperHouse />
        <Trees radius={about.radius} seed={about.seed} count={4} />
        <Flag position={[1.4, 0, 0.8]} />
        <Sign text="About" sub="who I am" position={[1.2, 2.6, 0.8]} />
      </Island>

      <Island def={proj} onPick={onPickIsland}>
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.35, 0.5, 1.1, 8]} />
          <meshLambertMaterial color="#d9cba6" flatShading />
        </mesh>
        <ProjectCards count={cardCount} activeIndex={activeProject} onPick={onPickProject} />
        <Trees radius={proj.radius} seed={proj.seed} count={3} />
        <Sign text="Projects" sub="tap a card" position={[0, 3.55, 0]} />
      </Island>

      <Island def={studio} onPick={onPickIsland}>
        <SkillTowers heights={towerHeights} />
        <Trees radius={studio.radius} seed={studio.seed} count={3} />
        <Flag color="#6b7c5f" position={[-1.6, 0, 0.9]} />
        <Sign text="Studio" sub="skills & experience" position={[0, 3.1, 0.4]} />
      </Island>

      <Island def={contact} onPick={onPickIsland}>
        <Lighthouse />
        <Mailbox />
        <Trees radius={contact.radius} seed={contact.seed} count={2} />
        <Sign text="Contact" sub="say hello" position={[-1.1, 2.3, 0.6]} />
      </Island>

      {islets.slice(0, isletCount).map((it, i) => (
        <group key={i} position={it.position}>
          <IslandRock radius={it.radius} seed={it.seed} />
          <Trees radius={it.radius} seed={it.seed} count={1} />
        </group>
      ))}
    </group>
  );
}
