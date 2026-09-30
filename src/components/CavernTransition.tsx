import { motion } from 'framer-motion';

type Props = {
  isExiting?: boolean;
};

/** Atmospheric darkness vignette during threshold crossing between cavern corridor and chamber rooms. */
export default function CavernTransition({ isExiting = false }: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-50 pointer-events-none"
      initial={{ opacity: 0, scale: isExiting ? 1.04 : 0.96 }}
      animate={{ opacity: [0, 0.95, 0], scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.65, times: [0, 0.5, 1], ease: 'easeInOut' }}
    >
      <div
        className="w-full h-full"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(12,13,15,0.4) 0%, rgba(10,9,8,0.95) 75%, #080807 100%)',
        }}
      />
    </motion.div>
  );
}
