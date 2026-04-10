'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

const MY_USER_ID = Math.random().toString(36).substring(7);
const MY_USERNAME = `Pilot-${MY_USER_ID}`;
const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946];

export default function NodeMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const myMarkerRef = useRef<any>(null);
  const peerMarkersRef = useRef<{ [id: string]: any }>({});
  const sensorsRef = useRef<{ [id: string]: any }>({});
  const polylineRef = useRef<any>(null);
  const hasFittedBounds = useRef(false);
  
  const [users, setUsers] = useState<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [geoError, setGeoError] = useState('');

  // 1. Load Leaflet Scripts & CSS via CDN
  useEffect(() => {
    if ((window as any).L) {
      setIsMapLoaded(true);
      return;
    }

    const cssInfo = document.createElement('link');
    cssInfo.rel = 'stylesheet';
    cssInfo.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(cssInfo);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => setIsMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!isMapLoaded || !mapContainer.current || mapRef.current) return;

    const L = (window as any).L;

    // Create Map Instance
    mapRef.current = L.map(mapContainer.current, {
        zoomControl: false // Custom placement later
    }).setView(DEFAULT_CENTER, 13);

    // Tiles (Free OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    // Initialize the line path layer for tracking trail
    polylineRef.current = L.polyline([], { 
        color: '#00f0ff', 
        weight: 3, 
        opacity: 0.7, 
        dashArray: '10, 10' 
    }).addTo(mapRef.current);

    // Add zoom controls cleanly
    L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

    return () => {
        // Safe unmount
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
        myMarkerRef.current = null;
        peerMarkersRef.current = {};
        sensorsRef.current = {};
        polylineRef.current = null;
        hasFittedBounds.current = false;
    };
  }, [isMapLoaded]);

  // 3. User Location Tracking
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !('geolocation' in navigator)) return;

    const L = (window as any).L;

    const myIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="width:16px; height:16px; background-color:#00f0ff; border-radius:50%; box-shadow:0 0 15px #00f0ff; border: 2px solid white;"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const latlng: [number, number] = [pos.coords.latitude, pos.coords.longitude];

        // First fix lock on
        if (!myMarkerRef.current) {
            myMarkerRef.current = L.marker(latlng, { icon: myIcon, zIndexOffset: 1000 })
                .bindTooltip("You", { permanent: false, direction: 'top' })
                .addTo(mapRef.current);
                
            // We won't strictly setView here anymore, because we want it to fitBounds on sensors!
            // mapRef.current.setView(latlng, 15);
        } else {
            // Smoothly move marker
            myMarkerRef.current.setLatLng(latlng);
        }

        // Add to polyline for path history
        if (polylineRef.current) {
            polylineRef.current.addLatLng(latlng);
        }

        // Broadcast to Backend
        fetch('/api/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: MY_USER_ID, name: MY_USERNAME, lat: latlng[0], lng: latlng[1] })
        }).catch(err => console.warn('Failed to post location to backend'));
      },
      (err) => {
        if (err.code === 1) setGeoError("Location permission denied.");
      },
      { enableHighAccuracy: false, maximumAge: 30000, timeout: 27000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isMapLoaded]);

  // 4. Polling for Other Crew Users
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    const L = (window as any).L;

    const peerIcon = L.divIcon({
        className: 'custom-peer-marker',
        html: `<div style="width:14px; height:14px; background-color:#ff7b00; border-radius:50%; box-shadow:0 0 10px #ff7b00; border: 2px solid white;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });

    const fetchPeers = async () => {
      try {
        const res = await fetch('/api/locations');
        if (res.ok) {
          const data = await res.json();
          const peers = data.filter((u: any) => u.id !== MY_USER_ID);
          setUsers(peers);

          const peerIds = new Set(peers.map((p: any) => p.id));

          // Remove disconnected maps
          Object.keys(peerMarkersRef.current).forEach(id => {
            if (!peerIds.has(id)) {
              mapRef.current.removeLayer(peerMarkersRef.current[id]);
              delete peerMarkersRef.current[id];
            }
          });

          // Update active peers
          peers.forEach((peer: any) => {
            const latlng: [number, number] = [peer.lat, peer.lng];
            if (peerMarkersRef.current[peer.id]) {
              peerMarkersRef.current[peer.id].setLatLng(latlng);
            } else {
              const marker = L.marker(latlng, { icon: peerIcon, zIndexOffset: 900 })
                 .bindTooltip(peer.name, { permanent: false, direction: 'top' })
                 .addTo(mapRef.current);
              peerMarkersRef.current[peer.id] = marker;
            }
          });
        }
      } catch (err) {}
    };

    const interval = setInterval(fetchPeers, 3000);
    return () => clearInterval(interval);
  }, [isMapLoaded]);

  // 5. IoT Sensor Tracking & Mapping
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    const L = (window as any).L;

    // Define interactive colored SVGs/classes
    const activeIcon = L.divIcon({
        className: 'custom-sensor-active',
        html: `<div style="width:12px; height:12px; background-color:#22c55e; border-radius:50%; box-shadow:0 0 12px #22c55e; border: 2px solid white;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });

    const faultyIcon = L.divIcon({
        className: 'custom-sensor-faulty',
        html: `<div style="width:14px; height:14px; background-color:#ef4444; border-radius:50%; box-shadow:0 0 20px #ef4444; border: 2px solid white;">
                  <div style="position: absolute; inset: 0; background-color: #ef4444; border-radius: 50%; opacity: 0.5; animation: pulse 1.5s infinite;"></div>
               </div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });

    const fetchSensors = async () => {
      try {
        const res = await fetch('/api/sensors');
        if (res.ok) {
          const sensors = await res.json();
          const currentIds = new Set(sensors.map((s: any) => s.id));

          // Cleanup missing sensors
          Object.keys(sensorsRef.current).forEach(id => {
            if (!currentIds.has(id)) {
              mapRef.current.removeLayer(sensorsRef.current[id]);
              delete sensorsRef.current[id];
            }
          });

          const boundsCoords: [number, number][] = [];

          sensors.forEach((s: any) => {
            const latlng: [number, number] = [s.lat, s.lng];
            boundsCoords.push(latlng);
            
            const icon = s.status === 'active' ? activeIcon : faultyIcon;
            
            // Generate clean popup UI
            const popupContent = `
               <div style="font-family: monospace; color: #1f2937; min-width: 140px;">
                  <strong style="color: ${s.status === 'active' ? '#16a34a' : '#dc2626'}; font-size: 14px;">${s.name}</strong><br/>
                  ID: <span style="color: #6b7280;">${s.id}</span><br/>
                  Status: <b style="color: ${s.status === 'active' ? '#16a34a' : '#dc2626'};">${s.status.toUpperCase()}</b><br/>
                  <div style="margin-top: 8px; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 4px;">
                     Lat: ${s.lat.toFixed(4)}<br/>
                     Lng: ${s.lng.toFixed(4)}
                  </div>
               </div>
            `;

            if (sensorsRef.current[s.id]) {
               // Fast update without re-initializing layer to maximize FPS
               const marker = sensorsRef.current[s.id];
               marker.setLatLng(latlng);
               marker.setIcon(icon);
               
               // Keep the popup bound intelligently
               marker.setPopupContent(popupContent);
            } else {
               // First time initialization
               const marker = L.marker(latlng, { icon, zIndexOffset: 500 })
                 .bindPopup(popupContent, { minWidth: 140, autoClose: false })
                 .addTo(mapRef.current);
               sensorsRef.current[s.id] = marker;
            }
          });

          // Only physically calculate boundaries on the very first injection to avoid jumping frames
          if (!hasFittedBounds.current && boundsCoords.length > 0) {
              mapRef.current.fitBounds(boundsCoords, { padding: [40, 40] });
              hasFittedBounds.current = true;
          }
        }
      } catch (err) {
         console.warn("Sensor fetch block execution failed.");
      }
    };

    fetchSensors();
    const interval = setInterval(fetchSensors, 3000);
    return () => clearInterval(interval);
  }, [isMapLoaded]);

  // Locate Me User Function
  const handleLocateMe = useCallback(() => {
    if (myMarkerRef.current && mapRef.current) {
      mapRef.current.setView(myMarkerRef.current.getLatLng(), 15);
    }
  }, []);

  return (
    <div className="relative w-full h-full bg-[#050510] overflow-hidden rounded-xl mx-auto border border-white/5 leaflet-dark-container">
      {/* 
        CSS Filter globally applied inside this scope to invert standard white OSM tiles
        into a sleek deep-space dark mode matrix!
        We also include custom generic CSS pulses for the markers.
      */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Only apply dark filter to the tile layer, NOT to markers/overlays */
        .leaflet-dark-container .leaflet-tile-pane {
           filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
        /* Keep marker pane, overlay pane, and popup pane unfiltered/color-correct */
        .leaflet-dark-container .leaflet-marker-pane,
        .leaflet-dark-container .leaflet-overlay-pane,
        .leaflet-dark-container .leaflet-popup-pane,
        .leaflet-dark-container .leaflet-shadow-pane {
           filter: none !important;
        }
        /* Reset Leaflet default divIcon white box so custom dots show cleanly */
        .leaflet-dark-container .leaflet-div-icon {
           background: transparent !important;
           border: none !important;
        }
        .leaflet-dark-container .leaflet-control-zoom a {
           background-color: rgba(0,0,0,0.6) !important;
           color: white !important;
           border-color: rgba(255,255,255,0.1) !important;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(2.5); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          background: rgba(255,255,255,0.95);
          border-radius: 8px;
        }
        .leaflet-popup-tip {
          background: rgba(255,255,255,0.95);
        }
      `}}/>

      {/* The raw map target */}
      <div ref={mapContainer} className="w-full h-full z-0" />

      {/* IoT Active Legend Overlay */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-3 z-[1000] pointer-events-none shadow-xl flex flex-col gap-2">
         <h4 className="font-mono text-xs text-gray-400 mb-1 border-b border-white/10 pb-1">OSM SENSOR MATRIX</h4>
         
         {/* Teams */}
         <div className="flex flex-col gap-1.5 mt-1">
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse"></span>
              <span className="text-[10px] text-white tracking-widest uppercase">Self Tracking</span>
           </div>
           {users.length > 0 && (
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff7b00]"></span>
                <span className="text-[10px] text-white tracking-widest uppercase">Active Crews ({users.length})</span>
             </div>
           )}
         </div>

         <div className="w-full h-[1px] bg-white/10 my-1"></div>

         {/* Sensors Legend */}
         <div className="flex flex-col gap-1.5">
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></span>
              <span className="text-[10px] text-gray-300 tracking-widest uppercase">Active Node</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444] animate-pulse"></span>
              <span className="text-[10px] text-gray-300 tracking-widest uppercase">Faulty Node</span>
           </div>
         </div>
      </div>
      
      {/* Locate Me Interaction Button */}
      <button 
        onClick={handleLocateMe}
         className="absolute bottom-6 right-6 bg-black/80 hover:bg-[#00f0ff] hover:text-black border border-white/10 text-white p-3 rounded-full transition-colors z-[1000] shadow-[0_0_15px_rgba(0,0,0,0.5)]"
         title="Center on my location"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      {/* Error Displays */}
      {geoError && (
        <div className="absolute top-4 right-4 bg-red-900/80 text-white p-2 rounded text-xs border border-red-500/50 z-[1000] max-w-xs text-right shadow-xl">
          {geoError}
        </div>
      )}
    </div>
  );
}
