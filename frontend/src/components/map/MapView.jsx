import React, { useState, useCallback, useRef, useEffect } from 'react';
import Map, { Source, Layer, Popup } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { TVS_FILL_COLOR_EXPRESSION, LST_FILL_COLOR_EXPRESSION } from '../../utils/colorUtils.js';

const PUNE_CENTER = { latitude: 18.5204, longitude: 73.8567 };

/**
 * MapView — Root Mapbox GL component with TVS/LST choropleth layers.
 */
export default function MapView({
  geojson,
  activeLayer,
  is3D,
  onBlockClick,
  onBlockHover,
  hoveredBlockId,
  selectedBlockId,
  children,
}) {
  const mapRef = useRef(null);
  const [viewState, setViewState] = useState({
    ...PUNE_CENTER,
    zoom: 12.5,
    pitch: 0,
    bearing: 0,
  });
  const [cursor, setCursor] = useState('default');
  const [hoverInfo, setHoverInfo] = useState(null);

  // Handle 3D toggle
  useEffect(() => {
    setViewState(prev => ({
      ...prev,
      pitch: is3D ? 45 : 0,
      bearing: is3D ? -20 : 0,
    }));
  }, [is3D]);

  const onHover = useCallback((event) => {
    const feature = event.features?.[0];
    if (feature) {
      setCursor('pointer');
      setHoverInfo({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        properties: feature.properties,
      });
      if (onBlockHover) onBlockHover(feature.properties);
    } else {
      setCursor('default');
      setHoverInfo(null);
      if (onBlockHover) onBlockHover(null);
    }
  }, [onBlockHover]);

  const onClick = useCallback((event) => {
    const feature = event.features?.[0];
    if (feature && onBlockClick) {
      onBlockClick(feature.properties);
    }
  }, [onBlockClick]);

  // Determine which color expression to use
  const fillColorExpression = activeLayer === 'lst' ? LST_FILL_COLOR_EXPRESSION : TVS_FILL_COLOR_EXPRESSION;

  const fillLayerStyle = {
    id: 'blocks-fill',
    type: 'fill',
    paint: {
      'fill-color': fillColorExpression,
      'fill-opacity': [
        'case',
        ['==', ['get', 'block_id'], selectedBlockId || ''],
        0.9,
        ['==', ['get', 'block_id'], hoveredBlockId || ''],
        0.85,
        0.75,
      ],
    },
  };

  const outlineLayerStyle = {
    id: 'blocks-outline',
    type: 'line',
    paint: {
      'line-color': [
        'case',
        ['==', ['get', 'block_id'], selectedBlockId || ''],
        '#FFFFFF',
        ['==', ['get', 'block_id'], hoveredBlockId || ''],
        'rgba(255,255,255,0.6)',
        'rgba(255,255,255,0.15)',
      ],
      'line-width': [
        'case',
        ['==', ['get', 'block_id'], selectedBlockId || ''],
        2,
        ['==', ['get', 'block_id'], hoveredBlockId || ''],
        1.5,
        0.5,
      ],
    },
  };

  // 3D extrusion layer
  const extrusionLayerStyle = {
    id: 'blocks-extrusion',
    type: 'fill-extrusion',
    paint: {
      'fill-extrusion-color': fillColorExpression,
      'fill-extrusion-height': ['*', ['get', 'bldg_density'], 0.5],
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0.7,
    },
  };

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      style={{ width: '100%', height: '100%' }}
      mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      interactiveLayerIds={['blocks-fill']}
      onMouseMove={onHover}
      onMouseLeave={() => { setCursor('default'); setHoverInfo(null); }}
      onClick={onClick}
      cursor={cursor}
      fadeDuration={0}
    >
      {geojson && (
        <Source id="pune-blocks" type="geojson" data={geojson}>
          <Layer {...fillLayerStyle} />
          <Layer {...outlineLayerStyle} />
          {is3D && <Layer {...extrusionLayerStyle} />}
        </Source>
      )}

      {/* Hover Tooltip */}
      {hoverInfo && (() => {
        const tvsScore = hoverInfo.properties.tvs.toFixed(2);
        const tvsColor = hoverInfo.properties.tvs >= 0.8 ? '#D73027' : hoverInfo.properties.tvs >= 0.6 ? '#F46D43' : hoverInfo.properties.tvs >= 0.4 ? '#FEE090' : hoverInfo.properties.tvs >= 0.2 ? '#74ADD1' : '#4575B4';
        
        return (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={[0, -10]}
          >
            <div style={{
              padding: '14px 18px',
              background: 'rgba(8, 16, 30, 0.90)',
              backdropFilter: 'blur(30px) saturate(150%)',
              WebkitBackdropFilter: 'blur(30px) saturate(150%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
              maxWidth: '220px',
              pointerEvents: 'none'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>
                {hoverInfo.properties.neighborhood} · Block {hoverInfo.properties.block_id}
              </div>
              {/* TVS pill */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '3px 10px', borderRadius: '100px',
                background: `${tvsColor}25`, border: `1px solid ${tvsColor}60`,
                marginBottom: '8px'
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: tvsColor }} />
                <span style={{ fontSize: '12px', color: tvsColor, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  TVS {tvsScore}
                </span>
              </div>
              {/* Stats */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>LST Mean</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-mono)' }}>{hoverInfo.properties.lst_mean}°C</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>Pop Density</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-mono)' }}>{Number(hoverInfo.properties.pop_density).toLocaleString()}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                Click for full details →
              </div>
            </div>
          </Popup>
        );
      })()}

      {children}
    </Map>
  );
}
