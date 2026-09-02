'use client';

import { useEffect, useRef } from 'react';

interface CanvasNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  glowColor: string;
  coreColor: string;
  satelliteColor: string;
  lineColor: string;
  label: string;
  pulseSpeed: number;
  pulsePhase: number;
  opacity: number;
  variants: { x: number; y: number; angle: number; speed: number; radius: number }[];
}

export default function AmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Read via a ref (not state) so the draw loop's closure sees live theme
  // changes without needing to restart the whole animation effect.
  const isLightRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Track the live theme so connecting lines stay visible against either
    // background (white lines vanish on a light page).
    isLightRef.current = document.documentElement.getAttribute('data-theme') === 'light';
    const themeObserver = new MutationObserver(() => {
      isLightRef.current = document.documentElement.getAttribute('data-theme') === 'light';
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isReducedMotion = mediaQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      isReducedMotion = e.matches;
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Setting canvas.width/height (even to a value close to the current one) wipes the
    // canvas instantly. A vertical scrollbar appearing/disappearing between routes of
    // different page heights changes window.innerWidth by its own width and fires a real
    // 'resize' event, which used to blank the canvas for a frame — visible as a flicker
    // when navigating between a "tall" page and a "short" one. Debouncing coalesces any
    // burst of resize events into one, and redrawing synchronously right after resizing
    // (instead of waiting for the next animation frame) means the cleared canvas is never
    // actually painted to the screen on its own.
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        cancelAnimationFrame(animationFrameId);
        draw();
      }, 100);
    };
    window.addEventListener('resize', handleResize);

    // Restricted to the three brand accents (amber/coral/teal) so the ambient
    // effect reads as "this system," not a decorative confetti of colors —
    // lower alphas than the original five-hue version for a quieter, more
    // minimal backdrop.
    const colors = [
      {
        base: 'rgba(245, 166, 35, 0.32)', // Amber
        glow: 'rgba(245, 166, 35, 0.08)',
        core: 'rgba(245, 166, 35, 0.7)',
        satellite: 'rgba(245, 166, 35, 0.45)',
        line: 'rgba(245, 166, 35, 0.1)',
      },
      {
        base: 'rgba(45, 212, 191, 0.32)', // Teal
        glow: 'rgba(45, 212, 191, 0.08)',
        core: 'rgba(45, 212, 191, 0.7)',
        satellite: 'rgba(45, 212, 191, 0.45)',
        line: 'rgba(45, 212, 191, 0.1)',
      },
      {
        base: 'rgba(251, 107, 83, 0.32)', // Coral
        glow: 'rgba(251, 107, 83, 0.08)',
        core: 'rgba(251, 107, 83, 0.7)',
        satellite: 'rgba(251, 107, 83, 0.45)',
        line: 'rgba(251, 107, 83, 0.1)',
      },
    ];

    // Build visual nodes
    const nodes: CanvasNode[] = [];

    // A quiet ambient drift of on-brand nodes — not tied to real cluster
    // data (that idea was scaffolded but never wired up), just a subtle
    // background texture. Kept deliberately sparse for a minimal feel.
    const nodeCount = 8;
    for (let i = 0; i < nodeCount; i++) {
      const baseRadius = 4 + Math.random() * 6;
      const x = Math.random() * width;
      const y = Math.random() * height;

      const satelliteCount = Math.floor(Math.random() * 3);
      const variants = Array.from({ length: satelliteCount }, () => ({
        x: 0,
        y: 0,
        angle: Math.random() * Math.PI * 2,
        speed: (0.005 + Math.random() * 0.01) * (Math.random() > 0.5 ? 1 : -1),
        radius: 1 + Math.random() * 1.5,
      }));

      const colorPalette = colors[i % colors.length];

      nodes.push({
        id: `seed-${i}`,
        x,
        y,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        baseRadius,
        radius: baseRadius,
        color: colorPalette.base,
        glowColor: colorPalette.glow,
        coreColor: colorPalette.core,
        satelliteColor: colorPalette.satellite,
        lineColor: colorPalette.line,
        label: '',
        pulseSpeed: 0.005 + Math.random() * 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
        opacity: 0.1 + Math.random() * 0.08,
        variants,
      });
    }

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw connecting lines between nodes that share the same general direction/category
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Connect nodes if they are within proximity (closer represents gravitate structure)
          if (distance < Math.max(width, height) * 0.18) {
            const alpha = (1 - distance / (Math.max(width, height) * 0.18)) * 0.05;
            ctx.strokeStyle = isLightRef.current
              ? `rgba(10, 14, 20, ${alpha * 1.6})`
              : `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // 2. Update and draw nodes
      nodes.forEach((node) => {
        // Drift movement
        if (!isReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;

          // Boundary bounce
          if (node.x < 50 || node.x > width - 50) node.vx *= -1;
          if (node.y < 50 || node.y > height - 50) node.vy *= -1;

          // Pulse sizing
          node.pulsePhase += node.pulseSpeed;
          const pulseCoeff = 1 + Math.sin(node.pulsePhase) * 0.15;
          node.radius = node.baseRadius * pulseCoeff;
        }

        // Radial glow gradient for node
        const glowRadius = node.radius * 3.5;
        const gradient = ctx.createRadialGradient(
          node.x,
          node.y,
          node.radius * 0.1,
          node.x,
          node.y,
          glowRadius
        );
        gradient.addColorStop(0, node.color);
        gradient.addColorStop(0.3, node.glowColor);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core solid dot
        ctx.fillStyle = node.coreColor;
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(1.5, node.radius * 0.35), 0, Math.PI * 2);
        ctx.fill();

        // Render orbits (satellite nodes)
        node.variants.forEach((v) => {
          if (!isReducedMotion) {
            v.angle += v.speed;
          }
          // Orbit calculation
          const orbitDist = node.radius * 2;
          v.x = node.x + Math.cos(v.angle) * orbitDist;
          v.y = node.y + Math.sin(v.angle) * orbitDist;

          ctx.fillStyle = node.satelliteColor;
          ctx.beginPath();
          ctx.arc(v.x, v.y, v.radius, 0, Math.PI * 2);
          ctx.fill();

          // Connect orbit satellite to main node with super faint lines
          ctx.strokeStyle = node.lineColor;
          ctx.lineWidth = 0.3;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(v.x, v.y);
          ctx.stroke();
        });
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    // Start animating only if tab is visible
    if (!document.hidden) {
      draw();
    }

    // Page Visibility Listener: Stop drawing loop when tab is in background (saves CPU/Memory & prevents unresponsiveness!)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        cancelAnimationFrame(animationFrameId); // Avoid duplicate queues
        draw();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      mediaQuery.removeEventListener('change', handleMotionChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 bg-bg-void"
      style={{
        // var() color stops make this swap instantly on theme toggle, no redraw needed.
        background: 'radial-gradient(circle at 50% 50%, var(--raw-bg-panel) 0%, var(--raw-bg-void) 100%)',
      }}
    />
  );
}
