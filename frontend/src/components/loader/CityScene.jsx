import React from 'react';
import CityBlock from './CityBlock.jsx';

const CITY_BLOCKS = [
  // [gridX, gridZ, widthUnits, depthUnits, heightPx, loadStage (0-3)]
  { id: 'b00', x: 0, z: 0, w: 1, d: 1, h: 30, stage: 0 }, 
  { id: 'b10', x: 1, z: 0, w: 1, d: 1, h: 55, stage: 0 }, 
  { id: 'b20', x: 2, z: 0, w: 1, d: 1, h: 40, stage: 1 },
  { id: 'b30', x: 3, z: 0, w: 1, d: 1, h: 25, stage: 1 },
  { id: 'b01', x: 0, z: 1, w: 1, d: 1, h: 70, stage: 0 }, 
  { id: 'b11', x: 1, z: 1, w: 1, d: 1, h: 45, stage: 0 },
  { id: 'b21', x: 2, z: 1, w: 1, d: 1, h: 35, stage: 1 },
  { id: 'b31', x: 3, z: 1, w: 1, d: 1, h: 60, stage: 1 },
  { id: 'b02', x: 0, z: 2, w: 1, d: 1, h: 20, stage: 2 }, 
  { id: 'b12', x: 1, z: 2, w: 1, d: 1, h: 50, stage: 2 },
  { id: 'b22', x: 2, z: 2, w: 1, d: 1, h: 80, stage: 2 }, 
  { id: 'b32', x: 3, z: 2, w: 1, d: 1, h: 35, stage: 2 },
  { id: 'b03', x: 0, z: 3, w: 1, d: 1, h: 15, stage: 3 }, 
  { id: 'b13', x: 1, z: 3, w: 1, d: 1, h: 45, stage: 3 },
  { id: 'b23', x: 2, z: 3, w: 1, d: 1, h: 30, stage: 3 },
  { id: 'b33', x: 3, z: 3, w: 1, d: 1, h: 55, stage: 3 },
];

const STAGE_COLORS = {
  0: '#2a3a4a', // Loaded - Road/Base
  1: '#1A3C5E', // Loaded - Building
  2: '#0D9488', // Loaded - Tree
  3: '#065F46', // Loaded - Park
};

const CityScene = ({ currentStage }) => {
  // Determine pulse block dynamically based on currentStage (but we can just use pure CSS to target `.pulse-block`)
  // We'll tag one block per stage as the pulsing block.
  const pulseBlockIds = {
    0: 'b00',
    1: 'b20',
    2: 'b02',
    3: 'b03',
  };

  return (
    <div style={{
      width: '320px',
      height: '220px',
      perspective: '600px',
      perspectiveOrigin: '50% 40%',
      margin: '0 auto 32px',
    }}>
      <div id="city-scene" style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transform: 'rotateX(28deg) rotateY(-18deg)',
        willChange: 'transform',
      }}>
        {CITY_BLOCKS.map(block => {
          const activated = currentStage >= block.stage && currentStage !== -1;
          const pulsing = currentStage === block.stage && block.id === pulseBlockIds[block.stage];
          
          return (
            <CityBlock
              key={block.id}
              x={block.x}
              z={block.z}
              width={block.w}
              depth={block.d}
              height={block.h}
              color={STAGE_COLORS[block.stage]}
              activated={activated}
              pulsing={pulsing}
              stage={block.stage}
            />
          );
        })}
      </div>
    </div>
  );
};

// Wrap in React.memo so the GSAP animations are not interrupted by React re-renders
export default React.memo(CityScene);
