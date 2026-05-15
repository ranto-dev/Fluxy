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
  MousePointer2,
} from "lucide-react";
import { domToPng } from "modern-screenshot";

// --- ALGORITHME DE GÉNÉRATION DU BLOB ---
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
    const noise = Math.sin(angle * (seed * 0.5)) * growth;
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

const Fluxy = () => {
  // --- ÉTATS ---
  const [params, setParams] = useState({
    growth: 60,
    edges: 6,
    seed: Math.random() * 100,
    smoothness: 3.5,
    rotate: 0,
    opacity: 1,
    blur: 0,
  });

  const [colors, setColors] = useState({
    primary: "#6366f1",
    secondary: "#a855f7",
  });
  const [image, setImage] = useState<string | null>(null);
  const [imageLayer, setImageLayer] = useState<"above" | "below">("above");

  // Référence unique sur la zone transparente à capturer
  const stageRef = useRef<HTMLDivElement>(null);

  // --- ACTIONS ---
  const randomize = () => {
    setParams((p) => ({
      ...p,
      seed: Math.random() * 100,
      rotate: Math.random() * 360,
      growth: 40 + Math.random() * 60,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (en) => setImage(en.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // --- LOGIQUE D'EXPORTATION AVEC FIX OKLCH & TRANSPARENCE ---
  const exportArt = async () => {
    if (!stageRef.current) return;

    try {
      // domToPng capture fidèlement le DOM, gère l'oklch et préserve la transparence
      const imgData = await domToPng(stageRef.current, {
        quality: 1,
        scale: 3, // Rendu ultra net (Haute Définition pour intégration UI)
      });

      // Déclenchement du téléchargement du fichier PNG
      const link = document.createElement("a");
      link.download = `fluxy-art-${Math.floor(Date.now() / 1000)}.png`;
      link.href = imgData;
      link.click();
    } catch (error) {
      console.error("Erreur lors de l'exportation du PNG :", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* --- PANNEAU LATÉRAL (CONTROLES) --- */}
      <aside className="w-full lg:w-96 bg-[#0c0c0c] border-r border-white/5 p-8 overflow-y-auto z-20 shadow-2xl">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="text-white" size={20} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
            Fluxy
          </h1>
        </div>

        <div className="space-y-8">
          {/* Section Géométrie */}
          <section className="space-y-5">
            <header className="flex items-center gap-2 text-indigo-400 mb-2">
              <Wand2 size={14} />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Géométrie du Blob
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
              max={150}
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

          {/* Section Style */}
          <section className="space-y-5">
            <header className="flex items-center gap-2 text-purple-400 mb-2">
              <Palette size={14} />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Couleurs & Effets
              </h2>
            </header>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="color"
                value={colors.primary}
                onChange={(e) =>
                  setColors({ ...colors, primary: e.target.value })
                }
                className="w-full h-10 rounded-lg bg-white/5 border border-white/10 cursor-pointer"
              />
              <input
                type="color"
                value={colors.secondary}
                onChange={(e) =>
                  setColors({ ...colors, secondary: e.target.value })
                }
                className="w-full h-10 rounded-lg bg-white/5 border border-white/10 cursor-pointer"
              />
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

          {/* Actions de l'application */}
          <div className="pt-6 border-t border-white/5 flex flex-col gap-3">
            <button
              onClick={randomize}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 font-medium"
            >
              <RefreshCw size={18} /> Aléatoire
            </button>

            <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer group">
              <Upload size={18} className="group-hover:text-indigo-400" />
              <span className="text-sm">Importer Image</span>
              <input
                type="file"
                className="hidden"
                onChange={handleImageUpload}
                accept="image/*"
              />
            </label>

            <button
              onClick={() =>
                setImageLayer(imageLayer === "above" ? "below" : "above")
              }
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 transition-all font-bold text-xs uppercase"
            >
              <Layers size={16} /> Image en :{" "}
              {imageLayer === "above" ? "Premier plan" : "Arrière-plan"}
            </button>

            <button
              onClick={exportArt}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-xl shadow-indigo-600/20 font-bold mt-4"
            >
              <Download size={20} /> Exporter PNG Transparent
            </button>
          </div>
        </div>
      </aside>

      {/* --- COMPOSANT DE PRÉVISUALISATION (CANVAS) --- */}
      <main className="flex-1 relative flex items-center justify-center p-12">
        {/* Grille décorative d'arrière-plan (exclue de la capture d'export) */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* ZONE DE CAPTURE STRICTEMENT TRANSPARENTE */}
        <div
          ref={stageRef}
          className="relative w-[500px] h-[500px] flex items-center justify-center bg-transparent"
        >
          {/* LE BLOB SVG */}
          <motion.div
            style={{
              zIndex: imageLayer === "above" ? 1 : 10,
              rotate: params.rotate,
              filter: `blur(${params.blur}px)`,
            }}
            className="absolute inset-0 w-full h-full"
          >
            <svg viewBox="0 0 500 500" className="w-full h-full">
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
                    500,
                    params.growth,
                    params.edges,
                    params.seed,
                    params.smoothness,
                  ),
                }}
                transition={{ type: "spring", damping: 15, stiffness: 50 }}
                fill="url(#fluxyGrad)"
                fillOpacity={params.opacity}
              />
            </svg>
          </motion.div>

          {/* L'IMAGE MOBILE (SUPPORTE LE GLISSER-DÉPOSER) */}
          <AnimatePresence>
            {image && (
              <motion.div
                drag
                dragMomentum={false}
                className="absolute cursor-grab active:cursor-grabbing"
                style={{ zIndex: imageLayer === "above" ? 20 : 5 }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="relative">
                  <img
                    src={image}
                    alt="Art overlay"
                    className="max-w-[260px] rounded-2xl shadow-2xl pointer-events-none border border-white/10"
                    draggable="false"
                  />
                  <div className="absolute -top-2 -right-2 bg-indigo-600 p-1.5 rounded-lg shadow-lg pointer-events-none">
                    <MousePointer2 size={12} className="text-white" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pied de page informatif de l'espace de travail */}
        <div className="absolute bottom-10 text-white/10 text-[10px] tracking-[0.4em] uppercase font-bold flex items-center gap-4 select-none">
          <span>Fluxy Studio</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
          <span>Modern-Screenshot Active</span>
        </div>
      </main>

      {/* STYLES PERSONNALISÉS DES SLIDERS DE COMMANDE */}
      <style>{`
        input[type="range"] { -webkit-appearance: none; background: #1a1a1a; height: 4px; border-radius: 2px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; height: 14px; width: 14px; border-radius: 50%; background: #6366f1; cursor: pointer; border: 2px solid #0c0c0c; transition: all 0.2s; }
        input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.2); box-shadow: 0 0 10px rgba(99, 102, 241, 0.4); }
      `}</style>
    </div>
  );
};

// --- COMPOSANT ENCAPSULÉ DES SLIDERS ---
const Slider = ({ label, min, max, step = 1, value, onChange }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center select-none">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
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

export default Fluxy;
