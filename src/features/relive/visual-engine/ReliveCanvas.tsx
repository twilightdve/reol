import React, { useEffect, useRef, useState } from "react";
import type {
  AudioReactiveFrame,
  MemoryTags,
  PerformanceMode,
  VenuePreset,
} from "../types/relive";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  hue: number;
}

const budgets: Record<PerformanceMode, number> = {
  battery_saver: 42,
  standard: 86,
  high_visual: 148,
};

const emptyFrame: AudioReactiveFrame = {
  lowEnergy: 0,
  midEnergy: 0,
  highEnergy: 0,
  rms: 0,
  kickLike: 0,
  snareLike: 0,
  hatLike: 0,
  bassFlow: 0,
  vocalBloom: 0,
};

const defaultMemoryTags: MemoryTags = {
  heat: 0.55,
  pressure: 0.55,
  pain: 0.35,
  release: 0.5,
  distance: 0.45,
  aftertaste: 0.72,
};

const TAG_LABELS: Record<keyof MemoryTags, string> = {
  heat: "熱量",
  pressure: "圧",
  pain: "痛覚",
  release: "解放",
  distance: "距離",
  aftertaste: "余韻",
};

const TAG_DESCRIPTIONS: Record<keyof MemoryTags, string> = {
  heat: "粒子密度とコアの明るさ。",
  pressure: "低域に対するコア径と圧の効き。",
  pain: "高域反応で走る亀裂線の本数と太さ。",
  release: "パーティクル寿命の延長。長く尾を引く。",
  distance: "視点距離。大きいほどコアが遠く・小さく感じる。",
  aftertaste: "余韻の長さ。明滅の減衰が遅くなる。",
};

interface ReliveCanvasProps {
  readFrame: () => AudioReactiveFrame;
  performanceMode: PerformanceMode;
  intensity: number;
  venue?: VenuePreset;
  memoryTags?: MemoryTags;
  onMemoryTagsChange?: (tags: MemoryTags) => void;
  onPerformanceModeChange?: (mode: PerformanceMode) => void;
}

const PERFORMANCE_MODES: PerformanceMode[] = ["battery_saver", "standard", "high_visual"];
const PERFORMANCE_LABELS: Record<PerformanceMode, string> = {
  battery_saver: "軽量",
  standard: "標準",
  high_visual: "濃い",
};

