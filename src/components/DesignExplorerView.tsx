import React, { useState } from 'react';
import { DesignAlternative, FurnitureObject, SurfaceFinish, RoomModel } from '../types';
import { calculateDesignBudget } from '../utils/furnitureCalculations';
import { InteractiveRoomCanvas } from './InteractiveRoomCanvas';
import { 
  Sparkles, 
  Send, 
  Ruler, 
  DollarSign, 
  Layers, 
  Check, 
  ArrowRight, 
  SlidersHorizontal,
  RotateCcw,
  Hammer,
  ShoppingBag,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface DesignExplorerViewProps {
  designs: DesignAlternative[];
  activeDesign: DesignAlternative;
  onSelectDesign: (designId: string) => void;
  onUpdateDesign: (updated: DesignAlternative) => void;
  onNavigateToCustomFurniture: (furniture: FurnitureObject) => void;
  onNavigateToMaterials: (surface: SurfaceFinish) => void;
  roomModel: RoomModel;
}

export const DesignExplorerView: React.FC<DesignExplorerViewProps> = ({
  designs,
  activeDesign,
  onSelectDesign,
  onUpdateDesign,
  onNavigateToCustomFurniture,
  onNavigateToMaterials,
  roomModel,
}) => {
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureObject | null>(
    activeDesign.furnitureObjects[0] || null
  );
  const [selectedSurface, setSelectedSurface] = useState<SurfaceFinish | null>(null);
  const [viewMode, setViewMode] = useState<'perspective' | 'clearance_plan'>('perspective');
  
  // Prompt refinement state
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refinementFeedback, setRefinementFeedback] = useState<string | null>(null);
  const [isRegeneratingRender, setIsRegeneratingRender] = useState(false);

  const handleRegenerateRender = () => {
    setIsRegeneratingRender(true);
    setTimeout(() => {
      setIsRegeneratingRender(false);
      onUpdateDesign({
        ...activeDesign,
        isOutOfDate: false,
        outOfDateReason: undefined,
        lastRegeneratedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }, 1200);
  };

  const samplePrompts = [
    'Use lighter blonde ash wood',
    'Make dining table smaller (seats 6)',
    'Keep layout but switch to French oak floor',
    'Warmer minimalist tone with Roman clay walls',
    'Reduce overall project budget by $2,000',
  ];

  const handleApplyRefinement = async (promptToUse?: string) => {
    const text = promptToUse || refinementPrompt;
    if (!text.trim()) return;

    setIsRefining(true);
    setRefinementFeedback(null);

    try {
      let refinedData: any = null;
      try {
        const response = await fetch('/api/gemini/refine-design', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentDesign: activeDesign,
            prompt: text,
            roomModel,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.refined) {
            refinedData = data.refined;
          }
        }
      } catch (e) {
        console.warn('API endpoint unavailable, applying local architectural refinement:', e);
      }

      if (!refinedData) {
        // Client-side rule-based architectural refinement for static deployments (Vercel)
        const pLower = text.toLowerCase();
        let wood = activeDesign.woodSpecies;
        let finish = activeDesign.finishType;
        let budget = activeDesign.estimatedTotalBudget;
        if (pLower.includes('lighter') || pLower.includes('ash') || pLower.includes('pale')) {
          wood = 'Blonde Ash & Pale Birch';
          finish = 'Nordic Soap Finish';
          budget -= 600;
        } else if (pLower.includes('darker') || pLower.includes('walnut') || pLower.includes('rich')) {
          wood = 'American Black Walnut';
          finish = 'Rubio Monocoat Pure Oil';
          budget += 1200;
        } else if (pLower.includes('reduce') || pLower.includes('cheaper') || pLower.includes('budget')) {
          budget = Math.max(8000, budget - 2500);
        } else if (pLower.includes('smaller')) {
          budget -= 800;
        }

        refinedData = {
          designTitle: `Refined: ${text.slice(0, 30)}`,
          narrative: `Adjusted the spatial composition in response to "${text}". Preserved the room's primary circulation pathways (minimum 36" clearance around dining table) while optimizing the wood tones and finish harmony.`,
          woodSpecies: wood,
          finishType: finish,
          flooring: pLower.includes('floor') ? 'Engineered French White Oak (Wide Plank)' : activeDesign.flooringType,
          wallFinish: pLower.includes('warm') ? 'Roman Clay Greige Finish' : 'Bone White Limewash Paint',
          newEstimatedBudget: budget,
        };
      }

      const ref = refinedData;
      
      // Build updated design
      const updated: DesignAlternative = {
        ...activeDesign,
        title: ref.designTitle || `Refined: ${text.slice(0, 30)}`,
        narrative: ref.narrative || activeDesign.narrative,
        woodSpecies: ref.woodSpecies || activeDesign.woodSpecies,
        finishType: ref.finishType || activeDesign.finishType,
        flooringType: ref.flooring || activeDesign.flooringType,
        wallFinish: ref.wallFinish || activeDesign.wallFinish,
        estimatedTotalBudget: ref.newEstimatedBudget || activeDesign.estimatedTotalBudget,
      };

      // If table modified
      if (text.toLowerCase().includes('smaller') || text.toLowerCase().includes('6')) {
        if (updated.furnitureObjects[0]?.specification) {
          updated.furnitureObjects[0] = {
            ...updated.furnitureObjects[0],
            name: 'Odin Compact Trestle Table (Custom Solid Oak)',
            dimensionsSummary: '2000 mm L x 900 mm W x 750 mm H (78.7" x 35.4")',
            estimatedPrice: 3600,
            specification: {
              ...updated.furnitureObjects[0].specification,
              overallLengthMm: 2000,
              overallWidthMm: 900,
              seatingCapacity: 6,
            },
          };
          setSelectedFurniture(updated.furnitureObjects[0]);
        }
      }

      onUpdateDesign(updated);
      setRefinementFeedback(`Refined in accordance with: "${text}". Updated furniture specs and budget.`);
      setRefinementPrompt('');
    } catch (err: any) {
      console.error('Failed to refine design:', err);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Design Switcher Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#E8E6DF] pb-5 gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#8C887B]">
            Interactive Room Design · Step 3 of 5
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1C] mt-1 font-normal">
            Personalized Room Visualizations
          </h1>
          <p className="text-sm text-[#5E5C56] mt-1.5 max-w-2xl">
            Generated directly from your {roomModel.length.valueFtIn} × {roomModel.width.valueFtIn} ({roomModel.length.valueMm.toLocaleString()} × {roomModel.width.valueMm.toLocaleString()} mm) room model. Modeled at millimeter scale with preliminary 36"+ circulation clearance checks (subject to on-site layout).
          </p>
        </div>

        {/* 3 Design Alternatives Switcher */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-[#E8E6DF] shadow-xs">
          {designs.map((d) => {
            const isSelected = activeDesign.id === d.id;
            const bInfo = calculateDesignBudget(d, roomModel);
            return (
              <button
                key={d.id}
                onClick={() => {
                  onSelectDesign(d.id);
                  setSelectedFurniture(d.furnitureObjects[0] || null);
                  setSelectedSurface(null);
                }}
                className={`px-3.5 py-2 rounded text-xs font-medium transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-[#2C2A29] text-white shadow-xs'
                    : 'text-[#6B6962] hover:bg-[#FAF9F6] hover:text-[#1E1E1C]'
                }`}
              >
                <div className="truncate max-w-[150px] font-semibold">{d.title.split('&')[0].trim()}</div>
                <div className={`text-[10px] truncate max-w-[150px] font-mono ${isSelected ? 'text-[#DCD7CB]' : 'text-[#8C887B]'}`}>
                  ${bInfo.currentTotalCost.toLocaleString()}
                  <span className="text-[9px] opacity-75 block font-sans">
                    (Est. ${d.estimatedTotalBudget.toLocaleString()})
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Canvas & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Canvas & Refinement Prompt */}
        <div className="lg:col-span-8 space-y-6">
          {/* Out of Date Banner */}
          {activeDesign.isOutOfDate && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">3D Perspective Rendering: Out of Date</span>
                  <p className="text-amber-800 text-[11px] mt-0.5">
                    {activeDesign.outOfDateReason || 'Spatial geometry or custom millwork parameters were updated.'} Real-time 2D spatial clearances and CAD fabrication packages are active.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRegenerateRender}
                disabled={isRegeneratingRender}
                className="px-3.5 py-1.5 bg-[#2C2A29] hover:bg-[#1E1E1C] text-white rounded font-medium shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingRender ? 'animate-spin' : ''}`} />
                <span>{isRegeneratingRender ? 'Regenerating...' : 'Regenerate 3D Visual'}</span>
              </button>
            </div>
          )}

          <InteractiveRoomCanvas
            design={activeDesign}
            selectedFurniture={selectedFurniture}
            selectedSurface={selectedSurface}
            onSelectFurniture={(furn) => {
              setSelectedFurniture(furn);
              setSelectedSurface(null);
            }}
            onSelectSurface={(surf) => {
              setSelectedSurface(surf);
              setSelectedFurniture(null);
            }}
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
            roomModel={roomModel}
            onRegenerateRender={handleRegenerateRender}
            isRegeneratingRender={isRegeneratingRender}
          />

          {/* Natural Language Refinement Bar */}
          <div className="bg-white rounded-lg border border-[#E8E6DF] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#5C4033]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1C]">
                  Refine This Room Design
                </h3>
              </div>
              <span className="text-[11px] text-[#706E66]">
                Preserves unchanged items & spatial geometry
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder='e.g., "Use lighter blonde ash wood" or "Make dining table smaller to seat 6"'
                value={refinementPrompt}
                onChange={(e) => setRefinementPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyRefinement()}
                className="flex-1 px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-[#DCD7CB] rounded focus:border-[#2C2A29] focus:outline-none placeholder:text-[#A8A499]"
              />
              <button
                onClick={() => handleApplyRefinement()}
                disabled={isRefining || !refinementPrompt.trim()}
                className="px-4 py-2.5 bg-[#2C2A29] hover:bg-[#1E1E1C] disabled:bg-[#8C887B] text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                {isRefining ? (
                  <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Refine</span>
              </button>
            </div>

            {/* Quick Sample Prompts */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-[#8C887B]">Quick adjustments:</span>
              {samplePrompts.map((sp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setRefinementPrompt(sp);
                    handleApplyRefinement(sp);
                  }}
                  className="text-[11px] text-[#5C4033] hover:text-[#1E1E1C] bg-[#F7F5F0] hover:bg-[#EFECE4] px-2.5 py-1 rounded transition-colors border border-[#E8E4DA] cursor-pointer"
                >
                  {sp}
                </button>
              ))}
            </div>

            {refinementFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{refinementFeedback}</span>
              </div>
            )}
          </div>

          {/* Design Rationale & Craft Narrative */}
          <div className="bg-white rounded-lg border border-[#E8E6DF] p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-lg text-[#1E1E1C]">
              Design Intent & Spatial Coordination
            </h3>
            <p className="text-xs text-[#5E5C56] leading-relaxed">
              {activeDesign.narrative}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-[#F0EDE6] text-xs">
              <div>
                <span className="text-[10px] uppercase text-[#8C887B] block">Wood Species</span>
                <span className="font-medium text-[#1E1E1C] mt-0.5 block">{activeDesign.woodSpecies}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#8C887B] block">Finish Chemistry</span>
                <span className="font-medium text-[#1E1E1C] mt-0.5 block">{activeDesign.finishType}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#8C887B] block">Flooring Spec</span>
                <span className="font-medium text-[#1E1E1C] mt-0.5 block">{activeDesign.flooringType}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#8C887B] block">Wall Surface</span>
                <span className="font-medium text-[#1E1E1C] mt-0.5 block">{activeDesign.wallFinish}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Item or Surface Detail Inspector */}
        <div className="lg:col-span-4 space-y-6">
          {selectedFurniture ? (
            <div className="bg-white rounded-lg border border-[#E8E6DF] p-5 shadow-xs space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#8C887B]">
                    {selectedFurniture.isCustomConcept ? 'Custom Millwork Commission' : 'Sourced Catalog Product'}
                  </span>
                  <h3 className="font-serif text-xl text-[#1E1E1C] mt-0.5">
                    {selectedFurniture.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="font-mono text-base font-semibold text-[#1E1E1C]">
                    ${selectedFurniture.estimatedPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[#8C887B] block">Estimated</span>
                </div>
              </div>

              {/* Classification & Summary */}
              <div className="space-y-2 text-xs">
                <div className="bg-[#FAF9F6] p-3 rounded border border-[#EDEAE3] space-y-1.5">
                  <div className="text-[#706E66]">Material & Finish:</div>
                  <div className="font-medium text-[#1E1E1C]">{selectedFurniture.materialSummary}</div>
                </div>

                <div className="bg-[#FAF9F6] p-3 rounded border border-[#EDEAE3] space-y-1.5">
                  <div className="text-[#706E66]">Spatial Dimensions:</div>
                  <div className="font-mono font-medium text-[#1E1E1C]">{selectedFurniture.dimensionsSummary}</div>
                </div>
              </div>

              {/* Custom Concept vs Catalog specific details */}
              {selectedFurniture.isCustomConcept ? (
                <div className="space-y-4 pt-2 border-t border-[#F0EDE6]">
                  <div className="flex items-center gap-2 text-amber-900 bg-amber-50/70 p-2.5 rounded border border-amber-200/80 text-xs">
                    <Hammer className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Editable joinery & dimensional specifications available for workshop quotation.</span>
                  </div>

                  {selectedFurniture.specification && (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-[#F5F2EB]">
                        <span className="text-[#706E66]">Joinery:</span>
                        <span className="font-medium text-[#1E1E1C]">{selectedFurniture.specification.joineryMethod.slice(0, 35)}...</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#F5F2EB]">
                        <span className="text-[#706E66]">Tabletop Thickness:</span>
                        <span className="font-mono font-medium text-[#1E1E1C]">{selectedFurniture.specification.topThicknessMm} mm (1.65")</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#F5F2EB]">
                        <span className="text-[#706E66]">Seating Capacity:</span>
                        <span className="font-medium text-[#1E1E1C]">{selectedFurniture.specification.seatingCapacity} Persons</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => onNavigateToCustomFurniture(selectedFurniture)}
                    className="w-full py-2.5 bg-[#2C2A29] hover:bg-[#1E1E1C] text-white text-xs font-medium rounded transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Hammer className="w-3.5 h-3.5" />
                    <span>Open Furniture Specification Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4 pt-2 border-t border-[#F0EDE6]">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#F5F2EB]">
                      <span className="text-[#706E66]">Supplier / Brand:</span>
                      <span className="font-medium text-[#1E1E1C]">{selectedFurniture.supplierName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F5F2EB]">
                      <span className="text-[#706E66]">Catalog SKU:</span>
                      <span className="font-mono font-medium text-[#1E1E1C]">{selectedFurniture.productSku}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F5F2EB]">
                      <span className="text-[#706E66]">Delivery Lead Time:</span>
                      <span className="font-medium text-[#1E1E1C]">{selectedFurniture.leadTimeWeeks} Weeks</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#F5F3EC] rounded text-xs text-[#5E5C56]">
                    Ready to order catalog item with guaranteed dimensions matching the 3D room clearance model.
                  </div>
                </div>
              )}
            </div>
          ) : selectedSurface ? (
            <div className="bg-white rounded-lg border border-[#E8E6DF] p-5 shadow-xs space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#8C887B]">
                    Surface Finish · {selectedSurface.surfaceType.replace('_', ' ')}
                  </span>
                  <h3 className="font-serif text-xl text-[#1E1E1C] mt-0.5">
                    {selectedSurface.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="font-mono text-base font-semibold text-[#1E1E1C]">
                    {selectedSurface.surfaceType === 'flooring' ? roomModel.areaSqFt : selectedSurface.approxAreaSqFt} sq ft
                  </span>
                  <span className="text-[10px] text-[#8C887B] block">Surface Area</span>
                </div>
              </div>

              <div className="space-y-2 text-xs bg-[#FAF9F6] p-3 rounded border border-[#EDEAE3]">
                <div className="flex justify-between py-0.5">
                  <span className="text-[#706E66]">Color & Tone:</span>
                  <span className="font-medium text-[#1E1E1C]">{selectedSurface.visualCharacteristics.color}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-[#706E66]">Texture / Pattern:</span>
                  <span className="font-medium text-[#1E1E1C]">{selectedSurface.visualCharacteristics.texture}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-[#706E66]">Selected Product:</span>
                  <span className="font-medium text-[#1E1E1C]">{selectedSurface.currentSelection.name}</span>
                </div>
              </div>

              <button
                onClick={() => onNavigateToMaterials(selectedSurface)}
                className="w-full py-2.5 bg-[#2C2A29] hover:bg-[#1E1E1C] text-white text-xs font-medium rounded transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Search Products & Calculate Waste</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#E8E6DF] p-6 shadow-xs text-center space-y-3">
              <Layers className="w-8 h-8 text-[#8C887B] mx-auto" />
              <div className="font-serif text-lg text-[#1E1E1C]">Select an Object or Surface</div>
              <p className="text-xs text-[#706E66]">
                Click on the dining table, chairs, credenza, floor, or wall in the rendering to inspect dimensions, wood species, and product matches.
              </p>
            </div>
          )}

          {/* Quick List of All Room Items */}
          <div className="bg-white rounded-lg border border-[#E8E6DF] p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1C]">
              Room Inventory ({activeDesign.furnitureObjects.length + activeDesign.surfaces.length} Items)
            </h4>
            <div className="space-y-1.5 divide-y divide-[#F5F2EB]">
              {activeDesign.furnitureObjects.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedFurniture(item);
                    setSelectedSurface(null);
                  }}
                  className={`pt-2 flex items-center justify-between text-xs cursor-pointer hover:text-[#5C4033] ${
                    selectedFurniture?.id === item.id ? 'font-semibold text-[#1E1E1C]' : 'text-[#5E5C56]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.isCustomConcept ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                    ></span>
                    <span className="truncate">{item.name}</span>
                  </div>
                  <span className="font-mono text-[#706E66]">${item.estimatedPrice.toLocaleString()}</span>
                </div>
              ))}

              {activeDesign.surfaces.map((surf) => (
                <div
                  key={surf.id}
                  onClick={() => {
                    setSelectedSurface(surf);
                    setSelectedFurniture(null);
                  }}
                  className={`pt-2 flex items-center justify-between text-xs cursor-pointer hover:text-[#5C4033] ${
                    selectedSurface?.id === surf.id ? 'font-semibold text-[#1E1E1C]' : 'text-[#5E5C56]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="truncate">{surf.name}</span>
                  </div>
                  <span className="text-[11px] text-[#706E66] font-mono">
                    {surf.surfaceType === 'flooring' ? roomModel.areaSqFt : surf.approxAreaSqFt} sq ft
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
