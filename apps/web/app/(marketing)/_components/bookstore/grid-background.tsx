/**
 * Grid Background Component
 * Animated grid with a traveling dot effect
 */

'use client';

import { useEffect, useRef } from 'react';

interface DotPosition {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

export function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<DotPosition>({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const animationFrameRef = useRef<number | undefined>(undefined);
  const isDarkRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Detect dark mode
    const checkDarkMode = () => {
      isDarkRef.current = document.documentElement.classList.contains('dark');
    };
    checkDarkMode();

    // Watch for class changes on document element
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Initialize dot at a random grid intersection
    const gridSize = 40;
    const initDot = () => {
      const cols = Math.ceil(canvas.offsetWidth / gridSize);
      const rows = Math.ceil(canvas.offsetHeight / gridSize);
      const randomCol = Math.floor(Math.random() * cols);
      const randomRow = Math.floor(Math.random() * rows);
      dotRef.current = {
        x: randomCol * gridSize,
        y: randomRow * gridSize,
        targetX: randomCol * gridSize,
        targetY: randomRow * gridSize,
      };
    };
    initDot();

    let lastMoveTime = Date.now();
    const moveInterval = 1500; // Move every 1.5 seconds
    const dotSpeed = 0.08; // Smooth movement speed
    const dotColor = '#FA8112'; // orange

    const getRandomGridTarget = () => {
      const cols = Math.ceil(canvas.offsetWidth / gridSize);
      const rows = Math.ceil(canvas.offsetHeight / gridSize);
      const randomCol = Math.floor(Math.random() * cols);
      const randomRow = Math.floor(Math.random() * rows);
      return { x: randomCol * gridSize, y: randomRow * gridSize };
    };

    const drawGrid = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Colors based on dark mode
      const gridColor = isDarkRef.current
        ? 'rgba(255, 255, 255, 0.08)' // white with low opacity for dark mode
        : 'rgba(34, 34, 34, 0.08)'; // black with low opacity for light mode

      // Fade colors based on dark mode
      const fadeColorStart = isDarkRef.current ? 'rgba(10, 10, 10, 0)' : 'rgba(250, 243, 225, 0)';
      const fadeColorEnd = isDarkRef.current ? 'rgba(10, 10, 10, 0.95)' : 'rgba(250, 243, 225, 0.95)';

      ctx.clearRect(0, 0, width, height);

      // Draw grid lines
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw gradient fade overlay (bottom)
      const gradient = ctx.createLinearGradient(0, height * 0.5, 0, height);
      gradient.addColorStop(0, fadeColorStart);
      gradient.addColorStop(1, fadeColorEnd);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Update dot position
      const dot = dotRef.current;
      dot.x += (dot.targetX - dot.x) * dotSpeed;
      dot.y += (dot.targetY - dot.y) * dotSpeed;

      // Check if it's time to pick a new target
      if (Date.now() - lastMoveTime > moveInterval) {
        const newTarget = getRandomGridTarget();
        dot.targetX = newTarget.x;
        dot.targetY = newTarget.y;
        lastMoveTime = Date.now();
      }

      // Draw dot with glow
      ctx.save();
      ctx.shadowColor = dotColor;
      ctx.shadowBlur = 20;
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw trailing effect
      ctx.save();
      ctx.strokeStyle = 'rgba(250, 129, 18, 0.3)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      const trailLength = 60;
      const dx = dot.targetX - dot.x;
      const dy = dot.targetY - dot.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) {
        ctx.moveTo(dot.x - (dx / dist) * trailLength, dot.y - (dy / dist) * trailLength);
        ctx.lineTo(dot.x, dot.y);
        ctx.stroke();
      }
      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(drawGrid);
    };

    drawGrid();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      observer.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
