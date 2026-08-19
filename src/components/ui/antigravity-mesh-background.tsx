"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

export interface AntigravityMeshProps {
  /** Total number of floating nodes in the field */
  particleCount?: number;
  /** Max distance in pixels for drawing interconnection lines */
  connectionDistance?: number;
  /** Radius of the zero-gravity cursor repulsion field */
  repulsionRadius?: number;
  /** Strength of the cursor repulsion force */
  repulsionStrength?: number;
  /** Elastic spring return stiffness (0.01 - 0.1) */
  springK?: number;
  /** Velocity damping / friction (0.8 - 0.98) */
  damping?: number;
  /** Base ambient floating speed multiplier */
  ambientSpeed?: number;
  /** Primary node color in HEX (e.g. #3b82f6 or #6366f1) */
  nodeColor?: string;
  /** Interconnecting line color in HEX */
  lineColor?: string;
  /** Maximum opacity of connection lines (0.0 - 1.0) */
  lineOpacity?: number;
  /** Success accent glow color for ripple shockwave */
  successColor?: string;
  /** Trigger boolean to initiate the Antigravity Auth Success Shockwave */
  isSuccess?: boolean;
  /** Additional container CSS classes */
  className?: string;
}

export interface AntigravityMeshRef {
  /** Imperative trigger for the Auth Success shockwave ripple */
  triggerSuccess: (originX?: number, originY?: number) => void;
}

interface NodePoint {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
  phaseSpeed: number;
  orbitAmpX: number;
  orbitAmpY: number;
  glow: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  strength: number;
  alpha: number;
  color: string;
}

/**
 * AntigravityMeshBackground
 *
 * High-performance interactive reactive canvas mesh with zero-gravity repulsion physics,
 * spring elasticity, and energetic Auth Success shockwave micro-interactions.
 */
