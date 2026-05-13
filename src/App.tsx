import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Zap, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AppendMode = () => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: number | undefined;
    if (isActive) {
      interval = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (total) => {
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-white flex items-center justify-center overflow-hidden font-sans">
      {/* BACKGROUND ANIMATION - Maillage de dégradés élégants */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: isActive ? 0.3 : 0.15,
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/30 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: isActive ? 0.2 : 0.1,
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[140px]"
        />
      </div>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center">
        {/* TOP BADGE */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12 flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
        >
          <Zap
            className={`w-4 h-4 ${isActive ? "text-yellow-400 fill-yellow-400" : "text-indigo-400"}`}
          />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-indigo-100/70">
            {isActive ? "Session en cours" : "Prêt pour le focus"}
          </span>
        </motion.div>

        {/* GLASS CARD */}
        <motion.div
          layout
          className="relative w-full aspect-square flex flex-col items-center justify-center rounded-[3rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-2xl"
        >
          {/* Progress Ring (Background) */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 p-8">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              className="fill-none stroke-white/5 stroke-[2]"
            />
            {isActive && (
              <motion.circle
                cx="50%"
                cy="50%"
                r="45%"
                className="fill-none stroke-indigo-500 stroke-[3]"
                strokeDasharray="100 100"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              />
            )}
          </svg>

          {/* TIMER */}
          <div className="text-center z-10">
            <motion.span
              key={seconds}
              initial={{ opacity: 0.8, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-8xl md:text-9xl font-light tracking-tighter tabular-nums"
            >
              {formatTime(seconds)}
            </motion.span>
            <p className="text-indigo-300/40 text-sm font-medium tracking-widest mt-2">
              MINUTES
            </p>
          </div>

          {/* PLAY/PAUSE BUTTON */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsActive(!isActive)}
            className={`absolute -bottom-8 p-6 rounded-3xl shadow-xl transition-all duration-300 ${
              isActive
                ? "bg-white text-black hover:bg-indigo-50"
                : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
          >
            {isActive ? (
              <Pause size={32} />
            ) : (
              <Play size={32} className="ml-1" />
            )}
          </motion.button>
        </motion.div>

        {/* SECONDARY ACTIONS */}
        <div className="mt-20 h-10">
          <AnimatePresence>
            {!isActive && seconds > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={() => setSeconds(0)}
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-medium"
              >
                <RotateCcw size={16} />
                Réinitialiser
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* FOOTER INFO */}
      <footer className="absolute bottom-8 w-full text-center">
        <p className="text-white/20 text-[11px] tracking-widest uppercase font-medium">
          Deep Work • Minimalist Tool
        </p>
      </footer>

      {/* STYLES ADDITIONNELS (Custom Blur) */}
      <style>{`
        body { background-color: #050505; margin: 0; overflow: hidden; }
        .backdrop-blur-3xl { backdrop-filter: blur(60px); }
      `}</style>
    </div>
  );
};

export default AppendMode;
