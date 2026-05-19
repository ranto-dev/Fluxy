import React, { useState, useRef, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  RefreshCw,
  Upload,
  Layers,
  Palette,
  Sparkles,
  Wand2,
} from "lucide-react";
import { domToPng } from "modern-screenshot";
import Slider from "./components/Slider";
import type { BlobColors, BlobParams, Point } from "./@types/types";

const EXPORT_SIZE = 650;

const generateComplexBlob = (
  size: number,
  growth: number,
  edges: number,
  seed: number,
  smoothness: number,
): string => {
  const center = size / 2;
  const points: Point[] = [];
  const angleStep = (Math.PI * 2) / edges;

  for (let i = 0; i < edges; i++) {
    const angle = i * angleStep;
    const noise = Math.sin(angle * (seed * 0.5)) * growth;
    const radius = size / smoothness + noise;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    points.push({ x, y });
  }

  return (
    points.reduce((path: string, p: Point, i: number, a: Point[]) => {
      const next = a[(i + 1) % a.length];
      const control = { x: (p.x + next.x) / 2, y: (p.y + next.y) / 2 };
      return i === 0
        ? `M ${control.x} ${control.y}`
        : `${path} Q ${p.x} ${p.y} ${control.x} ${control.y}`;
    }, "") + " Z"
  );
};

