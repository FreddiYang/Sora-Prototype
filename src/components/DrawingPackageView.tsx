import React, { useState } from 'react';
import { FurnitureObject, DrawingPackage, BOMComponent, RoomModel } from '../types';
import { calculateWoodMovement, getWoodProperty } from '../utils/furnitureCalculations';
import { 
  Printer, 
  Download, 
  FileText, 
  Layers, 
  Maximize2, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Sliders, 
  ShieldCheck,
  Eye,
  Package,
  ArrowLeft,
  Clock,
  Check,
  Send
} from 'lucide-react';

interface DrawingPackageViewProps {
  furniture: FurnitureObject;
  roomModel?: RoomModel;
  onUpdateFurniture?: (updated: FurnitureObject) => void;
  onBackToEditor: () => void;
}

export const DrawingPackageView: React.FC<DrawingPackageViewProps> = ({
  furniture,
  roomModel,
  onUpdateFurniture,
  onBackToEditor,
}) => {
  const [activeTab, setActiveTab] = useState<'multiview' | 'exploded' | 'section' | 'bom'>('multiview');
  const spec = furniture.specification;
  const initialPackage = furniture.drawingPackage;

  // Document states: 'concept_draft' | 'ready_for_review' | 'changes_requested' | 'approved_for_manufacturing'
  const currentStatus = initialPackage?.status || (initialPackage?.packageType === 'manufacturing_package' ? 'approved_for_manufacturing' : 'concept_draft');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [checkedIssues, setCheckedIssues] = useState<Record<string, boolean>>({
    moisture: true,
    movement: true,
    joinery: true,
    delivery: true,
  });
  const [approvalToast, setApprovalToast] = useState<string | null>(null);

  // If catalog item or unsupported category, display an honest unavailable state
  if (!furniture.isCustomConcept || !spec || !initialPackage) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto py-12 px-4">
        <button
          onClick={onBackToEditor}
          className="text-xs text-[#706E66] hover:text-[#1E1E1C] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Furniture Specs</span>
        </button>

        <div className="bg-white rounded-xl border-2 border-[#E8E6DF] p-10 text-center space-y-5 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#DDD7C8] flex items-center justify-center mx-auto text-[#5C4033]">
            <Package className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C887B]">
              Category: Sourced Catalog Product
            </span>
            <h2 className="font-serif text-2xl text-[#1E1E1C]">
              Fabrication Drawing Package Not Applicable
            </h2>
          </div>

          <p className="text-xs text-[#5E5C56] leading-relaxed max-w-lg mx-auto">
            "<strong>{furniture.name}</strong>" is a catalog product sourced from <strong>{furniture.supplierName || 'Design Partner'}</strong> (Catalog SKU: <span className="font-mono">{furniture.productSku || 'CAT-REF'}</span>).
            Millwork fabrication drawings, cut lists, and BOM joinery schedules are exclusively prepared for custom shop millwork (such as the Odin Trestle Dining Table or Koto Fluted Credenza).
          </p>

          <div className="bg-[#FAF9F6] p-4 rounded-lg border border-[#EDEAE3] text-xs text-left max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-[#706E66]">
              <span>Dimensions:</span>
              <span className="font-mono font-medium text-[#1E1E1C]">{furniture.dimensionsSummary}</span>
            </div>
            <div className="flex justify-between text-[#706E66]">
              <span>Retail Price:</span>
              <span className="font-mono font-medium text-[#1E1E1C]">${furniture.estimatedPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#706E66]">
              <span>Supplier Lead Time:</span>
              <span className="font-medium text-[#1E1E1C]">{furniture.leadTimeWeeks} Weeks</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onBackToEditor}
              className="px-5 py-2.5 bg-[#2C2A29] hover:bg-[#1E1E1C] text-white text-xs font-medium rounded transition-colors shadow-xs cursor-pointer"
            >
              Return to Project Items
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dynamic parameters from spec
  const lengthMm = spec.overallLengthMm || 2400;
  const widthMm = spec.overallWidthMm || 950;
  const heightMm = spec.overallHeightMm || 750;
  const topThicknessMm = spec.topThicknessMm || 42;
  const wood = spec.woodSpecies || 'Solid American White Oak';
  const isCredenza = furniture.category === 'credenza';

  // Wood movement scientific calculation
  const woodMovement = calculateWoodMovement(wood, widthMm);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify({ 
        furnitureName: furniture.name,
        category: furniture.category,
        dimensions: { lengthMm, widthMm, heightMm, topThicknessMm },
        woodSpecies: wood,
        drawingPackage: initialPackage,
        roomSynchronization: roomModel ? {
          lengthFtIn: roomModel.length.valueFtIn,
          widthFtIn: roomModel.width.valueFtIn,
          lengthMm: roomModel.length.valueMm,
          widthMm: roomModel.width.valueMm,
          areaSqFt: roomModel.areaSqFt,
        } : null,
      }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${initialPackage.drawingNumber}_spec_package.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSubmitForReview = () => {
    if (!onUpdateFurniture) return;
    const updatedPackage: DrawingPackage = {
      ...initialPackage,
      status: 'ready_for_review',
      packageType: 'concept_package',
      drawnDate: new Date().toISOString().split('T')[0],
      revisionHistory: [
        ...(initialPackage.revisionHistory || []),
        {
          revision: initialPackage.revision,
          date: new Date().toISOString().split('T')[0],
          changeNote: 'Submitted by homeowner for guild technical review',
          author: 'Homeowner Commission',
        },
      ],
    };
    onUpdateFurniture({
      ...furniture,
      drawingPackage: updatedPackage,
    });
    setApprovalToast('Package submitted to local woodworking guild for technical review. Shop approval will be issued following joint and tolerance audit.');
    setTimeout(() => setApprovalToast(null), 3500);
  };

  const handleReviewerAction = (action: 'approve' | 'request_changes') => {
    if (!onUpdateFurniture) return;
    const isApprove = action === 'approve';
    const updatedPackage: DrawingPackage = {
      ...initialPackage,
      status: isApprove ? 'approved_for_manufacturing' : 'changes_requested',
      packageType: isApprove ? 'manufacturing_package' : 'concept_package',
      approvedBy: isApprove ? 'Marcus Vance, Master Joiner & Millwork PE #48921' : undefined,
      approvedDate: isApprove ? new Date().toISOString().split('T')[0] : undefined,
      isApprovalInvalidated: false,
      invalidationReason: undefined,
      reviewerSignOff: {
        reviewerName: 'Marcus Vance, Master Joiner & Millwork PE #48921',
        role: 'Licensed Master Joiner / Technical Reviewer',
        organization: 'Pacific Woodworking Guild / Atelier Spatial Review Board',
        approvalDate: new Date().toISOString().split('T')[0],
        reviewNotes: reviewerNotes || (isApprove ? 'Drawings and tolerances approved for CNC and bench fabrication.' : 'Modifications required to joinery clearances.'),
        outstandingIssues: Object.entries(checkedIssues)
          .filter(([_, checked]) => !checked)
          .map(([key]) => key),
      },
      revisionHistory: [
        ...(initialPackage.revisionHistory || []),
        {
          revision: initialPackage.revision,
          date: new Date().toISOString().split('T')[0],
          changeNote: isApprove 
            ? 'Approved for Manufacturing by Marcus Vance, Master Joiner' 
            : `Changes requested by reviewer: ${reviewerNotes || 'Tolerance adjustment required'}`,
          author: 'Marcus Vance, Millwork PE',
        },
      ],
    };

    onUpdateFurniture({
      ...furniture,
      drawingPackage: updatedPackage,
    });
    setIsReviewModalOpen(false);
    setApprovalToast(
      isApprove 
        ? '✓ Drawing package officially approved for manufacturing. Tolerances and cut list sealed.'
        : 'Revisions requested. Package returned to concept review state with reviewer notes.'
    );
    setTimeout(() => setApprovalToast(null), 3500);
  };

  const getStatusBadge = () => {
    switch (currentStatus) {
      case 'approved_for_manufacturing':
        return (
          <span className="px-3 py-1 text-xs rounded border bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Approved for Manufacturing (Shop Authorized)</span>
          </span>
        );
      case 'ready_for_review':
        return (
          <span className="px-3 py-1 text-xs rounded border bg-blue-50 text-blue-800 border-blue-300 font-semibold inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Ready for Manufacturer Review (Pending Sign-Off)</span>
          </span>
        );
      case 'changes_requested':
        return (
          <span className="px-3 py-1 text-xs rounded border bg-rose-50 text-rose-800 border-rose-300 font-semibold inline-flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Changes Requested by Reviewer</span>
          </span>
        );
      case 'concept_draft':
      default:
        return (
          <span className="px-3 py-1 text-xs rounded border bg-amber-50 text-amber-800 border-amber-300 font-medium inline-flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>Concept Draft (Quotation & Preliminary Review)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 print:p-0 print:space-y-4">
      {/* Top Header & Export Bar */}
      <div className="border-b border-[#E8E6DF] pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#8C887B]">
              Fabrication Drawings · Step 4 of 5
            </span>
            <span className="text-[#CCC9BF]">/</span>
            <span className="text-xs font-mono text-[#5C4033] font-semibold">
              {initialPackage.drawingNumber}
            </span>
            <span className="text-[#CCC9BF]">·</span>
            <span className="text-xs font-mono font-bold text-[#1E1E1C]">
              {initialPackage.revision}
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1C] mt-1 font-normal">
            Furniture Fabrication Drawing Package
          </h1>
          <p className="text-sm text-[#5E5C56] mt-1.5 max-w-2xl">
            True millimeter CAD multi-view orthographic projections, bill of materials (BOM), and workshop joinery schedules for <strong>{furniture.name}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Current Status Indicator */}
          {getStatusBadge()}

          {/* Homeowner Submission Action */}
          {currentStatus === 'concept_draft' && (
            <button
              onClick={handleSubmitForReview}
              className="px-3.5 py-1.5 bg-[#2C2A29] hover:bg-[#1E1E1C] text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Manufacturer Review</span>
            </button>
          )}

          {/* Authorized Reviewer Portal Button (Simulated Guild Sign-off) */}
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F2ECE1] text-[#5C4033] border border-[#D5CABB] text-xs font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Open Technical Reviewer inspection and manufacturing seal portal"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#8C5835]" />
            <span>Authorized Reviewer Portal</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-[#FAF9F6] hover:bg-[#EFECE6] text-[#1E1E1C] border border-[#DDD7C8] text-xs font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 bg-[#FAF9F6] hover:bg-[#EFECE6] text-[#1E1E1C] border border-[#DDD7C8] text-xs font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CAD Data</span>
          </button>
        </div>
      </div>

      {/* Approval Status Invalidation Warning */}
      {initialPackage.isApprovalInvalidated && (
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-900 rounded-r-lg text-xs space-y-1 no-print">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Re-Approval Required: Specification modified after prior shop approval</span>
          </div>
          <p className="text-amber-800 pl-6">
            {initialPackage.invalidationReason || 'Dimensions, materials, or joinery parameters were altered in the specification editor. Please review the updated orthographic CAD drawings and regenerated BOM cut list below, then re-approve for manufacturing.'}
          </p>
        </div>
      )}

      {approvalToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 animate-fade-in no-print">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{approvalToast}</span>
        </div>
      )}

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
          {isCredenza ? 'Section Detail & Tambour Glide Track' : 'Section A-A & Breadboard Expansion Detail'}
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
          Bill of Materials (BOM) Table ({initialPackage.bom.length} Parts)
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
              {initialPackage.drawingNumber} · {initialPackage.revision}
            </span>
          </div>
          <div className="p-2.5">
            <span className="text-[10px] text-[#706E66] block uppercase tracking-wider">Material / Tolerance</span>
            <span className="font-medium text-[#1E1E1C] truncate block">{wood.split('(')[0].trim()} · ±{spec.tolerancesMm || 1.5}mm</span>
          </div>
          <div className="p-2.5 bg-[#FAF8F5]">
            <span className="text-[10px] text-[#706E66] block uppercase tracking-wider">Document Status / Reviewer</span>
            <span className={`font-semibold block ${
              currentStatus === 'approved_for_manufacturing' ? 'text-emerald-800' :
              currentStatus === 'ready_for_review' ? 'text-blue-800' :
              currentStatus === 'changes_requested' ? 'text-rose-800' : 'text-amber-800'
            }`}>
              {currentStatus === 'approved_for_manufacturing' ? 'Approved for Manufacturing' :
               currentStatus === 'ready_for_review' ? 'Under Guild Review' :
               currentStatus === 'changes_requested' ? 'Changes Requested' : 'Concept Draft'}
            </span>
            <span className="text-[10px] text-[#706E66] block truncate">
              {initialPackage.approvedBy ? `Sealed: ${initialPackage.approvedBy.split('&')[0]}` : 'Reviewer: Pending Guild Audit'}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: TABLE CAD DRAWINGS                                                */}
        {/* ========================================================================= */}
        {!isCredenza && (
          <>
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
                    <text x="80" y="38" fontSize="12" fontWeight="700" fill="#1E1E1C" fontFamily="sans-serif">
                      VIEW 1: TOP PLAN VIEW (Scale 1:20)
                    </text>

                    {/* Tabletop Rectangle */}
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

                    {/* Dimensions: Length */}
                    <line x1="80" y1="245" x2="520" y2="245" stroke="#1E1E1C" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                    <text x="300" y="260" fontSize="11" fontFamily="monospace" textAnchor="middle" fill="#1E1E1C" fontWeight="600">
                      {lengthMm} mm ({(lengthMm / 25.4).toFixed(1)}")
                    </text>

                    {/* Dimensions: Width */}
                    <line x1="535" y1="55" x2="535" y2="230" stroke="#1E1E1C" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                    <text x="545" y="145" fontSize="11" fontFamily="monospace" fill="#1E1E1C" fontWeight="600">
                      {widthMm} mm ({(widthMm / 25.4).toFixed(1)}")
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

                    {/* Center Longitudinal Trestle Stretcher */}
                    <rect x="185" y="420" width="230" height="25" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="1.8" />
                    <rect x="145" y="425" width="10" height="15" fill="#8C5835" stroke="#1E1E1C" strokeWidth="1" />
                    <rect x="445" y="425" width="10" height="15" fill="#8C5835" stroke="#1E1E1C" strokeWidth="1" />

                    {/* Overall Height Dimension */}
                    <line x1="55" y1="315" x2="55" y2="495" stroke="#1E1E1C" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                    <text x="45" y="410" fontSize="11" fontFamily="monospace" textAnchor="middle" fill="#1E1E1C" fontWeight="600" transform="rotate(-90 45 410)">
                      {heightMm} mm
                    </text>

                    {/* Callouts */}
                    <circle cx="300" cy="432" r="11" fill="#FFFFFF" stroke="#1E1E1C" strokeWidth="1.5" />
                    <text x="300" y="436" fontSize="10" fontWeight="bold" textAnchor="middle">6</text>
                  </g>

                  {/* View 3: Side Profile Elevation (Right Side) */}
                  <g id="side-elevation-view">
                    <text x="640" y="38" fontSize="12" fontWeight="700" fill="#1E1E1C" fontFamily="sans-serif">
                      VIEW 3: SIDE PROFILE ELEVATION
                    </text>

                    {/* Top End Section */}
                    <rect x="640" y="55" width="175" height="15" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="2" rx="2" />
                    <rect x="660" y="70" width="135" height="18" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="1.5" />

                    {/* Angled A-Frame Legs */}
                    <polygon points="675,88 650,210 675,210 695,88" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="1.5" />
                    <polygon points="780,88 805,210 780,210 760,88" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="1.5" />

                    {/* Stretcher tenon */}
                    <rect x="715" y="160" width="25" height="25" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="1.5" />

                    {/* Base Shoe */}
                    <rect x="635" y="210" width="185" height="22" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="2" rx="3" />
                    <rect x="655" y="232" width="15" height="4" fill="#333" />
                    <rect x="785" y="232" width="15" height="4" fill="#333" />

                    <text x="725" y="250" fontSize="10" fontFamily="monospace" fill="#5E5C56" textAnchor="middle">
                      Floor Base Shoe ({Math.round(widthMm * 0.86)} mm)
                    </text>
                  </g>

                  {/* Technical Notes Box */}
                  <g id="notes-box">
                    <rect x="620" y="280" width="260" height="235" fill="#FFFFFF" stroke="#1E1E1C" strokeWidth="1.2" />
                    <rect x="620" y="280" width="260" height="25" fill="#F4F1EA" stroke="#1E1E1C" strokeWidth="1.2" />
                    <text x="630" y="297" fontSize="10" fontWeight="bold" fill="#1E1E1C">
                      FABRICATION REQUIREMENTS
                    </text>

                    <text x="630" y="320" fontSize="9" fill="#1E1E1C">1. Species: {wood.split('(')[0].trim()}</text>
                    <text x="630" y="340" fontSize="9" fill="#1E1E1C">2. Kiln dried lumber 6.0% - 8.0% EMC.</text>
                    <text x="630" y="360" fontSize="9" fill="#1E1E1C">3. Tangential expansion allowance: ±{woodMovement.halfMovement} mm.</text>
                    <text x="630" y="380" fontSize="9" fill="#1E1E1C">4. Breadboard ends pegged with loose outer slots.</text>
                    <text x="630" y="400" fontSize="9" fill="#1E1E1C">5. Figure-8 fasteners slotted every 250mm.</text>
                    <text x="630" y="420" fontSize="9" fill="#1E1E1C">6. Finish: {spec.finishType.split('(')[0].trim()}</text>
                    <text x="630" y="440" fontSize="9" fill="#1E1E1C">7. General millwork tolerance: ±{spec.tolerancesMm || 1.5} mm.</text>
                    <text x="630" y="470" fontSize="9" fill="#8C5835" fontWeight="bold">
                      ★ {initialPackage.drawingNumber} · {initialPackage.revision}
                    </text>
                  </g>
                </svg>
              </div>
            )}

            {/* Section A-A Joinery Detail with Dynamic Wood Movement */}
            {activeTab === 'section' && (
              <div className="w-full aspect-16/10 bg-[#FAF9F6] blueprint-grid rounded border border-[#DDD7C8] p-4 flex flex-col justify-between overflow-hidden">
                <svg viewBox="0 0 900 500" className="w-full h-full select-none">
                  <text x="50" y="40" fontSize="14" fontWeight="700" fill="#1E1E1C">
                    SECTION A-A: BREADBOARD END EXPANSION JOINERY (Scale 1:2)
                  </text>

                  {/* Tabletop Longitudinal Core Planks */}
                  <rect x="50" y="100" width="420" height="90" fill="#EADCC9" stroke="#1E1E1C" strokeWidth="2.5" />
                  <text x="140" y="150" fontSize="11" fontWeight="600" fill="#1E1E1C">
                    Core Slab ({topThicknessMm}mm Solid {woodMovement.property.commonName})
                  </text>

                  {/* Integral Tenon */}
                  <rect x="470" y="125" width="90" height="40" fill="#EADCC9" stroke="#1E1E1C" strokeWidth="2" />
                  <text x="495" y="150" fontSize="10" fontFamily="monospace" fill="#5C4033">
                    TENON
                  </text>

                  {/* Breadboard End Cap */}
                  <rect x="560" y="90" width="160" height="110" fill="#D8C3A8" stroke="#1E1E1C" strokeWidth="2.5" rx="3" />
                  <text x="580" y="150" fontSize="11" fontWeight="600" fill="#1E1E1C">
                    Breadboard End (120mm W)
                  </text>

                  {/* Mortise Cavity */}
                  <rect x="470" y="122" width="95" height="46" fill="none" stroke="#2C2A29" strokeWidth="1.5" strokeDasharray="2,2" />

                  {/* Center Fixed Dowel */}
                  <circle cx="515" cy="145" r="9" fill="#8C5835" stroke="#1E1E1C" strokeWidth="1.5" />
                  <text x="515" y="148" fontSize="8" fill="#FFF" fontWeight="bold" textAnchor="middle">GLUE</text>

                  {/* Outer Slotted Dowel */}
                  <rect x="507" y="170" width="16" height="24" rx="8" fill="#8C5835" stroke="#1E1E1C" strokeWidth="1.5" />
                  <text x="535" y="186" fontSize="10" fill="#8C5835" fontWeight="bold">
                    ← {Math.max(5, Math.round(woodMovement.halfMovement))}mm SLOTTED HOLE (NO GLUE) →
                  </text>

                  {/* Scientific Principle Callout */}
                  <g transform="translate(50, 230)">
                    <rect x="0" y="0" width="780" height="200" fill="#FFFFFF" stroke="#1E1E1C" strokeWidth="1" />
                    <text x="20" y="30" fontSize="12" fontWeight="700" fill="#1E1E1C">
                      WOOD SCIENCE STANDARD: SEASONAL HYGROSCOPIC MOVEMENT ({woodMovement.property.botanicalName.toUpperCase()})
                    </text>
                    <text x="20" y="60" fontSize="11" fill="#333">
                      • Species: {woodMovement.property.commonName} ({woodMovement.property.botanicalName}).
                    </text>
                    <text x="20" y="85" fontSize="11" fill="#333">
                      • Tangential shrinkage coefficient: {woodMovement.property.tangentialShrinkage}% (expansion coeff: {woodMovement.property.expansionCoefficient} per % EMC change).
                    </text>
                    <text x="20" y="110" fontSize="11" fill="#333">
                      • Across this {widthMm}mm width, indoor humidity fluctuations (4% delta EMC) induce ±{woodMovement.halfMovement} mm seasonal movement.
                    </text>
                    <text x="20" y="135" fontSize="11" fill="#333">
                      • Joinery rule: Center dowel is pinned solid; outer pins float in slotted mortises, guaranteeing slab remains dead flat without splitting.
                    </text>
                    <text x="20" y="165" fontSize="10" fontFamily="monospace" fill="#8C5835">
                      Estimated movement calculated using USDA FPL shrinkage formulas (Requires manufacturer shop verification).
                    </text>
                  </g>
                </svg>
              </div>
            )}

            {/* Exploded Isometric View */}
            {activeTab === 'exploded' && (
              <div className="w-full aspect-16/10 bg-[#FAF9F6] blueprint-grid rounded border border-[#DDD7C8] p-4 flex flex-col justify-between overflow-hidden">
                <svg viewBox="0 0 900 500" className="w-full h-full select-none">
                  <text x="50" y="40" fontSize="14" fontWeight="700" fill="#1E1E1C">
                    EXPLODED ISOMETRIC ASSEMBLY SCHEMATIC
                  </text>

                  {/* Part 1: Top Slab */}
                  <polygon points="250,90 650,90 730,140 330,140" fill="#EADCC9" stroke="#1E1E1C" strokeWidth="2" />
                  <polygon points="250,90 250,105 330,155 330,140" fill="#D4B996" stroke="#1E1E1C" strokeWidth="2" />
                  <polygon points="330,140 330,155 730,105 730,90" fill="#C4A482" stroke="#1E1E1C" strokeWidth="2" />
                  <text x="470" y="120" fontSize="11" fontWeight="bold" textAnchor="middle">
                    [1] Tabletop Core Slab ({lengthMm - 240} mm L × {widthMm} mm W)
                  </text>

                  {/* Fasteners */}
                  <line x1="380" y1="160" x2="380" y2="210" stroke="#8C5835" strokeWidth="1.5" strokeDasharray="3,3" />
                  <line x1="560" y1="160" x2="560" y2="210" stroke="#8C5835" strokeWidth="1.5" strokeDasharray="3,3" />

                  {/* Part 4: Spreaders */}
                  <polygon points="310,210 450,210 470,230 330,230" fill="#FFF" stroke="#1E1E1C" strokeWidth="1.8" />
                  <polygon points="530,210 670,210 690,230 550,230" fill="#FFF" stroke="#1E1E1C" strokeWidth="1.8" />
                  <text x="390" y="225" fontSize="9" fontWeight="600">[4] Sub-Spreader</text>
                  <text x="610" y="225" fontSize="9" fontWeight="600">[4] Sub-Spreader</text>

                  {/* Part 3: Trestle Uprights */}
                  <rect x="360" y="250" width="35" height="110" fill="#FFF" stroke="#1E1E1C" strokeWidth="1.8" />
                  <rect x="580" y="250" width="35" height="110" fill="#FFF" stroke="#1E1E1C" strokeWidth="1.8" />
                  <text x="377" y="310" fontSize="9" fontWeight="bold" transform="rotate(-90 377 310)">[3] Uprights</text>
                  <text x="597" y="310" fontSize="9" fontWeight="bold" transform="rotate(-90 597 310)">[3] Uprights</text>

                  {/* Part 6: Stretcher Beam */}
                  <polygon points="320,330 670,330 690,350 340,350" fill="#D8C3A8" stroke="#1E1E1C" strokeWidth="2" />
                  <text x="500" y="345" fontSize="10" fontWeight="bold" textAnchor="middle">[6] Center Stretcher Beam</text>

                  {/* Part 5: Base Shoes */}
                  <polygon points="280,390 480,390 500,410 300,410" fill="#FFF" stroke="#1E1E1C" strokeWidth="2" />
                  <polygon points="500,390 700,390 720,410 520,410" fill="#FFF" stroke="#1E1E1C" strokeWidth="2" />
                  <text x="390" y="405" fontSize="9" fontWeight="600">[5] Base Shoe</text>
                  <text x="610" y="405" fontSize="9" fontWeight="600">[5] Base Shoe</text>
                </svg>
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CREDENZA CAD DRAWINGS                                             */}
        {/* ========================================================================= */}
        {isCredenza && (
          <>
            {activeTab === 'multiview' && (
              <div className="w-full aspect-16/10 bg-[#FAF9F6] blueprint-grid rounded border border-[#DDD7C8] p-4 flex flex-col justify-between overflow-hidden">
                <svg viewBox="0 0 900 540" className="w-full h-full select-none">
                  <defs>
                    <marker id="arrow2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#1E1E1C" />
                    </marker>
                  </defs>

                  {/* View 1: Top Plan View (Top Left) */}
                  <g id="credenza-top-plan">
                    <text x="80" y="38" fontSize="12" fontWeight="700" fill="#1E1E1C" fontFamily="sans-serif">
                      VIEW 1: TOP PLAN VIEW (Scale 1:20)
                    </text>

                    {/* Outer Carcass Boundary */}
                    <rect x="80" y="55" width="460" height="130" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="2" rx="2" />

                    {/* Inset Honed Travertine Stone Slab */}
                    <rect x="95" y="70" width="430" height="100" fill="#F4EFE6" stroke="#8C887B" strokeWidth="1.5" />
                    <text x="310" y="125" fontSize="11" fontFamily="sans-serif" fill="#706E66" textAnchor="middle" fontWeight="600">
                      Honed Travertine Stone Inlay ({lengthMm - 80} × {widthMm - 60} mm)
                    </text>

                    {/* Curved Tambour Track Pockets at Ends */}
                    <path d="M 95 65 Q 85 85 95 105" fill="none" stroke="#2C2A29" strokeWidth="1.5" strokeDasharray="3,3" />
                    <path d="M 525 65 Q 535 85 525 105" fill="none" stroke="#2C2A29" strokeWidth="1.5" strokeDasharray="3,3" />

                    {/* Dimension Length */}
                    <line x1="80" y1="205" x2="540" y2="205" stroke="#1E1E1C" strokeWidth="1" markerStart="url(#arrow2)" markerEnd="url(#arrow2)" />
                    <text x="310" y="220" fontSize="11" fontFamily="monospace" textAnchor="middle" fill="#1E1E1C" fontWeight="600">
                      {lengthMm} mm ({(lengthMm / 25.4).toFixed(1)}")
                    </text>

                    {/* Dimension Depth */}
                    <line x1="555" y1="55" x2="555" y2="185" stroke="#1E1E1C" strokeWidth="1" markerStart="url(#arrow2)" markerEnd="url(#arrow2)" />
                    <text x="565" y="125" fontSize="11" fontFamily="monospace" fill="#1E1E1C" fontWeight="600">
                      {widthMm} mm ({(widthMm / 25.4).toFixed(1)}")
                    </text>
                  </g>

                  {/* View 2: Front Elevation (Bottom Left) */}
                  <g id="credenza-front-elevation">
                    <text x="80" y="275" fontSize="12" fontWeight="700" fill="#1E1E1C" fontFamily="sans-serif">
                      VIEW 2: FRONT ELEVATION (Fluted Tambour Doors)
                    </text>

                    {/* Carcass Frame */}
                    <rect x="80" y="295" width="460" height="170" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="2" rx="2" />

                    {/* Top reveal */}
                    <line x1="80" y1="310" x2="540" y2="310" stroke="#1E1E1C" strokeWidth="1.5" />

                    {/* Vertical fluted reeded tambour lines across the front */}
                    {Array.from({ length: 44 }).map((_, i) => (
                      <line
                        key={i}
                        x1={86 + i * 10}
                        y1={312}
                        x2={86 + i * 10}
                        y2={445}
                        stroke="#DDD4C5"
                        strokeWidth="1.2"
                      />
                    ))}

                    {/* Recessed Plinth Base */}
                    <rect x="95" y="445" width="430" height="20" fill="#EFECE6" stroke="#1E1E1C" strokeWidth="1.8" />

                    {/* Height Dimension */}
                    <line x1="55" y1="295" x2="55" y2="465" stroke="#1E1E1C" strokeWidth="1" markerStart="url(#arrow2)" markerEnd="url(#arrow2)" />
                    <text x="45" y="380" fontSize="11" fontFamily="monospace" textAnchor="middle" fill="#1E1E1C" fontWeight="600" transform="rotate(-90 45 380)">
                      {heightMm} mm
                    </text>
                  </g>

                  {/* View 3: Side Profile (Right Side) */}
                  <g id="credenza-side-elevation">
                    <text x="640" y="38" fontSize="12" fontWeight="700" fill="#1E1E1C" fontFamily="sans-serif">
                      VIEW 3: SIDE PROFILE ELEVATION
                    </text>

                    {/* Gable End Profile */}
                    <rect x="640" y="55" width="130" height="170" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="2" rx="2" />
                    <rect x="650" y="205" width="110" height="20" fill="#EFECE6" stroke="#1E1E1C" strokeWidth="1.5" />

                    {/* Dimension Depth */}
                    <line x1="640" y1="240" x2="770" y2="240" stroke="#1E1E1C" strokeWidth="1" markerStart="url(#arrow2)" markerEnd="url(#arrow2)" />
                    <text x="705" y="255" fontSize="11" fontFamily="monospace" textAnchor="middle" fill="#1E1E1C">
                      {widthMm} mm Depth
                    </text>
                  </g>

                  {/* Technical Requirements Box */}
                  <g id="credenza-notes">
                    <rect x="620" y="280" width="260" height="235" fill="#FFFFFF" stroke="#1E1E1C" strokeWidth="1.2" />
                    <rect x="620" y="280" width="260" height="25" fill="#F4F1EA" stroke="#1E1E1C" strokeWidth="1.2" />
                    <text x="630" y="297" fontSize="10" fontWeight="bold" fill="#1E1E1C">
                      CREDENZA MILLWORK REQUIREMENTS
                    </text>

                    <text x="630" y="320" fontSize="9" fill="#1E1E1C">1. Frame: Solid {wood.split('(')[0].trim()}</text>
                    <text x="630" y="340" fontSize="9" fill="#1E1E1C">2. Top: 20mm Roman Travertine (Honed & sealed)</text>
                    <text x="630" y="360" fontSize="9" fill="#1E1E1C">3. Doors: 12mm fluted oak tambour on Belgian linen</text>
                    <text x="630" y="380" fontSize="9" fill="#1E1E1C">4. Glide track: Extruded brass with Delrin dampeners</text>
                    <text x="630" y="400" fontSize="9" fill="#1E1E1C">5. Plinth: Recessed 60mm with 6x M8 leveling glides</text>
                    <text x="630" y="420" fontSize="9" fill="#1E1E1C">6. Finish: {spec.finishType.split('(')[0].trim()}</text>
                    <text x="630" y="440" fontSize="9" fill="#1E1E1C">7. General millwork tolerance: ±1.0 mm.</text>
                    <text x="630" y="470" fontSize="9" fill="#8C5835" fontWeight="bold">
                      ★ {initialPackage.drawingNumber} · {initialPackage.revision}
                    </text>
                  </g>
                </svg>
              </div>
            )}

            {/* Section Detail: Travertine & Tambour Glide */}
            {activeTab === 'section' && (
              <div className="w-full aspect-16/10 bg-[#FAF9F6] blueprint-grid rounded border border-[#DDD7C8] p-4 flex flex-col justify-between overflow-hidden">
                <svg viewBox="0 0 900 500" className="w-full h-full select-none">
                  <text x="50" y="40" fontSize="14" fontWeight="700" fill="#1E1E1C">
                    SECTION DETAIL: TRAVERTINE STONE REBATE & TAMBOUR TRACK (Scale 1:1)
                  </text>

                  {/* Carcass Top Frame */}
                  <rect x="50" y="90" width="220" height="70" fill="#EADCC9" stroke="#1E1E1C" strokeWidth="2" />
                  <text x="65" y="130" fontSize="11" fontWeight="600">Solid Oak Carcass Frame</text>

                  {/* Rebate Shelf for Stone */}
                  <rect x="270" y="110" width="380" height="50" fill="#F4EFE6" stroke="#1E1E1C" strokeWidth="2" />
                  <text x="350" y="140" fontSize="12" fontWeight="700" fill="#5C4033">
                    20mm Honed Roman Travertine Stone Slab
                  </text>

                  {/* Neoprene Cushion Isolation Tape */}
                  <rect x="270" y="155" width="380" height="6" fill="#333" />
                  <text x="400" y="180" fontSize="10" fill="#666">
                    Continuous Closed-Cell Neoprene Vibration Damper Tape
                  </text>

                  {/* Lower Track and Tambour Slat */}
                  <g transform="translate(50, 220)">
                    <rect x="0" y="0" width="120" height="30" fill="#C4B49F" stroke="#1E1E1C" strokeWidth="1.5" />
                    <rect x="15" y="10" width="12" height="150" fill="#D8C3A8" stroke="#1E1E1C" strokeWidth="1.5" />
                    <text x="35" y="60" fontSize="11" fontWeight="600">Fluted Tambour Reed (Solid Hardwood)</text>
                    <text x="35" y="85" fontSize="10" fill="#706E66">Bonded to high-tensile Belgian linen duck backing</text>

                    {/* Brass guide track */}
                    <rect x="10" y="0" width="22" height="10" fill="#B5A642" stroke="#1E1E1C" strokeWidth="1" />
                    <text x="140" y="10" fontSize="10" fontFamily="monospace" fill="#8C5835">
                      Extruded Low-Friction Brass Glide Channel
                    </text>
                  </g>

                  {/* Principles note */}
                  <g transform="translate(50, 390)">
                    <rect x="0" y="0" width="780" height="70" fill="#FFFFFF" stroke="#1E1E1C" strokeWidth="1" />
                    <text x="20" y="25" fontSize="11" fontWeight="700" fill="#1E1E1C">
                      DUAL-MATERIAL CRAFT PRINCIPLE: STONE-TO-TIMBER ISOLATION
                    </text>
                    <text x="20" y="48" fontSize="10" fill="#444">
                      • Solid timber expands with humidity, whereas natural travertine expands only with ambient temperature. 
                      A continuous 4mm perimeter expansion reveal backed by neoprene isolation prevents deflection cracking under live weight loads.
                    </text>
                  </g>
                </svg>
              </div>
            )}

            {/* Exploded Isometric View */}
            {activeTab === 'exploded' && (
              <div className="w-full aspect-16/10 bg-[#FAF9F6] blueprint-grid rounded border border-[#DDD7C8] p-4 flex flex-col justify-between overflow-hidden">
                <svg viewBox="0 0 900 500" className="w-full h-full select-none">
                  <text x="50" y="40" fontSize="14" fontWeight="700" fill="#1E1E1C">
                    EXPLODED ASSEMBLY SCHEMATIC: CREDENZA MILLWORK
                  </text>

                  {/* Travertine Stone Inlay Slab floating */}
                  <polygon points="260,80 640,80 720,120 340,120" fill="#F4EFE6" stroke="#8C887B" strokeWidth="2" />
                  <text x="470" y="105" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#5C4033">
                    [3] Roman Honed Travertine Inlay Slab
                  </text>

                  {/* Carcass Top Frame */}
                  <polygon points="240,140 660,140 740,180 320,180" fill="#EADCC9" stroke="#1E1E1C" strokeWidth="2" />
                  <text x="470" y="165" fontSize="10" fontWeight="bold" textAnchor="middle">[1] Mitered Carcass Top Slab</text>

                  {/* Side Gable Ends */}
                  <polygon points="310,200 340,200 340,340 310,340" fill="#D8C3A8" stroke="#1E1E1C" strokeWidth="1.8" />
                  <polygon points="690,200 720,200 720,340 690,340" fill="#D8C3A8" stroke="#1E1E1C" strokeWidth="1.8" />
                  <text x="290" y="270" fontSize="9" fontWeight="bold">[2] Left Gable</text>
                  <text x="735" y="270" fontSize="9" fontWeight="bold">[2] Right Gable</text>

                  {/* Fluted Tambour Doors wrapping */}
                  <rect x="360" y="210" width="130" height="120" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="1.5" />
                  <rect x="520" y="210" width="130" height="120" fill="#FAF9F6" stroke="#1E1E1C" strokeWidth="1.5" />
                  <text x="425" y="270" fontSize="10" fontWeight="bold" textAnchor="middle">[4] Fluted Tambour Door</text>
                  <text x="585" y="270" fontSize="10" fontWeight="bold" textAnchor="middle">[4] Fluted Tambour Door</text>

                  {/* Plinth Base */}
                  <polygon points="260,370 660,370 720,400 320,400" fill="#EFECE6" stroke="#1E1E1C" strokeWidth="2" />
                  <text x="480" y="390" fontSize="10" fontWeight="bold" textAnchor="middle">[5] Recessed Plinth Base</text>
                </svg>
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* BILL OF MATERIALS (BOM) & CUT LIST TABLE                                  */}
        {/* ========================================================================= */}
        {activeTab === 'bom' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1C]">
                  Component Bill of Materials (BOM) & Millwork Cut List
                </h3>
                <p className="text-[11px] text-[#706E66]">
                  Derived directly from the verified {lengthMm}mm × {widthMm}mm × {heightMm}mm 3D model. All lengths and unit costs recalculate automatically.
                </p>
              </div>
              <span className="text-xs text-[#706E66] font-mono">
                {initialPackage.bom.length} Certified Components
              </span>
            </div>

            <div className="overflow-x-auto border border-[#E8E6DF] rounded">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF9F6] border-b border-[#E8E6DF] text-[#706E66]">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Item #</th>
                    <th className="py-2.5 px-3 font-semibold">Part Name</th>
                    <th className="py-2.5 px-3 font-semibold font-mono">Qty</th>
                    <th className="py-2.5 px-3 font-semibold">Species & Specification</th>
                    <th className="py-2.5 px-3 font-semibold font-mono">Finished Dims (T × W × L mm)</th>
                    <th className="py-2.5 px-3 font-semibold">Grain</th>
                    <th className="py-2.5 px-3 font-semibold">Joinery & Milling Schedule</th>
                    <th className="py-2.5 px-3 font-semibold text-right font-mono">Est. Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F2EB]">
                  {initialPackage.bom.map((b) => (
                    <tr key={b.itemNumber} className="hover:bg-[#FAF9F6]">
                      <td className="py-2.5 px-3 font-mono font-medium">{b.itemNumber}</td>
                      <td className="py-2.5 px-3 font-medium text-[#1E1E1C]">{b.partName}</td>
                      <td className="py-2.5 px-3 font-mono">{b.quantity}</td>
                      <td className="py-2.5 px-3 text-[#5E5C56] font-medium">{b.material}</td>
                      <td className="py-2.5 px-3 font-mono text-[#1E1E1C] whitespace-nowrap">
                        {b.thicknessMm} × {b.widthMm} × {b.lengthMm}
                      </td>
                      <td className="py-2.5 px-3 text-[#706E66]">{b.grainDirection}</td>
                      <td className="py-2.5 px-3 text-[#706E66] text-[11px] max-w-xs">{b.joineryNote}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium">${b.estimatedCost.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#FAF8F5] border-t border-[#E8E6DF] font-semibold text-[#1E1E1C]">
                  <tr>
                    <td colSpan={7} className="py-2.5 px-3 text-right">Total Component Shop Yield:</td>
                    <td className="py-2.5 px-3 text-right font-mono text-sm text-[#1E1E1C]">
                      ${initialPackage.bom.reduce((acc, c) => acc + c.estimatedCost, 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Revision Records */}
            {initialPackage.revisionHistory && initialPackage.revisionHistory.length > 0 && (
              <div className="pt-3 border-t border-[#E8E6DF] space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8C887B] block">
                  Drawing Revision Log
                </span>
                <div className="space-y-1">
                  {initialPackage.revisionHistory.map((rev, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-[#5E5C56] bg-[#FAF9F6] p-2 rounded border border-[#EDEAE3]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-[#1E1E1C]">{rev.revision}</span>
                        <span aria-hidden="true">·</span>
                        <span>{rev.changeNote}</span>
                      </div>
                      <div className="text-[11px] text-[#8C887B] font-mono">
                        {rev.date} ({rev.author})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Notes & Revision History */}
        <div className="pt-4 border-t border-[#E8E6DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#706E66]">
          <div className="flex items-center gap-3">
            <span>Drawn By: Atelier Spatial Engineering Guild</span>
            <span aria-hidden="true">·</span>
            <span>Date: {initialPackage.drawnDate}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">Rev: {initialPackage.revision}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              Dimensional model synchronized with {roomModel ? `${roomModel.length.valueFtIn} × ${roomModel.width.valueFtIn} (${roomModel.length.valueMm.toLocaleString()} × ${roomModel.width.valueMm.toLocaleString()} mm)` : "spatial"} room scan
            </span>
          </div>
        </div>
      </div>

      {/* Authorized Reviewer Portal Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in no-print">
          <div className="bg-white rounded-xl border border-[#D5CABB] max-w-xl w-full shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-[#F0EDE6] pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Authorized Sign-Off Role · Guild Inspection
                </span>
                <h3 className="font-serif text-xl text-[#1E1E1C] mt-1">
                  Manufacturer & Technical Reviewer Sign-Off
                </h3>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-[#8C887B] hover:text-[#1E1E1C] text-sm p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#5E5C56]">
              <div className="p-3 bg-[#FAF8F5] rounded border border-[#EDE5D8] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#8C887B]">Authorized Reviewer:</span>
                  <span className="font-semibold text-[#1E1E1C]">Marcus Vance, Master Joiner & Millwork PE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C887B]">License / Accreditation:</span>
                  <span className="font-mono font-medium text-[#1E1E1C]">PE #48921 · Pacific Woodworking Guild</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C887B]">Drawing Sheet Under Review:</span>
                  <span className="font-mono font-medium text-[#1E1E1C]">{initialPackage.drawingNumber} · {initialPackage.revision}</span>
                </div>
              </div>

              {/* Outstanding Issues Checklist */}
              <div className="space-y-2">
                <span className="font-semibold text-[#1E1E1C] block uppercase tracking-wider text-[11px]">
                  Technical Audit Checklist & Outstanding Issues:
                </span>
                
                <label className="flex items-start gap-2.5 p-2 bg-[#FAF9F6] rounded border border-[#E8E6DF] cursor-pointer hover:bg-white">
                  <input
                    type="checkbox"
                    checked={checkedIssues.movement}
                    onChange={(e) => setCheckedIssues({ ...checkedIssues, movement: e.target.checked })}
                    className="mt-0.5 accent-[#2C2A29]"
                  />
                  <div>
                    <span className="font-medium text-[#1E1E1C] block">Slotted Breadboard Joint Movement Allowance</span>
                    <span className="text-[#706E66] text-[11px]">
                      Validated ±{woodMovement.halfMovement}mm slotted clearance based on {woodMovement.property.commonName} tangential coefficient ({woodMovement.property.tangentialShrinkage}%).
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 bg-[#FAF9F6] rounded border border-[#E8E6DF] cursor-pointer hover:bg-white">
                  <input
                    type="checkbox"
                    checked={checkedIssues.moisture}
                    onChange={(e) => setCheckedIssues({ ...checkedIssues, moisture: e.target.checked })}
                    className="mt-0.5 accent-[#2C2A29]"
                  />
                  <div>
                    <span className="font-medium text-[#1E1E1C] block">Kiln-Dried Moisture Content (EMC)</span>
                    <span className="text-[#706E66] text-[11px]">
                      Lumber certified conditioned to 6.5% - 8.0% moisture content prior to milling and glue-up.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 bg-[#FAF9F6] rounded border border-[#E8E6DF] cursor-pointer hover:bg-white">
                  <input
                    type="checkbox"
                    checked={checkedIssues.delivery}
                    onChange={(e) => setCheckedIssues({ ...checkedIssues, delivery: e.target.checked })}
                    className="mt-0.5 accent-[#2C2A29]"
                  />
                  <div>
                    <span className="font-medium text-[#1E1E1C] block">Delivery & Threshold Ingress Feasibility</span>
                    <span className="text-[#706E66] text-[11px]">
                      Confirmed tabletop flat packaging clears 950mm entrance doorway with legs unbolted.
                    </span>
                  </div>
                </label>
              </div>

              {/* Reviewer Notes */}
              <div className="space-y-1">
                <label className="font-semibold text-[#1E1E1C] block text-[11px] uppercase tracking-wider">
                  Reviewer Directives / Cut List Conditions:
                </label>
                <textarea
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Enter shop notes (e.g., grain orientation preference, drawbore peg tightness, or specific CNC hold-downs)..."
                  className="w-full p-2.5 bg-[#FAF9F6] border border-[#DDD7C8] rounded text-xs focus:outline-none focus:border-[#2C2A29]"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#F0EDE6] gap-3">
              <button
                onClick={() => handleReviewerAction('request_changes')}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-medium rounded transition-colors cursor-pointer"
              >
                Request Design Changes
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-3 py-2 text-xs text-[#706E66] hover:text-[#1E1E1C] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReviewerAction('approve')}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Approve & Seal for Shop Fabrication</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
