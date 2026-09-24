import React, { useState } from 'react';
import { FurnitureObject, FurnitureSpecification } from '../types';
import { 
  generateTableBOM, 
  generateCredenzaBOM, 
  calculateFurniturePrice, 
  calculateWoodMovement, 
  getWoodProperty 
} from '../utils/furnitureCalculations';
import { 
  Ruler, 
  Layers, 
  Hammer, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ChevronRight,
  Sparkles,
  Info,
  RotateCcw
} from 'lucide-react';

interface FurnitureSpecEditorProps {
  furniture: FurnitureObject;
  onUpdateFurniture: (updated: FurnitureObject) => void;
  onOpenDrawingPackage: () => void;
}

export const FurnitureSpecEditor: React.FC<FurnitureSpecEditorProps> = ({
  furniture,
  onUpdateFurniture,
  onOpenDrawingPackage,
}) => {
  const spec = furniture.specification;

  if (!spec) {
    return (
      <div className="bg-white p-8 rounded-lg border border-[#E8E6DF] text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
        <h2 className="font-serif text-xl">Catalog Item</h2>
        <p className="text-xs text-[#706E66]">
          This piece is a standard catalog product from {furniture.supplierName}. 
          To edit custom millwork specifications, select a custom concept like the Odin Trestle Dining Table.
        </p>
      </div>
    );
  }

  // Local state for editable fields
  const [lengthMm, setLengthMm] = useState(spec.overallLengthMm);
  const [widthMm, setWidthMm] = useState(spec.overallWidthMm);
  const [heightMm, setHeightMm] = useState(spec.overallHeightMm);
  const [topThicknessMm, setTopThicknessMm] = useState(spec.topThicknessMm);
  const [woodSpecies, setWoodSpecies] = useState(spec.woodSpecies);
  const [finishType, setFinishType] = useState(spec.finishType);
  const [joineryMethod, setJoineryMethod] = useState(spec.joineryMethod);
  const [seatingCapacity, setSeatingCapacity] = useState(spec.seatingCapacity);
  const [expansionHardware, setExpansionHardware] = useState(spec.expansionHardware);
  
  // Homeowner prioritized decisions
  const [edgeShape, setEdgeShape] = useState<string>('Soft Beveled Chamfer Edge (45° under-bevel)');
  const [deliveryMethod, setDeliveryMethod] = useState<'flat_pack' | 'assembled'>('flat_pack');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [lastChangeSummary, setLastChangeSummary] = useState<string | null>(null);

  // History state for Undo
  const [history, setHistory] = useState<FurnitureSpecification[]>([]);

  // Sync state if furniture prop changes
  React.useEffect(() => {
    setLengthMm(spec.overallLengthMm);
    setWidthMm(spec.overallWidthMm);
    setHeightMm(spec.overallHeightMm);
    setTopThicknessMm(spec.topThicknessMm);
    setWoodSpecies(spec.woodSpecies);
    setFinishType(spec.finishType);
    setJoineryMethod(spec.joineryMethod);
    setSeatingCapacity(spec.seatingCapacity);
    setExpansionHardware(spec.expansionHardware);
  }, [furniture.id]);

  // Dynamic recalculations
  const woodProp = getWoodProperty(woodSpecies);
  const woodMovement = calculateWoodMovement(woodSpecies, widthMm);

  const estimatedBoardFeet = Math.round(((lengthMm / 25.4) * (widthMm / 25.4) * (topThicknessMm / 25.4)) / 144 * 2.2); // with 120% waste factor

  // Generate dynamic BOM preview for current form state
  const currentBOM = furniture.category === 'credenza'
    ? generateCredenzaBOM({
        ...spec,
        overallLengthMm: lengthMm,
        overallWidthMm: widthMm,
        overallHeightMm: heightMm,
        topThicknessMm,
        woodSpecies,
      }, woodSpecies)
    : generateTableBOM({
        ...spec,
        overallLengthMm: lengthMm,
        overallWidthMm: widthMm,
        overallHeightMm: heightMm,
        topThicknessMm,
        woodSpecies,
      }, woodSpecies);

  const calculatedCost = calculateFurniturePrice(currentBOM, furniture.category);

  const woodOptions = [
    { name: 'Select American White Oak (Quercus alba)', tag: 'Durable, prominent medullary rays, neutral warm tone' },
    { name: 'American Black Walnut (Juglans nigra)', tag: 'Deep chocolate violet hues, rich grain, luxury premium' },
    { name: 'Blonde White Ash (Fraxinus americana)', tag: 'Ultra-bright elastic grain, modern Scandinavian style' },
    { name: 'Hard Sugar Maple (Acer saccharum)', tag: 'Dense closed-pore grain, blonde cream tone' },
    { name: 'American Black Cherry (Prunus serotina)', tag: 'Warm amber aging patina, silky smooth hand' },
  ];

  const finishOptions = [
    { name: 'Rubio Monocoat 2C Pure (Plant-based hardwax oil)', desc: 'Zero VOC, matte natural wood texture' },
    { name: 'Osmo Polyx-Oil Raw 3044 (Matte Natural)', desc: 'Micro-pigmented white keeps oak from ambering' },
    { name: 'Traditional Danish Soap Finish (Flaked Castile)', desc: 'Authentic untreated Scandinavian tactile feel' },
    { name: 'Satin Conversion Varnish (Commercial Clear)', desc: 'High chemical resistance for heavy wine/food spills' },
  ];

  const joineryOptions = [
    { name: 'Mortise & Tenon base with pegged breadboard ends', desc: 'Allows seasonal cross-grain expansion of tabletop' },
    { name: 'Sliding Dovetail under-top transverse battens', desc: 'Concealed wood stabilization without visible end breadboards' },
    { name: 'Half-Lap Japanese Trestle Joinery', desc: 'Interlocking architectural joinery with wedged keys' },
  ];

  const handleSave = () => {
    // Push current spec to undo history
    setHistory((prev) => [...prev, spec]);

    const updatedSpec: FurnitureSpecification = {
      ...spec,
      overallLengthMm: lengthMm,
      overallWidthMm: widthMm,
      overallHeightMm: heightMm,
      topThicknessMm,
      woodSpecies,
      finishType,
      joineryMethod,
      seatingCapacity,
      expansionHardware,
    };

    const newBOM = furniture.category === 'credenza'
      ? generateCredenzaBOM(updatedSpec, woodSpecies)
      : generateTableBOM(updatedSpec, woodSpecies);

    const newPrice = calculateFurniturePrice(newBOM, furniture.category);

    const hasSpecChanged =
      spec.overallLengthMm !== lengthMm ||
      spec.overallWidthMm !== widthMm ||
      spec.overallHeightMm !== heightMm ||
      spec.woodSpecies !== woodSpecies ||
      spec.topThicknessMm !== topThicknessMm;

    let updatedDrawingPackage = furniture.drawingPackage;
    if (updatedDrawingPackage) {
      const prevRev = updatedDrawingPackage.revision || 'Rev A';
      const revLetter = prevRev.replace('Rev', '').trim();
      const nextChar = String.fromCharCode(revLetter.charCodeAt(0) + 1);
      const nextRev = hasSpecChanged ? `Rev ${nextChar}` : prevRev;

      const changeNote = `Respecified to ${lengthMm}×${widthMm}×${heightMm}mm in ${woodSpecies}`;
      const updatedHistory = [
        ...(updatedDrawingPackage.revisionHistory || []),
        ...(hasSpecChanged ? [{
          revision: nextRev,
          date: new Date().toISOString().split('T')[0],
          changeNote,
          author: 'Specification Editor',
        }] : []),
      ];

      updatedDrawingPackage = {
        ...updatedDrawingPackage,
        status: hasSpecChanged ? 'concept_draft' : updatedDrawingPackage.status,
        packageType: hasSpecChanged ? 'concept_package' : updatedDrawingPackage.packageType,
        isApprovalInvalidated: hasSpecChanged && (updatedDrawingPackage.packageType === 'manufacturing_package' || updatedDrawingPackage.status === 'approved_for_manufacturing'),
        invalidationReason: hasSpecChanged
          ? `Specification edited after approval: Dimensions updated to ${lengthMm}×${widthMm}mm, species: ${woodSpecies}. Re-approval required.`
          : undefined,
        approvedBy: hasSpecChanged ? undefined : updatedDrawingPackage.approvedBy,
        approvedDate: hasSpecChanged ? undefined : updatedDrawingPackage.approvedDate,
        reviewerSignOff: hasSpecChanged ? undefined : updatedDrawingPackage.reviewerSignOff,
        revision: nextRev,
        drawnDate: new Date().toISOString().split('T')[0],
        bom: newBOM,
        revisionHistory: updatedHistory,
      };
    }

    const updatedFurniture: FurnitureObject = {
      ...furniture,
      estimatedPrice: newPrice,
      materialSummary: `${woodSpecies}, ${finishType}`,
      dimensionsSummary: `${lengthMm} mm L x ${widthMm} mm W x ${heightMm} mm H (${(lengthMm/25.4).toFixed(1)}" x ${(widthMm/25.4).toFixed(1)}" x ${(heightMm/25.4).toFixed(1)}")`,
      specification: updatedSpec,
      drawingPackage: updatedDrawingPackage,
    };

    onUpdateFurniture(updatedFurniture);
    setLastChangeSummary(`Updated ${furniture.name} to ${lengthMm}×${widthMm}mm (${woodSpecies.split('(')[0].trim()}). Drawing package regenerated at ${updatedDrawingPackage?.revision || 'Rev A'} — Document status set to Concept Draft.`);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 4000);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousSpec = history[history.length - 1];
    setHistory(history.slice(0, -1));

    setLengthMm(previousSpec.overallLengthMm);
    setWidthMm(previousSpec.overallWidthMm);
    setHeightMm(previousSpec.overallHeightMm);
    setTopThicknessMm(previousSpec.topThicknessMm);
    setWoodSpecies(previousSpec.woodSpecies);
    setFinishType(previousSpec.finishType);
    setJoineryMethod(previousSpec.joineryMethod);
    setSeatingCapacity(previousSpec.seatingCapacity);

    const revertedBOM = furniture.category === 'credenza'
      ? generateCredenzaBOM(previousSpec, previousSpec.woodSpecies)
      : generateTableBOM(previousSpec, previousSpec.woodSpecies);

    const revertedPrice = calculateFurniturePrice(revertedBOM, furniture.category);

    const revertedFurniture: FurnitureObject = {
      ...furniture,
      estimatedPrice: revertedPrice,
      materialSummary: `${previousSpec.woodSpecies}, ${previousSpec.finishType}`,
      dimensionsSummary: `${previousSpec.overallLengthMm} mm L x ${previousSpec.overallWidthMm} mm W x ${previousSpec.overallHeightMm} mm H`,
      specification: previousSpec,
      drawingPackage: furniture.drawingPackage ? {
        ...furniture.drawingPackage,
        bom: revertedBOM,
      } : undefined,
    };

    onUpdateFurniture(revertedFurniture);
    setLastChangeSummary('Reverted last edit. Prior dimensions and wood specifications restored.');
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-[#E8E6DF] pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#8C887B]">
            Custom Millwork Engineering · Step 4 of 5
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1C] mt-1 font-normal">
            Custom Furniture Specification Editor
          </h1>
          <p className="text-sm text-[#5E5C56] mt-1.5 max-w-2xl">
            Configure homeowner priorities: dimensions, wood species, edge profiles, and maintenance expectations. Joinery and seasonal movement defaults are pre-engineered.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <button
              onClick={handleUndo}
              className="px-3.5 py-2 bg-[#FAF9F6] hover:bg-[#EFECE6] text-[#1E1E1C] border border-[#DDD7C8] text-xs font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Undo last modification"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo Last Edit</span>
            </button>
          )}

          <button
            onClick={onOpenDrawingPackage}
            className="px-4 py-2 bg-[#2C2A29] hover:bg-[#1E1E1C] text-white text-xs font-medium rounded shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Drawing Package & BOM</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Change Summary Notification */}
      {lastChangeSummary && (
        <div className="p-3.5 bg-[#FAF8F5] border border-[#E0D7C6] rounded-lg text-xs text-[#5C4033] flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#8C5835] shrink-0" />
            <span>{lastChangeSummary}</span>
          </div>
          <button
            onClick={() => setLastChangeSummary(null)}
            className="text-[#8C887B] hover:text-[#1E1E1C] font-semibold text-xs ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Form Left + Live Preview / Calculation Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editable Engineering Parameters */}
        <div className="lg:col-span-8 space-y-6">
          {/* Dimension Controls */}
          <div className="bg-white rounded-lg border border-[#E8E6DF] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0EDE6]">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-[#5C4033]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1C]">
                  Dimensional Scale & Seating Capacity
                </h3>
              </div>
              <span className="text-[11px] text-[#706E66]">Scale check against room model</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Length */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-medium text-[#2C2A29]">Table Length</label>
                  <span className="text-[#8C887B]">{(lengthMm / 25.4).toFixed(1)}"</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="50"
                    min="1600"
                    max="3400"
                    value={lengthMm}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setLengthMm(val);
                      // Adjust seating
                      if (val >= 2800) setSeatingCapacity(10);
                      else if (val >= 2200) setSeatingCapacity(8);
                      else setSeatingCapacity(6);
                    }}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#DDD7C8] rounded focus:border-[#2C2A29] focus:outline-none font-mono"
                  />
                  <span className="absolute right-3 top-2 text-xs text-[#8C887B]">mm</span>
                </div>
              </div>

              {/* Width */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-medium text-[#2C2A29]">Table Width</label>
                  <span className="text-[#8C887B]">{(widthMm / 25.4).toFixed(1)}"</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="25"
                    min="800"
                    max="1200"
                    value={widthMm}
                    onChange={(e) => setWidthMm(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#DDD7C8] rounded focus:border-[#2C2A29] focus:outline-none font-mono"
                  />
                  <span className="absolute right-3 top-2 text-xs text-[#8C887B]">mm</span>
                </div>
              </div>

              {/* Height */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-medium text-[#2C2A29]">Height</label>
                  <span className="text-[#8C887B]">{(heightMm / 25.4).toFixed(1)}"</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="5"
                    min="720"
                    max="780"
                    value={heightMm}
                    onChange={(e) => setHeightMm(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#DDD7C8] rounded focus:border-[#2C2A29] focus:outline-none font-mono"
                  />
                  <span className="absolute right-3 top-2 text-xs text-[#8C887B]">mm</span>
                </div>
              </div>
            </div>

            {/* Thickness and Seating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-medium text-[#2C2A29]">Top Thickness</label>
                  <span className="text-[#8C887B]">{(topThicknessMm / 25.4).toFixed(2)}" solid</span>
                </div>
                <select
                  value={topThicknessMm}
                  onChange={(e) => setTopThicknessMm(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#DDD7C8] rounded focus:border-[#2C2A29] focus:outline-none"
                >
                  <option value={32}>32 mm (1.25" nominal 6/4 hardwood)</option>
                  <option value={38}>38 mm (1.5" standard 8/4 hardwood)</option>
                  <option value={42}>42 mm (1.65" substantial estate scale)</option>
                  <option value={50}>50 mm (2.0" ultra-heavy monumental slab)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#2C2A29]">Target Seating Capacity</label>
                <div className="px-3 py-2 text-xs bg-[#F4F1EA] text-[#1E1E1C] rounded border border-[#E2DDD0] font-mono flex items-center justify-between">
                  <span>{seatingCapacity} Adults (With 28" chair center-to-center spacing)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timber Species & Grade Selection */}
          <div className="bg-white rounded-lg border border-[#E8E6DF] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0EDE6]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#5C4033]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1C]">
                  Solid Hardwood Species & Grain
                </h3>
              </div>
              <span className="text-[11px] text-[#706E66]">Kiln-dried 6-8% EMC</span>
            </div>

            <div className="space-y-2">
              {woodOptions.map((wood, idx) => (
                <label
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    woodSpecies === wood.name
                      ? 'border-[#2C2A29] bg-[#FAF8F5]'
                      : 'border-[#EDE9DF] hover:bg-[#FAF9F6]'
                  }`}
                >
                  <input
                    type="radio"
                    name="woodSpecies"
                    checked={woodSpecies === wood.name}
                    onChange={() => setWoodSpecies(wood.name)}
                    className="mt-1 text-[#2C2A29] focus:ring-[#2C2A29]"
                  />
                  <div>
                    <div className="text-xs font-semibold text-[#1E1E1C]">{wood.name}</div>
                    <div className="text-[11px] text-[#706E66] mt-0.5">{wood.tag}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Finish Schedule & Maintenance Expectations */}
          <div className="bg-white rounded-lg border border-[#E8E6DF] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0EDE6]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#5C4033]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1C]">
                  Finish Preferences & Maintenance Expectations
                </h3>
              </div>
              <span className="text-[11px] text-[#706E66]">Tactile profile & care level</span>
            </div>

            <div className="space-y-2.5">
              {finishOptions.map((f, idx) => {
                const isSelected = finishType.includes(f.name.split('(')[0].trim());
                return (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#2C2A29] bg-[#FAF8F5]'
                        : 'border-[#EDE9DF] hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="finishType"
                      checked={isSelected}
                      onChange={() => setFinishType(f.name)}
                      className="mt-1 text-[#2C2A29] focus:ring-[#2C2A29]"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-[#1E1E1C]">{f.name}</div>
                      <div className="text-[11px] text-[#706E66] mt-0.5">{f.desc}</div>
                      <div className="text-[10px] text-[#8C887B] mt-1 font-mono">
                        Maintenance: {idx === 3 ? 'Ultra-low (wipe clean with damp cloth)' : idx === 2 ? 'Monthly gentle castile soap conditioning' : 'Bi-annual refresh oil buffing'}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Edge Shape & Delivery Configuration (Homeowner Decisions) */}
          <div className="bg-white rounded-lg border border-[#E8E6DF] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0EDE6]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1C]">
                Table Edge Profile & Delivery Configuration
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#2C2A29]">Tabletop Edge Profile</label>
                <select
                  value={edgeShape}
                  onChange={(e) => setEdgeShape(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#DDD7C8] rounded focus:border-[#2C2A29] focus:outline-none"
                >
                  <option value="Soft Beveled Chamfer Edge (45° under-bevel)">Soft Chamfer Bevel (Tactile & slender appearance)</option>
                  <option value="Square Architectural Minimalist (Eased 3mm)">Square Eased (Architectural modern geometry)</option>
                  <option value="Half-Bullnose Organic Radius">Half-Bullnose (Child-friendly rounded edge)</option>
                  <option value="Undercut Swiss Knife-Edge">Undercut Knife Edge (Floating visual effect)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#2C2A29]">Delivery & Ingress Handling</label>
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#DDD7C8] rounded focus:border-[#2C2A29] focus:outline-none"
                >
                  <option value="flat_pack">Knock-Down (Tabletop flat with legs unbolted · Fits all standard doors)</option>
                  <option value="assembled">Fully Assembled White-Glove (Requires 950mm doorway clearance)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Expandable Technical Details (Joinery & Movement Engineering) */}
          <details className="bg-white rounded-lg border border-[#E8E6DF] p-5 shadow-xs group">
            <summary className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1C] cursor-pointer list-none flex items-center justify-between select-none">
              <span className="flex items-center gap-2">
                <Hammer className="w-4 h-4 text-[#5C4033]" />
                <span>Technical Details & Joinery Engineering (Manufacturer Reviewed)</span>
              </span>
              <span className="text-[#8C887B] text-xs font-normal group-open:rotate-180 transition-transform">▼</span>
            </summary>

            <div className="pt-4 space-y-4 border-t border-[#F0EDE6] mt-4 text-xs">
              <p className="text-[#706E66]">
                These parameters use verified master-woodworker defaults. Changes will be audited during the manufacturer review step:
              </p>

              <div>
                <label className="text-xs font-medium text-[#2C2A29] block mb-1.5">Joinery Architecture</label>
                <div className="space-y-2">
                  {joineryOptions.map((j, idx) => (
                    <label
                      key={idx}
                      className={`flex items-start gap-3 p-2.5 rounded border cursor-pointer ${
                        joineryMethod === j.name
                          ? 'border-[#2C2A29] bg-[#FAF8F5]'
                          : 'border-[#EDE9DF] hover:bg-[#FAF9F6]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="joineryMethod"
                        checked={joineryMethod === j.name}
                        onChange={() => setJoineryMethod(j.name)}
                        className="mt-1 text-[#2C2A29]"
                      />
                      <div>
                        <div className="font-semibold text-[#1E1E1C]">{j.name}</div>
                        <div className="text-[11px] text-[#706E66]">{j.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#2C2A29] block mb-1">Seasonal Expansion Hardware</label>
                <input
                  type="text"
                  value={expansionHardware}
                  onChange={(e) => setExpansionHardware(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FAF9F6] border border-[#DDD7C8] rounded font-mono text-xs"
                />
              </div>
            </div>
          </details>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-[#2C2A29] hover:bg-[#1E1E1C] text-white text-xs font-medium rounded transition-colors shadow-sm cursor-pointer"
            >
              Save & Update Specification
            </button>

            {showSavedToast && (
              <div className="text-xs text-emerald-800 flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Specification saved. Re-approval required for manufacturing.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Fabrication Readiness & Review Items */}
        <div className="lg:col-span-4 space-y-6">
          {/* Engineering Cost & Lumber Estimate */}
          <div className="bg-white rounded-lg border border-[#E8E6DF] p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1C] pb-2 border-b border-[#F0EDE6]">
              Commission Estimate Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#706E66]">Lumber Volume:</span>
                <span className="font-mono font-medium text-[#1E1E1C]">{estimatedBoardFeet} Board Feet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#706E66]">Rough Lumber Cost:</span>
                <span className="font-mono text-[#1E1E1C]">${Math.round(estimatedBoardFeet * 14.5).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#706E66]">Craftsman Joinery (Labor):</span>
                <span className="font-mono text-[#1E1E1C]">${(calculatedCost - Math.round(estimatedBoardFeet * 14.5)).toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-[#F0EDE6] flex justify-between font-semibold">
                <span className="text-[#1E1E1C]">Total Commission Estimate:</span>
                <span className="font-mono text-base text-[#1E1E1C]">${calculatedCost.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded border border-[#EDE7DB] text-xs text-[#7A6048]">
              Estimated price covers hand-selected FAS rift lumber, CNC mortising, hand drawboring, and 2-coat natural oil finish.
            </div>
          </div>

          {/* User Confirmed vs Manufacturer Review Items (Product Brief requirement) */}
          <div className="bg-white rounded-lg border border-[#E8E6DF] p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1C]">
                Manufacturer Review Checklist
              </h3>
            </div>
            <p className="text-xs text-[#5E5C56]">
              The 3D render indicates aesthetic intent. The items below must be verified with the millwork fabricator prior to cutting:
            </p>

            <div className="space-y-2.5">
              <div className="p-3 bg-amber-50/60 rounded border border-amber-200/80 text-xs space-y-1">
                <div className="font-medium text-amber-900">1. Wood Movement Allowance ({woodProp.commonName})</div>
                <div className="text-[#6E5A44]">
                  Estimated: At {widthMm}mm width, {woodProp.commonName.toLowerCase()} will expand ~{woodMovement.seasonalExpansionMm}mm (±{woodMovement.halfMovement}mm) seasonally. Slotted breadboard pin holes designed in CAD; requires manufacturer verification during shop tooling.
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 rounded border border-amber-200/80 text-xs space-y-1">
                <div className="font-medium text-amber-900">2. Deflection & Span Check (Estimated)</div>
                <div className="text-[#6E5A44]">
                  Preliminary estimate: {lengthMm}mm span with {topThicknessMm}mm top thickness modeled for residential use. Exact live-load deflection calculation requires fabricator shop review.
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 rounded border border-amber-200/80 text-xs space-y-1">
                <div className="font-medium text-amber-900">3. Delivery Threshold Verification (Preliminary)</div>
                <div className="text-[#6E5A44]">
                  Estimated doorway threshold clearance ~780mm. Delivery path and stair turn clearances require homeowner site check or knocked-down joinery.
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenDrawingPackage}
                className="w-full py-2.5 bg-[#2C2A29] hover:bg-[#1E1E1C] text-white text-xs font-medium rounded transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View CAD Drawings & BOM Package</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
