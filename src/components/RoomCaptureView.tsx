import React, { useState } from 'react';
import { RoomModel, DimensionSource } from '../types';
import { 
  Camera, 
  Upload, 
  Ruler, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  RotateCcw,
  Sparkles,
  Compass,
  Maximize2
} from 'lucide-react';

interface RoomCaptureViewProps {
  roomModel: RoomModel;
  onUpdateRoomModel: (updated: RoomModel) => void;
  onProceedToDesigns: () => void;
}

export const RoomCaptureView: React.FC<RoomCaptureViewProps> = ({
  roomModel,
  onUpdateRoomModel,
  onProceedToDesigns,
}) => {
  const [activeInputMode, setActiveInputMode] = useState<'lidar' | 'photo' | 'floorplan' | 'manual'>('lidar');
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

  // Editable dimensions state
  const [lengthMm, setLengthMm] = useState(roomModel.length.valueMm);
  const [widthMm, setWidthMm] = useState(roomModel.width.valueMm);
  const [ceilingMm, setCeilingMm] = useState(roomModel.ceilingHeight.valueMm);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const mmToFeetInches = (mm: number) => {
    const totalInches = mm / 25.4;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}' ${inches}"`;
  };

  const handleSimulateScan = () => {
    setIsSimulatingScan(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulatingScan(false);
          // Update model with measured status
          const updated: RoomModel = {
            ...roomModel,
            scanMethod: 'lidar_scan',
            scanDate: new Date().toISOString().split('T')[0],
            confidenceScore: 99,
            length: { ...roomModel.length, source: 'measured' },
            width: { ...roomModel.width, source: 'measured' },
            ceilingHeight: { ...roomModel.ceilingHeight, source: 'measured' },
          };
          onUpdateRoomModel(updated);
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  const handleSaveDimensions = (source: DimensionSource) => {
    const areaSqM = Number(((lengthMm / 1000) * (widthMm / 1000)).toFixed(1));
    const areaSqFt = Math.round(areaSqM * 10.7639);

    const updated: RoomModel = {
      ...roomModel,
      length: {
        valueMm: lengthMm,
        valueFtIn: mmToFeetInches(lengthMm),
        source,
      },
      width: {
        valueMm: widthMm,
        valueFtIn: mmToFeetInches(widthMm),
        source,
      },
      ceilingHeight: {
        valueMm: ceilingMm,
        valueFtIn: mmToFeetInches(ceilingMm),
        source,
      },
      areaSqFt,
      areaSqM,
    };
    onUpdateRoomModel(updated);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2500);
  };

  const getSourceBadge = (source: DimensionSource) => {
    switch (source) {
      case 'measured':
        return (
          <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Measured (LiDAR)
          </span>
        );
      case 'estimated':
        return (
          <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> Estimated (Photo/Plan)
          </span>
        );
      case 'manual':
        return (
          <span className="text-[11px] font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span> Manual Override
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header section */}
      <div className="border-b border-[#E8E6DF] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#8C887B]">
            Spatial Model · Step 2 of 5
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1C] mt-1 font-normal">
            Room Capture & Dimensional Review
          </h1>
          <p className="text-sm text-[#5E5C56] mt-2 max-w-2xl">
            Confirm room geometry, boundary clearances, doors, and natural light sources. 
            Accurate measurements ensure commissioned furniture and surface finishes fit seamlessly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onProceedToDesigns}
            className="px-5 py-2.5 bg-[#2C2A29] hover:bg-[#1E1E1C] text-white text-xs font-medium tracking-wide rounded shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Confirm & Generate Designs</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>

      {/* Input Method Switcher */}
      <div className="bg-white p-2 rounded-lg border border-[#E8E6DF] shadow-xs flex flex-wrap gap-2">
        <button
          onClick={() => setActiveInputMode('lidar')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded text-xs font-medium transition-all text-left flex items-center gap-2.5 ${
            activeInputMode === 'lidar'
              ? 'bg-[#F4F1EA] text-[#1E1E1C] font-semibold border border-[#DCD7CB]'
              : 'text-[#6B6962] hover:bg-[#FAF9F6]'
          }`}
        >
          <Camera className="w-4 h-4 text-[#5C4033]" />
          <div>
            <div className="font-medium">LiDAR Room Scan</div>
            <div className="text-[10px] text-[#8C887B]">Mobile depth sensor (98% precision)</div>
          </div>
        </button>

        <button
          onClick={() => setActiveInputMode('photo')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded text-xs font-medium transition-all text-left flex items-center gap-2.5 ${
            activeInputMode === 'photo'
              ? 'bg-[#F4F1EA] text-[#1E1E1C] font-semibold border border-[#DCD7CB]'
              : 'text-[#6B6962] hover:bg-[#FAF9F6]'
          }`}
        >
          <Upload className="w-4 h-4 text-[#5C4033]" />
          <div>
            <div className="font-medium">Room Photographs</div>
            <div className="text-[10px] text-[#8C887B]">Upload 3-4 panoramic shots</div>
          </div>
        </button>

        <button
          onClick={() => setActiveInputMode('floorplan')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded text-xs font-medium transition-all text-left flex items-center gap-2.5 ${
            activeInputMode === 'floorplan'
              ? 'bg-[#F4F1EA] text-[#1E1E1C] font-semibold border border-[#DCD7CB]'
              : 'text-[#6B6962] hover:bg-[#FAF9F6]'
          }`}
        >
          <Layers className="w-4 h-4 text-[#5C4033]" />
          <div>
            <div className="font-medium">Architectural Floor Plan</div>
            <div className="text-[10px] text-[#8C887B]">PDF / CAD / Blueprint image</div>
          </div>
        </button>

        <button
          onClick={() => setActiveInputMode('manual')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded text-xs font-medium transition-all text-left flex items-center gap-2.5 ${
            activeInputMode === 'manual'
              ? 'bg-[#F4F1EA] text-[#1E1E1C] font-semibold border border-[#DCD7CB]'
              : 'text-[#6B6962] hover:bg-[#FAF9F6]'
          }`}
        >
          <Ruler className="w-4 h-4 text-[#5C4033]" />
          <div>
            <div className="font-medium">Manual Tape Measure</div>
            <div className="text-[10px] text-[#8C887B]">Direct millimeter / feet entry</div>
          </div>
        </button>
      </div>

      {/* Main 2-column layout: 2D Spatial Plan (Left) + Dimensional Controls (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive 2D Architectural Floor Plan */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-[#E8E6DF] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE6]">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#8C887B]" />
              <h2 className="text-sm font-semibold text-[#1E1E1C]">
                2D Architectural Floor Plan & Circulation Clearance
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#706E66]">
              <span>Scale: 1:50</span>
              <span aria-hidden="true">·</span>
              <span>Orientation: North Up</span>
            </div>
          </div>

          {/* SVG Floorplan Canvas */}
          <div className="relative aspect-4/3 w-full bg-[#FAF9F6] blueprint-grid rounded border border-[#E2DFD7] p-4 flex items-center justify-center overflow-hidden">
            <svg
              viewBox="0 0 600 460"
              className="w-full h-full select-none"
            >
              {/* Outer Room Perimeter (5480 x 4260 mm normalized to 480 x 370) */}
              <defs>
                <pattern id="clearanceHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#D1CDC2" strokeWidth="1" strokeDasharray="2,2" />
                </pattern>
              </defs>

              {/* Floor Surface */}
              <rect
                x="60"
                y="45"
                width="480"
                height="370"
                fill="#F7F5F0"
                stroke="#2C2A29"
                strokeWidth="4"
              />

              {/* 36" (914mm) Circulation Pathway Boundary (dashed) */}
              <rect
                x="110"
                y="95"
                width="380"
                height="270"
                fill="none"
                stroke="#A8A499"
                strokeWidth="1.2"
                strokeDasharray="4,4"
              />
              <text x="120" y="112" fill="#8C887B" fontSize="9" fontFamily="monospace">
                36" RECOMMENDED CIRCULATION CLEARANCE
              </text>

              {/* North Wall: Large Architectural Picture Window (x=160 to 360, y=45) */}
              <rect x="150" y="41" width="220" height="8" fill="#FFFFFF" stroke="#4A6572" strokeWidth="2" />
              <line x1="150" y1="45" x2="370" y2="45" stroke="#4A6572" strokeWidth="1" />
              <text x="215" y="35" fill="#4A6572" fontSize="10" fontWeight="600" textAnchor="middle">
                WINDOW 2400 mm (Morning Light)
              </text>

              {/* South Wall: Hallway Entrance Door (x=140 to 220, y=415) with Swing Arc */}
              <rect x="130" y="411" width="75" height="8" fill="#FFFFFF" stroke="#2C2A29" strokeWidth="2" />
              {/* Door Leaf (swinging open inwards) */}
              <line x1="130" y1="415" x2="130" y2="340" stroke="#8C5835" strokeWidth="2" />
              {/* Door Swing Arc */}
              <path
                d="M 130 340 A 75 75 0 0 1 205 415"
                fill="none"
                stroke="#C4A482"
                strokeWidth="1.5"
                strokeDasharray="3,3"
              />
              <text x="145" y="435" fill="#5C4033" fontSize="10" fontWeight="600">
                DOOR 950 mm (Swing Arc)
              </text>

              {/* East Wall: French Patio Doors (x=540, y=140 to 280) */}
              <rect x="536" y="140" width="8" height="130" fill="#FFFFFF" stroke="#4A6572" strokeWidth="2" />
              <path
                d="M 540 140 A 65 65 0 0 0 540 205"
                fill="none"
                stroke="#A4B5BC"
                strokeWidth="1.2"
                strokeDasharray="2,2"
              />
              <path
                d="M 540 270 A 65 65 0 0 1 540 205"
                fill="none"
                stroke="#A4B5BC"
                strokeWidth="1.2"
                strokeDasharray="2,2"
              />
              <text x="555" y="210" fill="#4A6572" fontSize="9" transform="rotate(90 555 210)" textAnchor="middle">
                FRENCH DOORS (Terrace)
              </text>

              {/* West Wall: Low Credenza Millwork Zone */}
              <rect
                x="64"
                y="150"
                width="40"
                height="160"
                fill="#E8DFD3"
                stroke="#8C7058"
                strokeWidth="1.5"
              />
              <text x="84" y="235" fill="#5C4033" fontSize="9" transform="rotate(-90 84 235)" textAnchor="middle" fontWeight="500">
                FLUTED CREDENZA ZONE
              </text>

              {/* Center Zone: Dining Table & Chair Footprint (2400 x 950mm -> 210 x 85) */}
              <g id="table-group" className="cursor-pointer">
                {/* Tabletop */}
                <rect
                  x="195"
                  y="180"
                  width="210"
                  height="85"
                  rx="6"
                  fill="#D4B996"
                  stroke="#5C4033"
                  strokeWidth="2"
                />
                {/* Breadboard ends */}
                <line x1="215" y1="180" x2="215" y2="265" stroke="#8C6239" strokeWidth="1.5" strokeDasharray="2,2" />
                <line x1="385" y1="180" x2="385" y2="265" stroke="#8C6239" strokeWidth="1.5" strokeDasharray="2,2" />

                {/* Table Label */}
                <text x="300" y="218" fill="#2C2A29" fontSize="11" fontWeight="600" textAnchor="middle">
                  Bespoke Solid Oak Table
                </text>
                <text x="300" y="233" fill="#5E5C56" fontSize="9" fontFamily="monospace" textAnchor="middle">
                  2400 x 950 mm · 8 Seats
                </text>

                {/* Surrounding Chairs (6-8 chairs) */}
                {/* Top 3 chairs */}
                <rect x="220" y="148" width="34" height="26" rx="2" fill="#E6DFD5" stroke="#7A7468" strokeWidth="1" />
                <rect x="283" y="148" width="34" height="26" rx="2" fill="#E6DFD5" stroke="#7A7468" strokeWidth="1" />
                <rect x="346" y="148" width="34" height="26" rx="2" fill="#E6DFD5" stroke="#7A7468" strokeWidth="1" />

                {/* Bottom 3 chairs */}
                <rect x="220" y="271" width="34" height="26" rx="2" fill="#E6DFD5" stroke="#7A7468" strokeWidth="1" />
                <rect x="283" y="271" width="34" height="26" rx="2" fill="#E6DFD5" stroke="#7A7468" strokeWidth="1" />
                <rect x="346" y="271" width="34" height="26" rx="2" fill="#E6DFD5" stroke="#7A7468" strokeWidth="1" />

                {/* End Chairs */}
                <rect x="163" y="206" width="26" height="34" rx="2" fill="#E6DFD5" stroke="#7A7468" strokeWidth="1" />
                <rect x="411" y="206" width="26" height="34" rx="2" fill="#E6DFD5" stroke="#7A7468" strokeWidth="1" />
              </g>

              {/* Dimensions Labels on Canvas */}
              {/* Length dimension (Top: 5480 mm) */}
              <line x1="60" y1="18" x2="540" y2="18" stroke="#1E1E1C" strokeWidth="1.2" />
              <line x1="60" y1="12" x2="60" y2="24" stroke="#1E1E1C" strokeWidth="1.2" />
              <line x1="540" y1="12" x2="540" y2="24" stroke="#1E1E1C" strokeWidth="1.2" />
              <text x="300" y="14" fill="#1E1E1C" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="monospace">
                5,480 mm (18' 0")
              </text>

              {/* Width dimension (Left: 4260 mm) */}
              <line x1="30" y1="45" x2="30" y2="415" stroke="#1E1E1C" strokeWidth="1.2" />
              <line x1="24" y1="45" x2="36" y2="45" stroke="#1E1E1C" strokeWidth="1.2" />
              <line x1="24" y1="415" x2="36" y2="415" stroke="#1E1E1C" strokeWidth="1.2" />
              <text x="22" y="235" fill="#1E1E1C" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="monospace" transform="rotate(-90 22 235)">
                4,260 mm (14' 0")
              </text>
            </svg>

            {/* Scan animation overlay */}
            {isSimulatingScan && (
              <div className="absolute inset-0 bg-[#2C2A29]/70 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 transition-all">
                <div className="w-12 h-12 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mb-4"></div>
                <div className="font-serif text-lg tracking-wide">Processing LiDAR Spatial Mesh</div>
                <div className="text-xs text-[#CCC9BF] mt-1">Detecting structural planes, openings & ceiling datum</div>
                <div className="w-48 bg-[#444] rounded-full h-1.5 mt-4 overflow-hidden">
                  <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
                </div>
                <div className="text-[11px] font-mono mt-2 text-emerald-300">{scanProgress}% mapped</div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-[#706E66] pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#4A6572]"></span> Natural Light / Windows
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#8C5835]"></span> Door Clearance Arcs
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-b border-dashed border-[#A8A499]"></span> 36" Walking Aisles
              </span>
            </div>
            <span className="font-mono text-[11px]">Area: {roomModel.areaSqFt} sq ft ({roomModel.areaSqM} m²)</span>
          </div>
        </div>

        {/* Right: Dimension Controls & Verification */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Mode Banner */}
          {activeInputMode === 'lidar' && (
            <div className="bg-white rounded-lg border border-[#E8E6DF] p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#5C4033]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1C]">
                    LiDAR Scan Active
                  </span>
                </div>
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  98% Confidence
                </span>
              </div>
              <p className="text-xs text-[#5E5C56]">
                iPhone / iPad Pro RoomPlan LiDAR point cloud verified 3 days ago. Room planes and door thresholds captured automatically.
              </p>
              <button
                onClick={handleSimulateScan}
                disabled={isSimulatingScan}
                className="w-full py-2 bg-[#F5F2EA] hover:bg-[#EAE4D7] text-[#1E1E1C] text-xs font-medium rounded border border-[#DDD7C8] transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-scan Room with Phone Sensor</span>
              </button>
            </div>
          )}

          {activeInputMode === 'photo' && (
            <div className="bg-white rounded-lg border border-[#E8E6DF] p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#5C4033]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1C]">
                  Photo Estimator
                </span>
              </div>
              <p className="text-xs text-[#5E5C56]">
                Upload 3 to 5 wide-angle photos showing all 4 corners and the ceiling joint.
              </p>
              <div className="border-2 border-dashed border-[#DCD7CB] rounded p-6 text-center bg-[#FAF9F6] cursor-pointer hover:border-[#8C887B] transition-colors">
                <Upload className="w-6 h-6 text-[#8C887B] mx-auto mb-2" />
                <div className="text-xs font-medium text-[#1E1E1C]">Click or drag room photos here</div>
                <div className="text-[11px] text-[#8C887B] mt-1">JPEG, HEIC, PNG up to 25MB</div>
              </div>
            </div>
          )}

          {activeInputMode === 'floorplan' && (
            <div className="bg-white rounded-lg border border-[#E8E6DF] p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#5C4033]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1C]">
                  Floor Plan Vectorizer
                </span>
              </div>
              <p className="text-xs text-[#5E5C56]">
                Extract wall dimensions and doorway positions directly from your builder's floor plan drawing.
              </p>
              <div className="border-2 border-dashed border-[#DCD7CB] rounded p-6 text-center bg-[#FAF9F6] cursor-pointer hover:border-[#8C887B] transition-colors">
                <Layers className="w-6 h-6 text-[#8C887B] mx-auto mb-2" />
                <div className="text-xs font-medium text-[#1E1E1C]">Upload Architectural Floor Plan</div>
                <div className="text-[11px] text-[#8C887B] mt-1">PDF or image format with dimension scale</div>
              </div>
            </div>
          )}

          {/* Dimension Adjustment Form */}
          <div className="bg-white rounded-lg border border-[#E8E6DF] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0EDE6]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1C]">
                Review & Correct Dimensions
              </h3>
              <span className="text-[11px] text-[#706E66]">Metric (mm) & Imperial</span>
            </div>

            {/* Room Length */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#2C2A29]">Room Length (North to South)</label>
                {getSourceBadge(roomModel.length.source)}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    value={lengthMm}
                    onChange={(e) => setLengthMm(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#FAF9F6] border border-[#DDD7C8] rounded focus:border-[#2C2A29] focus:outline-none font-mono"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs text-[#8C887B]">mm</span>
                </div>
                <div className="px-3 py-1.5 text-xs bg-[#F4F1EA] text-[#5E5C56] rounded border border-[#E2DDD0] font-mono flex items-center justify-between">
                  <span>{mmToFeetInches(lengthMm)}</span>
                  <span className="text-[10px] text-[#8C887B]">ft/in</span>
                </div>
              </div>
            </div>

            {/* Room Width */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#2C2A29]">Room Width (East to West)</label>
                {getSourceBadge(roomModel.width.source)}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    value={widthMm}
                    onChange={(e) => setWidthMm(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#FAF9F6] border border-[#DDD7C8] rounded focus:border-[#2C2A29] focus:outline-none font-mono"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs text-[#8C887B]">mm</span>
                </div>
                <div className="px-3 py-1.5 text-xs bg-[#F4F1EA] text-[#5E5C56] rounded border border-[#E2DDD0] font-mono flex items-center justify-between">
                  <span>{mmToFeetInches(widthMm)}</span>
                  <span className="text-[10px] text-[#8C887B]">ft/in</span>
                </div>
              </div>
            </div>

            {/* Ceiling Height */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#2C2A29]">Ceiling Height</label>
                {getSourceBadge(roomModel.ceilingHeight.source)}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    value={ceilingMm}
                    onChange={(e) => setCeilingMm(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#FAF9F6] border border-[#DDD7C8] rounded focus:border-[#2C2A29] focus:outline-none font-mono"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs text-[#8C887B]">mm</span>
                </div>
                <div className="px-3 py-1.5 text-xs bg-[#F4F1EA] text-[#5E5C56] rounded border border-[#E2DDD0] font-mono flex items-center justify-between">
                  <span>{mmToFeetInches(ceilingMm)}</span>
                  <span className="text-[10px] text-[#8C887B]">ft/in</span>
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => handleSaveDimensions('manual')}
                className="flex-1 py-2 bg-[#2C2A29] hover:bg-[#1E1E1C] text-white text-xs font-medium rounded transition-colors cursor-pointer"
              >
                Apply Manual Override
              </button>
            </div>

            {showSavedFeedback && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Room model dimensions updated across all drawing and CAD packages.</span>
              </div>
            )}
          </div>

          {/* Architectural Notes & Obstacles */}
          <div className="bg-white rounded-lg border border-[#E8E6DF] p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1C]">
              Fixed Constraints & Clearances
            </h3>
            <ul className="text-xs text-[#5E5C56] space-y-2">
              {roomModel.obstacles.map((obs, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#8C5835] font-bold mt-0.5">•</span>
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
