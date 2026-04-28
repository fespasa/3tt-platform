"use client";

import { useEffect, useRef } from "react";

export default function HeroBackground() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Animate court lines on mount
    const lines = svgRef.current?.querySelectorAll(".court-line");
    lines?.forEach((line, i) => {
      setTimeout(() => line.classList.add("animate"), 400 + i * 200);
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Mesh gradient blobs */}
      <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-teal/[0.04] blur-[120px] animate-glow-pulse" />
      <div className="absolute top-1/2 -left-60 w-[500px] h-[500px] rounded-full bg-teal/[0.03] blur-[100px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] rounded-full bg-teal/[0.03] blur-[100px] animate-glow-pulse" style={{ animationDelay: "3s" }} />

      {/* Volleyball court lines SVG */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full opacity-100"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Court outline */}
        <rect x="200" y="150" width="1040" height="600" className="court-line" rx="4" />

        {/* Center line */}
        <line x1="720" y1="150" x2="720" y2="750" className="court-line" />

        {/* Net (dashed) */}
        <line
          x1="720" y1="120" x2="720" y2="780"
          stroke="rgba(0,168,168,0.12)"
          strokeWidth="2"
          strokeDasharray="8 6"
          fill="none"
          style={{ opacity: 0 }}
          className="court-line"
        />

        {/* Attack lines (3m) */}
        <line x1="520" y1="150" x2="520" y2="750" className="court-line" />
        <line x1="920" y1="150" x2="920" y2="750" className="court-line" />

        {/* Diagonal accent lines */}
        <line x1="0" y1="0" x2="400" y2="400" stroke="rgba(0,168,168,0.03)" strokeWidth="1" />
        <line x1="1440" y1="0" x2="1040" y2="400" stroke="rgba(0,168,168,0.03)" strokeWidth="1" />
        <line x1="0" y1="900" x2="600" y2="300" stroke="rgba(0,168,168,0.02)" strokeWidth="1" />
        <line x1="1440" y1="900" x2="840" y2="300" stroke="rgba(0,168,168,0.02)" strokeWidth="1" />
      </svg>

      {/* Floating geometric shapes */}
      <div className="absolute top-[15%] left-[8%] w-3 h-3 border border-teal/20 rotate-45 animate-float" style={{ animationDelay: "0s" }} />
      <div className="absolute top-[25%] right-[12%] w-2 h-2 bg-teal/15 rounded-full animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-[60%] left-[15%] w-4 h-4 border border-teal/10 rounded-full animate-float" style={{ animationDelay: "4s" }} />
      <div className="absolute top-[70%] right-[20%] w-2.5 h-2.5 border border-teal/15 rotate-12 animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute top-[40%] left-[75%] w-1.5 h-1.5 bg-teal/20 rounded-full animate-float" style={{ animationDelay: "3s" }} />
      <div className="absolute top-[80%] left-[40%] w-3 h-3 rotate-45 animate-float" style={{ animationDelay: "5s", border: "1px solid var(--border)" }} />

      {/* Volleyball trajectory dots (the 3 touches) */}
      <div className="absolute top-[30%] left-[25%] flex items-center gap-1.5 opacity-0 animate-fade-in" style={{ animationDelay: "1.5s" }}>
        <div className="w-1.5 h-1.5 rounded-full bg-teal/40" />
        <div className="w-8 h-px bg-gradient-to-r from-teal/30 to-transparent" />
      </div>
      <div className="absolute top-[22%] left-[42%] flex items-center gap-1.5 opacity-0 animate-fade-in" style={{ animationDelay: "2s" }}>
        <div className="w-1.5 h-1.5 rounded-full bg-teal/50" />
        <div className="w-8 h-px bg-gradient-to-r from-teal/40 to-transparent" />
      </div>
      <div className="absolute top-[35%] left-[58%] flex items-center gap-1.5 opacity-0 animate-fade-in" style={{ animationDelay: "2.5s" }}>
        <div className="w-2 h-2 rounded-full bg-teal/60 shadow-[0_0_12px_rgba(0,168,168,0.4)]" />
      </div>

      {/* Grid dots pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle, var(--text-primary) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />
    </div>
  );
}
