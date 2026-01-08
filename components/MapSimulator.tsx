
import React from 'react';
import { MapPin, Navigation, Package } from 'lucide-react';

interface MapSimulatorProps {
  pickup?: string;
  delivery?: string;
  status?: string;
  isDriverView?: boolean;
}

const MapSimulator: React.FC<MapSimulatorProps> = ({ pickup, delivery, status, isDriverView }) => {
  return (
    <div className="relative w-full h-64 bg-slate-200 rounded-xl overflow-hidden border border-slate-300 shadow-inner group">
      {/* Abstract Map Background */}
      <div className="absolute inset-0 opacity-40">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Simulated Roads */}
          <path d="M 0 50 Q 150 120 300 50 T 600 80" stroke="#cbd5e1" strokeWidth="15" fill="none" />
          <path d="M 100 0 L 120 400" stroke="#cbd5e1" strokeWidth="10" fill="none" />
          <path d="M 350 0 Q 300 200 400 400" stroke="#cbd5e1" strokeWidth="12" fill="none" />
        </svg>
      </div>

      {/* Markers */}
      <div className="absolute top-1/4 left-1/4 flex flex-col items-center animate-bounce">
        <div className="bg-indigo-600 p-2 rounded-full shadow-lg">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div className="bg-white px-2 py-0.5 rounded text-[10px] font-bold shadow mt-1 whitespace-nowrap">
          {pickup || "Retirada"}
        </div>
      </div>

      <div className="absolute bottom-1/4 right-1/4 flex flex-col items-center">
        <div className="bg-emerald-600 p-2 rounded-full shadow-lg">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div className="bg-white px-2 py-0.5 rounded text-[10px] font-bold shadow mt-1 whitespace-nowrap">
          {delivery || "Entrega"}
        </div>
      </div>

      {/* Connection Line */}
      <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
        <line x1="25%" y1="25%" x2="75%" y2="75%" stroke="#4f46e5" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_2s_linear_infinite]" />
      </svg>

      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -10; }
        }
      `}</style>

      {/* Tracking Car/Icon if in transit */}
      {(status === 'in_transit' || status === 'accepted') && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out">
           <div className="bg-slate-900 p-1.5 rounded-full shadow-xl border-2 border-white">
              <Navigation className="w-4 h-4 text-white rotate-45" />
           </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 shadow-sm">
        {isDriverView ? "Visualização do Motorista" : "Rastreamento em Tempo Real"}
      </div>
    </div>
  );
};

export default MapSimulator;
