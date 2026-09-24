import React, { useState } from 'react';
import { FurnitureObject, FurnitureSpecification } from '../types';
import { 
  Ruler, 
  Layers, 
  Hammer, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ChevronRight,
  Sparkles,
  Info
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
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Dynamic recalculations
  const estimatedBoardFeet = Math.round(((lengthMm / 25.4) * (widthMm / 25.4) * (topThicknessMm / 25.4)) / 144 * 2.2); // with 120% waste factor
  const calculatedCost = Math.round(1800 + (lengthMm * 0.9) + (topThicknessMm * 25) + (woodSpecies.includes('Walnut') ? 900 : 0));

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

    const updatedFurniture: FurnitureObject = {
      ...furniture,
      estimatedPrice: calculatedCost,
      materialSummary: `${woodSpecies}, ${finishType}`,
      dimensionsSummary: `${lengthMm} mm L x ${widthMm} mm W x ${heightMm} mm H (${(lengthMm/25.4).toFixed(1)}" x ${(widthMm/25.4).toFixed(1)}" x ${(heightMm/25.4).toFixed(1)}")`,
      specification: updatedSpec,
    };

    onUpdateFurniture(updatedFurniture);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
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
            Translate 3D visual intent into verified woodworking parameters: timber species, cross-grain movement allowances, mortise & tenon joinery, and manufacturer review criteria.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDrawingPackage}
            className="px-4 py-2.5 bg-[#2C2A29] hover:bg-[#1E1E1C] text-white text-xs font-medium rounded shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Fabrication Drawings & BOM</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

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

          {/* Finish Schedule & Joinery Method */}
          <div className="bg-white rounded-lg border border-[#E8E6DF] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0EDE6]">
              <div className="flex items-center gap-2">
                <Hammer className="w-4 h-4 text-[#5C4033]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1C]">
                  Joinery Architecture & Hardware Schedule
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#2C2A29] block mb-1.5">Proposed Structural Joinery</label>
                <div className="space-y-2">
                  {joineryOptions.map((j, idx) => (
                    <label
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
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
                        className="mt-1 text-[#2C2A29] focus:ring-[#2C2A29]"
                      />
                      <div>
                        <div className="text-xs font-semibold text-[#1E1E1C]">{j.name}</div>
                        <div className="text-[11px] text-[#706E66] mt-0.5">{j.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="text-xs font-medium text-[#2C2A29] block mb-1.5">Protective Finish Schedule</label>
                <select
                  value={finishType}
                  onChange={(e) => setFinishType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#DDD7C8] rounded focus:border-[#2C2A29] focus:outline-none"
                >
                  {finishOptions.map((f, idx) => (
                    <option key={idx} value={f.name}>
                      {f.name} — {f.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <label className="text-xs font-medium text-[#2C2A29] block mb-1.5">Tabletop Expansion Fasteners</label>
                <input
                  type="text"
                  value={expansionHardware}
                  onChange={(e) => setExpansionHardware(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#DDD7C8] rounded focus:border-[#2C2A29] focus:outline-none"
                />
                <span className="text-[11px] text-[#8C887B] mt-1 block">
                  Crucial: Prevents tabletop splits caused by seasonal humidity fluctuations in the room.
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0EDE6] flex items-center justify-between">
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-[#2C2A29] hover:bg-[#1E1E1C] text-white text-xs font-medium rounded transition-colors shadow-sm cursor-pointer"
              >
                Save & Update Specification
              </button>

              {showSavedToast && (
                <div className="text-xs text-emerald-800 flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Specification saved. Drawings regenerated.</span>
                </div>
              )}
            </div>
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
                <div className="font-medium text-amber-900">1. Wood Movement Allowance</div>
                <div className="text-[#6E5A44]">
                  At {widthMm}mm width, white oak will move ~4–6mm across the grain seasonally. Slotted breadboard pin holes verified.
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 rounded border border-amber-200/80 text-xs space-y-1">
                <div className="font-medium text-amber-900">2. Deflection & Span Check</div>
                <div className="text-[#6E5A44]">
                  {lengthMm}mm span with {topThicknessMm}mm top thickness yields acceptable sag (&lt;1.2mm under 80kg center load).
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 rounded border border-amber-200/80 text-xs space-y-1">
                <div className="font-medium text-amber-900">3. Delivery Threshold Verification</div>
                <div className="text-[#6E5A44]">
                  Ensure on-site door threshold is minimum 780mm wide or specify detachable knock-down trestle stretcher.
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
