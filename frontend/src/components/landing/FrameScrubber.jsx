import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ============================================
   CONFIGURABLE CONSTANTS — Change these when you have real frames
   ============================================ */
export const TOTAL_FRAMES = 153;
export const FRAME_PATH_TEMPLATE = '/frames/ezgif-frame-';
export const FRAME_EXTENSION = '.jpg';
export const FRAME_PAD_LENGTH = 3;
export const SCRUB_SECTION_HEIGHT = '500vh';

/**
 * Build frame URL for a given index (1-based).
 */
function getFrameUrl(index) {
  return `${FRAME_PATH_TEMPLATE}${String(index).padStart(FRAME_PAD_LENGTH, '0')}${FRAME_EXTENSION}`;
}

/**
 * FrameScrubber — Canvas-based Apple-style scroll-scrub frame sequence.
 * Falls back to a gradient transition if no frame images are found.
 */
export default function FrameScrubber({ onProgress }) {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const framesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // Draw a frame to the canvas
  const drawFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (useFallback) {
      // Gradient fallback: red/orange → green/blue
      const t = index / Math.max(TOTAL_FRAMES - 1, 1);
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

      // Hot state (t=0): orange-red
      // Cool state (t=1): green-blue
      const r = Math.round(215 - t * 180);
      const g = Math.round(48 + t * 150);
      const b = Math.round(39 + t * 120);
      const r2 = Math.round(244 - t * 200);
      const g2 = Math.round(109 + t * 60);
      const b2 = Math.round(67 + t * 100);

      gradient.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
      gradient.addColorStop(0.3, `rgb(${r2}, ${g2}, ${b2})`);
      gradient.addColorStop(0.6, `rgb(${Math.round(r * 0.7)}, ${Math.round(g * 1.2)}, ${Math.round(b * 1.5)})`);
      gradient.addColorStop(1, `rgb(${Math.round(40 + t * 20)}, ${Math.round(60 + t * 100)}, ${Math.round(80 + t * 80)})`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add some visual noise / city-like pattern
      ctx.globalAlpha = 0.05;
      for (let i = 0; i < 50; i++) {
        const x = (Math.sin(i * 7.3 + t * 2) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(i * 11.1 + t * 3) * 0.5 + 0.5) * canvas.height;
        const size = 20 + Math.sin(i * 3.7) * 40;
        ctx.fillStyle = t > 0.5 ? 'rgba(34,197,94,0.3)' : 'rgba(215,48,39,0.3)';
        ctx.fillRect(x, y, size, size * 1.5);
      }
      ctx.globalAlpha = 1.0;

      // Overlay text watermark
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.font = '14px Inter';
      ctx.fillText('Drop frame images in /public/frames/', canvas.width / 2 - 140, canvas.height - 30);
    } else {
      const img = framesRef.current[index];
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    }
  }, [useFallback]);

  // Resize canvas to viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(currentFrameRef.current);
    }

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [drawFrame]);

  // Preload frames
  useEffect(() => {
    let loadedCount = 0;
    let errorCount = 0;
    const frames = [];

    // Test first frame to decide if we use fallback
    const testImg = new Image();
    testImg.onload = () => {
      // Frames exist — load all
      frames[0] = testImg;
      loadedCount = 1;

      for (let i = 2; i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
          if (loadedCount >= TOTAL_FRAMES) {
            framesRef.current = frames;
            setLoaded(true);
            drawFrame(0);
          }
        };
        img.onerror = () => {
          errorCount++;
          loadedCount++;
          setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
          if (loadedCount >= TOTAL_FRAMES) {
            framesRef.current = frames;
            setLoaded(true);
            drawFrame(0);
          }
        };
        img.src = getFrameUrl(i);
        frames[i - 1] = img;
      }
    };

    testImg.onerror = () => {
      // No frames found — use gradient fallback
      setUseFallback(true);
      setLoaded(true);
      setLoadProgress(100);
    };

    testImg.src = getFrameUrl(1);
  }, [drawFrame]);

  // GSAP ScrollTrigger scrub
  useEffect(() => {
    if (!loaded || !sectionRef.current) return;

    // Draw initial frame
    drawFrame(0);

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      pin: false, // The section itself provides the scroll height
      onUpdate: (self) => {
        const index = Math.round(self.progress * (TOTAL_FRAMES - 1));
        if (index !== currentFrameRef.current) {
          currentFrameRef.current = index;
          requestAnimationFrame(() => drawFrame(index));
        }
        if (onProgress) onProgress(self.progress);
      },
    });

    return () => trigger.kill();
  }, [loaded, drawFrame, onProgress]);

  return (
    <>
      {/* Canvas — fixed behind everything */}
      <canvas
        ref={canvasRef}
        id="hero-canvas"
        className="fixed top-0 left-0 w-screen h-screen"
        style={{ zIndex: 0 }}
      />

      {/* Scroll height container — 6x viewport for scrub travel */}
      <div
        ref={sectionRef}
        id="frame-scrub-section"
        style={{ height: SCRUB_SECTION_HEIGHT, position: 'relative', zIndex: 1 }}
      >
        {/* Content overlays are children placed by parent */}
      </div>
    </>
  );
}
