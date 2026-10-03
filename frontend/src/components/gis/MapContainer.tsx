import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, MapPin, Eye, Satellite, Mountain, Map as MapIcon, 
  Maximize2, ZoomIn, ZoomOut, Compass, Sparkles 
} from 'lucide-react';
import { Intervention, Watershed } from '../../types';

interface MapContainerProps {
  watersheds?: Watershed[];
  interventions?: Intervention[];
  selectedInterventionId?: string | null;
  onSelectIntervention?: (intervention: Intervention) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  showLayerControls?: boolean;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  watersheds = [],
  interventions = [],
  selectedInterventionId = null,
  onSelectIntervention,
  center = [22.2541, 70.7812], // Rajkot centroid by default
  zoom = 13,
  height = '500px',
  showLayerControls = true
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMap = useRef<L.Map | null>(null);
  
  // Layer references
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerLayerGroup = useRef<L.LayerGroup | null>(null);
  const polygonLayerGroup = useRef<L.LayerGroup | null>(null);
  const drainageLayerGroup = useRef<L.LayerGroup | null>(null);
  const bufferLayerGroup = useRef<L.LayerGroup | null>(null);

  // Basemap & Layer toggles
  const [basemap, setBasemap] = useState<'satellite' | 'carto' | 'topo'>('satellite');
  const [showInterventions, setShowInterventions] = useState(true);
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [showDrainage, setShowDrainage] = useState(true);
  const [showBuffers, setShowBuffers] = useState(false);

