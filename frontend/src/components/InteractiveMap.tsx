import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ShieldCheck,
  Radio,
  Clock,
  Car,
  Bike,
  Sparkles,
  AlertCircle,
  LocateFixed,
  Info,
} from 'lucide-react';
import { Address, Provider } from '../types';
import { NASHIK_LOCALITY_COORDS, NASHIK_HUBS } from '../data/mockData';

interface InteractiveMapProps {
  customerAddress: Address;
  provider?: Provider;
  bookingStatus?: string;
  height?: string;
  showAllHubs?: boolean;
  showTrafficOverlay?: boolean;
  onSelectHub?: (hubId: string) => void;
  className?: string;
  isSimulatingDefault?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  customerAddress,
  provider,
  bookingStatus = 'On the Way',
  height = '360px',
  showAllHubs = true,
  showTrafficOverlay = true,
  onSelectHub,
  className = '',
  isSimulatingDefault = true,
}) => {
  // Map View State
  const [mapType, setMapType] = useState<'streets' | 'satellite' | 'terrain'>('streets');
  const [zoomLevel, setZoomLevel] = useState<number>(14);
  const [trafficEnabled, setTrafficEnabled] = useState<boolean>(showTrafficOverlay);
  const [selectedHubId, setSelectedHubId] = useState<string | null>(null);

  // Simulation State for Real-Time Technician Movement
  const [progress, setProgress] = useState<number>(0.35); // 0.0 to 1.0 along the route
  const [isPlaying, setIsPlaying] = useState<boolean>(isSimulatingDefault && bookingStatus === 'On the Way');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [viewCenterMode, setViewCenterMode] = useState<'follow-pro' | 'center-fit' | 'destination'>('center-fit');

  // Customer Target Coordinates
  const targetCoords = NASHIK_LOCALITY_COORDS[customerAddress.locality] || {
    lat: customerAddress.lat || 19.9982,
    lng: customerAddress.lng || 73.7621,
  };

  // Provider Start Coordinates (Nearest Hub or Assigned Location)
  const startCoords = {
    lat: targetCoords.lat - 0.015,
    lng: targetCoords.lng - 0.018,
  };

  // Waypoints connecting the technician to destination along Nashik streets
  const routePoints = [
    { lat: startCoords.lat, lng: startCoords.lng, name: 'Dispatch Station' },
    { lat: startCoords.lat + 0.004, lng: startCoords.lng + 0.005, name: 'Main Road Junction' },
    { lat: startCoords.lat + 0.009, lng: startCoords.lng + 0.011, name: 'Canada Corner Corridor' },
    { lat: startCoords.lat + 0.012, lng: startCoords.lng + 0.015, name: 'Near Landmark Point' },
    { lat: targetCoords.lat, lng: targetCoords.lng, name: customerAddress.locality },
  ];

  // Calculate current technician position based on progress
  const getCurrentPosition = (pct: number) => {
    if (pct <= 0) return routePoints[0];
    if (pct >= 1) return routePoints[routePoints.length - 1];

    const segmentCount = routePoints.length - 1;
    const scaledPct = pct * segmentCount;
    const index = Math.floor(scaledPct);
    const remainder = scaledPct - index;

    const p1 = routePoints[index];
    const p2 = routePoints[Math.min(index + 1, routePoints.length - 1)];

    return {
      lat: p1.lat + (p2.lat - p1.lat) * remainder,
      lng: p1.lng + (p2.lng - p1.lng) * remainder,
    };
  };

  const currentProPosition = getCurrentPosition(progress);

  // Live simulation tick timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return Math.min(1, prev + 0.008 * speedMultiplier);
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier]);

  // Derived real-time distance and ETA
  const remainingDistanceKm = Math.max(0.2, ((1 - progress) * 3.8)).toFixed(1);
  const remainingEtaMins = Math.max(1, Math.ceil((1 - progress) * 14));

  // Convert GPS Coordinates to Relative SVG Canvas Percentages (0% to 100%)
  const minLat = Math.min(...routePoints.map((p) => p.lat), targetCoords.lat - 0.02);
  const maxLat = Math.max(...routePoints.map((p) => p.lat), targetCoords.lat + 0.02);
  const minLng = Math.min(...routePoints.map((p) => p.lng), targetCoords.lng - 0.02);
  const maxLng = Math.max(...routePoints.map((p) => p.lng), targetCoords.lng + 0.02);

  const coordToPct = (coord: { lat: number; lng: number }) => {
    const x = ((coord.lng - minLng) / (maxLng - minLng)) * 80 + 10;
    const y = 90 - ((coord.lat - minLat) / (maxLat - minLat)) * 80;
    return { x: Math.max(8, Math.min(92, x)), y: Math.max(8, Math.min(92, y)) };
  };

  const startPct = coordToPct(startCoords);
  const destPct = coordToPct(targetCoords);
  const proPct = coordToPct(currentProPosition);

  // Generate SVG polyline path
  const svgPathData = routePoints
    .map((pt, i) => {
      const p = coordToPct(pt);
      return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
    })
    .join(' ');

  return (
    <div
      id="interactive-map-container"
      className={`relative w-full rounded-2xl overflow-hidden border border-[#c3c6d6]/70 shadow-sm select-none transition-all ${className}`}
      style={{ height }}
    >
      {/* 1. Map Canvas Background */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          mapType === 'satellite'
            ? 'bg-[#1b263b]'
            : mapType === 'terrain'
            ? 'bg-[#e8ece9]'
            : 'bg-[#f4f7f6]'
        }`}
      >
        {/* Grid pattern simulating map vector tiles */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              mapType === 'satellite'
                ? 'radial-gradient(#415a77 1px, transparent 1px), radial-gradient(#1e293b 1px, transparent 1px)'
                : 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        {/* Nashik Roads Visual Simulation */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#003d9b" />
              <stop offset="100%" stopColor="#006e2f" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#003d9b" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Background Arterial City Streets (Nashik Road Network) */}
          <path
            d="M 5 20 Q 40 45 95 30"
            fill="none"
            stroke={mapType === 'satellite' ? '#334155' : '#e2e8f0'}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 15 90 Q 50 50 85 10"
            fill="none"
            stroke={mapType === 'satellite' ? '#334155' : '#e2e8f0'}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 20 10 Q 55 50 80 85"
            fill="none"
            stroke={mapType === 'satellite' ? '#334155' : '#e2e8f0'}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 5 65 Q 45 60 95 80"
            fill="none"
            stroke={mapType === 'satellite' ? '#334155' : '#e2e8f0'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Traffic Flow Overlay */}
          {trafficEnabled && (
            <>
              {/* Green (Smooth Traffic) */}
              <path
                d="M 15 90 Q 35 70 50 50"
                fill="none"
                stroke="#22c55e"
                strokeWidth="1.8"
                strokeOpacity="0.7"
                strokeDasharray="4 2"
              />
              {/* Amber (Moderate) */}
              <path
                d="M 50 50 Q 65 35 85 10"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.2"
                strokeOpacity="0.7"
              />
              {/* Gangapur Road Corridor Green */}
              <path
                d="M 5 20 Q 40 45 60 38"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
                strokeOpacity="0.8"
              />
            </>
          )}

          {/* Active Navigation Route Path */}
          {/* Shadow Path */}
          <path
            d={svgPathData}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Completed Segment (Behind technician) */}
          <path
            d={svgPathData}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
        </svg>

        {/* Nashik Hub Markers (if showAllHubs enabled) */}
        {showAllHubs &&
          NASHIK_HUBS.map((hub) => {
            const pos = coordToPct(hub.coords);
            const isSelected = selectedHubId === hub.id;
            return (
              <div
                key={hub.id}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => {
                  setSelectedHubId(isSelected ? null : hub.id);
                  if (onSelectHub) onSelectHub(hub.id);
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-125 ${
                    isSelected
                      ? 'bg-[#003d9b] text-white ring-4 ring-blue-200'
                      : 'bg-white text-[#003d9b] border border-blue-200'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                </div>
                {/* Hover / Selected Label */}
                <div
                  className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap bg-gray-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg pointer-events-none transition-opacity ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {hub.name.split(' ')[0]} Hub • {hub.activeTechnicians} pros
                </div>
              </div>
            );
          })}

        {/* 2. Destination Marker (Customer Address) */}
        <div
          style={{ left: `${destPct.x}%`, top: `${destPct.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-full cursor-pointer z-20"
        >
          <div className="relative flex flex-col items-center">
            {/* Custom Location Card */}
            <div className="bg-white/95 backdrop-blur-xs border border-gray-200 text-gray-900 text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-md whitespace-nowrap mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#006e2f] animate-pulse" />
              <span>{customerAddress.locality}</span>
            </div>
            {/* Pin Icon */}
            <div className="w-8 h-8 rounded-full bg-[#006e2f] text-white flex items-center justify-center shadow-lg border-2 border-white">
              <MapPin className="w-4 h-4 fill-white" />
            </div>
            <div className="w-1.5 h-1.5 bg-[#006e2f] rotate-45 -mt-1 shadow-xs" />
          </div>
        </div>

        {/* 3. Live Moving Technician Marker */}
        <div
          style={{ left: `${proPct.x}%`, top: `${proPct.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-300 pointer-events-auto"
        >
          {/* Radar Pulse Effect */}
          <div className="absolute inset-0 -m-3 rounded-full bg-blue-500/20 animate-ping pointer-events-none" />
          <div className="absolute inset-0 -m-1.5 rounded-full bg-blue-500/30 animate-pulse pointer-events-none" />

          {/* Vehicle Pin */}
          <div className="relative bg-[#003d9b] text-white p-2 rounded-full shadow-xl border-2 border-white flex items-center justify-center transform transition-transform hover:scale-115">
            {provider?.vehicleType?.toLowerCase().includes('car') ? (
              <Car className="w-4 h-4" />
            ) : (
              <Bike className="w-4 h-4" />
            )}
          </div>

          {/* Technician Info Floating Chip */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-gray-950/90 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-xl flex items-center gap-1.5">
            <span className="text-emerald-400 font-mono">{remainingEtaMins}m ETA</span>
            <span className="text-gray-400">•</span>
            <span>{provider?.name || 'Ramesh Jadhav'}</span>
          </div>
        </div>
      </div>

      {/* Top Map Header Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-30 pointer-events-none">
        {/* GPS Live Status Pill */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/80 shadow-md flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1">
            <span>Nashik Live GPS</span>
            <span className="text-gray-400 font-normal">|</span>
            <span className="text-emerald-700 font-mono">{remainingDistanceKm} km away</span>
          </span>
        </div>

        {/* Map Type Switcher */}
        <div className="pointer-events-auto flex items-center bg-white/95 backdrop-blur-md rounded-xl border border-gray-200/80 shadow-md p-1 gap-1">
          <button
            onClick={() => setMapType('streets')}
            className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
              mapType === 'streets'
                ? 'bg-[#003d9b] text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
              mapType === 'satellite'
                ? 'bg-[#003d9b] text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setTrafficEnabled(!trafficEnabled)}
            className={`px-2 py-1 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all ${
              trafficEnabled
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            title="Toggle Live Traffic"
          >
            <Layers className="w-3 h-3" />
            <span>Traffic</span>
          </button>
        </div>
      </div>

      {/* Right Side Map Navigation Controls */}
      <div className="absolute right-3 bottom-14 flex flex-col gap-1.5 z-30 pointer-events-auto">
        <button
          onClick={() => setZoomLevel((z) => Math.min(18, z + 1))}
          className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(10, z - 1))}
          className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setProgress(0.5);
            setIsPlaying(true);
          }}
          className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 shadow-md flex items-center justify-center text-[#003d9b] hover:bg-blue-50 active:scale-95"
          title="Center on Technician"
        >
          <LocateFixed className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Live Route Simulation & Speed Player Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-30 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-xl border border-gray-200/90 shadow-lg px-3 py-2 flex items-center justify-between gap-2">
          {/* Play/Pause Live Simulation */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                isPlaying
                  ? 'bg-amber-500 text-white'
                  : 'bg-[#003d9b] text-white hover:bg-blue-800'
              }`}
              title={isPlaying ? 'Pause Simulation' : 'Play Live GPS Tracking'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                setProgress(0);
                setIsPlaying(true);
              }}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              title="Restart Route"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSpeedMultiplier((s) => (s === 1 ? 2 : s === 2 ? 4 : 1))}
              className="px-2 py-1 text-[10px] font-bold text-gray-700 hover:bg-gray-100 rounded-md border border-gray-200"
              title="Simulation Speed"
            >
              {speedMultiplier}x Speed
            </button>
          </div>

          {/* Real-time Progress Slider */}
          <div className="flex-1 max-w-[200px] flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={progress}
              onChange={(e) => {
                setProgress(parseFloat(e.target.value));
                setIsPlaying(false);
              }}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#003d9b]"
            />
            <span className="text-[10px] font-mono text-gray-500 whitespace-nowrap">
              {Math.round(progress * 100)}%
            </span>
          </div>

          {/* Current City Transit Corridor */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
            <Navigation className="w-3 h-3 text-[#003d9b]" />
            <span>Via Gangapur Main Rd</span>
          </div>
        </div>
      </div>
    </div>
  );
};
