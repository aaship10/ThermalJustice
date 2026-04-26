import React from 'react';

const CityBlock = ({ x, z, width, depth, height, activated, pulsing, stage }) => {
  const UNIT = 40;

  const isoX = (x - z) * UNIT * 0.6;
  const isoY = (x + z) * UNIT * 0.3;

  return (
    <div
      className={`city-block ${pulsing ? 'pulse-block' : ''}`}
      data-stage={stage}
      style={{
        position: 'absolute',
        left: `calc(50% + ${isoX}px)`,
        top: `calc(50% + ${isoY}px)`,
        width: `${width * UNIT}px`,
        height: `${height}px`,
        transformStyle: 'preserve-3d',
        transform: `translateZ(0)`,
        transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        willChange: 'transform',
        filter: activated
          ? 'drop-shadow(0 20px 40px rgba(0,0,0,0.18))'
          : 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))',
      }}
    >
      {/* TOP (ROOFTOP WITH GREENERY) */}
      <div
        style={{
          position: 'absolute',
          width: `${width * UNIT}px`,
          height: `${depth * UNIT * 0.6}px`,
          background: `linear-gradient(135deg, #ffffff, #fdfefe)`,
          transform: `rotateX(90deg) translateZ(${height / 2}px) translateY(-${depth * UNIT * 0.3}px)`,
          transformOrigin: 'top center',
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: `
            inset 0 4px 12px rgba(255,255,255,0.9),
            inset 0 -4px 8px rgba(0,0,0,0.05)
          `,
        }}
      >
        {/* Rooftop garden */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '80%',
            height: '60%',
            background: 'linear-gradient(135deg, #7ed957, #3cb371)',
            borderRadius: '6px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}
        />
      </div>

      {/* FRONT FACE */}
      <div
        style={{
          position: 'absolute',
          width: `${width * UNIT}px`,
          height: `${height}px`,
          background: `linear-gradient(
            to bottom,
            #ffffff 0%,
            #ffffff 60%,
            #f8fbff 100%
          )`,
          transform: `translateZ(${depth * UNIT * 0.3}px)`,
          border: '1px solid rgba(0,0,0,0.04)',
          bottom: 0,
          overflow: 'hidden',
        }}
      >
        {/* Glass window grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              repeating-linear-gradient(
                to right,
                rgba(0, 150, 255, 0.08) 0px,
                rgba(0, 150, 255, 0.08) 2px,
                transparent 2px,
                transparent 14px
              ),
              repeating-linear-gradient(
                to bottom,
                rgba(0, 150, 255, 0.06) 0px,
                rgba(0, 150, 255, 0.06) 2px,
                transparent 2px,
                transparent 14px
              )
            `,
            opacity: activated ? 0.6 : 0.35,
          }}
        />

        {/* Glass reflection */}
        <div
          style={{
            position: 'absolute',
            left: '15%',
            width: '25%',
            height: '100%',
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(255,255,255,0))',
            opacity: 0.5,
          }}
        />

        {/* Vertical greenery strips */}
        <div
          style={{
            position: 'absolute',
            right: '5%',
            width: '6%',
            height: '100%',
            background: 'linear-gradient(to bottom, #6bd66b, #2e8b57)',
            opacity: 0.7,
          }}
        />
      </div>

      {/* RIGHT FACE */}
      <div
        style={{
          position: 'absolute',
          width: `${depth * UNIT * 0.6}px`,
          height: `${height}px`,
          background: `linear-gradient(
            to bottom,
            #ffffff 0%,
            #2c70b4ff 100%
          )`,
          transform: `rotateY(-90deg) translateZ(${width * UNIT}px) translateX(${depth * UNIT * 0.3}px)`,
          transformOrigin: 'right center',
          border: '1px solid rgba(0,0,0,0.03)',
          bottom: 0,
          overflow: 'hidden',
        }}
      >
        {/* Side glass shine */}
        <div
          style={{
            position: 'absolute',
            left: '20%',
            width: '40%',
            height: '100%',
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0))',
          }}
        />

        {/* Side greenery */}
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '10%',
            width: '80%',
            height: '10%',
            background: '#4caf50',
            borderRadius: '4px',
          }}
        />
      </div>

      {/* GLOW EFFECT */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.4), transparent 70%)',
          pointerEvents: 'none',
          opacity: activated ? 0.8 : 0.4,
        }}
      />
    </div>
  );
};

export default React.memo(CityBlock);