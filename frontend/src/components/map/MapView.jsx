// import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
// import Map, { Source, Layer, Popup } from 'react-map-gl';
// import 'maplibre-gl/dist/maplibre-gl.css';

// const PUNE_CENTER = { latitude: 18.5204, longitude: 73.8567 };

// export default function MapView({
//   geojson,
//   activeLayer,
//   is3D,
//   onBlockClick,
//   onBlockHover,
//   hoveredBlockId,
//   selectedBlockId,
//   interventionMarkers, // Added for Grid
//   isOptimised,        // Added for Grid
//   children,
// }) {
//   const mapRef = useRef(null);
//   const [viewState, setViewState] = useState({ ...PUNE_CENTER, zoom: 12.5, pitch: 0, bearing: 0 });
//   const [cursor, setCursor] = useState('default');
//   const [hoverInfo, setHoverInfo] = useState(null);

//   // 1. GRID STYLE: Translucent Green Base (Entire Ward)
//   const gridBaseLayer = {
//     id: 'grid-base-fill',
//     type: 'fill',
//     paint: {
//       'fill-color': '#22c55e', // Emerald Green
//       'fill-opacity': isOptimised ? 0.2 : 0.75, // Becomes translucent when optimized
//     },
//   };

//   // 2. GRID STYLE: Translucent Red "Glow" Cells
//   const redGlowLayer = {
//     id: 'red-glow-cells',
//     type: 'circle',
//     paint: {
//       'circle-radius': {
//         base: 1.75,
//         stops: [[12, 20], [22, 180]] // Scales with zoom
//       },
//       'circle-color': '#ef4444', 
//       'circle-opacity': 0.5,
//       'circle-blur': 0.8, // Softens the edges for that "Heat Grid" look
//     }
//   };

//   // Prepare the data for the Red Cells
//   const redGridSource = useMemo(() => ({
//     type: 'FeatureCollection',
//     features: (interventionMarkers || []).map(m => ({
//       type: 'Feature',
//       geometry: { type: 'Point', coordinates: m.position },
//     }))
//   }), [interventionMarkers]);

//   // Handle Camera: Fly to the ward when results arrive
//   useEffect(() => {
//     if (isOptimised && interventionMarkers?.length > 0 && mapRef.current) {
//       const [lng, lat] = interventionMarkers[0].position;
//       mapRef.current.flyTo({
//         center: [lng, lat],
//         zoom: 14.5,
//         duration: 2500,
//         essential: true
//       });
//     }
//   }, [isOptimised, interventionMarkers]);

//   return (
//     <Map
//       ref={mapRef}
//       {...viewState}
//       onMove={evt => setViewState(evt.viewState)}
//       style={{ width: '100%', height: '100%' }}
//       mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
//       interactiveLayerIds={['grid-base-fill']}
//       onMouseMove={onHover}
//       onClick={onBlockClick}
//       cursor={cursor}
//     >
//       {/* THE GREEN GRID (All Ward Blocks) */}
//       {geojson && (
//         <Source id="pune-blocks" type="geojson" data={geojson}>
//           <Layer {...gridBaseLayer} />
//           <Layer id="grid-outline" type="line" paint={{'line-color': '#22c55e', 'line-width': 0.5, 'line-opacity': 0.2}} />
//         </Source>
//       )}

//       {/* THE RED CELLS (Intervention Areas) */}
//       {isOptimised && (
//         <Source id="intervention-grid" type="geojson" data={redGridSource}>
//           <Layer {...redGlowLayer} />
//         </Source>
//       )}

//       {/* TOOLTIPS & ICONS */}
//       {children}
//     </Map>
//   );
// }


import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Map, { Source, Layer } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const PUNE_CENTER = { latitude: 18.5204, longitude: 73.8567 };

export default function MapView({
  geojson,
  onBlockClick,
  interventionMarkers, 
  isOptimised,        
  children,
}) {
  const mapRef = useRef(null);
  const [viewState, setViewState] = useState({ ...PUNE_CENTER, zoom: 11, pitch: 0, bearing: 0 });

  // 1. Hover Logic (Fixed the onHover error)
  const [cursor, setCursor] = useState('default');
  const onHover = useCallback((e) => {
    if (e.features.length > 0) setCursor('pointer');
    else setCursor('default');
  }, []);

  // 2. Camera Logic: Auto-zoom when Optimised
  useEffect(() => {
    if (isOptimised && interventionMarkers?.length > 0 && mapRef.current) {
      const [lng, lat] = interventionMarkers[0].position;
      mapRef.current.flyTo({ center: [lng, lat], zoom: 14.5, duration: 2000 });
    }
  }, [isOptimised, interventionMarkers]);

  // 3. Layer Styles
  const gridBaseLayer = {
    id: 'grid-base-fill', // 👈 This MUST match interactiveLayerIds
    type: 'fill',
    paint: {
      'fill-color': '#22c55e', // Green
      'fill-opacity': isOptimised ? 0.15 : 0.4,
    },
  };

  const redGlowLayer = {
    id: 'red-glow-cells',
    type: 'circle',
    paint: {
      'circle-radius': { base: 2, stops: [[12, 30], [22, 200]] },
      'circle-color': '#ef4444', // Red
      'circle-opacity': 0.6,
      'circle-blur': 0.8,
    }
  };

  const redSourceData = useMemo(() => ({
    type: 'FeatureCollection',
    features: (interventionMarkers || []).map(m => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: m.position },
    }))
  }), [interventionMarkers]);

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      style={{ width: '100%', height: '100%' }}
      mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      interactiveLayerIds={['grid-base-fill']}
      onMouseMove={onHover}
      cursor={cursor}
    >
      {/* THE GREEN WARD LAYER */}
      {geojson && (
        <Source id="pune-wards" type="geojson" data={geojson}>
          <Layer {...gridBaseLayer} />
          <Layer 
            id="ward-outline" 
            type="line" 
            paint={{ 'line-color': '#22c55e', 'line-width': 1, 'line-opacity': 0.3 }} 
          />
        </Source>
      )}

      {/* THE RED INTERVENTION LAYER */}
      {isOptimised && (
        <Source id="red-grid" type="geojson" data={redSourceData}>
          <Layer {...redGlowLayer} />
        </Source>
      )}

      {children}
    </Map>
  );
}