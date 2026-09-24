import React, { useState } from 'react';
import { SurfaceFinish, MaterialProduct } from '../types';
import { CATALOG_MATERIALS } from '../data/initialData';
import { 
  ShoppingBag, 
  Layers, 
  Check, 
  ExternalLink, 
  Filter, 
  Calculator, 
  Package, 
  Sparkles,
  Info,
  Calendar,
  Truck
} from 'lucide-react';

interface MaterialDiscoveryPanelProps {
  surface: SurfaceFinish | null;
  onSelectProduct: (surfaceId: string, product: MaterialProduct) => void;
  onOrderSample: (product: MaterialProduct) => void;
  allSurfaces: SurfaceFinish[];
  onSwitchSurface: (surface: SurfaceFinish) => void;
}

export const MaterialDiscoveryPanel: React.FC<MaterialDiscoveryPanelProps> = ({
  surface,
  onSelectProduct,
  onOrderSample,
  allSurfaces,
  onSwitchSurface,
}) => {
  const activeSurface = surface || allSurfaces[0];
  
  // Calculator state
  const [wastePercent, setWastePercent] = useState<number>(10);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'exact' | 'alternative'>('all');
  const [sampleOrderedSku, setSampleOrderedSku] = useState<string | null>(null);

  if (!activeSurface) {
    return null;
  }

  // Calculate quantities
  const netArea = activeSurface.approxAreaSqFt;
  const grossArea = Math.ceil(netArea * (1 + wastePercent / 100));
  
  const getRequiredUnits = (prod: MaterialProduct) => {
    return Math.ceil(grossArea / prod.coveragePerUnit);
  };

  const getEstimatedCost = (prod: MaterialProduct) => {
    if (prod.priceUnit === 'sq.ft') {
      return Math.round(grossArea * prod.pricePerUnit);
    }
    const units = getRequiredUnits(prod);
    return Math.round(units * prod.pricePerUnit);
  };

  // Products filtered for this surface type
  const products = CATALOG_MATERIALS.filter((m) => {
    if (activeSurface.surfaceType === 'flooring') return m.category === 'flooring';
    if (activeSurface.surfaceType === 'wall_paint') return m.category === 'wall_paint';
    if (activeSurface.surfaceType === 'accent_tile') return m.category === 'wall_tile';
    return true;
  });

  const filteredProducts = products.filter((p) => {
    if (selectedFilter === 'exact') return p.matchType === 'exact_identified';
    if (selectedFilter === 'alternative') return p.matchType === 'visually_similar_alternative';
    return true;
  });

  const handleSampleClick = (prod: MaterialProduct) => {
    onOrderSample(prod);
    setSampleOrderedSku(prod.sku);
    setTimeout(() => setSampleOrderedSku(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-[#E8E6DF] pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#8C887B]">
            Material Sourcing & Takeoff
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1C] mt-1 font-normal">
            Surface Materials & Sourcing Catalog
          </h1>
          <p className="text-sm text-[#5E5C56] mt-1.5 max-w-2xl">
            Real purchasable finishes matched against your room rendering. Includes coverage calculations, waste allowances, and exact vs similar alternatives.
          </p>
        </div>

        {/* Surface Switcher */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-[#E8E6DF] shadow-xs">
          {allSurfaces.map((s) => {
            const isSelected = activeSurface.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSwitchSurface(s)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#2C2A29] text-white'
                    : 'text-[#6B6962] hover:bg-[#FAF9F6]'
                }`}
              >
                {s.name.split('(')[0].trim()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Surface Context & Area Takeoff Banner */}
      <div className="bg-white rounded-lg border border-[#E8E6DF] p-6 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-7 space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#8C887B]">
            <Layers className="w-4 h-4 text-[#5C4033]" />
            <span className="font-semibold uppercase tracking-wider text-[#1E1E1C]">Active Surface Profile</span>
            <span aria-hidden="true">·</span>
            <span>{activeSurface.visualCharacteristics.color}</span>
          </div>
          <h2 className="font-serif text-2xl text-[#1E1E1C]">{activeSurface.name}</h2>
          <p className="text-xs text-[#5E5C56]">
            Visual characteristics: {activeSurface.visualCharacteristics.texture}, {activeSurface.visualCharacteristics.finish}. Pattern: {activeSurface.visualCharacteristics.pattern}.
          </p>
        </div>

        {/* Interactive Waste & Quantity Calculator */}
        <div className="md:col-span-5 bg-[#FAF9F6] p-4 rounded-lg border border-[#EDEAE3] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#706E66] font-medium flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-[#5C4033]" />
              Measured Net Surface:
            </span>
            <span className="font-mono font-semibold text-[#1E1E1C]">{netArea} sq ft</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="text-[#706E66]">Waste & Cut Allowance:</label>
              <span className="font-mono font-medium text-[#1E1E1C]">{wastePercent}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              step="1"
              value={wastePercent}
              onChange={(e) => setWastePercent(Number(e.target.value))}
              className="w-full accent-[#2C2A29] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8C887B]">
              <span>5% (Simple Rectangles)</span>
              <span>10% (Standard)</span>
              <span>15%+ (Herringbone/Angles)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E2DFD6] flex items-center justify-between text-xs">
            <span className="text-[#1E1E1C] font-semibold">Total Order Gross Area:</span>
            <span className="font-mono text-sm font-bold text-[#1E1E1C]">{grossArea} sq ft</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-[#E8E6DF]">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-[#2C2A29] text-white font-medium'
                : 'text-[#6B6962] hover:text-[#1E1E1C]'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setSelectedFilter('exact')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              selectedFilter === 'exact'
                ? 'bg-[#2C2A29] text-white font-medium'
                : 'text-[#6B6962] hover:text-[#1E1E1C]'
            }`}
          >
            Exact Matches Only
          </button>
          <button
            onClick={() => setSelectedFilter('alternative')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              selectedFilter === 'alternative'
                ? 'bg-[#2C2A29] text-white font-medium'
                : 'text-[#6B6962] hover:text-[#1E1E1C]'
            }`}
          >
            Similar Alternatives
          </button>
        </div>

        <span className="text-xs text-[#706E66]">Prices verified from active suppliers</span>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((prod) => {
          const isSelected = activeSurface.currentSelection.sku === prod.sku;
          const cost = getEstimatedCost(prod);
          const unitsNeeded = getRequiredUnits(prod);

          return (
            <div
              key={prod.sku}
              className={`bg-white rounded-lg border transition-all shadow-xs flex flex-col justify-between ${
                isSelected
                  ? 'border-[#2C2A29] ring-2 ring-[#2C2A29]/10'
                  : 'border-[#E8E6DF] hover:border-[#D1CEBF]'
              }`}
            >
              <div className="p-5 space-y-4">
                {/* Header: Match Tag + Swatch */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-md border border-black/10 shrink-0"
                      style={{ backgroundColor: prod.swatchColor }}
                    ></span>
                    <div>
                      <span className="text-[10px] text-[#8C887B] block uppercase tracking-wider">
                        {prod.manufacturer}
                      </span>
                      <span className="text-[11px] font-mono text-[#706E66]">SKU: {prod.sku}</span>
                    </div>
                  </div>

                  <div>
                    {prod.matchType === 'exact_identified' ? (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Exact Spec Match ({prod.visualMatchScore}%)
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Visually Similar ({prod.visualMatchScore}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Title */}
                <div>
                  <h3 className="font-serif text-lg text-[#1E1E1C] leading-snug">{prod.name}</h3>
                  <p className="text-xs text-[#5E5C56] mt-1.5 leading-relaxed">{prod.texture}</p>
                </div>

                {/* Match Reasoning Callout */}
                <div className="p-3 bg-[#FAF9F6] rounded border border-[#EDEAE3] text-xs text-[#5E5C56] space-y-1">
                  <span className="text-[10px] font-semibold uppercase text-[#8C887B] block">Match Rationale</span>
                  <span>{prod.matchReason}</span>
                </div>

                {/* Details Breakdown */}
                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex justify-between">
                    <span className="text-[#706E66]">Dimensions / Format:</span>
                    <span className="font-medium text-[#1E1E1C]">{prod.dimensions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#706E66]">Finish Profile:</span>
                    <span className="font-medium text-[#1E1E1C]">{prod.finish}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#706E66]">Lead Time:</span>
                    <span className="font-medium text-[#1E1E1C] flex items-center gap-1">
                      <Truck className="w-3 h-3 text-[#8C887B]" />
                      {prod.leadTimeWeeks} Weeks ({prod.inStock ? 'In Stock' : 'Made to Order'})
                    </span>
                  </div>
                </div>

                {/* Takeoff Pricing Box */}
                <div className="p-3.5 bg-[#FAF8F5] rounded border border-[#EBE4D5] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-[#8C887B] block">Unit Price</span>
                    <span className="font-mono text-sm font-semibold text-[#1E1E1C]">
                      ${prod.pricePerUnit.toFixed(2)} / {prod.priceUnit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-[#8C887B] block">Est. Surface Package ({unitsNeeded} units)</span>
                    <span className="font-mono text-base font-bold text-[#1E1E1C]">
                      ${cost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-[#FAF9F6] border-t border-[#E8E6DF] flex items-center gap-2">
                <button
                  onClick={() => onSelectProduct(activeSurface.id, prod)}
                  className={`flex-1 py-2 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white'
                      : 'bg-[#2C2A29] hover:bg-[#1E1E1C] text-white'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Active for Project</span>
                    </>
                  ) : (
                    <span>Select for Project</span>
                  )}
                </button>

                {prod.sampleAvailable && (
                  <button
                    onClick={() => handleSampleClick(prod)}
                    className="px-3 py-2 bg-white hover:bg-[#EDEAE3] border border-[#DDD7C8] text-[#1E1E1C] text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1"
                    title="Order Swatch Sample Kit to Room"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>
                      {sampleOrderedSku === prod.sku ? 'Sample Added' : 'Order Sample'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
