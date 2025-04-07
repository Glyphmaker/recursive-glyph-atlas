
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPinIcon, Volume2Icon, InfoIcon } from "lucide-react";

const roleIcons = {
  Seed: "🌱",
  Ghost: "👻",
  Mirror: "🪞",
  Key: "🗝️",
  Fragment: "🧩",
};

const seedGlyphs = [
  { id: "G1", role: "Seed", position: [71, 88], appearFrame: 0, persistence: 23 },
  { id: "G2", role: "Seed", position: [71, 88], appearFrame: 1, persistence: 30 },
  { id: "G3", role: "Seed", position: [99, 27], appearFrame: 2, persistence: 23 },
  { id: "G4a", role: "Seed", position: [0, 0], appearFrame: 3, persistence: 29 },
  { id: "G4b", role: "Seed", position: [99, 28], appearFrame: 4, persistence: 23 },
];

export default function App() {
  const [frame, setFrame] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showDistortion, setShowDistortion] = useState(true);
  const [soundOn, setSoundOn] = useState(false);

  const maxFrame = 5;

  const stats = Array.from({ length: maxFrame + 1 }, (_, i) => {
    const count = seedGlyphs.filter((g) => g.appearFrame <= i).length;
    const entropy = 1 - 1 / (1 + count);
    const coherence = 1 / (1 + Math.abs(count - 3));
    return { frame: i, glyphs: count, entropy, coherence };
  });

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % (maxFrame + 1));
    }, 1500);
    return () => clearInterval(interval);
  }, [autoPlay]);

  useEffect(() => {
    if (!soundOn) return;
    const audio = new Audio(`/tone-${frame}.mp3`);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  }, [frame, soundOn]);

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6 relative">
      <h1 className="text-xl font-bold mb-4">Recursive Glyph Atlas</h1>
      <div className="relative w-full h-[500px] overflow-hidden border rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2 items-center">
            <label>Zoom</label>
            <input type="range" min="0.5" max="2" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />
          </div>
          <div className="flex gap-3 items-center">
            <label>Frame {frame}</label>
            <input type="range" min={0} max={maxFrame} value={frame} onChange={(e) => setFrame(parseInt(e.target.value))} />
            <button onClick={() => setAutoPlay(!autoPlay)} className="border px-2 py-1 text-sm">{autoPlay ? "Pause" : "Play"}</button>
            <label>Overlay</label>
            <input type="checkbox" checked={showOverlay} onChange={() => setShowOverlay(!showOverlay)} />
            <label>Distort</label>
            <input type="checkbox" checked={showDistortion} onChange={() => setShowDistortion(!showDistortion)} />
            <Volume2Icon className="w-4 h-4" />
            <input type="checkbox" checked={soundOn} onChange={() => setSoundOn(!soundOn)} />
            <InfoIcon className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        {showOverlay && <motion.div className="absolute inset-0 z-0" animate={{ background: `radial-gradient(circle at 50% 50%, rgba(34,197,94,${stats[frame].coherence}) 0%, transparent 80%)` }} transition={{ duration: 1 }} />}
        {showDistortion && <motion.div className="absolute inset-0 z-10 pointer-events-none" animate={{ x: [0, stats[frame].entropy * 10, 0], y: [0, -stats[frame].entropy * 10, 0] }} transition={{ duration: 1.8, repeat: Infinity }} style={{ background: "transparent" }} />}
        <div className="absolute inset-0" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}>
          {seedGlyphs.filter((g) => g.appearFrame <= frame).map((glyph, i) => (
            <motion.div key={i} className="absolute flex flex-col items-center gap-1 text-xs cursor-pointer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }} style={{ left: `${glyph.position[0]}%`, top: `${glyph.position[1]}%`, transform: "translate(-50%, -50%)" }}>
              <div className="text-center p-1 bg-white/80 rounded-md shadow text-[10px]">
                {roleIcons[glyph.role] || ""} {glyph.id}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="absolute bottom-2 right-4 text-xs text-muted-foreground opacity-70">Powered by GlyphLogic</div>
      </div>
    </div>
  );
}