const Fluxy: React.FC = () => {
  const [params, setParams] = useState<BlobParams>({
    growth: 75,
    edges: 6,
    seed: Math.random() * 100,
    smoothness: 3.5,
    rotate: 0,
    opacity: 1,
    blur: 0,
  });

  const [colors, setColors] = useState<BlobColors>({
    primary: "#6366f1",
    secondary: "#a855f7",
  });

  const [image, setImage] = useState<string | null>(null);
  const [imageLayer, setImageLayer] = useState<"above" | "below">("above");
  const stageRef = useRef<HTMLDivElement>(null);

  const randomize = (): void => {
    setParams((p) => ({
      ...p,
      seed: Math.random() * 100,
      rotate: Math.random() * 360,
      growth: 50 + Math.random() * 70,
    }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (en: ProgressEvent<FileReader>) => {
        if (en.target?.result) {
          setImage(en.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const exportArt = async (): Promise<void> => {
    if (!stageRef.current) return;
    try {
      const imgData = await domToPng(stageRef.current, {
        quality: 1,
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `fluxy-art-${Math.floor(Date.now() / 1000)}.png`;
      link.href = imgData;
      link.click();
    } catch (error) {
      console.error("Erreur lors de l'exportation du PNG :", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-slate-300 flex flex-col lg:flex-row overflow-hidden font-sans antialiased">
      <aside className="w-full lg:w-96 bg-[#09090b]/80 backdrop-blur-xl border-r border-white/5 p-8 overflow-y-auto z-20 flex flex-col justify-between shadow-2xl h-auto lg:h-screen">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white uppercase italic">
                Fluxy
              </h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                Blob Generator & Layer Lab
              </p>
            </div>
          </div>

          <section className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <header className="flex items-center gap-2 text-indigo-400 mb-1">
              <Wand2 size={14} />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Géométrie
              </h2>
            </header>
            <Slider
              label="Complexité"
              min={3}
              max={15}
              value={params.edges}
              onChange={(v) => setParams({ ...params, edges: v })}
            />
            <Slider
              label="Amplitude"
              min={20}
              max={180}
              value={params.growth}
              onChange={(v) => setParams({ ...params, growth: v })}
            />
            <Slider
              label="Lissage"
              min={2}
              max={6}
              step={0.1}
              value={params.smoothness}
              onChange={(v) => setParams({ ...params, smoothness: v })}
            />
            <Slider
              label="Rotation"
              min={0}
              max={360}
              value={params.rotate}
              onChange={(v) => setParams({ ...params, rotate: v })}
            />
          </section>

          <section className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <header className="flex items-center gap-2 text-purple-400 mb-1">
              <Palette size={14} />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Couleurs & Effets
              </h2>
            </header>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative group h-11 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                <input
                  type="color"
                  value={colors.primary}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setColors({ ...colors, primary: e.target.value })
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                  className="w-4 h-4 rounded-full border border-white/20"
                  style={{ backgroundColor: colors.primary }}
                />
                <span className="text-xs font-mono ml-2 text-white">
                  {colors.primary}
                </span>
              </div>
              <div className="relative group h-11 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                <input
                  type="color"
                  value={colors.secondary}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setColors({ ...colors, secondary: e.target.value })
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                  className="w-4 h-4 rounded-full border border-white/20"
                  style={{ backgroundColor: colors.secondary }}
                />
                <span className="text-xs font-mono ml-2 text-white">
                  {colors.secondary}
                </span>
              </div>
            </div>
            <Slider
              label="Opacité"
              min={0.1}
              max={1}
              step={0.1}
              value={params.opacity}
              onChange={(v) => setParams({ ...params, opacity: v })}
            />
            <Slider
              label="Flou (Glass)"
              min={0}
              max={30}
              value={params.blur}
              onChange={(v) => setParams({ ...params, blur: v })}
            />
          </section>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col gap-2.5 mt-6 lg:mt-0">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={randomize}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 font-medium text-sm text-white"
            >
              <RefreshCw size={15} /> Mix
            </button>
            <button
              onClick={() =>
                setImageLayer(imageLayer === "above" ? "below" : "above")
              }
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 transition-all font-semibold text-xs uppercase tracking-wider border border-indigo-500/10"
            >
              <Layers size={15} />{" "}
              {imageLayer === "above" ? "Dessus" : "Dessous"}
            </button>
          </div>

          <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all cursor-pointer group">
            <Upload
              size={16}
              className="text-slate-500 group-hover:text-indigo-400 transition-colors"
            />
            <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
              Importer Image
            </span>
            <input
              type="file"
              className="hidden"
              onChange={handleImageUpload}
              accept="image/*"
            />
          </label>

          <button
            onClick={exportArt}
            className="group relative flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all font-bold shadow-lg shadow-indigo-600/20 overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <Download size={18} /> Exporter PNG
          </button>
        </div>
      </aside>

      <main className="flex-1 relative flex items-center justify-center p-6 lg:p-12 select-none overflow-auto bg-[#070708]">
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#fff 1.5px, transparent 1.5px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative p-1 rounded-[2.5rem] bg-linear-to-b from-white/10 via-transparent to-white/5 shadow-2xl">
          <div className="relative w-[340px] h-[340px] sm:w-[650px] sm:h-[650px] rounded-[2.3rem] bg-[#09090b] border border-white/5 flex items-center justify-center overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-8 bg-linear-to-b from-white/2 to-transparent pointer-events-none flex items-center justify-center z-30">
              <span className="text-[9px] uppercase font-bold tracking-[0.3em] text-white/20 group-hover:text-white/40 transition-colors">
                Zone d'exportation
              </span>
            </div>

            <div
              ref={stageRef}
              className="relative w-full h-full flex items-center justify-center bg-transparent"
            >
              <motion.div
                style={{
                  zIndex: imageLayer === "above" ? 1 : 10,
                  rotate: params.rotate,
                  filter: `blur(${params.blur}px)`,
                }}
                className="absolute inset-0 w-full h-full p-8"
              >
                <svg
                  viewBox={`0 0 ${EXPORT_SIZE} ${EXPORT_SIZE}`}
                  className="w-full h-full"
                >
                  <defs>
                    <linearGradient
                      id="fluxyGrad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor={colors.primary} />
                      <stop offset="100%" stopColor={colors.secondary} />
                    </linearGradient>
                  </defs>
                  <motion.path
                    animate={{
                      d: generateComplexBlob(
                        EXPORT_SIZE,
                        params.growth,
                        params.edges,
                        params.seed,
                        params.smoothness,
                      ),
                    }}
                    transition={{ type: "spring", damping: 14, stiffness: 45 }}
                    fill="url(#fluxyGrad)"
                    fillOpacity={params.opacity}
                  />
                </svg>
              </motion.div>

              <AnimatePresence>
                {image && (
                  <motion.div
                    drag
                    dragMomentum={false}
                    className="absolute cursor-grab active:cursor-grabbing"
                    style={{ zIndex: imageLayer === "above" ? 20 : 5 }}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                  >
                    <img
                      src={image}
                      alt="Overlay"
                      className="max-w-[240px] sm:max-w-[340px] pointer-events-none select-none"
                      draggable="false"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 hidden sm:flex items-center gap-3 text-[10px] tracking-wider font-mono text-slate-600 bg-white/1 border border-white/5 px-3 py-1.5 rounded-xl">
          <span className="text-indigo-500">W</span> {EXPORT_SIZE}px{" "}
          <span className="text-purple-500">H</span> {EXPORT_SIZE}px
        </div>
      </main>
    </div>
  );
};

export default Fluxy;
