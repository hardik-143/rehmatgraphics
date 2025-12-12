"use client";

import { motion, useScroll, useSpring } from "framer-motion";

const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed left-0 top-0 z-50 h-[3px] w-full origin-left bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
      style={{ scaleX: smoothProgress }}
      aria-hidden="true"
    />
  );
};

export default ScrollProgressBar;