const resizeCanvas = (canvas: HTMLCanvasElement) => {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor(rect.width * dpr));
  const height = Math.max(1, Math.floor(rect.height * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  return { width, height, dpr };
};

const ReliveCanvas: React.FC<ReliveCanvasProps> = ({
  readFrame,
  performanceMode,
  intensity,
  venue,
  memoryTags,
  onMemoryTagsChange,
  onPerformanceModeChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tags, setTags] = useState<MemoryTags>(memoryTags ?? defaultMemoryTags);
  const [panelOpen, setPanelOpen] = useState(false);
  const tagsRef = useRef<MemoryTags>(tags);

  // 外部 (公演記憶プリセット切替など) からの memoryTags 変更を反映。
  useEffect(() => {
    if (memoryTags) {
      setTags(memoryTags);
    }
  }, [memoryTags]);

  // 描画ループから常に最新の tags を参照できるよう ref に同期。
  useEffect(() => {
    tagsRef.current = tags;
  }, [tags]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") {
      return undefined;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return undefined;
    }

    let raf = 0;
    let afterglow = 0;
    const particles: Particle[] = [];

    const spawnParticles = (frame: AudioReactiveFrame, width: number, height: number) => {
      const maxParticles = budgets[performanceMode];
      // burst 倍率を 4 → 7 に上げ、intensity / hatLike の差を体感しやすくする。
      const burst = Math.floor((frame.hatLike + frame.snareLike * 0.85) * intensity * 7);

      for (let i = 0; i < burst && particles.length < maxParticles; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.4 + Math.random() * (2.4 + frame.highEnergy * 5);
        particles.push({
          x: width / 2 + (Math.random() - 0.5) * width * 0.16,
          y: height / 2 + (Math.random() - 0.5) * height * 0.16,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.4 + Math.random() * 0.8,
          hue: 18 + Math.random() * 32,
        });
      }
    };

    const draw = () => {
      const { width, height } = resizeCanvas(canvas);
      const frame = readFrame() || emptyFrame;
      const visualBias = venue?.visualBias;
      const currentTags = tagsRef.current;
      const heat = currentTags.heat;
      const pressure = currentTags.pressure;
      const pain = currentTags.pain;
      const release = currentTags.release;
      const distance = currentTags.distance;
      const aftertaste = currentTags.aftertaste;
      // afterglow の余韻: aftertaste と release の両方で大幅に伸ばし、差を体感できるレンジへ。
      // 0 → 0.78 (即減衰), 1 → 0.997 (ほぼ消えない) の極端な振れ幅。
      const afterglowDecay = Math.min(
        0.997,
        0.78 + (visualBias?.afterglowDecay ?? 0.82) * 0.05 + aftertaste * 0.15 + release * 0.06
      );
      // 各 bias の振れ幅を大幅拡張 (0 で素朴・1 で過剰なほどはっきりした差)。
      const particleBias =
        (visualBias?.particleDensity ?? 0.7) * (0.2 + heat * 2.2);
      const fractureBias =
        (visualBias?.fractureBias ?? 0.6) * (0.2 + pain * 2.4);
      const pressureBias =
        (visualBias?.pressureBias ?? 0.7) * (0.2 + pressure * 2.4);
      // distance: 1 に近いほどコアが遠く小さく感じられる。
      const distanceShrink = 1 - distance * 0.55;
      // release: パーティクル寿命の延長率。0 で短命、1 で長く尾を引く。
      const particleLifeBoost = 0.5 + release * 1.6;
      afterglow = Math.max(afterglow * afterglowDecay, frame.rms * intensity);

      ctx.fillStyle = "rgba(3, 4, 7, 0.22)";
      ctx.fillRect(0, 0, width, height);

      // 中心は常に画面中央。ポジションマップとは連動しない。
      const centerX = width / 2;
      // distance タグは 0..1。中心を保ちつつ、極端値で僅かに上下にズラす (±3% 程度)。
      const centerY = height * (0.5 + (distance - 0.5) * 0.06);
      const coreRadius = Math.max(
        18,
        Math.min(width, height) * (0.06 + frame.lowEnergy * 0.28 * pressureBias) * distanceShrink
      );
      const core = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius * 4);
      core.addColorStop(0, `rgba(255, 244, 206, ${0.38 + frame.kickLike * 0.44})`);
      core.addColorStop(0.22, `rgba(217, 55, 51, ${0.18 + frame.vocalBloom * 0.3})`);
      core.addColorStop(0.58, `rgba(30, 95, 138, ${0.12 + afterglow * 0.18})`);
      core.addColorStop(1, "rgba(3, 4, 7, 0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.strokeStyle = `rgba(255, 236, 178, ${0.08 + frame.highEnergy * 0.55})`;
      ctx.lineWidth = 1 + frame.hatLike * 3.5 * fractureBias;
      const cracks = 3 + Math.floor(frame.highEnergy * 14 * fractureBias);
      for (let i = 0; i < cracks; i += 1) {
        const angle = (Math.PI * 2 * i) / cracks + frame.midEnergy * 0.55;
        const length = coreRadius * (1.2 + Math.random() * 3.5 * frame.hatLike);
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * coreRadius * 0.72, Math.sin(angle) * coreRadius * 0.72);
        ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
        ctx.stroke();
      }
      ctx.restore();

      spawnParticles(
        { ...frame, hatLike: Math.min(1, frame.hatLike * particleBias) },
        width,
        height
      );
      // release が大きいほど寿命の減りが緩やかになり、画面に長く残る。
      const lifeDecay = (0.022 - release * 0.018) + frame.rms * 0.01;
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.life -= lifeDecay;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = `hsla(${p.hue}, 92%, 65%, ${Math.max(0, p.life)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, (1.1 + p.life * 2.8) * particleLifeBoost * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = window.requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [intensity, performanceMode, readFrame, venue]);

  const updateTag = (key: keyof MemoryTags, value: number) => {
    const next = { ...tagsRef.current, [key]: value };
    setTags(next);
    onMemoryTagsChange?.(next);
  };

  return (
    <div className="relive-canvas-wrap">
      <canvas ref={canvasRef} className="relive-canvas" aria-label="ライブビジュアル" />
      <button
        type="button"
        className="relive-canvas-toggle"
        aria-expanded={panelOpen}
        aria-controls="relive-canvas-tags"
        onClick={() => setPanelOpen((open) => !open)}
      >
        {panelOpen ? "× ビジュアル調整を閉じる" : "✦ ビジュアル調整"}
      </button>
      {panelOpen && (
        <div id="relive-canvas-tags" className="relive-canvas-tags" role="group" aria-label="ビジュアル調整">
          {onPerformanceModeChange && (
            <label className="relive-canvas-tag" title="パーティクル上限と表現の濃さ。軽量→標準→濃い。">
              <span className="relive-canvas-tag-label">
                <span>濃さ</span>
                <span className="relive-canvas-tag-value">{PERFORMANCE_LABELS[performanceMode]}</span>
              </span>
              <input
                type="range"
                min={0}
                max={2}
                step={1}
                value={PERFORMANCE_MODES.indexOf(performanceMode)}
                onChange={(event) => {
                  const next = PERFORMANCE_MODES[Number(event.target.value)];
                  if (next) {
                    onPerformanceModeChange(next);
                  }
                }}
                aria-label={`描画濃度 (現在: ${PERFORMANCE_LABELS[performanceMode]})`}
              />
            </label>
          )}
          {(Object.keys(tags) as Array<keyof MemoryTags>).map((key) => (
            <label key={key} className="relive-canvas-tag" title={TAG_DESCRIPTIONS[key]}>
              <span className="relive-canvas-tag-label">
                <span>{TAG_LABELS[key]}</span>
                <span className="relive-canvas-tag-value">{tags[key].toFixed(2)}</span>
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={tags[key]}
                onChange={(event) => updateTag(key, Number(event.target.value))}
                aria-label={`${TAG_LABELS[key]} (${key})`}
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReliveCanvas;