  // Basemap Tile URLs
  const basemapUrls = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    carto: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    },
    topo: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
    });

    // Add Initial Basemap (Satellite by default for real earth observation experience!)
    const activeTileConfig = basemapUrls[basemap];
    const baseTile = L.tileLayer(activeTileConfig.url, {
      attribution: activeTileConfig.attribution,
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = baseTile;

    // Zoom control in top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    leafletMap.current = map;
    polygonLayerGroup.current = L.layerGroup().addTo(map);
    drainageLayerGroup.current = L.layerGroup().addTo(map);
    bufferLayerGroup.current = L.layerGroup().addTo(map);
    markerLayerGroup.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  // Update Basemap Tiles when selected
  useEffect(() => {
    if (!leafletMap.current) return;
    if (tileLayerRef.current) {
      leafletMap.current.removeLayer(tileLayerRef.current);
    }
    const config = basemapUrls[basemap];
    const newTile = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: 19
    }).addTo(leafletMap.current);
    tileLayerRef.current = newTile;
  }, [basemap]);

  // Center update
  useEffect(() => {
    if (leafletMap.current && center) {
      leafletMap.current.setView(center, zoom, { animate: true });
    }
  }, [center[0], center[1], zoom]);

  // Render Watershed Boundary Polygons
  useEffect(() => {
    if (!polygonLayerGroup.current) return;
    polygonLayerGroup.current.clearLayers();

    if (!showBoundaries) return;

    const isSatellite = basemap === 'satellite';

    watersheds.forEach((ws) => {
      try {
        const geojson = JSON.parse(ws.geom_geojson);
        const poly = L.geoJSON(geojson, {
          style: {
            color: isSatellite ? '#00e5ff' : '#0E8A42',
            weight: 3,
            opacity: 0.95,
            fillColor: isSatellite ? '#00e5ff' : '#0E8A42',
            fillOpacity: isSatellite ? 0.12 : 0.08,
            dashArray: '6, 6'
          }
        });
        poly.bindTooltip(
          `<strong>${ws.name}</strong><br/>Code: <code>${ws.code}</code><br/>Area: ${ws.area_ha.toLocaleString()} ha<br/>Health Index: ${ws.health_index}/100`,
          { sticky: true, className: 'text-xs rounded-xl shadow-lg border border-slate-200' }
        );
        polygonLayerGroup.current?.addLayer(poly);
      } catch (err) {
        console.error('Failed to parse watershed boundary GeoJSON:', err);
      }
    });
  }, [watersheds, showBoundaries, basemap]);

  // Render Synthetic Drainage Network
  useEffect(() => {
    if (!drainageLayerGroup.current) return;
    drainageLayerGroup.current.clearLayers();

    if (!showDrainage) return;

    const isSatellite = basemap === 'satellite';

    const streamCoords = [
      [[22.285, 70.760], [22.270, 70.772], [22.254, 70.781]],
      [[22.235, 70.795], [22.245, 70.788], [22.254, 70.781]],
      [[22.254, 70.781], [22.258, 70.798], [22.265, 70.820], [22.275, 70.840]]
    ];

    streamCoords.forEach((coords, idx) => {
      const line = L.polyline(coords as [number, number][], {
        color: isSatellite ? '#38bdf8' : '#0265D2',
        weight: idx === 2 ? 4 : 2.5,
        opacity: 0.9,
      });
      line.bindTooltip(
        idx === 2 ? 'Khirasara Main Nala (Strahler Order 2 - Check Dam Axis)' : 'Order 1 Tributary Channel',
        { sticky: true, className: 'text-xs' }
      );
      drainageLayerGroup.current?.addLayer(line);
    });
  }, [showDrainage, basemap]);

  // Render Hydrologic Buffers (100m influence zones)
  useEffect(() => {
    if (!bufferLayerGroup.current) return;
    bufferLayerGroup.current.clearLayers();

    if (!showBuffers) return;

    interventions.forEach((iv) => {
      const circle = L.circle([iv.latitude, iv.longitude], {
        radius: 100, // 100 meter buffer
        color: '#10b981',
        weight: 1.5,
        fillColor: '#10b981',
        fillOpacity: 0.15,
        dashArray: '3, 3'
      });
      circle.bindTooltip(`100m Hydrologic Catchment Buffer: ${iv.work_id}`, { sticky: true });
      bufferLayerGroup.current?.addLayer(circle);
    });
  }, [interventions, showBuffers]);

  // Render Intervention Point Markers
  useEffect(() => {
    if (!markerLayerGroup.current) return;
    markerLayerGroup.current.clearLayers();

    if (!showInterventions) return;

    interventions.forEach((iv) => {
      const isSelected = selectedInterventionId === iv.id;

      // Color coding from JALDRISHTI design system
      let pinColor = '#0284c7'; // Blue
      let ringColor = 'rgba(2, 132, 199, 0.4)';

      if (iv.decision_status === 'POSITIVE_SIGNAL') {
        pinColor = '#0E8A42'; // Vibrant DRISHTI Green
        ringColor = 'rgba(14, 138, 66, 0.4)';
      } else if (iv.decision_status === 'NEGATIVE_SIGNAL') {
        pinColor = '#dc2626'; // Red
        ringColor = 'rgba(220, 38, 38, 0.4)';
      } else if (iv.decision_status === 'NEEDS_VERIFICATION') {
        pinColor = '#d97706'; // Amber
        ringColor = 'rgba(217, 119, 6, 0.4)';
      }

      const iconHtml = `
        <div style="
          width: ${isSelected ? '36px' : '28px'};
          height: ${isSelected ? '36px' : '28px'};
          background: linear-gradient(135deg, ${pinColor}, ${pinColor}dd);
          border: 2.5px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 4px 14px ${ringColor}, 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          cursor: pointer;
          transform: translate(-50%, -50%);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          ${isSelected ? 'outline: 4px solid rgba(2, 101, 210, 0.6); transform: translate(-50%, -50%) scale(1.15); z-index: 1000;' : ''}
        ">
          <svg width="${isSelected ? '18' : '14'}" height="${isSelected ? '18' : '14'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-marker',
        iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
        iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14]
      });

      const marker = L.marker([iv.latitude, iv.longitude], { icon: customIcon });

      const statusBadgeClass = 
        iv.decision_status === 'POSITIVE_SIGNAL' ? 'background: #dcfce7; color: #166534;' :
        iv.decision_status === 'NEEDS_VERIFICATION' ? 'background: #fef3c7; color: #92400e;' :
        iv.decision_status === 'NEGATIVE_SIGNAL' ? 'background: #fee2e2; color: #991b1b;' : 'background: #e0f2fe; color: #075985;';

      const popupContent = `
        <div style="font-family: 'Inter', sans-serif; padding: 4px; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
            <span style="font-weight: 700; font-size: 13px; color: #0f172a; font-family: monospace;">${iv.work_id}</span>
            <span style="font-size: 10px; padding: 2px 6px; border-radius: 9999px; font-weight: 700; text-transform: uppercase; ${statusBadgeClass}">
              ${iv.decision_status.replace('_', ' ')}
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; line-height: 1.5;">
            <div>Structure: <strong style="color: #0f172a;">${iv.structure_type}</strong></div>
            <div>Readiness Score: <strong style="color: #0E8A42;">${iv.evidence_readiness_score}/100</strong></div>
            <div>Stream Drainage: <strong>Order ${iv.stream_order || 1}</strong> (${iv.slope_pct || 2.4}% slope)</div>
            <div>Coordinates: <code style="font-size: 10px; color: #64748b;">${iv.latitude.toFixed(4)}°N, ${iv.longitude.toFixed(4)}°E</code></div>
          </div>
          <button id="btn-inspect-${iv.id}" style="margin-top: 10px; width: 100%; padding: 7px; background: #0265D2; color: #ffffff; font-size: 11px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 2px 4px rgba(2,101,210,0.2);">
            <span>Inspect Evidence Drawer</span>
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280 });

      marker.on('click', () => {
        if (onSelectIntervention) onSelectIntervention(iv);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${iv.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectIntervention) onSelectIntervention(iv);
          };
        }
      });

      markerLayerGroup.current?.addLayer(marker);
    });
  }, [interventions, selectedInterventionId, showInterventions]);

  const fitToWatershed = () => {
    if (!leafletMap.current || watersheds.length === 0) return;
    try {
      const geojson = JSON.parse(watersheds[0].geom_geojson);
      const tempLayer = L.geoJSON(geojson);
      leafletMap.current.fitBounds(tempLayer.getBounds(), { padding: [30, 30] });
    } catch (e) {
      leafletMap.current.setView(center, 13);
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md group" style={{ height }}>
      {/* Leaflet Map DOM Element */}
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* Top Left: Basemap Mode Switcher (Satellite 🛰️ vs Clean 🗺️ vs Topo ⛰️) */}
      <div className="absolute top-4 left-4 z-20 flex items-center bg-white/95 backdrop-blur-md rounded-xl p-1 border border-slate-200 shadow-xl">
        <button
          onClick={() => setBasemap('satellite')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            basemap === 'satellite'
              ? 'bg-forest-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="High-Resolution Real Satellite Imagery"
        >
          <Satellite className="w-3.5 h-3.5" />
          <span>Real Satellite</span>
        </button>

        <button
          onClick={() => setBasemap('carto')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            basemap === 'carto'
              ? 'bg-forest-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Clean Light Government Carto Basemap"
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>Clean Map</span>
        </button>

        <button
          onClick={() => setBasemap('topo')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            basemap === 'topo'
              ? 'bg-forest-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Topographic Elevation & Contours"
        >
          <Mountain className="w-3.5 h-3.5" />
          <span>Terrain Topo</span>
        </button>
      </div>

      {/* Top Right Zoom to Boundary Button */}
      <button
        onClick={fitToWatershed}
        className="absolute top-4 right-14 z-20 p-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg text-slate-700 hover:text-forest-900 hover:bg-slate-50 transition-colors"
        title="Fit Map to Watershed Boundary"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      {/* Floating GIS Vector Overlays & Controls */}
      {showLayerControls && (
        <div className="absolute top-16 left-4 z-20 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-200 shadow-xl text-xs space-y-2 max-w-[220px]">
          <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-100 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-forest-800" />
              <span>GIS Thematic Layers</span>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={showBoundaries}
              onChange={(e) => setShowBoundaries(e.target.checked)}
              className="rounded text-forest-900 focus:ring-forest-900"
            />
            <span>Watershed Boundary Polygon</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={showDrainage}
              onChange={(e) => setShowDrainage(e.target.checked)}
              className="rounded text-water-600 focus:ring-water-600"
            />
            <span>Drainage Network (DEM D8)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={showInterventions}
              onChange={(e) => setShowInterventions(e.target.checked)}
              className="rounded text-forest-900 focus:ring-forest-900"
            />
            <span>Intervention Markers ({interventions.length})</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={showBuffers}
              onChange={(e) => setShowBuffers(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-600"
            />
            <span>100m Catchment Buffers</span>
          </label>
        </div>
      )}

      {/* Floating Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-200 shadow-xl text-[11px] space-y-1.5">
        <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center justify-between gap-4">
          <span>Signal Legend</span>
          <span className="text-[9px] font-mono text-slate-400">Esri / Sentinel-2</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0E8A42] ring-1 ring-white" />
          <span className="text-slate-700 font-medium">Observed Positive (Greening &gt; 0)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#d97706] ring-1 ring-white" />
          <span className="text-slate-700 font-medium">Needs Verification (GPS / Data Gap)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] ring-1 ring-white" />
          <span className="text-slate-700 font-medium">Observed Negative / Stress</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] ring-1 ring-white" />
          <span className="text-slate-700 font-medium">Inconclusive (Marginal Delta)</span>
        </div>
      </div>
    </div>
  );
};
