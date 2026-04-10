'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import "leaflet-defaulticon-compatibility";
import { useMemo } from 'react';

interface TollLocation {
  id: number;
  lat: number;
  lng: number;
  name: string;
  status: 'online' | 'warning' | 'offline';
  openTickets: number;
}

export default function KarnatakaMap({ selectedTollId, onTollSelect }: { selectedTollId: number, onTollSelect: (id: number) => void }) {
  
  // Center of Karnataka roughly
  const mapCenter = { lat: 15.3173, lng: 75.7139 };

  // Generate 20 pseudo-random toll plazas within rough Karnataka boundaries
  const tolls: TollLocation[] = useMemo(() => {
    const list: TollLocation[] = [];
    const minLat = 11.5;
    const maxLat = 18.2;
    const minLng = 74.0;
    const maxLng = 78.4;
    
    // Seeded random-ish behavior based on ID
    for (let i = 1; i <= 20; i++) {
      // Deterministic offset so it stays static
      const latOffset = (Math.sin(i * 12.9898) * 0.5 + 0.5) * (maxLat - minLat);
      const lngOffset = (Math.cos(i * 78.233) * 0.5 + 0.5) * (maxLng - minLng);
      
      let status: 'online' | 'warning' | 'offline' = 'online';
      if (i % 7 === 0) status = 'warning';
      if (i % 13 === 0) status = 'offline';

      list.push({
        id: i,
        lat: minLat + latOffset,
        lng: minLng + lngOffset,
        name: `Toll Plaza ${i}`,
        status,
        openTickets: (i * 3) % 8, // dummy ticket counts
      });
    }
    return list;
  }, []);

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-inner z-0 relative isolate">
      <MapContainer 
        center={[mapCenter.lat, mapCenter.lng]} 
        zoom={6} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {tolls.map((toll) => (
          <Marker 
            key={toll.id}
            position={[toll.lat, toll.lng]}
            eventHandlers={{
              click: () => onTollSelect(toll.id)
            }}
          >
            <Popup className="rounded-lg shadow-lg">
              <div className="p-1 min-w-[200px]">
                <h3 className="font-bold text-slate-800 text-base mb-1">{toll.name}</h3>
                <div className="flex items-center space-x-2 text-xs mb-3">
                  <span className={`h-2 w-2 rounded-full ${
                    toll.status === 'online' ? 'bg-emerald-500' : 
                    toll.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  <span className="uppercase tracking-widest font-semibold text-slate-500">
                    {toll.status}
                  </span>
                </div>
                
                <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-sm">
                  <span className="text-slate-500">Open Tickets:</span>
                  <span className={`font-bold ${toll.openTickets > 0 ? 'text-red-500' : 'text-slate-700'}`}>
                    {toll.openTickets}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <div className="absolute top-4 right-4 z-[400] pointer-events-none bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-2 rounded shadow-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
        <div className="font-bold mb-1">Legend</div>
        <div className="flex items-center space-x-2"><span className="h-2 w-2 rounded-full bg-emerald-500"/><span>Online</span></div>
        <div className="flex items-center space-x-2"><span className="h-2 w-2 rounded-full bg-amber-500"/><span>Warning</span></div>
        <div className="flex items-center space-x-2"><span className="h-2 w-2 rounded-full bg-red-500"/><span>Offline</span></div>
      </div>
    </div>
  );
}
