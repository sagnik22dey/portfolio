import type { Theme } from '../theme';

export type SceneColors = {
  bg: string;
  fog: string;
  fogNear: number;
  fogFar: number;
  skyTop: string;
  skyMid: string;
  skyLow: string;
  hemiSky: string;
  hemiGround: string;
  hemi: number;
  sun: string;
  sunIntensity: number;
  sunPos: [number, number, number];
  cloud: string;
  stars: boolean;
};

const DAY: SceneColors = {
  bg: '#f7e4c6',
  fog: '#f5dcbc',
  fogNear: 34,
  fogFar: 120,
  skyTop: '#9cc7e8',
  skyMid: '#fbe8cc',
  skyLow: '#f0b98a',
  hemiSky: '#fff4e2',
  hemiGround: '#a87a54',
  hemi: 1.05,
  sun: '#fff0d6',
  sunIntensity: 1.9,
  sunPos: [8, 14, 10],
  cloud: '#fffdf7',
  stars: false,
};

const NIGHT: SceneColors = {
  bg: '#141a33',
  fog: '#1a2142',
  fogNear: 30,
  fogFar: 115,
  skyTop: '#070b1f',
  skyMid: '#1d2650',
  skyLow: '#3a2a4f',
  hemiSky: '#93a3e6',
  hemiGround: '#4a3a52',
  hemi: 0.95,
  sun: '#c9d4ff',
  sunIntensity: 1.05,
  sunPos: [-10, 16, 6],
  cloud: '#8e98c4',
  stars: true,
};

/** Sky, fog and light colours for the archipelago in the given theme. */
export function sceneColors(theme: Theme): SceneColors {
  return theme === 'dark' ? NIGHT : DAY;
}
