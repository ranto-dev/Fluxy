import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  RefreshCw,
  Upload,
  Layers,
  Move,
  Sliders,
  Image as ImageIcon,
} from "lucide-react";
import html2canvas from "html2canvas";

// Fonction pour générer le chemin du Blob
const createBlobPath = (
  size: number,
  growth: number,
  edges: number,
  seed: number,
) => {
  const center = size / 2;
  const coords: { x: number; y: number }[] = [];
  const step = (Math.PI * 2) / edges;

  for (let i = 0; i < edges; i++) {
    const angle = i * step;
    const offset = Math.cos(angle * seed) * growth;
    const radius = size / 3 + offset;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    coords.push({ x, y });
  }

  // Création du chemin fluide (Bézier)
  return (
    coords.reduce((path, p, i, a) => {
      const next = a[(i + 1) % a.length];
      const control = { x: (p.x + next.x) / 2, y: (p.y + next.y) / 2 };
      return i === 0
        ? `M ${p.x} ${p.y} Q ${p.x} ${p.y} ${control.x} ${control.y}`
        : `${path} Q ${p.x} ${p.y} ${control.x} ${control.y}`;
    }, "") + " Z"
  );
};

const App = () => {
  const [blobParams, setBlobParams] = useState({
    size: 400,
    growth: 40,
    edges: 6,
    seed: 1,
  });
  const [blobColor, setBlobColor] = useState("#6366f1");
  const [image, setImage] = useState<string | null>(null);
  const [imagePos, setImagePos] = useState({ x: 0, y: 0 });
  const [imageLayer, setImageLayer] = useState<"above" | "below">("above");
  const [isDragging, setIsDragging] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);

  const generateNew = () =>
    setBlobParams((prev) => ({ ...prev, seed: Math.random() * 10 }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (en) => setImage(en.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const downloadPNG = async () => {
    if (stageRef.current) {
      const canvas = await html2canvas(stageRef.current, {
        backgroundColor: null,
      });
      const link = document.createElement("a");
      link.download = "blob-illustration.png";
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 flex flex-col md:flex-row overflow-hidden">
      {/* SIDEBAR CONTROLS */}
      <aside className="w-full md:w-80 bg-white/[0.03] border-r border-white/10 p-6 flex flex-col gap-8 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <ImageIcon size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">App</h1>
        </div>

        {/* Blob Settings */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-400">
              Paramètres du Blob
            </label>
            <button
              onClick={generateNew}
              className="p-2 hover:bg-white/5 rounded-full text-indigo-400 transition-colors"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span>Courbe</span>
                <span>{blobParams.growth}</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={blobParams.growth}
                onChange={(e) =>
                  setBlobParams({
                    ...blobParams,
                    growth: Number(e.target.value),
                  })
                }
                className="w-full accent-indigo-500 bg-white/10 rounded-lg appearance-none h-1"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span>Complexité</span>
                <span>{blobParams.edges}</span>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                value={blobParams.edges}
                onChange={(e) =>
                  setBlobParams({
                    ...blobParams,
                    edges: Number(e.target.value),
                  })
                }
                className="w-full accent-indigo-500 bg-white/10 rounded-lg appearance-none h-1"
              />
            </div>
          </div>
        </section>

        {/* Color & Layer */}
        <section className="space-y-4">
          <label className="text-sm font-medium text-slate-400">
            Style & Calques
          </label>
          <div className="flex gap-4">
            <input
              type="color"
              value={blobColor}
              onChange={(e) => setBlobColor(e.target.value)}
              className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer"
            />
            <button
              onClick={() =>
                setImageLayer(imageLayer === "above" ? "below" : "above")
              }
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border transition-all ${imageLayer === "above" ? "border-indigo-500 bg-indigo-500/10 text-indigo-400" : "border-white/10 text-slate-400"}`}
            >
              <Layers size={18} />{" "}
              <span className="text-xs uppercase font-bold">
                Image {imageLayer === "above" ? "Dessus" : "Dessous"}
              </span>
            </button>
          </div>
        </section>

        {/* Image Upload */}
        <section className="mt-auto pt-6 border-t border-white/10">
          <label className="group cursor-pointer flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-white/10 rounded-2xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all">
            <Upload className="text-slate-500 group-hover:text-indigo-400" />
            <span className="text-xs font-medium text-slate-400">
              Importer une image
            </span>
            <input
              type="file"
              className="hidden"
              onChange={handleImageUpload}
              accept="image/*"
            />
          </label>
        </section>

        <button
          onClick={downloadPNG}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
        >
          <Download size={20} /> Exporter en PNG
        </button>
      </aside>

      {/* CANVAS AREA */}
      <main className="relative flex-1 flex items-center justify-center p-4 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px]">
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/20">
          <Move size={14} />
          <span className="text-[10px] uppercase tracking-[0.2em]">
            Glissez l'image pour la placer
          </span>
        </div>

        <div
          ref={stageRef}
          className="relative w-[500px] h-[500px] flex items-center justify-center"
        >
          {/* LE BLOB SVG */}
          <svg
            viewBox="0 0 400 400"
            className="w-full h-full drop-shadow-2xl"
            style={{ zIndex: imageLayer === "above" ? 1 : 10 }}
          >
            <motion.path
              animate={{
                d: createBlobPath(
                  400,
                  blobParams.growth,
                  blobParams.edges,
                  blobParams.seed,
                ),
              }}
              transition={{ type: "spring", damping: 10, stiffness: 50 }}
              fill={blobColor}
            />
          </svg>

          {/* L'IMAGE IMPORTÉE */}
          <AnimatePresence>
            {image && (
              <motion.div
                drag
                dragMomentum={false}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                style={{
                  zIndex: imageLayer === "above" ? 20 : 5,
                  position: "absolute",
                  cursor: isDragging ? "grabbing" : "grab",
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <img
                  src={image}
                  alt="overlay"
                  className="max-w-[250px] pointer-events-none rounded-lg shadow-2xl"
                  draggable="false"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: 3px solid #0a0a0a;
        }
      `}</style>
    </div>
  );
};

export default App;
