/** Simple HTML5 audio trigger for UI and 3D spatial feedback. */
export function playSound(url: string, volume = 0.5): HTMLAudioElement | null {
  try {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(() => {});
    return audio;
  } catch {
    return null;
  }
}
