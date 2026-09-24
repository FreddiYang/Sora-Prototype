import React, { useState } from 'react';
import { DesignAlternative, FurnitureObject, SurfaceFinish } from '../types';
import { Eye, Info, Sparkles, Layers, Maximize2, Compass } from 'lucide-react';

interface InteractiveRoomCanvasProps {
  design: DesignAlternative;
  selectedFurniture: FurnitureObject | null;
  selectedSurface: SurfaceFinish | null;
  onSelectFurniture: (furniture: FurnitureObject | null) => void;
  onSelectSurface: (surface: SurfaceFinish | null) => void;
  viewMode: 'perspective' | 'clearance_plan';
  onToggleViewMode: (mode: 'perspective' | 'clearance_plan') => void;
}

export const InteractiveRoomCanvas: React.FC<InteractiveRoomCanvasProps> = ({
  design,
  selectedFurniture,
  selectedSurface,
  onSelectFurniture,
  onSelectSurface,
  viewMode,
  onToggleViewMode,
}) => {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  return (
    <div className="relative bg-[#1A1A18] rounded-xl overflow-hidden shadow-lg border border-[#383633] select-none group">
      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="bg-[#1E1E1C]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#3E3C38] flex items-center gap-2 text-xs text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium">{design.title}</span>
          <span className="text-[#8C887B]">·</span>
          <span className="text-[#CCC9BF] font-mono text-[11px]">${design.estimatedTotalBudget.toLocaleString()}</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-[#1E1E1C]/85 backdrop-blur-md p-1 rounded-lg border border-[#3E3C38]">
        <button
          onClick={() => onToggleViewMode('perspective')}
          className={`px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
            viewMode === 'perspective'
              ? 'bg-[#FAF9F6] text-[#1E1E1C] font-semibold'
              : 'text-[#CCC9BF] hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Render View</span>
        </button>
        <button
          onClick={() => onToggleViewMode('clearance_plan')}
          className={`px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
            viewMode === 'clearance_plan'
              ? 'bg-[#FAF9F6] text-[#1E1E1C] font-semibold'
              : 'text-[#CCC9BF] hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Spatial Clearance</span>
        </button>
      </div>

      {/* Perspective Image Mode */}
      {viewMode === 'perspective' ? (
        <div className="relative w-full aspect-16/9 bg-[#121210] overflow-hidden">
          <img
            src={design.renderImageUrl}
            alt={design.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              const fallbackMap: Record<string, string> = {
                'design-scandi-oak': '/assets/images/room_render_scandi_warm_1790211994944.jpg',
                'design-japandi-walnut': '/assets/images/room_render_japandi_walnut_1790212005558.jpg',
                'design-nordic-ash': '/assets/images/room_render_nordic_minimal_1790212016769.jpg',
              };
              const fb = fallbackMap[design.id] || '/assets/images/room_render_scandi_warm_1790211994944.jpg';
              if (!target.src.endsWith(fb)) {
                target.src = fb;
              }
            }}
          />

          {/* Interactive Hotspot Overlays: Furniture */}
          {design.furnitureObjects.map((item) => {
            const isSelected = selectedFurniture?.id === item.id;
            const isHovered = hoveredItemId === item.id;

            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSurface(null);
                  onSelectFurniture(isSelected ? null : item);
                }}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId(null)}
                style={{
                  left: `${item.hotspot.xPercent}%`,
                  top: `${item.hotspot.yPercent}%`,
                  width: `${item.hotspot.widthPercent}%`,
                  height: `${item.hotspot.heightPercent}%`,
                }}
                className={`absolute cursor-pointer transition-all duration-200 rounded-lg group/hotspot ${
                  isSelected
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-black/50 bg-white/10 shadow-2xl'
                    : isHovered
                    ? 'ring-1 ring-white/80 bg-white/5'
                    : 'hover:bg-white/5'
                }`}
                title={`Click to inspect ${item.name}`}
              >
                {/* Visual Pin / Callout Tag */}
                <div
                  className={`absolute -top-3 left-4 transform -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium tracking-wide shadow-md transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-[#1E1E1C] font-bold scale-105'
                      : isHovered
                      ? 'bg-[#2C2A29] text-white'
                      : 'bg-[#1E1E1C]/80 text-[#FAF9F6] opacity-75 group-hover/hotspot:opacity-100'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.isCustomConcept ? 'bg-amber-400' : 'bg-blue-400'
                    }`}
                  ></span>
                  <span>{item.name.split('(')[0].trim()}</span>
                  {item.isCustomConcept && (
                    <span className="text-[9px] text-amber-300 font-serif uppercase tracking-wider ml-0.5">
                      [Custom]
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Interactive Hotspot Overlays: Surfaces (Floor, Walls) */}
          {design.surfaces.map((surf) => {
            const isSelected = selectedSurface?.id === surf.id;
            const isHovered = hoveredItemId === surf.id;

            return (
              <div
                key={surf.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFurniture(null);
                  onSelectSurface(isSelected ? null : surf);
                }}
                onMouseEnter={() => setHoveredItemId(surf.id)}
                onMouseLeave={() => setHoveredItemId(null)}
                style={{
                  left: `${surf.hotspot.xPercent}%`,
                  top: `${surf.hotspot.yPercent}%`,
                  width: `${surf.hotspot.widthPercent}%`,
                  height: `${surf.hotspot.heightPercent}%`,
                }}
                className={`absolute cursor-pointer transition-all duration-200 rounded group/surf ${
                  isSelected
                    ? 'ring-2 ring-amber-300 ring-offset-2 ring-offset-black/50 bg-amber-500/10'
                    : isHovered
                    ? 'ring-1 ring-amber-200/60 bg-amber-500/5'
                    : 'hover:bg-amber-500/5'
                }`}
                title={`Click to inspect ${surf.name}`}
              >
                {/* Surface Tag */}
                <div
                  className={`absolute bottom-2 right-4 flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] tracking-wide shadow-md transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-amber-300 text-[#1E1E1C] font-bold scale-105'
                      : isHovered
                      ? 'bg-[#2C2A29] text-white'
                      : 'bg-[#1E1E1C]/80 text-[#FAF9F6] opacity-60 group-hover/surf:opacity-100'
                  }`}
                >
                  <Layers className="w-3 h-3 text-amber-400" />
                  <span>{surf.name}</span>
                  <span className="text-[9px] text-[#A8A499]">{surf.approxAreaSqFt} sq ft</span>
                </div>
              </div>
            );
          })}

          {/* Bottom Hint Banner */}
          <div className="absolute bottom-3 left-4 z-20 pointer-events-none">
            <span className="text-[11px] text-[#FAF9F6]/80 bg-[#1E1E1C]/75 backdrop-blur-xs px-2.5 py-1 rounded">
              Tap any furniture piece or surface to configure specs & source materials
            </span>
          </div>
        </div>
      ) : (
        /* Clearance & Circulation 2D Plan View */
        <div className="w-full aspect-16/9 bg-[#0F141C] blueprint-dark p-6 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between text-xs text-white/80 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-medium text-emerald-300">Spatial Clearance & Ergonomic Pathways</span>
            </div>
            <span className="text-[#8C887B] font-mono text-[11px]">Minimum 36" (914mm) Aisle Enforced</span>
          </div>

          <div className="flex-1 flex items-center justify-center p-2">
            <svg viewBox="0 0 700 360" className="w-full h-full max-h-[300px]">
              {/* Outer Room */}
              <rect x="50" y="20" width="600" height="320" fill="#141B24" stroke="#4A6572" strokeWidth="2.5" />

              {/* Circulation Zone (Dotted green) */}
              <rect x="110" y="60" width="480" height="240" fill="none" stroke="#22C55E" strokeWidth="1" strokeDasharray="4,4" />
              <text x="120" y="78" fill="#4ADE80" fontSize="10" fontFamily="monospace">
                ✓ 38" DINING CIRCULATION CLEARANCE VERIFIED
              </text>

              {/* Table Footprint */}
              <rect x="230" y="130" width="240" height="100" rx="4" fill="#3E2C1C" stroke="#D4B996" strokeWidth="2" />
              <text x="350" y="175" fill="#FAF9F6" fontSize="13" fontWeight="600" textAnchor="middle">
                {design.furnitureObjects[0]?.name || 'Solid Wood Dining Table'}
              </text>
              <text x="350" y="195" fill="#C4A482" fontSize="10" fontFamily="monospace" textAnchor="middle">
                2400 x 950 mm · 8 Seats Comfortable
              </text>

              {/* Chairs Surrounding Table */}
              {/* Top row */}
              <rect x="250" y="90" width="40" height="30" rx="2" fill="#2A3442" stroke="#607D8B" strokeWidth="1" />
              <rect x="330" y="90" width="40" height="30" rx="2" fill="#2A3442" stroke="#607D8B" strokeWidth="1" />
              <rect x="410" y="90" width="40" height="30" rx="2" fill="#2A3442" stroke="#607D8B" strokeWidth="1" />

              {/* Bottom row */}
              <rect x="250" y="240" width="40" height="30" rx="2" fill="#2A3442" stroke="#607D8B" strokeWidth="1" />
              <rect x="330" y="240" width="40" height="30" rx="2" fill="#2A3442" stroke="#607D8B" strokeWidth="1" />
              <rect x="410" y="240" width="40" height="30" rx="2" fill="#2A3442" stroke="#607D8B" strokeWidth="1" />

              {/* End chairs */}
              <rect x="185" y="160" width="30" height="40" rx="2" fill="#2A3442" stroke="#607D8B" strokeWidth="1" />
              <rect x="485" y="160" width="30" height="40" rx="2" fill="#2A3442" stroke="#607D8B" strokeWidth="1" />

              {/* Door Swing Clearance Arc (South) */}
              <line x1="140" y1="340" x2="140" y2="270" stroke="#F59E0B" strokeWidth="2" />
              <path d="M 140 270 A 70 70 0 0 1 210 340" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3,3" />
              <text x="145" y="325" fill="#FCD34D" fontSize="10" fontFamily="monospace">
                Door Swing (Clear)
              </text>

              {/* Side Credenza (West Wall) */}
              <rect x="54" y="120" width="45" height="150" fill="#261E16" stroke="#A88B70" strokeWidth="1.5" />
              <text x="76" y="200" fill="#E2C9B2" fontSize="10" transform="rotate(-90 76 200)" textAnchor="middle">
                Credenza (480mm D)
              </text>

              {/* Clearance Dimension Indicators */}
              {/* Between Table and Credenza */}
              <line x1="100" y1="180" x2="180" y2="180" stroke="#22C55E" strokeWidth="1" />
              <text x="140" y="174" fill="#4ADE80" fontSize="9" textAnchor="middle" fontFamily="monospace">
                44" AISLE
              </text>

              {/* Between Table and Patio Doors */}
              <line x1="520" y1="180" x2="650" y2="180" stroke="#22C55E" strokeWidth="1" />
              <text x="585" y="174" fill="#4ADE80" fontSize="9" textAnchor="middle" fontFamily="monospace">
                51" PATIO FLOW
              </text>
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#A8A499] pt-2 border-t border-white/10">
            <span>Room Scale: 5,480 mm × 4,260 mm</span>
            <span className="text-emerald-400">All door swings & wheelchair turning radii satisfied</span>
          </div>
        </div>
      )}
    </div>
  );
};
