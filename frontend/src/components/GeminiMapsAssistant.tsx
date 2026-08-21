import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  Search,
  ExternalLink,
  Loader2,
  Navigation,
  Compass,
  Store,
  Clock,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { MapsGroundingResponse } from '../types';

interface GeminiMapsAssistantProps {
  currentLocality: string;
  onSelectPlace?: (placeName: string) => void;
}

export const GeminiMapsAssistant: React.FC<GeminiMapsAssistantProps> = ({
  currentLocality,
  onSelectPlace,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MapsGroundingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const samplePrompts = [
    `Hardware & plumbing stores near ${currentLocality}, Nashik`,
    `Electrical supply & wire shops near College Road, Nashik`,
    `AC spare parts & gas refill stations in Nashik`,
    `Best transit route from Gangapur Road Hub to Indira Nagar`,
  ];

  const handleSearch = async (searchPrompt?: string) => {
    const promptToSend = searchPrompt || query;
    if (!promptToSend.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/maps/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          locality: currentLocality,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve Google Maps grounded response');
      }

      const data: MapsGroundingResponse = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error('Maps Grounding Error:', err);
      setError(err.message || 'Unable to connect to Gemini Maps Grounding service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#c3c6d6]/70 shadow-sm p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#003d9b] to-[#006e2f] text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-base">Nashik Maps & Parts Radar</h3>
              <span className="bg-blue-50 text-[#003d9b] text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                Google Maps Grounded
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Live location intel, verified supply stores, & route checks in {currentLocality}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-center">
          <MapPin className="w-3.5 h-3.5" />
          <span>Active Locality: {currentLocality}</span>
        </div>
      </div>

      {/* Query Search Bar */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={`Ask about hardware shops, parts supply, or routes in ${currentLocality}...`}
            className="w-full pl-10 pr-24 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20 focus:border-[#003d9b] transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />

          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#003d9b] text-white rounded-lg text-xs font-bold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all shadow-xs"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
            <span>Locate</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-gray-400 mr-1">Try:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(p);
                handleSearch(p);
              }}
              className="text-[11px] font-medium bg-gray-100 hover:bg-blue-50 hover:text-[#003d9b] hover:border-blue-200 text-gray-600 px-2.5 py-1 rounded-lg border border-gray-200/80 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <HelpCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to fetch real-time map data</p>
            <p className="text-[11px] text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Results Box */}
      {result && (
        <div className="p-4 rounded-xl bg-gradient-to-b from-blue-50/50 to-white border border-blue-100/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#003d9b]" />
              <span className="text-xs font-bold text-[#003d9b]">
                Google Maps Verified Real-Time Response
              </span>
            </div>
            <span className="text-[10px] text-gray-400">Powered by Gemini 3.5 Flash</span>
          </div>

          <div className="text-xs text-gray-800 leading-relaxed whitespace-pre-line">
            {result.text}
          </div>

          {/* Grounding Chunks and Maps links if available */}
          {result.groundingMetadata?.groundingChunks &&
            result.groundingMetadata.groundingChunks.length > 0 && (
              <div className="pt-3 border-t border-blue-100/60 space-y-2">
                <p className="text-[11px] font-bold text-gray-700">Verified Google Maps Sources:</p>
                <div className="flex flex-wrap gap-2">
                  {result.groundingMetadata.groundingChunks.map((chunk, cIdx) => {
                    const title = chunk.maps?.title || chunk.web?.title || 'Google Maps Verified Point';
                    const uri = chunk.maps?.uri || chunk.web?.uri || 'https://maps.google.com';
                    const address = chunk.maps?.address;

                    return (
                      <a
                        key={cIdx}
                        href={uri}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-white border border-blue-200 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-gray-800 hover:text-[#003d9b] hover:border-[#003d9b] shadow-2xs transition-all"
                      >
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className="truncate max-w-[200px]">{title}</span>
                        {address && <span className="text-gray-400 text-[10px]">({address})</span>}
                        <ExternalLink className="w-3 h-3 text-gray-400 ml-0.5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};
