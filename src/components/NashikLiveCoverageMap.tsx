import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Radio,
  Clock,
  ShieldCheck,
  Zap,
  Users,
  Search,
  CheckCircle2,
  ChevronRight,
  Phone,
  Sparkles,
  Layers,
  LocateFixed,
  Car,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { Address, NashikHub } from '../types';
import { NASHIK_HUBS, NASHIK_LOCALITY_COORDS, SERVICE_CATEGORIES } from '../data/mockData';
import { InteractiveMap } from './InteractiveMap';
import { GeminiMapsAssistant } from './GeminiMapsAssistant';

interface NashikLiveCoverageMapProps {
  currentAddress: Address;
  onSelectLocality: (locality: string) => void;
  onBookService: (categoryId: string) => void;
}

export const NashikLiveCoverageMap: React.FC<NashikLiveCoverageMapProps> = ({
  currentAddress,
  onSelectLocality,
  onBookService,
}) => {
  const [selectedHub, setSelectedHub] = useState<NashikHub>(NASHIK_HUBS[0]);
  const [activeLocality, setActiveLocality] = useState<string>(currentAddress.locality || 'Gangapur Road');
  const [customSearch, setCustomSearch] = useState<string>('');

  const totalTechnicians = NASHIK_HUBS.reduce((acc, h) => acc + h.activeTechnicians, 0);

  const testAddress: Address = {
    ...currentAddress,
    locality: activeLocality,
    lat: NASHIK_LOCALITY_COORDS[activeLocality]?.lat || currentAddress.lat,
    lng: NASHIK_LOCALITY_COORDS[activeLocality]?.lng || currentAddress.lng,
  };

  const handleSelectLocality = (locality: string) => {
    setActiveLocality(locality);
    onSelectLocality(locality);
    // Auto-select corresponding nearest hub
    const matchedHub = NASHIK_HUBS.find((h) => h.locality.toLowerCase() === locality.toLowerCase());
    if (matchedHub) {
      setSelectedHub(matchedHub);
    }
  };

  const filteredLocalities = Object.keys(NASHIK_LOCALITY_COORDS).filter((loc) =>
    loc.toLowerCase().includes(customSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#003d9b] via-[#002b6e] to-[#001f52] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background glow & radar motif */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-64 h-64 border border-white/10 rounded-full pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-84 h-84 border border-white/5 rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Nashik City Real-Time Service Grid</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Live Service Hubs & Real-Time Pro Tracking
          </h1>

          <p className="text-sm text-blue-100/90 leading-relaxed">
            URBN Services operates 6 synchronized rapid-dispatch centers across Nashik. All technicians carry GPS telemetry for real-time arrival estimates and our 1-Day Service Guarantee.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-blue-200">
                <Users className="w-3.5 h-3.5" />
                <span>On-Duty Pros</span>
              </div>
              <p className="text-xl font-bold text-white mt-0.5">{totalTechnicians} Verified</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-blue-200">
                <Radio className="w-3.5 h-3.5" />
                <span>Active Hubs</span>
              </div>
              <p className="text-xl font-bold text-white mt-0.5">6 Express Hubs</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-blue-200">
                <Clock className="w-3.5 h-3.5" />
                <span>Avg Dispatch ETA</span>
              </div>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">12 mins</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-blue-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Promise SLA</span>
              </div>
              <p className="text-xl font-bold text-white mt-0.5">99.4% On-Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Map & Locality Selector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Interactive Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-[#c3c6d6]/70 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#003d9b] flex items-center justify-center">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Interactive Nashik Map</h3>
                  <p className="text-xs text-gray-500">
                    Live simulation of technician route to {activeLocality}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 hidden sm:inline">Active Locality:</span>
                <span className="text-xs font-bold text-[#003d9b] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  {activeLocality}
                </span>
              </div>
            </div>

            {/* Interactive Map Component */}
            <InteractiveMap
              customerAddress={testAddress}
              height="400px"
              showAllHubs={true}
              showTrafficOverlay={true}
              onSelectHub={(hubId) => {
                const found = NASHIK_HUBS.find((h) => h.id === hubId);
                if (found) setSelectedHub(found);
              }}
              isSimulatingDefault={true}
            />

            {/* Selected Hub Highlights */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#003d9b]" />
                  <span className="text-xs font-bold text-gray-900">{selectedHub.name}</span>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {selectedHub.status}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 pl-4">{selectedHub.address}</p>
                <div className="flex items-center gap-3 text-[11px] text-gray-600 pl-4 pt-0.5">
                  <span>🚗 {selectedHub.activeTechnicians} pros stationed</span>
                  <span>⚡ ~{selectedHub.avgEtaMins} min response time</span>
                  <span>🎯 {selectedHub.coverageRadiusKm} km coverage radius</span>
                </div>
              </div>

              <a
                href={`tel:${selectedHub.phone}`}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-semibold rounded-lg shadow-2xs transition-all self-start sm:self-center"
              >
                <Phone className="w-3.5 h-3.5 text-[#003d9b]" />
                <span>Hub Dispatch Desk</span>
              </a>
            </div>
          </div>

          {/* Gemini Maps Grounding AI Assistant */}
          <GeminiMapsAssistant currentLocality={activeLocality} />
        </div>

        {/* Right 1 Col: Locality & Service Coverage Explorer */}
        <div className="space-y-4">
          {/* Locality Quick Selector */}
          <div className="bg-white rounded-2xl border border-[#c3c6d6]/70 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">Nashik Localities</h3>
              <span className="text-xs text-gray-400">{Object.keys(NASHIK_LOCALITY_COORDS).length} Zones</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={customSearch}
                onChange={(e) => setCustomSearch(e.target.value)}
                placeholder="Filter locality (e.g. Gangapur, Indira Nagar)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#003d9b]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Localities List */}
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 divide-y divide-gray-50">
              {filteredLocalities.map((loc) => {
                const isSelected = activeLocality.toLowerCase() === loc.toLowerCase();
                const coords = NASHIK_LOCALITY_COORDS[loc];
                return (
                  <button
                    key={loc}
                    onClick={() => handleSelectLocality(loc)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all pt-2.5 ${
                      isSelected
                        ? 'bg-blue-50 text-[#003d9b] border border-blue-200 font-bold'
                        : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin
                        className={`w-3.5 h-3.5 ${
                          isSelected ? 'text-[#003d9b]' : 'text-gray-400'
                        }`}
                      />
                      <span>{loc}</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                      10-15m
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6 Nashik Service Hubs Cards */}
          <div className="bg-white rounded-2xl border border-[#c3c6d6]/70 shadow-sm p-4 space-y-3">
            <h3 className="font-bold text-gray-900 text-sm">6 Nashik Dispatch Hubs</h3>
            <div className="space-y-2">
              {NASHIK_HUBS.map((hub) => {
                const isSelected = selectedHub.id === hub.id;
                return (
                  <div
                    key={hub.id}
                    onClick={() => {
                      setSelectedHub(hub);
                      setActiveLocality(hub.locality);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#003d9b] bg-blue-50/50 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-gray-900">{hub.name}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">{hub.locality}, Nashik</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        {hub.avgEtaMins}m ETA
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500 border-t border-gray-100 pt-2">
                      <span>{hub.activeTechnicians} Active Pros</span>
                      <span className="text-[#003d9b] font-semibold flex items-center gap-0.5">
                        View Hub Details <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Instant Booking Callout */}
          <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl border border-blue-200/80 p-4 space-y-3">
            <div className="flex items-center gap-2 text-[#003d9b]">
              <Zap className="w-4 h-4" />
              <span className="font-bold text-xs uppercase tracking-wide">
                Need Rapid Household Help in {activeLocality}?
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Verified technician assigned in under 3 minutes with 1-Day Service Guarantee.
            </p>
            <button
              onClick={() => onBookService('plumbing')}
              className="w-full py-2.5 bg-[#003d9b] text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Book Instant Service in {activeLocality}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
