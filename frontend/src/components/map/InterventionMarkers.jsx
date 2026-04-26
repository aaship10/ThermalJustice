// import React, { useEffect, useRef } from 'react';
// import { Marker } from 'react-map-gl';
// import gsap from 'gsap';
// import { INTERVENTION_CONFIG } from '../../utils/colorUtils.js';

// /**
//  * SVG marker icons for each intervention type.
//  */
// function MarkerIcon({ type, tvsColor }) {
//   const config = INTERVENTION_CONFIG[type] || INTERVENTION_CONFIG.tree_planting;
//   const borderColor = tvsColor || config.markerColor;

//   const iconPaths = {
//     tree_planting: (
//       <g>
//         <circle cx="18" cy="12" r="8" fill="#22C55E" opacity="0.9" />
//         <rect x="16.5" y="18" width="3" height="6" fill="#854D0E" rx="1" />
//         <circle cx="18" cy="11" r="5" fill="#16A34A" />
//       </g>
//     ),
//     cool_pavement: (
//       <g>
//         <polygon points="18,4 32,14 28,14 28,28 8,28 8,14 4,14" fill="#9CA3AF" opacity="0.9" />
//         <polygon points="18,7 29,14.5 28,14.5 28,26 8,26 8,14.5 7,14.5" fill="#6B7280" />
//         <rect x="12" y="16" width="4" height="4" fill="#D1D5DB" rx="0.5" />
//         <rect x="20" y="16" width="4" height="4" fill="#D1D5DB" rx="0.5" />
//       </g>
//     ),
//     green_roof: (
//       <g>
//         <rect x="6" y="14" width="24" height="14" fill="#0D9488" rx="2" />
//         <polygon points="18,4 32,14 4,14" fill="#0F766E" />
//         <rect x="10" y="18" width="3" height="3" fill="#5EEAD4" rx="0.5" />
//         <rect x="16" y="18" width="3" height="3" fill="#5EEAD4" rx="0.5" />
//         <rect x="23" y="18" width="3" height="3" fill="#5EEAD4" rx="0.5" />
//       </g>
//     ),
//     pocket_park: (
//       <g>
//         <circle cx="18" cy="16" r="12" fill="#166534" opacity="0.3" />
//         <circle cx="12" cy="12" r="5" fill="#22C55E" />
//         <circle cx="24" cy="12" r="4" fill="#16A34A" />
//         <circle cx="18" cy="18" r="6" fill="#15803D" />
//         <rect x="17" y="22" width="2" height="5" fill="#854D0E" rx="0.5" />
//       </g>
//     ),
//   };

//   return (
//     <svg width="36" height="36" viewBox="0 0 36 36">
//       <circle cx="18" cy="18" r="17" fill="none" stroke={borderColor} strokeWidth="2" opacity="0.8" />
//       {iconPaths[type] || iconPaths.tree_planting}
//     </svg>
//   );
// }

// /**
//  * InterventionMarkers — Custom SVG markers on the map with staggered GSAP animations.
//  */
// export default function InterventionMarkers({ markers, geojson }) {
//   const markersContainerRef = useRef(null);
//   const prevMarkersRef = useRef([]);

//   useEffect(() => {
//     // Animate markers in with stagger
//     const markerElements = document.querySelectorAll('.intervention-marker');
//     if (markerElements.length === 0) return;

//     // Fade out old markers first if there were previous markers
//     if (prevMarkersRef.current.length > 0) {
//       const tl = gsap.timeline();
//       tl.to('.intervention-marker', {
//         scale: 0.5,
//         autoAlpha: 0,
//         duration: 0.2,
//         stagger: 0.02,
//         ease: 'power2.in',
//       });

//       // Then animate new ones in
//       tl.fromTo('.intervention-marker',
//         { scale: 0.5, autoAlpha: 0 },
//         {
//           scale: 1,
//           autoAlpha: 1,
//           duration: 0.3,
//           stagger: 0.05,
//           ease: 'elastic.out(1, 0.5)',
//         },
//         '+=0.1'
//       );
//     } else {
//       // First time — just animate in
//       gsap.fromTo('.intervention-marker',
//         { scale: 0.5, autoAlpha: 0 },
//         {
//           scale: 1,
//           autoAlpha: 1,
//           duration: 0.4,
//           stagger: 0.05,
//           ease: 'elastic.out(1, 0.5)',
//           delay: 0.2,
//         }
//       );
//     }

//     prevMarkersRef.current = markers;
//   }, [markers]);

//   if (!markers || markers.length === 0) return null;

//   // Get TVS value from geojson for border color
//   const tvsMap = {};
//   if (geojson?.features) {
//     for (const f of geojson.features) {
//       tvsMap[f.properties.block_id] = f.properties.tvs;
//     }
//   }

