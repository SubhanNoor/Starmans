import { useEffect, useRef } from 'react';

const DOT_SPACING = 18;
const DOT_RADIUS = 1.5;
const BULGE_STRENGTH = 70;
const CURSOR_RADIUS = 450;
const GLOW_RADIUS = 160;

const GOLD: [number, number, number] = [176, 141, 87]; // #B08D57
const NAVY: [number, number, number] = [27, 42, 65]; // #1B2A41

export default function DotField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    const dpr = window.devicePixelRatio || 1;
    let mouseX = -9999;
    let mouseY = -9999;
    let animId = 0;

    function resize() {
      const parent = canvas!.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      const cols = Math.ceil(width / DOT_SPACING) + 1;
      const rows = Math.ceil(height / DOT_SPACING) + 1;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const baseX = col * DOT_SPACING;
          const baseY = row * DOT_SPACING;

          const dx = baseX - mouseX;
          const dy = baseY - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let x = baseX;
          let y = baseY;

          if (dist < CURSOR_RADIUS && dist > 0.001) {
            const push = (1 - dist / CURSOR_RADIUS) * BULGE_STRENGTH;
            x += (dx / dist) * push;
            y += (dy / dist) * push;
          }

          const t = width > 0 ? Math.min(Math.max(baseX / width, 0), 1) : 0;
          const baseOpacity = 0.38 - t * 0.1;

          const glow = dist < GLOW_RADIUS ? 1 - dist / GLOW_RADIUS : 0;

          if (glow > 0.02) {
            const opacity = 0.25 + glow * 0.45;
            ctx!.fillStyle = `rgba(${GOLD[0]},${GOLD[1]},${GOLD[2]},${opacity.toFixed(3)})`;
          } else {
            const r = GOLD[0] + (NAVY[0] - GOLD[0]) * t;
            const g = GOLD[1] + (NAVY[1] - GOLD[1]) * t;
            const b = GOLD[2] + (NAVY[2] - GOLD[2]) * t;
            ctx!.fillStyle = `rgba(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)},${baseOpacity.toFixed(3)})`;
          }

          ctx!.beginPath();
          ctx!.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', onMouseMove);
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
