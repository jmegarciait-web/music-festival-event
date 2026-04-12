import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useEffect, useState } from 'react';

const NeonIntro = ({ onComplete }: { onComplete: () => void }) => {
  const [isFlickering, setIsFlickering] = useState(false);

  useEffect(() => {
    // Start the flicker effect after drawing finishes
    const timer = setTimeout(() => setIsFlickering(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const pathVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 2, ease: "easeInOut" }
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0, scale: 1.5 }}
      transition={{ duration: 0.8, delay: 3.5, ease: "circIn" }}
      onAnimationComplete={onComplete}
      style={{ pointerEvents: 'none' }}
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Neon SVG */}
        <motion.svg 
          width="200" 
          height="200" 
          viewBox="0 0 100 100" 
          className="overflow-visible"
        >
          {/* Outer glow filter */}
          <filter id="neon-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <motion.path
            d="M 20 80 L 50 20 L 80 80 L 35 45 L 65 45 Z"
            fill="transparent"
            stroke="#f900ff"
            strokeWidth="2"
            filter="url(#neon-glow)"
            variants={pathVariants}
            initial="hidden"
            animate="visible"
            className={isFlickering ? "animate-[neonPulse_0.2s_ease-in-out_3]" : ""}
          />
          <motion.path
            d="M 20 80 L 50 20 L 80 80 L 35 45 L 65 45 Z"
            fill="transparent"
            stroke="#00f9ff"
            strokeWidth="0.5"
            variants={pathVariants}
            initial="hidden"
            animate="visible"
            style={{ x: 3, y: 3 }}
            className={isFlickering ? "animate-[neonPulse_0.1s_ease-in-out_4]" : ""}
          />
        </motion.svg>

        {/* Text Fade In */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2.2 }}
          className="mt-8 font-display text-4xl font-black tracking-[0.5em] text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-cyan uppercase ml-4"
        >
          Project 5
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NeonIntro;
