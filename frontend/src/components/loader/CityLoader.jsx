import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import CircularProgress from './CircularProgress.jsx';
import StageList from './StageList.jsx';
import CityScene from './CityScene.jsx';

export default function CityLoader({ loaderState }) {
  const { visible, progress, currentStage, stageStatuses, stageTimes, done } = loaderState;
  
  const tlRef = useRef(null);
  const idleTweenRef = useRef(null);
  const pulseTweenRef = useRef(null);
  const exitTlRef = useRef(null);

  useEffect(() => {
    if (!visible) return;

    // Initial mount animations
    tlRef.current = gsap.timeline();
    tlRef.current.from('.city-block', {
      scaleY: 0,
      transformOrigin: 'bottom center',
      duration: 0.6,
      ease: 'back.out(1.4)',
      stagger: { amount: 0.8, from: 'start' }
    });

    // Idle rotation
    idleTweenRef.current = gsap.to('#city-scene', {
      rotateY: '-22deg',
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    return () => {
      if (tlRef.current) tlRef.current.kill();
      if (idleTweenRef.current) idleTweenRef.current.kill();
    };
  }, [visible]);

  // Handle stage transitions and pulsing
  useEffect(() => {
    if (!visible || currentStage === -1 || done) return;

    // Pulse animation for the current active block
    if (pulseTweenRef.current) pulseTweenRef.current.kill();
    pulseTweenRef.current = gsap.to('.pulse-block .block-front', {
      background: '#FEE09044',
      duration: 0.8,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    // When a stage is marked done, we want to pulse the blocks that just completed
    // Wait, the prompt says "On each stage completion: newly activated blocks do a color-shift + subtle pop"
    // So if currentStage updates, we pop the blocks belonging to the *previous* stage?
    // Actually, `currentStage` is the one *currently* loading. The previous stage is `currentStage - 1`.
    const completedStage = currentStage - 1;
    if (completedStage >= 0) {
      gsap.to(`[data-stage="${completedStage}"]`, {
        scale: 1.05,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out',
      });
    }

    return () => {
      if (pulseTweenRef.current) pulseTweenRef.current.kill();
    };
  }, [currentStage, visible, done]);

  // Handle exit animation
  useEffect(() => {
    if (!done) return;
    
    // Kill idle animations to prevent conflicts
    if (idleTweenRef.current) idleTweenRef.current.kill();
    if (pulseTweenRef.current) pulseTweenRef.current.kill();

    exitTlRef.current = gsap.timeline();
    
    // City blocks compress down into the ground
    exitTlRef.current.to('.city-block', {
      scaleY: 0,
      transformOrigin: 'bottom center',
      duration: 0.5,
      ease: 'power3.in',
      stagger: { amount: 0.3, from: 'end' }
    });
    
    // The whole overlay fades out + scales up slightly
    exitTlRef.current.to('#city-loader-overlay', {
      opacity: 0,
      scale: 1.04,
      duration: 0.5,
      ease: 'power2.in',
    }, '-=0.2');

    return () => {
      if (exitTlRef.current) exitTlRef.current.kill();
    };
  }, [done]);

  if (!visible) return null;

  return (
    <div id="city-loader-overlay" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      backgroundColor: '#060d18',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      willChange: 'opacity, transform',
    }}>
      {/* 3D City Block Zone - 40vh equivalent space approximately */}
      <div style={{ height: '40vh', display: 'flex', alignItems: 'flex-end', paddingBottom: '20px' }}>
        <CityScene currentStage={currentStage} />
      </div>

      <div style={{
        fontSize: '18px',
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: '24px',
        fontFamily: 'var(--font-display)',
        textAlign: 'center'
      }}>
        Optimizing Pune's thermal future
      </div>

      <CircularProgress progress={progress} />

      <StageList stageStatuses={stageStatuses} stageTimes={stageTimes} />
    </div>
  );
}
