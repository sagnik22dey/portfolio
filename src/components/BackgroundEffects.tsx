import { motion } from 'framer-motion';

export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#09090f]">
      {/* Animated subtle grid */}
      <motion.div 
        className="absolute inset-0 grid-bg opacity-30"
        animate={{
          backgroundPosition: ['0px 0px', '48px 48px']
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 15
        }}
      />

      {/* Floating Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] bg-brand-600/25 rounded-full blur-[120px]"
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 50, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[25vw] h-[25vw] bg-accent-cyan/20 rounded-full blur-[100px]"
        animate={{
          x: [0, -70, 70, 0],
          y: [0, 70, -70, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-accent-pink/15 rounded-full blur-[150px]"
        animate={{
          rotate: [0, 180, 360],
          scale: [1, 1.3, 0.9, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Static Noise Overlay for texture */}
      <div className="absolute inset-0 noise mix-blend-overlay" />
    </div>
  );
}