export const AntigravityMeshBackground = forwardRef<AntigravityMeshRef, AntigravityMeshProps>(
  (
    {
      particleCount = 85,
      connectionDistance = 140,
      repulsionRadius = 180,
      repulsionStrength = 14,
      springK = 0.04,
      damping = 0.88,
      ambientSpeed = 0.6,
      nodeColor = "#6366f1", // Sleek indigo / cyber blue
      lineColor = "#818cf8",
      lineOpacity = 0.22,
      successColor = "#10b981", // Luminous emerald / cyan
      isSuccess = false,
      className = "",
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const shockwavesRef = useRef<Shockwave[]>([]);
    const mouseRef = useRef<{
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      active: boolean;
      radius: number;
    }>({
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
      radius: repulsionRadius,
    });

    const triggerShockwave = (x?: number, y?: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const originX = x ?? canvas.width / (2 * (window.devicePixelRatio || 1));
      const originY = y ?? canvas.height / (2 * (window.devicePixelRatio || 1));
      const maxDim = Math.max(canvas.width, canvas.height);

      shockwavesRef.current.push({
        x: originX,
        y: originY,
        radius: 0,
        maxRadius: maxDim * 0.9,
        speed: 16,
        strength: 28,
        alpha: 1.0,
        color: successColor,
      });
    };

    useImperativeHandle(ref, () => ({
      triggerSuccess: (originX?: number, originY?: number) => {
        triggerShockwave(originX, originY);
      },
    }));

    // Trigger shockwave when isSuccess prop changes to true
    useEffect(() => {
      if (isSuccess) {
        triggerShockwave();
      }
    }, [isSuccess]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;

      let animationFrameId: number;
      let width = 0;
      let height = 0;
      let dpr = 1;
      let nodes: NodePoint[] = [];
      let time = 0;

      // Hex to RGB parser helper
      const hexToRgb = (hex: string) => {
        const cleanHex = hex.replace("#", "");
        if (cleanHex.length === 3) {
          const r = parseInt(cleanHex[0] + cleanHex[0], 16);
          const g = parseInt(cleanHex[1] + cleanHex[1], 16);
          const b = parseInt(cleanHex[2] + cleanHex[2], 16);
          return { r, g, b };
        }
        const num = parseInt(cleanHex, 16);
        return {
          r: (num >> 16) & 255,
          g: (num >> 8) & 255,
          b: num & 255,
        };
      };

      const baseNodeRgb = hexToRgb(nodeColor);
      const baseLineRgb = hexToRgb(lineColor);
      const successRgb = hexToRgb(successColor);

      // Initialize responsive grid of particles
      const initNodes = () => {
        dpr = window.devicePixelRatio || 1;
        width = canvas.parentElement?.clientWidth || window.innerWidth;
        height = canvas.parentElement?.clientHeight || window.innerHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        // Adjust particle density dynamically based on viewport size
        const area = width * height;
        const targetCount = Math.max(30, Math.min(140, Math.floor((area / 18000) * (particleCount / 80))));

        nodes = [];
        for (let i = 0; i < targetCount; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          nodes.push({
            x,
            y,
            originX: x,
            originY: y,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: 1.6 + Math.random() * 1.8,
            phase: Math.random() * Math.PI * 2,
            phaseSpeed: (0.008 + Math.random() * 0.015) * ambientSpeed,
            orbitAmpX: 18 + Math.random() * 32,
            orbitAmpY: 18 + Math.random() * 32,
            glow: 0,
          });
        }
      };

      initNodes();

      const handleResize = () => {
        initNodes();
      };

      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.targetX = e.clientX - rect.left;
        mouseRef.current.targetY = e.clientY - rect.top;
        mouseRef.current.active = true;
      };

      const handleMouseLeave = () => {
        mouseRef.current.active = false;
        mouseRef.current.targetX = -1000;
        mouseRef.current.targetY = -1000;
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          const rect = canvas.getBoundingClientRect();
          mouseRef.current.targetX = e.touches[0].clientX - rect.left;
          mouseRef.current.targetY = e.touches[0].clientY - rect.top;
          mouseRef.current.active = true;
        }
      };

      window.addEventListener("resize", handleResize);
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      document.addEventListener("mouseleave", handleMouseLeave);
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", handleMouseLeave);

      // Main Animation Loop
      const render = () => {
        time += 1;
        ctx.clearRect(0, 0, width, height);

        // Smooth lerp mouse coordinates
        const mouse = mouseRef.current;
        mouse.x += (mouse.targetX - mouse.x) * 0.12;
        mouse.y += (mouse.targetY - mouse.y) * 0.12;

        // Render Cursor Glow Field
        if (mouse.active && mouse.x > 0 && mouse.y > 0) {
          const cursorGrad = ctx.createRadialGradient(
            mouse.x,
            mouse.y,
            0,
            mouse.x,
            mouse.y,
            repulsionRadius * 1.2
          );
          cursorGrad.addColorStop(
            0,
            `rgba(${baseNodeRgb.r}, ${baseNodeRgb.g}, ${baseNodeRgb.b}, 0.08)`
          );
          cursorGrad.addColorStop(
            0.6,
            `rgba(${baseLineRgb.r}, ${baseLineRgb.g}, ${baseLineRgb.b}, 0.02)`
          );
          cursorGrad.addColorStop(1, "transparent");
          ctx.fillStyle = cursorGrad;
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, repulsionRadius * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Process Shockwaves (Auth Success energetic pulse)
        const shockwaves = shockwavesRef.current;
        for (let sIdx = shockwaves.length - 1; sIdx >= 0; sIdx--) {
          const sw = shockwaves[sIdx];
          sw.radius += sw.speed;
          sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);

          // Draw expanding ethereal energy ripple
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${successRgb.r}, ${successRgb.g}, ${successRgb.b}, ${sw.alpha * 0.7})`;
          ctx.lineWidth = Math.max(1, (1 - sw.radius / sw.maxRadius) * 4);
          ctx.stroke();

          // Shockwave impulse on nodes
          for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            const dx = n.x - sw.x;
            const dy = n.y - sw.y;
            const dist = Math.hypot(dx, dy);
            const waveDelta = Math.abs(dist - sw.radius);

            if (waveDelta < 60) {
              const impulse = (1 - waveDelta / 60) * sw.strength * sw.alpha;
              const angle = Math.atan2(dy, dx);
              n.vx += Math.cos(angle) * impulse * 0.6;
              n.vy += Math.sin(angle) * impulse * 0.6;
              n.glow = Math.min(1.0, n.glow + impulse * 0.1);
            }
          }

          if (sw.alpha <= 0.01 || sw.radius >= sw.maxRadius) {
            shockwaves.splice(sIdx, 1);
          }
        }

        // Update & Render Nodes with Physics
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];

          // 1. Organic harmonic ambient drift
          n.phase += n.phaseSpeed;
          const targetAmbientX = n.originX + Math.sin(n.phase) * n.orbitAmpX;
          const targetAmbientY = n.originY + Math.cos(n.phase * 0.8) * n.orbitAmpY;

          // 2. Zero-Gravity Cursor Repulsion Force
          if (mouse.active) {
            const dx = n.x - mouse.x;
            const dy = n.y - mouse.y;
            const dist = Math.hypot(dx, dy);

            if (dist < repulsionRadius && dist > 0.1) {
              const normalizedDist = dist / repulsionRadius;
              // Smooth inverse falloff curve
              const force = (1 - normalizedDist) * repulsionStrength;
              const angle = Math.atan2(dy, dx);

              // Tangential zero-g micro-swirl
              const tangentAngle = angle + Math.PI * 0.25;

              n.vx += Math.cos(angle) * force * 0.65 + Math.cos(tangentAngle) * force * 0.2;
              n.vy += Math.sin(angle) * force * 0.65 + Math.sin(tangentAngle) * force * 0.2;
              n.glow = Math.min(1.0, n.glow + 0.04);
            }
          }

          // 3. Elastic Return-to-Origin Spring Physics & Damping
          const springAx = (targetAmbientX - n.x) * springK;
          const springAy = (targetAmbientY - n.y) * springK;

          n.vx = (n.vx + springAx) * damping;
          n.vy = (n.vy + springAy) * damping;

          n.x += n.vx;
          n.y += n.vy;

          // Glow decay
          n.glow = Math.max(0, n.glow - 0.018);
        }

        // Draw Interconnection Lines (Mesh Graph)
        ctx.lineWidth = 1;
        const connDistSq = connectionDistance * connectionDistance;

        for (let i = 0; i < nodes.length; i++) {
          const nA = nodes[i];
          for (let j = i + 1; j < nodes.length; j++) {
            const nB = nodes[j];
            const dx = nA.x - nB.x;
            const dy = nA.y - nB.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < connDistSq) {
              const dist = Math.sqrt(distSq);
              const factor = 1 - dist / connectionDistance;
              const alpha = factor * lineOpacity;
              const glowFactor = Math.max(nA.glow, nB.glow);

              ctx.beginPath();
              ctx.moveTo(nA.x, nA.y);
              ctx.lineTo(nB.x, nB.y);

              if (glowFactor > 0.05) {
                // Color shift toward Success Glow
                const r = Math.round(baseLineRgb.r + (successRgb.r - baseLineRgb.r) * glowFactor);
                const g = Math.round(baseLineRgb.g + (successRgb.g - baseLineRgb.g) * glowFactor);
                const b = Math.round(baseLineRgb.b + (successRgb.b - baseLineRgb.b) * glowFactor);
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(1, alpha * (1 + glowFactor * 2))})`;
              } else {
                ctx.strokeStyle = `rgba(${baseLineRgb.r}, ${baseLineRgb.g}, ${baseLineRgb.b}, ${alpha})`;
              }

              ctx.stroke();
            }
          }
        }

        // Draw Nodes
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const glowFactor = n.glow;

          const r = Math.round(baseNodeRgb.r + (successRgb.r - baseNodeRgb.r) * glowFactor);
          const g = Math.round(baseNodeRgb.g + (successRgb.g - baseNodeRgb.g) * glowFactor);
          const b = Math.round(baseNodeRgb.b + (successRgb.b - baseNodeRgb.b) * glowFactor);

          const currentRadius = n.radius * (1 + glowFactor * 0.6);

          // Node core
          ctx.beginPath();
          ctx.arc(n.x, n.y, currentRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.7 + glowFactor * 0.3})`;
          ctx.fill();

          // Node outer ambient bloom
          if (glowFactor > 0.1) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, currentRadius * 2.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${glowFactor * 0.25})`;
            ctx.fill();
          }
        }

        animationFrameId = requestAnimationFrame(render);
      };

      animationFrameId = requestAnimationFrame(render);

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseleave", handleMouseLeave);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleMouseLeave);
      };
    }, [
      particleCount,
      connectionDistance,
      repulsionRadius,
      repulsionStrength,
      springK,
      damping,
      ambientSpeed,
      nodeColor,
      lineColor,
      lineOpacity,
      successColor,
    ]);

    return (
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none -z-10 w-full h-full ${className}`}
        style={{ display: "block" }}
      />
    );
  }
);

AntigravityMeshBackground.displayName = "AntigravityMeshBackground";

export default AntigravityMeshBackground;