//   return (
//     <div ref={markersContainerRef}>
//       {markers.map((marker, i) => {
//         const tvs = tvsMap[marker.block_id] || 0.5;
//         const borderColor = tvs > 0.7 ? '#D73027' : tvs > 0.4 ? '#FDAE61' : '#4575B4';

//         return (
//           <Marker
//             key={`${marker.block_id}-${marker.type}-${i}`}
//             longitude={marker.position[0]}
//             latitude={marker.position[1]}
//             anchor="center"
//           >
//             <div
//               className="intervention-marker cursor-pointer"
//               title={`${INTERVENTION_CONFIG[marker.type]?.label} — ${marker.block_id}\nΔT: ${marker.delta_t}°C | Cost: ₹${marker.cost_lakh}L`}
//               style={{ visibility: 'hidden' }}
//             >
//               <MarkerIcon type={marker.type} tvsColor={borderColor} />
//             </div>
//           </Marker>
//         );
//       })}
//     </div>
//   );
// }



import React from 'react';
import { Marker } from 'react-map-gl';
import { INTERVENTION_CONFIG } from '../../utils/colorUtils.js';

/**
 * SVG marker icons for each intervention type.
 */
function MarkerIcon({ type, tvsColor }) {
  const config = INTERVENTION_CONFIG[type] || INTERVENTION_CONFIG.tree_planting;
  const borderColor = tvsColor || config.markerColor;

  const iconPaths = {
    tree_planting: (
      <g>
        <circle cx="18" cy="12" r="8" fill="#22C55E" opacity="0.9" />
        <rect x="16.5" y="18" width="3" height="6" fill="#854D0E" rx="1" />
        <circle cx="18" cy="11" r="5" fill="#16A34A" />
      </g>
    ),
    cool_pavement: (
      <g>
        <polygon points="18,4 32,14 28,14 28,28 8,28 8,14 4,14" fill="#9CA3AF" opacity="0.9" />
        <polygon points="18,7 29,14.5 28,14.5 28,26 8,26 8,14.5 7,14.5" fill="#6B7280" />
        <rect x="12" y="16" width="4" height="4" fill="#D1D5DB" rx="0.5" />
        <rect x="20" y="16" width="4" height="4" fill="#D1D5DB" rx="0.5" />
      </g>
    ),
    green_roof: (
      <g>
        <rect x="6" y="14" width="24" height="14" fill="#0D9488" rx="2" />
        <polygon points="18,4 32,14 4,14" fill="#0F766E" />
        <rect x="10" y="18" width="3" height="3" fill="#5EEAD4" rx="0.5" />
        <rect x="16" y="18" width="3" height="3" fill="#5EEAD4" rx="0.5" />
        <rect x="23" y="18" width="3" height="3" fill="#5EEAD4" rx="0.5" />
      </g>
    ),
    pocket_park: (
      <g>
        <circle cx="18" cy="16" r="12" fill="#166534" opacity="0.3" />
        <circle cx="12" cy="12" r="5" fill="#22C55E" />
        <circle cx="24" cy="12" r="4" fill="#16A34A" />
        <circle cx="18" cy="18" r="6" fill="#15803D" />
        <rect x="17" y="22" width="2" height="5" fill="#854D0E" rx="0.5" />
      </g>
    ),
  };

  return (
    <svg width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="17" fill="none" stroke={borderColor} strokeWidth="2" opacity="0.8" />
      {iconPaths[type] || iconPaths.tree_planting}
    </svg>
  );
}

/**
 * InterventionMarkers — Custom SVG markers on the map.
 */
export default function InterventionMarkers({ markers, geojson }) {
  if (!markers || markers.length === 0) return null;

  // Get TVS value from geojson for border color
  const tvsMap = {};
  if (geojson?.features) {
    for (const f of geojson.features) {
      tvsMap[f.properties.block_id] = f.properties.tvs;
    }
  }

  return (
    <>
      {markers.map((marker, i) => {
        const tvs = tvsMap[marker.block_id] || 0.5;
        const borderColor = tvs > 0.7 ? '#D73027' : tvs > 0.4 ? '#FDAE61' : '#4575B4';

        return (
          <Marker
            key={`${marker.block_id}-${marker.type}-${i}`}
            longitude={marker.position[0]}
            latitude={marker.position[1]}
            anchor="center"
          >
            <div
              className="cursor-pointer transition-all duration-300 hover:scale-125 hover:-translate-y-2 animate-in zoom-in spin-in-3"
              title={`${INTERVENTION_CONFIG[marker.type]?.label} — ${marker.block_id}\nΔT: ${marker.delta_t}°C | Cost: ₹${marker.cost_lakh}L`}
            >
              <MarkerIcon type={marker.type} tvsColor={borderColor} />
            </div>
          </Marker>
        );
      })}
    </>
  );
}