import React, { useState } from 'react';
import { SurfaceFinish, MaterialProduct, RoomModel, DesignAlternative } from '../types';
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
  roomModel?: RoomModel;
  activeDesign?: DesignAlternative;
}

export const MaterialDiscoveryPanel: React.FC<MaterialDiscoveryPanelProps> = ({
  surface,
  onSelectProduct,
  onOrderSample,
  allSurfaces,
  onSwitchSurface,
  roomModel,
  activeDesign,
}) => {
  const activeSurface = surface || allSurfaces[0];
  
  // Calculator state
  const [wastePercent, setWastePercent] = useState<number>(10);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'exact' | 'spec_match' | 'alternative'>('all');
  const [sampleOrderedSku, setSampleOrderedSku] = useState<string | null>(null);
  const [sampleFeedback, setSampleFeedback] = useState<string | null>(null);

  if (!activeSurface) {
    return null;
  }

  // Calculate quantities from single source of truth
  const netArea = activeSurface.surfaceType === 'flooring' && roomModel
    ? roomModel.areaSqFt
    : activeSurface.approxAreaSqFt;
  const wasteAllowanceSqFt = Math.ceil(netArea * (wastePercent / 100));
  const requiredCoverageSqFt = netArea + wasteAllowanceSqFt;
  
  const getPackageCount = (prod: MaterialProduct) => {
    return Math.ceil(requiredCoverageSqFt / prod.coveragePerUnit);
  };

  const getPurchasedCoverage = (prod: MaterialProduct) => {
    return Number((getPackageCount(prod) * prod.coveragePerUnit).toFixed(1));
  };

  const getEstimatedCost = (prod: MaterialProduct) => {
    const packages = getPackageCount(prod);
    if (prod.priceUnit === 'gallon' || prod.priceUnit === 'box' || prod.priceUnit === 'piece') {
      return Math.round(packages * prod.pricePerUnit);
    }
    // For sq.ft priced items sold in cartons, price is packages * coveragePerBox * pricePerSqFt
    return Math.round(packages * prod.coveragePerUnit * prod.pricePerUnit);
  };

  // Products filtered for this surface type
  const products = CATALOG_MATERIALS.filter((m) => {
    if (activeSurface.surfaceType === 'flooring') return m.category === 'flooring';
    if (activeSurface.surfaceType === 'wall_paint') return m.category === 'wall_paint';
    if (activeSurface.surfaceType === 'accent_tile') return m.category === 'wall_tile';
    return true;
  });

  // Dynamically determine match status bound to activeDesign and current surface selection
  const getProductMatchClassification = (prod: MaterialProduct): {
    type: 'exact' | 'spec_match' | 'alternative';
    label: string;
    badgeClass: string;
  } => {
    const isCurrentActiveExact = activeSurface.currentSelection.sku === prod.sku;
    if (isCurrentActiveExact) {
      return {
        type: 'exact',
        label: 'Exact Product in Design',
        badgeClass: 'text-emerald-800 bg-emerald-50 border-emerald-300 font-semibold',
      };
    }
    if (prod.matchType === 'specification_match' || (prod.category === activeSurface.currentSelection.category && prod.visualMatchScore >= 90)) {
      return {
        type: 'spec_match',
        label: 'Specification Match',
        badgeClass: 'text-indigo-800 bg-indigo-50 border-indigo-300 font-medium',
      };
    }
    return {
      type: 'alternative',
      label: 'Visually Similar Alternative',
      badgeClass: 'text-amber-800 bg-amber-50 border-amber-300 font-medium',
    };
  };

  const filteredProducts = products.filter((p) => {
    const match = getProductMatchClassification(p);
    if (selectedFilter === 'exact') return match.type === 'exact';
    if (selectedFilter === 'spec_match') return match.type === 'spec_match';
    if (selectedFilter === 'alternative') return match.type === 'alternative';
    return true;
  });

  const handleSampleClick = (prod: MaterialProduct) => {
    onOrderSample(prod);
    setSampleOrderedSku(prod.sku);
    setSampleFeedback(`Sample requested: 1x physical material swatch (${prod.name}) queued for delivery. Tracking #AS-SMPL-${prod.sku.replace(/[^0-9]/g, '') || '9401'} (Demonstration Order).`);
    setTimeout(() => {
      setSampleOrderedSku(null);
      setSampleFeedback(null);
    }, 4500);
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
              Measured Net Surface Area:
            </span>
            <span className="font-mono font-semibold text-[#1E1E1C]">{netArea} sq ft</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="text-[#706E66]">Waste & Cut Allowance:</label>
              <span className="font-mono font-medium text-[#1E1E1C]">{wastePercent}% (+{wasteAllowanceSqFt} sq ft)</span>
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
              <span>10% (Standard Planks)</span>
              <span>15%+ (Angles & Nooks)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E2DFD6] space-y-1 text-xs">
            <div className="flex justify-between text-[#706E66]">
              <span>Required Gross Coverage:</span>
              <span className="font-mono font-medium text-[#1E1E1C]">{requiredCoverageSqFt} sq ft</span>
            </div>
            <div className="text-[11px] text-[#8C887B]">
              Packages are rounded up to whole boxes/cans to prevent shortfalls.
            </div>
          </div>
        </div>
      </div>

      {sampleFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{sampleFeedback}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-white rounded-lg border border-[#E8E6DF]">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-[#2C2A29] text-white font-medium'
                : 'text-[#6B6962] hover:text-[#1E1E1C]'
            }`}
          >
            All Verified Catalog ({products.length})
          </button>
          <button
            onClick={() => setSelectedFilter('exact')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              selectedFilter === 'exact'
                ? 'bg-[#2C2A29] text-white font-medium'
                : 'text-[#6B6962] hover:text-[#1E1E1C]'
            }`}
          >
            Exact Product in Design
          </button>
          <button
            onClick={() => setSelectedFilter('spec_match')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              selectedFilter === 'spec_match'
                ? 'bg-[#2C2A29] text-white font-medium'
                : 'text-[#6B6962] hover:text-[#1E1E1C]'
            }`}
          >
            Specification Matches
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

        <span className="text-xs text-[#706E66]">Prices verified directly from trade suppliers</span>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((prod) => {
          const isSelected = activeSurface.currentSelection.sku === prod.sku;
          const cost = getEstimatedCost(prod);
          const packagesNeeded = getPackageCount(prod);
          const purchasedCoverage = getPurchasedCoverage(prod);
          const matchInfo = getProductMatchClassification(prod);

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
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${matchInfo.badgeClass}`}>
                      {matchInfo.label} ({prod.visualMatchScore}%)
                    </span>
                  </div>
                </div>

                {/* Product Title */}
                <div>
                  <h3 className="font-serif text-lg text-[#1E1E1C] leading-snug">{prod.name}</h3>
                  <p className="text-xs text-[#5E5C56] mt-1.5 leading-relaxed">{prod.texture}</p>
                </div>

                {/* Match Reasoning & Attribute Differences */}
                <div className="p-3 bg-[#FAF9F6] rounded border border-[#EDEAE3] text-xs text-[#5E5C56] space-y-1.5">
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-[#8C887B] block">Design Correlation</span>
                    <span>{prod.matchReason}</span>
                  </div>

                  {prod.attributesMatch && prod.attributesMatch.length > 0 && (
                    <div className="pt-1 border-t border-[#EAE6DD] text-[11px]">
                      <span className="text-emerald-800 font-medium">✓ Matching Attributes: </span>
                      <span>{prod.attributesMatch.join(', ')}</span>
                    </div>
                  )}

                  {prod.attributesDiffer && prod.attributesDiffer.length > 0 && prod.attributesDiffer[0] !== 'None' && (
                    <div className="text-[11px]">
                      <span className="text-amber-800 font-medium">⚠ Specification Difference: </span>
                      <span>{prod.attributesDiffer.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Installation Suitability */}
                {prod.installationSuitability && (
                  <div className="text-[11px] text-[#706E66] bg-[#F7F5F0] p-2 rounded border border-[#EDE8DE]">
                    <span className="font-semibold text-[#5C4033]">Installation Suitability: </span>
                    <span>{prod.installationSuitability}</span>
                  </div>
                )}

                {/* Details Breakdown */}
                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex justify-between">
                    <span className="text-[#706E66]">Format / Dimensions:</span>
                    <span className="font-medium text-[#1E1E1C]">{prod.dimensions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#706E66]">Finish Profile:</span>
                    <span className="font-medium text-[#1E1E1C]">{prod.finish}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#706E66]">Packaging Yield:</span>
                    <span className="font-mono text-[#1E1E1C]">{prod.packageCoverageLabel || `${prod.coveragePerUnit} sq ft per container`}</span>
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
                <div className="p-3.5 bg-[#FAF8F5] rounded border border-[#EBE4D5] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-[#8C887B] block">Unit Price</span>
                      <span className="font-mono text-sm font-semibold text-[#1E1E1C]">
                        ${prod.pricePerUnit.toFixed(2)} / {prod.priceUnit}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-[#8C887B] block">
                        Order: {packagesNeeded} {prod.priceUnit === 'gallon' ? 'Containers' : 'Boxes'}
                      </span>
                      <span className="font-mono text-base font-bold text-[#1E1E1C]">
                        ${cost.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] text-[#706E66] pt-1.5 border-t border-[#EAE3D2]">
                    <span>Purchased Coverage:</span>
                    <span className="font-mono font-medium text-[#1E1E1C]">
                      {purchasedCoverage} sq ft ({purchasedCoverage > requiredCoverageSqFt ? `+${(purchasedCoverage - requiredCoverageSqFt).toFixed(1)} sq ft surplus` : 'exact'})
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
                      <span>Active for Room</span>
                    </>
                  ) : (
                    <span>Select for Room</span>
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
                      {sampleOrderedSku === prod.sku ? 'Sample Queued' : 'Order Sample'}
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
