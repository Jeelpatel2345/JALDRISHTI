import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, MapPin, Eye, Satellite, Mountain, Map as MapIcon, 
  Maximize2, Minimize2, ZoomIn, ZoomOut, Compass, Sparkles, Search, Loader2, Navigation, X, ChevronDown, Check, Info
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
  center = [22.2541, 70.7812], // Default centroid
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

  // Dropdown states to keep map canvas 100% clean
  const [layersMenuOpen, setLayersMenuOpen] = useState(false);
  const [teleportMenuOpen, setTeleportMenuOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Real-World Geocoding Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchMarkerRef = useRef<L.Marker | null>(null);

  // Real-World National Benchmark Watersheds Across India
  const benchmarkRegions = [
    { label: '🇮🇳 Pan-India Grid', center: [22.5000, 78.9000] as [number, number], zoom: 5 },
    { label: 'Ralegan Siddhi (Ahmednagar, MH)', center: [19.0425, 74.4981] as [number, number], zoom: 14 },
    { label: 'Arvari River Catchment (Alwar, RJ)', center: [27.3210, 76.2750] as [number, number], zoom: 13 },
    { label: 'Jhabua Tribal Catchment (MP)', center: [22.7540, 74.5680] as [number, number], zoom: 13 },
    { label: 'Shirapur Ridge Basin (Solapur, MH)', center: [17.6250, 75.8820] as [number, number], zoom: 13 },
    { label: 'Penna Catchment (Anantapur, AP)', center: [14.6720, 77.6120] as [number, number], zoom: 13 },
    { label: 'Garhwal Springshed (Tehri, UK)', center: [30.3720, 78.4650] as [number, number], zoom: 13 },
    { label: 'Khirasara-Aji (Rajkot, GJ)', center: [22.2541, 70.7812] as [number, number], zoom: 13 },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await res.json();
      setSearchResults(data);
      setShowSearchResults(true);
      if (data.length > 0) {
        flyToLocation(parseFloat(data[0].lat), parseFloat(data[0].lon), data[0].display_name);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const flyToLocation = (lat: number, lon: number, name: string) => {
    if (!leafletMap.current) return;
    leafletMap.current.flyTo([lat, lon], 14, { duration: 1.5 });
    setShowSearchResults(false);

    if (searchMarkerRef.current) {
      leafletMap.current.removeLayer(searchMarkerRef.current);
    }

    const pinIcon = L.divIcon({
      html: `
        <div style="background: #e11d48; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(225,29,72,0.8); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `,
      className: 'search-pin',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker([lat, lon], { icon: pinIcon })
      .bindPopup(`<div style="padding: 4px; font-size: 11px;"><strong>${name}</strong><br/><span style="color:#64748b;">${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E</span></div>`)
      .addTo(leafletMap.current);
    marker.openPopup();
    searchMarkerRef.current = marker;
  };

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

  // Invalidate map size on fullscreen toggle
  useEffect(() => {
    if (leafletMap.current) {
      setTimeout(() => {
        leafletMap.current?.invalidateSize();
      }, 250);
    }
  }, [isFullscreen]);

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
        idx === 2 ? 'Khirasara Main Stream (Strahler Order 2 - Check Dam Axis)' : 'Order 1 Tributary Channel',
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
        pinColor = '#0E8A42'; // Vibrant Green
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

      const getMarkerThumbnail = (type: string): string => {
        const s = type.toLowerCase();
        if (s.includes('johad') || s.includes('nadi')) return '/images/real/johad.jpg';
        if (s.includes('percolation tank')) return '/images/real/percolation_tank.jpg';
        if (s.includes('contour') || s.includes('trench')) return '/images/real/contour_trench.jpg';
        if (s.includes('farm pond') || s.includes('khet talab') || s.includes('pond')) return '/images/real/farm_pond.jpg';
        if (s.includes('spring')) return '/images/real/spring_chamber.jpg';
        if (s.includes('chauka') || s.includes('grassland')) return '/images/real/chauka_system.jpg';
        return '/images/real/check_dam.jpg';
      };

      const popupContent = `
        <div style="font-family: 'Inter', sans-serif; padding: 2px; min-width: 230px;">
          <div style="border-radius: 8px; overflow: hidden; height: 110px; margin-bottom: 8px; position: relative; background: #0f172a; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
            <img src="${getMarkerThumbnail(iv.structure_type)}" onerror="this.src='/images/real/check_dam.jpg'" style="width: 100%; height: 100%; object-fit: cover;" alt="${iv.structure_type}" />
            <span style="position: absolute; bottom: 6px; left: 6px; background: rgba(15,23,42,0.85); color: #ffffff; font-size: 10px; padding: 2px 7px; border-radius: 4px; font-weight: 600; backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.2);">
              ${iv.structure_type}
            </span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
            <span style="font-weight: 700; font-size: 13px; color: #0f172a; font-family: monospace;">${iv.work_id}</span>
            <span style="font-size: 10px; padding: 2px 6px; border-radius: 9999px; font-weight: 700; text-transform: uppercase; ${statusBadgeClass}">
              ${iv.decision_status.replace('_', ' ')}
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; line-height: 1.5;">
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

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <div className={`space-y-3 transition-all ${isFullscreen ? 'fixed inset-0 z-[9999] bg-slate-900 p-4 flex flex-col' : ''}`}>
      {/* 
        EXTERNAL COMMAND TOOLBAR (Outside the map! Zero clutter inside canvas)
      */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
        {/* Left: Basemap Switcher + GIS Layers Dropdown + Benchmark Teleporter Dropdown */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Basemap Segmented Toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setBasemap('satellite')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                basemap === 'satellite'
                  ? 'bg-[#0265D2] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="True-color High Resolution Esri Satellite"
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>Satellite</span>
            </button>
            <button
              type="button"
              onClick={() => setBasemap('carto')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                basemap === 'carto'
                  ? 'bg-[#0265D2] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Clean Government Vector Carto Basemap"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Clean Map</span>
            </button>
            <button
              type="button"
              onClick={() => setBasemap('topo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                basemap === 'topo'
                  ? 'bg-[#0265D2] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Topographic Elevation & Contours"
            >
              <Mountain className="w-3.5 h-3.5" />
              <span>Terrain</span>
            </button>
          </div>

          {/* GIS Layers Dropdown */}
          {showLayerControls && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setLayersMenuOpen(!layersMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-[#0265D2]" />
                <span>GIS Layers</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {layersMenuOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3 z-50 text-xs space-y-2.5 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1.5">
                    <span>Thematic Overlays</span>
                    <button onClick={() => setLayersMenuOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={showBoundaries}
                      onChange={(e) => setShowBoundaries(e.target.checked)}
                      className="rounded text-[#0265D2]"
                    />
                    <span>Watershed Boundaries</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={showDrainage}
                      onChange={(e) => setShowDrainage(e.target.checked)}
                      className="rounded text-[#0265D2]"
                    />
                    <span>Stream Drainage Network</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={showInterventions}
                      onChange={(e) => setShowInterventions(e.target.checked)}
                      className="rounded text-[#0265D2]"
                    />
                    <span>Intervention Pins ({interventions.length})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={showBuffers}
                      onChange={(e) => setShowBuffers(e.target.checked)}
                      className="rounded text-[#0265D2]"
                    />
                    <span>100m Catchment Buffers</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Jump to Benchmark Region Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setTeleportMenuOpen(!teleportMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-[#0E8A42]" />
              <span>📍 Jump to Region</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {teleportMenuOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl p-1.5 z-50 text-xs space-y-0.5 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2.5 py-1.5 border-b">
                  National Watersheds
                </span>
                {benchmarkRegions.map((reg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (leafletMap.current) {
                        leafletMap.current.flyTo(reg.center, reg.zoom, { duration: 1.5 });
                      }
                      setTeleportMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-sky-50 hover:text-[#0265D2] text-slate-700 font-semibold transition-colors flex items-center justify-between"
                  >
                    <span>{reg.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Real-World Search Bar (Outside the map!) */}
        <div className="relative flex-1 max-w-md">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any place in India / World..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0265D2] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-3.5 py-2 bg-[#0265D2] hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs flex-shrink-0"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Fly To</span>}
            </button>
          </form>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-2xl p-1 z-50 max-h-48 overflow-y-auto text-xs space-y-0.5 animate-in fade-in slide-in-from-top-1">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => flyToLocation(parseFloat(r.lat), parseFloat(r.lon), r.display_name)}
                  className="w-full text-left p-2 rounded-lg hover:bg-sky-50 text-slate-800 transition-colors flex items-start gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#0265D2] flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2 text-[11px] leading-snug">{r.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Reset Fit & Fullscreen Enhance Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fitToWatershed}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            title="Fit Map to Active Watershed"
          >
            <Compass className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Fit Boundary</span>
          </button>

          {/* Enhance & Open Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all ${
              isFullscreen
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
            title="Expand to Fullscreen on large monitor"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Enhance & Expand'}</span>
          </button>
        </div>
      </div>

      {/* 
        CLEAN MAP CANVAS (100% clean view of satellite earth observation)
      */}
      <div 
        className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md ${
          isFullscreen ? 'flex-1 rounded-none border-none' : ''
        }`} 
        style={{ height: isFullscreen ? 'calc(100vh - 90px)' : height }}
      >
        {/* Leaflet Map DOM Element */}
        <div ref={mapRef} className="w-full h-full z-0" />

        {/* Floating Compact Signal Legend (Collapsible) */}
        <div className="absolute bottom-4 left-4 z-20">
          <button
            type="button"
            onClick={() => setLegendOpen(!legendOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg text-[11px] font-bold text-slate-700 hover:bg-white transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-[#0265D2]" />
            <span>Signal Legend</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${legendOpen ? 'rotate-180' : ''}`} />
          </button>

          {legendOpen && (
            <div className="mt-1.5 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200 shadow-2xl text-[11px] space-y-1.5 w-60 animate-in fade-in slide-in-from-bottom-2">
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center justify-between pb-1 border-b">
                <span>Outcome Signals</span>
                <span className="text-[9px] font-mono text-slate-400">Sentinel-2</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0E8A42] ring-1 ring-white" />
                <span className="text-slate-700 font-medium">Observed Positive (Greening &gt; 0)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d97706] ring-1 ring-white" />
                <span className="text-slate-700 font-medium">Needs Verification (GPS Gap)</span>
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
          )}
        </div>

        {/* If in Fullscreen Mode: Floating Exit Button in corner */}
        {isFullscreen && (
          <button
            type="button"
            onClick={toggleFullscreen}
            className="absolute top-4 right-14 z-30 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-2xl flex items-center gap-1.5 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Close Fullscreen</span>
          </button>
        )}
      </div>
    </div>
  );
};
