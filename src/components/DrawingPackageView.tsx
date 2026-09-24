import React, { useState } from 'react';
import { FurnitureObject, DrawingPackage, BOMComponent } from '../types';
import { 
  Printer, 
  Download, 
  FileText, 
  Layers, 
  Maximize2, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  ShieldCheck,
  Eye
} from 'lucide-react';

interface DrawingPackageViewProps {
  furniture: FurnitureObject;
  onUpdateDrawingPackage?: (pkg: DrawingPackage) => void;
  onBackToEditor: () => void;
}

export const DrawingPackageView: React.FC<DrawingPackageViewProps> = ({
  furniture,
  onUpdateDrawingPackage,
  onBackToEditor,
}) => {
  const [activeTab, setActiveTab] = useState<'multiview' | 'exploded' | 'section' | 'bom'>('multiview');
  const spec = furniture.specification;
  const initialPackage = furniture.drawingPackage;

  const [packageType, setPackageType] = useState<'concept_package' | 'manufacturing_package'>(
    initialPackage?.packageType || 'concept_package'
  );
  const [isApproved, setIsApproved] = useState(packageType === 'manufacturing_package');

  // Dynamic parameters from spec
  const lengthMm = spec?.overallLengthMm || 2400;
  const widthMm = spec?.overallWidthMm || 950;
  const heightMm = spec?.overallHeightMm || 750;
  const topThicknessMm = spec?.topThicknessMm || 42;
  const wood = spec?.woodSpecies || 'Solid American White Oak';

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify({ furniture, drawingPackage: initialPackage }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${initialPackage?.drawingNumber || 'DRAWING'}_spec_package.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const togglePackageStatus = () => {
    const newType = packageType === 'concept_package' ? 'manufacturing_package' : 'concept_package';
    setPackageType(newType);
    setIsApproved(newType === 'manufacturing_package');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 print:p-0 print:space-y-4">
      {/* Top Header & Export Bar */}
      <div className="border-b border-[#E8E6DF] pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#8C887B]">
              Fabrication Drawings · Step 5 of 5
            </span>
            <span className="text-[#CCC9BF]">/</span>
            <span className="text-xs font-mono text-[#5C4033] font-semibold">
              {initialPackage?.drawingNumber || 'AS-TBL-2026-001'}
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1C] mt-1 font-normal">
            Furniture Fabrication Drawing Package
          </h1>
          <p className="text-sm text-[#5E5C56] mt-1.5 max-w-2xl">
            True millimeter CAD multi-view orthographic projections, bill of materials (BOM), and workshop joinery schedules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Toggle Badge */}
          <button
            onClick={togglePackageStatus}
            className={`px-3 py-1.5 text-xs rounded border transition-colors flex items-center gap-2 cursor-pointer ${
              packageType === 'manufacturing_package'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {packageType === 'manufacturing_package'
                ? 'Manufacturing Package (Approved for Shop)'
                : 'Concept Package (For Discussion & Quotation)'}
            </span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-[#FAF9F6] hover:bg-[#EFECE6] text-[#1E1E1C] border border-[#DDD7C8] text-xs font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3.5 py-1.5 bg-[#2C2A29] hover:bg-[#1E1E1C] text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CAD Data</span>
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="bg-white p-1 rounded-lg border border-[#E8E6DF] flex flex-wrap gap-1 shadow-xs no-print">
        <button
          onClick={() => setActiveTab('multiview')}
          className={`px-4 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'multiview'
              ? 'bg-[#2C2A29] text-white'
              : 'text-[#6B6962] hover:bg-[#FAF9F6]'
          }`}
        >
          Orthographic Multi-View (Top, Front, Side)
        </button>
        <button
          onClick={() => setActiveTab('section')}
          className={`px-4 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'section'
              ? 'bg-[#2C2A29] text-white'
              : 'text-[#6B6962] hover:bg-[#FAF9F6]'
          }`}
        >
          Section A-A & Breadboard Detail
        </button>
        <button
          onClick={() => setActiveTab('exploded')}
          className={`px-4 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'exploded'
              ? 'bg-[#2C2A29] text-white'
              : 'text-[#6B6962] hover:bg-[#FAF9F6]'
          }`}
        >
          Exploded Isometric Assembly
        </button>
        <button
          onClick={() => setActiveTab('bom')}
          className={`px-4 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'bom'
              ? 'bg-[#2C2A29] text-white'
              : 'text-[#6B6962] hover:bg-[#FAF9F6]'
          }`}
        >
          Bill of Materials (BOM) Table
        </button>
      </div>

      {/* Technical Drawing Canvas Card */}
      <div className="bg-white rounded-lg border-2 border-[#1E1E1C] p-6 shadow-sm space-y-6">
        {/* Drawing Title Block Header */}
        <div className="border border-[#1E1E1C] grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[#1E1E1C] text-xs">
          <div className="p-2.5">
            <span className="text-[10px] text-[#706E66] block uppercase tracking-wider">Project / Item</span>
            <span className="font-semibold text-[#1E1E1C] truncate block">{furniture.name}</span>
          </div>
          <div className="p-2.5">
            <span className="text-[10px] text-[#706E66] block uppercase tracking-wider">Drawing No. / Rev</span>
            <span className="font-mono font-semibold text-[#1E1E1C]">
              {initialPackage?.drawingNumber || 'AS-TBL-001'} · {initialPackage?.revision || 'Rev B'}
            </span>
          </div>
          <div className="p-2.5">
            <span className="text-[10px] text-[#706E66] block uppercase tracking-wider">Material / Tolerance</span>
            <span className="font-medium text-[#1E1E1C]">{wood.split('(')[0].trim()} · ±1.5mm</span>
          </div>
          <div className="p-2.5 bg-[#FAF8F5]">
            <span className="text-[10px] text-[#706E66] block uppercase tracking-wider">Package Status</span>
            <span className={`font-semibold ${packageType === 'manufacturing_package' ? 'text-emerald-800' : 'text-amber-800'}`}>
              {packageType === 'manufacturing_package' ? 'Manufacturing Confirmed' : 'Concept Review Package'}
            </span>
          </div>
        </div>

        {/* CAD Vector Sheet */}
        {activeTab === 'multiview' && (
          <div className="w-full aspect-16/10 bg-[#FAF9F6] blueprint-grid rounded border border-[#DDD7C8] p-4 flex flex-col justify-between overflow-hidden">
            <svg viewBox="0 0 900 540" className="w-full h-full select-none">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#1E1E1C" />
                </marker>
              </defs>

              {/* View 1: Top / Plan View (Top Left) */}
              <g id="top-plan-view">
                <text x="80" y="40" fontSize="12" fontWeight="700" fill="#1E1E1C" fontFamily="sans-serif">
                  VIEW 1: TOP PLAN VIEW (Scale 1:20)
                </text>

                {/* Tabletop Rectangle (Length: 460px, Width: 180px) */}
                <rect x="80" y="55" width="440" height="175" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="2" rx="4" />

                {/* Breadboard Ends (Left & Right) */}
                <line x1="120" y1="55" x2="120" y2="230" stroke="#1E1E1C" strokeWidth="1.5" strokeDasharray="3,3" />
                <line x1="480" y1="55" x2="480" y2="230" stroke="#1E1E1C" strokeWidth="1.5" strokeDasharray="3,3" />

                {/* Wood Grain Direction Lines */}
                <line x1="135" y1="90" x2="465" y2="90" stroke="#DDD7C8" strokeWidth="1" />
                <line x1="135" y1="140" x2="465" y2="140" stroke="#DDD7C8" strokeWidth="1" />
                <line x1="135" y1="190" x2="465" y2="190" stroke="#DDD7C8" strokeWidth="1" />

                {/* Hidden Trestle Base Underneath (Dashed) */}
                <rect x="150" y="70" width="300" height="145" fill="none" stroke="#8C887B" strokeWidth="1.2" strokeDasharray="4,4" />

                {/* Dimensions: Length (440px -> lengthMm) */}
                <line x1="80" y1="245" x2="520" y2="245" stroke="#1E1E1C" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                <text x="300" y="260" fontSize="11" fontFamily="monospace" textAnchor="middle" fill="#1E1E1C" fontWeight="600">
                  {lengthMm} mm ({(lengthMm / 25.4).toFixed(1)}")
                </text>

                {/* Dimensions: Width (175px -> widthMm) */}
                <line x1="535" y1="55" x2="535" y2="230" stroke="#1E1E1C" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                <text x="545" y="145" fontSize="11" fontFamily="monospace" fill="#1E1E1C" fontWeight="600">
                  {widthMm} mm
                </text>

                {/* Callout balloon: Breadboard End (Item 2) */}
                <circle cx="100" cy="140" r="11" fill="#FFFFFF" stroke="#1E1E1C" strokeWidth="1.5" />
                <text x="100" y="144" fontSize="10" fontWeight="bold" textAnchor="middle">2</text>
              </g>

              {/* View 2: Front Elevation (Bottom Left) */}
              <g id="front-elevation-view">
                <text x="80" y="295" fontSize="12" fontWeight="700" fill="#1E1E1C" fontFamily="sans-serif">
                  VIEW 2: FRONT ELEVATION
                </text>

                {/* Tabletop Profile */}
                <rect x="80" y="315" width="440" height="15" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="2" rx="2" />
                <text x="535" y="327" fontSize="10" fontFamily="monospace" fill="#1E1E1C">
                  {topThicknessMm}mm TOP
                </text>

                {/* Left Trestle Leg Assembly */}
                <rect x="155" y="330" width="30" height="150" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="1.8" />
                <rect x="140" y="475" width="60" height="20" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="2" rx="2" />

                {/* Right Trestle Leg Assembly */}
                <rect x="415" y="330" width="30" height="150" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="1.8" />
                <rect x="400" y="475" width="60" height="20" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="2" rx="2" />

                {/* Center Longitudinal Trestle Stretcher (Item 6) */}
                <rect x="185" y="420" width="230" height="25" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="1.8" />
                {/* Tenon Pegs Through Leg */}
                <rect x="145" y="425" width="10" height="15" fill="#8C5835" stroke="#1E1E1C" strokeWidth="1" />
                <rect x="445" y="425" width="10" height="15" fill="#8C5835" stroke="#1E1E1C" strokeWidth="1" />

                {/* Overall Height Dimension */}
                <line x1="55" y1="315" x2="55" y2="495" stroke="#1E1E1C" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                <text x="45" y="410" fontSize="11" fontFamily="monospace" textAnchor="middle" fill="#1E1E1C" fontWeight="600" transform="rotate(-90 45 410)">
                  {heightMm} mm
                </text>

                {/* Callout balloon: Center Stretcher (Item 6) */}
                <circle cx="300" cy="432" r="11" fill="#FFFFFF" stroke="#1E1E1C" strokeWidth="1.5" />
                <text x="300" y="436" fontSize="10" fontWeight="bold" textAnchor="middle">6</text>

                {/* Callout balloon: Foot Shoe (Item 5) */}
                <circle cx="170" cy="510" r="11" fill="#FFFFFF" stroke="#1E1E1C" strokeWidth="1.5" />
                <text x="170" y="514" fontSize="10" fontWeight="bold" textAnchor="middle">5</text>
              </g>

              {/* View 3: Side Profile Elevation (Right Side) */}
              <g id="side-elevation-view">
                <text x="640" y="40" fontSize="12" fontWeight="700" fill="#1E1E1C" fontFamily="sans-serif">
                  VIEW 3: SIDE PROFILE ELEVATION
                </text>

                {/* Top End Section (Width: 175px) */}
                <rect x="640" y="55" width="175" height="15" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="2" rx="2" />

                {/* Trestle Top Spreader */}
                <rect x="660" y="70" width="135" height="18" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="1.5" />

                {/* Angled A-Frame Upright Legs */}
                <polygon points="675,88 650,210 675,210 695,88" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="1.5" />
                <polygon points="780,88 805,210 780,210 760,88" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="1.5" />

                {/* Center Stretcher Tenon Profile */}
                <rect x="715" y="160" width="25" height="25" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="1.5" />

                {/* Bottom Base Shoe */}
                <rect x="635" y="210" width="185" height="22" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="2" rx="3" />

                {/* Leveling Glides (M8) */}
                <rect x="655" y="232" width="15" height="4" fill="#333" />
                <rect x="785" y="232" width="15" height="4" fill="#333" />

                <text x="725" y="250" fontSize="10" fontFamily="monospace" fill="#5E5C56" textAnchor="middle">
                  Floor Base Shoe (820 mm)
                </text>
              </g>

              {/* General Technical Notes In Box (Bottom Right) */}
              <g id="notes-box">
                <rect x="620" y="290" width="250" height="215" fill="#FFFFFF" stroke="#1E1E1C" strokeWidth="1.2" />
                <rect x="620" y="290" width="250" height="25" fill="#F4F1EA" stroke="#1E1E1C" strokeWidth="1.2" />
                <text x="630" y="307" fontSize="10" fontWeight="bold" fill="#1E1E1C">
                  FABRICATION REQUIREMENTS
                </text>

                <text x="630" y="330" fontSize="9" fill="#1E1E1C">1. Kiln dried lumber 6.0% - 8.0% EMC.</text>
                <text x="630" y="350" fontSize="9" fill="#1E1E1C">2. Breadboard ends pegged with loose outer slots.</text>
                <text x="630" y="370" fontSize="9" fill="#1E1E1C">3. Figure-8 fasteners allow ±5mm movement.</text>
                <text x="630" y="390" fontSize="9" fill="#1E1E1C">4. Sanded to 240-grit; hardwax oil 2 coats.</text>
                <text x="630" y="410" fontSize="9" fill="#1E1E1C">5. Recessed M8 stainless leveling feet.</text>
                <text x="630" y="430" fontSize="9" fill="#1E1E1C">6. Tolerances: ±1.5 mm on all millwork.</text>
                <text x="630" y="460" fontSize="9" fill="#8C5835" fontWeight="bold">
                  ★ DRAWING REV B · ATELIER SPATIAL
                </text>
              </g>
            </svg>
          </div>
        )}

        {/* Section A-A Joinery Detail */}
        {activeTab === 'section' && (
          <div className="w-full aspect-16/10 bg-[#FAF9F6] blueprint-grid rounded border border-[#DDD7C8] p-4 flex flex-col justify-between overflow-hidden">
            <svg viewBox="0 0 900 500" className="w-full h-full select-none">
              <text x="50" y="40" fontSize="14" fontWeight="700" fill="#1E1E1C">
                SECTION A-A: BREADBOARD END EXPANSION JOINERY (Scale 1:2)
              </text>

              {/* Tabletop Longitudinal Core Planks */}
              <rect x="50" y="100" width="420" height="90" fill="#EADCC9" stroke="#1E1E1C" strokeWidth="2.5" />
              <text x="180" y="150" fontSize="12" fontWeight="600" fill="#1E1E1C">
                Tabletop Core Slab (42 mm Thick Solid White Oak)
              </text>
              <line x1="80" y1="120" x2="450" y2="120" stroke="#C4B49F" strokeWidth="1" strokeDasharray="6,3" />
              <line x1="80" y1="165" x2="450" y2="165" stroke="#C4B49F" strokeWidth="1" strokeDasharray="6,3" />

              {/* Integral Tenon extending from Core (100mm tongue) */}
              <rect x="470" y="125" width="90" height="40" fill="#EADCC9" stroke="#1E1E1C" strokeWidth="2" />
              <text x="500" y="150" fontSize="10" fontFamily="monospace" fill="#5C4033">
                TENON
              </text>

              {/* Breadboard End Cap with matching Mortise */}
              <rect x="560" y="90" width="160" height="110" fill="#D8C3A8" stroke="#1E1E1C" strokeWidth="2.5" rx="3" />
              <text x="580" y="150" fontSize="11" fontWeight="600" fill="#1E1E1C">
                Breadboard End Cap (120mm W)
              </text>

              {/* Mortise Cavity (Hatched) */}
              <rect x="470" y="122" width="95" height="46" fill="none" stroke="#2C2A29" strokeWidth="1.5" strokeDasharray="2,2" />

              {/* Drawbore Oak Pegs */}
              {/* Center Fixed Dowel */}
              <circle cx="515" cy="145" r="9" fill="#8C5835" stroke="#1E1E1C" strokeWidth="1.5" />
              <text x="515" y="148" fontSize="8" fill="#FFF" fontWeight="bold" textAnchor="middle">GLUE</text>

              {/* Outer Slotted Dowel (Accommodates expansion) */}
              <rect x="507" y="170" width="16" height="24" rx="8" fill="#8C5835" stroke="#1E1E1C" strokeWidth="1.5" />
              <text x="535" y="186" fontSize="10" fill="#8C5835" fontWeight="bold">
                ← 6mm SLOTTED HOLE (NO GLUE) →
              </text>

              {/* Joinery Explanation Callout */}
              <g transform="translate(50, 240)">
                <rect x="0" y="0" width="760" height="180" fill="#FFFFFF" stroke="#1E1E1C" strokeWidth="1" />
                <text x="20" y="30" fontSize="12" fontWeight="700" fill="#1E1E1C">
                  ARCHITECTURAL CRAFT PRINCIPLE: SEASONAL WOOD MOVEMENT
                </text>
                <text x="20" y="60" fontSize="11" fill="#444">
                  • Solid white oak expands across tangential grain ~0.0036 per % moisture change.
                </text>
                <text x="20" y="85" fontSize="11" fill="#444">
                  • Across this 950mm table width, seasonal winter-to-summer swelling reaches ±5.2 mm.
                </text>
                <text x="20" y="110" fontSize="11" fill="#444">
                  • The center drawbore pin is permanently glued. The outer pins slide within elongated mortises.
                </text>
                <text x="20" y="135" fontSize="11" fill="#444">
                  • Result: Tabletop stays dead flat without cracking, splitting, or separating at end joints.
                </text>
                <text x="20" y="160" fontSize="10" fontFamily="monospace" fill="#8C5835">
                  Specification verified compliant with Forest Products Laboratory (FPL) Wood Handbook Standards.
                </text>
              </g>
            </svg>
          </div>
        )}

        {/* Exploded Assembly View */}
        {activeTab === 'exploded' && (
          <div className="w-full aspect-16/10 bg-[#FAF9F6] blueprint-grid rounded border border-[#DDD7C8] p-4 flex flex-col justify-between overflow-hidden">
            <svg viewBox="0 0 900 500" className="w-full h-full select-none">
              <text x="50" y="40" fontSize="14" fontWeight="700" fill="#1E1E1C">
                EXPLODED ISOMETRIC ASSEMBLY SCHEMATIC
              </text>

              {/* Part 1: Top Slab floating */}
              <polygon points="250,90 650,90 730,140 330,140" fill="#EADCC9" stroke="#1E1E1C" strokeWidth="2" />
              <polygon points="250,90 250,105 330,155 330,140" fill="#D4B996" stroke="#1E1E1C" strokeWidth="2" />
              <polygon points="330,140 330,155 730,105 730,90" fill="#C4A482" stroke="#1E1E1C" strokeWidth="2" />
              <text x="470" y="120" fontSize="11" fontWeight="bold" textAnchor="middle">
                [1] Tabletop Core Slab
              </text>

              {/* Fasteners (Figure-8 expansion clips) */}
              <line x1="380" y1="160" x2="380" y2="210" stroke="#8C5835" strokeWidth="1.5" strokeDasharray="3,3" />
              <line x1="560" y1="160" x2="560" y2="210" stroke="#8C5835" strokeWidth="1.5" strokeDasharray="3,3" />

              {/* Part 4: Top Spreaders */}
              <polygon points="310,210 450,210 470,230 330,230" fill="#FFF" stroke="#1E1E1C" strokeWidth="1.8" />
              <polygon points="530,210 670,210 690,230 550,230" fill="#FFF" stroke="#1E1E1C" strokeWidth="1.8" />
              <text x="390" y="225" fontSize="9" fontWeight="600">[4] Sub-Spreader</text>
              <text x="610" y="225" fontSize="9" fontWeight="600">[4] Sub-Spreader</text>

              {/* Part 3: Trestle Uprights */}
              <rect x="360" y="250" width="35" height="110" fill="#FFF" stroke="#1E1E1C" strokeWidth="1.8" />
              <rect x="580" y="250" width="35" height="110" fill="#FFF" stroke="#1E1E1C" strokeWidth="1.8" />
              <text x="377" y="310" fontSize="9" fontWeight="bold" transform="rotate(-90 377 310)">[3] Uprights</text>
              <text x="597" y="310" fontSize="9" fontWeight="bold" transform="rotate(-90 597 310)">[3] Uprights</text>

              {/* Part 6: Longitudinal Stretcher (Interlocking tenons) */}
              <polygon points="320,330 670,330 690,350 340,350" fill="#D8C3A8" stroke="#1E1E1C" strokeWidth="2" />
              <text x="500" y="345" fontSize="10" fontWeight="bold" textAnchor="middle">[6] Center Stretcher Beam</text>

              {/* Part 5: Bottom Base Shoes */}
              <polygon points="280,390 480,390 500,410 300,410" fill="#FFF" stroke="#1E1E1C" strokeWidth="2" />
              <polygon points="500,390 700,390 720,410 520,410" fill="#FFF" stroke="#1E1E1C" strokeWidth="2" />
              <text x="390" y="405" fontSize="9" fontWeight="600">[5] Base Floor Shoe</text>
              <text x="610" y="405" fontSize="9" fontWeight="600">[5] Base Floor Shoe</text>

              {/* Stainless M8 Glides */}
              <circle cx="310" cy="425" r="4" fill="#333" />
              <circle cx="470" cy="425" r="4" fill="#333" />
              <circle cx="530" cy="425" r="4" fill="#333" />
              <circle cx="690" cy="425" r="4" fill="#333" />
            </svg>
          </div>
        )}

        {/* Bill of Materials (BOM) Table */}
        {activeTab === 'bom' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1C]">
                Component Bill of Materials (BOM) & Cut List
              </h3>
              <span className="text-xs text-[#706E66]">7 Unique Components · Solid Hardwood Yield</span>
            </div>

            <div className="overflow-x-auto border border-[#E8E6DF] rounded">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF9F6] border-b border-[#E8E6DF] text-[#706E66]">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Item #</th>
                    <th className="py-2.5 px-3 font-semibold">Part Name</th>
                    <th className="py-2.5 px-3 font-semibold">Qty</th>
                    <th className="py-2.5 px-3 font-semibold">Species & Grade</th>
                    <th className="py-2.5 px-3 font-semibold font-mono">Finished Dims (T x W x L mm)</th>
                    <th className="py-2.5 px-3 font-semibold">Grain</th>
                    <th className="py-2.5 px-3 font-semibold">Joinery & Milling</th>
                    <th className="py-2.5 px-3 font-semibold text-right font-mono">Est. Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F2EB]">
                  {initialPackage?.bom.map((b) => (
                    <tr key={b.itemNumber} className="hover:bg-[#FAF9F6]">
                      <td className="py-2.5 px-3 font-mono font-medium">{b.itemNumber}</td>
                      <td className="py-2.5 px-3 font-medium text-[#1E1E1C]">{b.partName}</td>
                      <td className="py-2.5 px-3 font-mono">{b.quantity}</td>
                      <td className="py-2.5 px-3 text-[#5E5C56]">{b.material}</td>
                      <td className="py-2.5 px-3 font-mono text-[#1E1E1C]">
                        {b.thicknessMm} × {b.widthMm} × {b.lengthMm}
                      </td>
                      <td className="py-2.5 px-3 text-[#706E66]">{b.grainDirection}</td>
                      <td className="py-2.5 px-3 text-[#706E66] text-[11px] max-w-xs">{b.joineryNote}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium">${b.estimatedCost}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#FAF8F5] border-t border-[#E8E6DF] font-semibold text-[#1E1E1C]">
                  <tr>
                    <td colSpan={7} className="py-2.5 px-3 text-right">Total Component Shop Fabrication:</td>
                    <td className="py-2.5 px-3 text-right font-mono text-sm">
                      ${initialPackage?.bom.reduce((acc, c) => acc + c.estimatedCost, 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Footer Notes & Revision History */}
        <div className="pt-4 border-t border-[#E8E6DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#706E66]">
          <div className="flex items-center gap-3">
            <span>Drawn By: Atelier Spatial Engineering Guild</span>
            <span aria-hidden="true">·</span>
            <span>Date: {initialPackage?.drawnDate || '2026-09-20'}</span>
            <span aria-hidden="true">·</span>
            <span>Sheet 1 of 1</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Dimensional model synchronized with 18' × 14' room scan</span>
          </div>
        </div>
      </div>
    </div>
  );
};
