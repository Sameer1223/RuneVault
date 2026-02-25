import React, { useState } from "react";

import { ArrowRight } from "lucide-react";

interface HoloProps {
  name: string;
  texture?: string;
  className?: string;
}

export default function Holo({
  name,
  texture = "/textures/holofoil.png",
  className = "",
}: HoloProps) {
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPos({ x: 50, y: 50 })}
      className={`
      relative group cursor-pointer overflow-hidden rounded-xl
      flex items-center justify-center
      bg-black text-white
      border border-zinc-600/40
      bg-gradient-to-br from-zinc-800 to-black
      transition-all duration-300
      hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(0,255,255,0.3)] hover:border-stone-400
      ${className}
    `}
    >
      {/* 🪞 Texture layer (faint until hover) */}
      <div
        className="
          absolute inset-0 bg-cover bg-center bg-no-repeat
          opacity-10 group-hover:opacity-25
          transition-opacity duration-500
        "
        style={{
          backgroundImage: `url('${texture}')`,
          mixBlendMode: "lighten",
          backgroundPosition: "center 30%",
          backgroundSize: "200% 200%",
        }}
      />

      {/* Rainbow highlight — localized & soft */}
      <div
        className="
          absolute inset-0 pointer-events-none
          opacity-0 group-hover:opacity-90
          transition-opacity duration-500 ease-out
          mix-blend-overlay
        "
        style={{
          backgroundImage: `
            radial-gradient(
              circle at ${pos.x}% ${pos.y}%,
              rgba(255,255,255,0.15) 0%,
              rgba(255,255,255,0.05) 20%,
              transparent 45%
            ),
            conic-gradient(
              from 0deg,
              #00ffff,
              #3b82f6,
              #a855f7,
              #ec4899,
              #facc15,
              #00ffff
            )
          `,
          backgroundSize: "200% 200%",
          backgroundPosition: "center",
          filter: "brightness(1.4) contrast(1.1) saturate(0.8)",
        }}
      />

      {/* ⚫ Depth/lighting layer */}
      <div
        className="
          absolute inset-0 pointer-events-none
          opacity-0 group-hover:opacity-100
          transition-opacity duration-500 ease-out
          mix-blend-multiply
        "
        style={{
          background: `
            radial-gradient(
              circle at ${pos.x}% ${pos.y}%,
              rgba(255,255,255,0.1) 0%,
              rgba(0,0,0,0.85) 60%
            )
          `,
          filter: "brightness(1.4)",
        }}
      />

      {/* ✍️ Centered name */}
      <div className="relative z-10 flex h-full w-full items-center justify-center select-none">
        <span className="flex items-center gap-2 font-raleway text-2xl font-normal tracking-wide">
          {name}
          <ArrowRight className="size-5 opacity-70" />
        </span>
      </div>

    </div>
  );
}
