'use client';
import { motion, useReducedMotion } from "framer-motion";
import BottomCandleChart from "./BottomCandleChart";
import DynamicTrendLine from "./DynamicTrendLine";
import { useEffect, useState } from "react";

const AnimatedBackground = () => {
  const shouldReduce = useReducedMotion();
  const [particles, setParticles] = useState<Array<{ left: string; top: string; delay: number; duration: number }>>([]);

  useEffect(() => {
    if (shouldReduce) return;
    const items = Array.from({ length: 25 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 5,
    }));
    setParticles(items);
  }, [shouldReduce]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50 bg-background">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.1]" />

      {!shouldReduce && (
        <motion.div
          className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {!shouldReduce && particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-profit/40 rounded-full"
          style={{ left: p.left, top: p.top }}
          animate={{ y: [0, -100, 0], opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {!shouldReduce && <DynamicTrendLine />}
      {!shouldReduce && <BottomCandleChart />}

      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />
      <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-[0.02] pointer-events-none" />
    </div>
  );
};

export default AnimatedBackground;