import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  RefreshCw,
  Upload,
  Layers,
  Move,
  Palette,
  Sparkles,
  Wand2,
} from "lucide-react";
import html2canvas from "html2canvas";

// Algorithme de génération avancé avec bruit sinus
const generateComplexBlob = (
  size: number,
  growth: number,
  edges: number,
  seed: number,
  smoothness: number,
) => {
  const center = size / 2;
  const points = [];
  const angleStep = (Math.PI * 2) / edges;

  for (let i = 0; i < edges; i++) {
    const angle = i * angleStep;
    // Utilisation du seed pour varier les rayons de manière pseudo-aléatoire
    const noise = Math.sin(angle * seed) * growth;
    const radius = size / smoothness + noise;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    points.push({ x, y });
  }

  return (
    points.reduce((path, p, i, a) => {
      const next = a[(i + 1) % a.length];
      const control = { x: (p.x + next.x) / 2, y: (p.y + next.y) / 2 };
      return i === 0
        ? `M ${control.x} ${control.y}`
        : `${path} Q ${p.x} ${p.y} ${control.x} ${control.y}`;
    }, "") + " Z"
  );
};

const FluxyV2 = () => {
  const [params, setParams] = useState({
    growth: 50,
    edges: 6,
    seed: 42,
    smoothness: 3,
    rotate: 0,
    opacity: 0.9,
    blur: 0,
    gradientAngle: 45,
  });

  const [colors, setColors] = useState({
    primary: "#6366f1",
    secondary: "#a855f7",
  });
  const [image, setImage] = useState<string | null>(null);
  const [imageLayer, setImageLayer] = useState<"above" | "below">("above");
  const stageRef = useRef<HTMLDivElement>(null);

  const randomize = () =>
    setParams({
      ...params,
      seed: Math.random() * 100,
      rotate: Math.random() * 360,
    });

  const exportArt = async () => {
    if (!stageRef.current) return;
    const canvas = await html2canvas(stageRef.current, {
      backgroundColor: null,
      scale: 2,
    });
    const link = document.createElement("a");
    link.download = `fluxy-art-${Math.floor(Date.now() / 1000)}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* PANEL DE CONTRÔLE (SIDEBAR) */}
      <aside className="w-full lg:w-96 bg-[#0c0c0c] border-r border-white/5 p-8 overflow-y-auto custom-scrollbar shadow-2xl z-20">
        <header className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="text-white" size={22} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white italic">
            FLUXY
          </h1>
        </header>

        <div className="space-y-8">
          {/* Géométrie */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-indigo-400">
              <Wand2 size={16} />
              <h2 className="text-xs font-bold uppercase tracking-widest">
                Géométrie
              </h2>
            </div>
            <div className="space-y-5">
              <ControlSlider
                label="Complexité"
                min={3}
                max={20}
                value={params.edges}
                onChange={(v) => setParams({ ...params, edges: v })}
              />
              <ControlSlider
                label="Amplitude"
                min={10}
                max={120}
                value={params.growth}
                onChange={(v) => setParams({ ...params, growth: v })}
              />
              <ControlSlider
                label="Lissage"
                min={2}
                max={6}
                step={0.1}
                value={params.smoothness}
                onChange={(v) => setParams({ ...params, smoothness: v })}
              />
              <ControlSlider
                label="Rotation"
                min={0}
                max={360}
                value={params.rotate}
                onChange={(v) => setParams({ ...params, rotate: v })}
              />
            </div>
          </section>

          {/* Style Visuel */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-purple-400">
              <Palette size={16} />
              <h2 className="text-xs font-bold uppercase tracking-widest">
                Apparence
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="color"
                value={colors.primary}
                onChange={(e) =>
                  setColors({ ...colors, primary: e.target.value })
                }
                className="w-full h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer"
              />
              <input
                type="color"
                value={colors.secondary}
                onChange={(e) =>
                  setColors({ ...colors, secondary: e.target.value })
                }
                className="w-full h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer"
              />
            </div>
            <ControlSlider
              label="Flou (Glass)"
              min={0}
              max={40}
              value={params.blur}
              onChange={(v) => setParams({ ...params, blur: v })}
            />
          </section>

          {/* Actions */}
          <div className="pt-6 border-t border-white/5 space-y-4">
            <button
              onClick={randomize}
              className="w-full py-3 border border-white/10 hover:bg-white/5 rounded-xl flex items-center justify-center gap-2 transition-all font-medium"
            >
              <RefreshCw size={18} /> Aléatoire
            </button>

            <label className="w-full py-3 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all">
              <Upload size={18} /> Importer Image
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (en) =>
                      setImage(en.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>

            <button
              onClick={() =>
                setImageLayer(imageLayer === "above" ? "below" : "above")
              }
              className="w-full py-3 bg-indigo-600/10 text-indigo-400 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-600/20 transition-all"
            >
              <Layers size={18} /> Image en{" "}
              {imageLayer === "above" ? "Premier plan" : "Arrière-plan"}
            </button>

            <button
              onClick={exportArt}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20 font-bold"
            >
              <Download size={20} /> Exporter le Design
            </button>
          </div>
        </div>
      </aside>

      {/* ZONE DE DESIGN (PREVIEW) */}
      <main className="flex-1 relative flex items-center justify-center bg-[#050505] overflow-hidden">
        {/* Grille de fond subtile */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        <div
          ref={stageRef}
          className="relative w-[600px] h-[600px] flex items-center justify-center"
        >
          {/* LE BLOB */}
          <motion.div
            style={{
              zIndex: imageLayer === "above" ? 1 : 10,
              rotate: params.rotate,
              filter: `blur(${params.blur}px)`,
            }}
            animate={{
              d: generateComplexBlob(
                500,
                params.growth,
                params.edges,
                params.seed,
                params.smoothness,
              ),
            }}
            className="w-full h-full flex items-center justify-center"
          >
            <svg
              viewBox="0 0 500 500"
              className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <defs>
                <linearGradient
                  id="blobGrad"
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
                    500,
                    params.growth,
                    params.edges,
                    params.seed,
                    params.smoothness,
                  ),
                }}
                transition={{ type: "spring", damping: 12, stiffness: 60 }}
                fill="url(#blobGrad)"
                fillOpacity={params.opacity}
              />
            </svg>
          </motion.div>

          {/* L'IMAGE */}
          <AnimatePresence>
            {image && (
              <motion.div
                drag
                dragMomentum={false}
                className="absolute"
                style={{ zIndex: imageLayer === "above" ? 20 : 5 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="relative group cursor-grab active:cursor-grabbing">
                  <div className="absolute -inset-2 bg-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img
                    src={image}
                    alt="Art"
                    className="max-w-[300px] rounded-2xl shadow-2xl pointer-events-none"
                  />
                  <div className="absolute top-2 right-2 p-1 bg-black/50 backdrop-blur-md rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Move size={14} className="text-white/70" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Aide visuelle */}
        <div className="absolute bottom-10 flex gap-6 text-[10px] uppercase tracking-[0.3em] text-white/20">
          <span>500x500 Canvas</span>
          <span>•</span>
          <span>Bezier Quadratic Flow</span>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
        input[type="range"] { -webkit-appearance: none; height: 4px; background: #222; border-radius: 5px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; background: #6366f1; border-radius: 50%; cursor: pointer; border: 2px solid #050505; }
      `}</style>
    </div>
  );
};

// Petit composant utilitaire pour les sliders
const ControlSlider = ({ label, min, max, step = 1, value, onChange }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-[11px] font-semibold text-slate-500 uppercase">
        {label}
      </span>
      <span className="text-[11px] font-mono text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded">
        {value}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full"
    />
  </div>
);

export default FluxyV2;
