import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export const AnimatedPrice: React.FC<{ value: number }> = ({ value }) => {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
};
