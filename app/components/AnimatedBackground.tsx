'use client';

import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const scrollYRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize nodes - more nodes for better visibility
    const nodeCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 8000));
    nodesRef.current = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
    }));

    // Handle scroll for parallax and pulse effect
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          scrollYRef.current = window.scrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update nodes
      nodesRef.current.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        // Wrap around edges
        if (node.x < 0) node.x = canvas.width;
        if (node.x > canvas.width) node.x = 0;
        if (node.y < 0) node.y = canvas.height;
        if (node.y > canvas.height) node.y = 0;
      });

      // Calculate pulse intensity based on scroll
      const scrollPulse = Math.min(scrollYRef.current / 500, 0.3);
      const baseOpacity = 0.5;
      const pulseOpacity = baseOpacity + scrollPulse * 0.2;

      // Draw connections
      ctx.strokeStyle = `rgba(66, 153, 225, ${pulseOpacity})`; // Accent Primary with low opacity
      ctx.lineWidth = 0.5;

      for (let i = 0; i < nodesRef.current.length; i++) {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const dx = nodesRef.current[i].x - nodesRef.current[j].x;
          const dy = nodesRef.current[i].y - nodesRef.current[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Only draw connections within a certain distance
          if (distance < 200) {
            const opacity = (1 - distance / 200) * pulseOpacity;
            ctx.strokeStyle = `rgba(66, 153, 225, ${Math.max(opacity, 0.3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodesRef.current[i].x, nodesRef.current[i].y);
            ctx.lineTo(nodesRef.current[j].x, nodesRef.current[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes with pulse effect
      const nodeGlow = 1 + scrollPulse * 0.5;
      nodesRef.current.forEach((node) => {
        ctx.fillStyle = `rgba(66, 153, 225, ${pulseOpacity * 1.2})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3 * nodeGlow, 0, Math.PI * 2);
        ctx.fill();
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(66, 153, 225, 0.8)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none bg-slate-950"
        style={{ 
          zIndex: 0
        }}
      />
      {/* Dark overlay for readability - minimal opacity to let animation show */}
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none bg-slate-950/10"
        style={{ 
          zIndex: 1
        }}
      />
    </>
  );
}

