import React, { useState } from 'react';
import { ProjectPreferences } from '../types';
import { X, Check, Sliders, Heart, Shield, Users } from 'lucide-react';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: ProjectPreferences;
  onSavePreferences: (updated: ProjectPreferences) => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
}) => {
  if (!isOpen) return null;

  const [budget, setBudget] = useState(preferences.overallBudget);
  const [roomPurpose, setRoomPurpose] = useState(preferences.roomPurpose || 'Daily family dining & regular weekend hosting');
  const [everydaySeating, setEverydaySeating] = useState(preferences.everydaySeating || 6);
  const [guestCapacity, setGuestCapacity] = useState(preferences.guestCapacity || 8);
  const [preferredStyle, setPreferredStyle] = useState(preferences.preferredStyles?.[0] || 'Nordic Warm Minimalist');
  const [retainedFurniture, setRetainedFurniture] = useState(preferences.retainedFurnitureNotes || 'Retaining family heirloom brass pendant lighting');
  const [desiredDeliveryTiming, setDesiredDeliveryTiming] = useState(preferences.desiredDeliveryTiming || 'Standard (8-10 weeks for custom millwork)');
  const [childrenOrPets, setChildrenOrPets] = useState(preferences.functionalRequirements.childrenOrPets);
  const [storageNeeded, setStorageNeeded] = useState(preferences.functionalRequirements.storageNeeded);
  const [accessibilityNeeds, setAccessibilityNeeds] = useState(preferences.functionalRequirements.accessibilityNeeds);
  const [selectedWoods, setSelectedWoods] = useState<string[]>(preferences.preferredWoods);

  const availableWoods = [
    'American White Oak',
    'Black Walnut',
    'Blonde Ash',
    'Hard Sugar Maple',
    'American Black Cherry',
  ];

  const handleToggleWood = (wood: string) => {
    if (selectedWoods.includes(wood)) {
      if (selectedWoods.length > 1) {
        setSelectedWoods(selectedWoods.filter((w) => w !== wood));
      }
    } else {
      setSelectedWoods([...selectedWoods, wood]);
    }
  };

  const handleSave = () => {
    onSavePreferences({
      ...preferences,
      overallBudget: budget,
      roomPurpose,
      everydaySeating,
      guestCapacity,
      preferredStyles: [preferredStyle],
      retainedFurnitureNotes: retainedFurniture,
      desiredDeliveryTiming,
      preferredWoods: selectedWoods,
      functionalRequirements: {
        ...preferences.functionalRequirements,
        seatingCapacity: everydaySeating,
        childrenOrPets,
        storageNeeded,
        accessibilityNeeds,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-xl border border-[#E8E6DF] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#F0EDE6] flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#8C887B] font-semibold">
              Project Brief & Needs
            </span>
            <h2 className="font-serif text-2xl text-[#1E1E1C] mt-0.5">
              Room Design Preferences & Constraints
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8C887B] hover:text-[#1E1E1C] rounded-lg hover:bg-[#F5F3EC] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Room Purpose */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#1E1E1C] block">Room Purpose & Primary Function</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Daily family dining & regular weekend hosting',
                'Formal dinner entertaining & wine staging',
                'Multipurpose family dining & work-from-home',
                'Open-concept great room flow with casual meals',
              ].map((purpose) => (
                <button
                  key={purpose}
                  type="button"
                  onClick={() => setRoomPurpose(purpose)}
                  className={`p-2.5 text-xs text-left rounded-lg border transition-colors cursor-pointer ${
                    roomPurpose === purpose
                      ? 'bg-[#2C2A29] text-white border-[#2C2A29]'
                      : 'bg-[#FAF9F6] border-[#DDD7C8] text-[#5E5C56] hover:border-[#8C887B]'
                  }`}
                >
                  <div className="font-medium">{purpose}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Budget Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[#1E1E1C]">Total Room Furnishing Budget Target</label>
              <span className="font-mono text-base font-bold text-[#1E1E1C]">${budget.toLocaleString()} USD</span>
            </div>
            <input
              type="range"
              min="8000"
              max="35000"
              step="500"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-[#2C2A29] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8C887B]">
              <span>$8,000 (Essential)</span>
              <span>$16,000 (Artisanal Oak)</span>
              <span>$35,000 (Full Estate Millwork)</span>
            </div>
          </div>

          {/* Seating: Everyday vs Occasional Guest Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[#1E1E1C]">Everyday Seating Needs</label>
                <span className="font-mono text-xs font-bold text-[#2C2A29]">{everydaySeating} Chairs</span>
              </div>
              <p className="text-[11px] text-[#706E66]">Chairs placed out at the dining table on a daily basis.</p>
              <div className="grid grid-cols-4 gap-1.5">
                {[4, 6, 8, 10].map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => setEverydaySeating(cap)}
                    className={`py-1.5 text-xs font-mono font-semibold rounded border transition-colors cursor-pointer ${
                      everydaySeating === cap
                        ? 'bg-[#2C2A29] text-white border-[#2C2A29]'
                        : 'bg-[#FAF9F6] border-[#DDD7C8] text-[#5E5C56] hover:border-[#8C887B]'
                    }`}
                  >
                    {cap}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[#1E1E1C]">Max Occasional Guest Capacity</label>
                <span className="font-mono text-xs font-bold text-[#5C4033]">{guestCapacity} Guests</span>
              </div>
              <p className="text-[11px] text-[#706E66]">With table breadboard leaves or pull-up side chairs.</p>
              <div className="grid grid-cols-4 gap-1.5">
                {[6, 8, 10, 12].map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => setGuestCapacity(cap)}
                    className={`py-1.5 text-xs font-mono font-semibold rounded border transition-colors cursor-pointer ${
                      guestCapacity === cap
                        ? 'bg-[#5C4033] text-white border-[#5C4033]'
                        : 'bg-[#FAF9F6] border-[#DDD7C8] text-[#5E5C56] hover:border-[#8C887B]'
                    }`}
                  >
                    {cap}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preferred Style */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#1E1E1C] block">Preferred Design Aesthetic</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                'Nordic Warm Minimalist',
                'Japandi Architectural Craft',
                'Contemporary Organic',
                'Traditional American Craftsman',
              ].map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setPreferredStyle(style)}
                  className={`p-2 text-xs text-center rounded border transition-colors cursor-pointer ${
                    preferredStyle === style
                      ? 'bg-[#2C2A29] text-white border-[#2C2A29] font-medium'
                      : 'bg-[#FAF9F6] border-[#DDD7C8] text-[#5E5C56] hover:border-[#8C887B]'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Solid Wood Preferences */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#1E1E1C] block">Preferred Hardwood Species</label>
            <div className="flex flex-wrap gap-2">
              {availableWoods.map((wood) => {
                const isSelected = selectedWoods.includes(wood);
                return (
                  <button
                    key={wood}
                    type="button"
                    onClick={() => handleToggleWood(wood)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#2C2A29] text-white'
                        : 'bg-[#FAF9F6] border border-[#DDD7C8] text-[#5E5C56] hover:border-[#8C887B]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{wood}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Retained Furniture & Existing Items */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#1E1E1C] block">Retained Furniture & Existing Heirlooms</label>
            <input
              type="text"
              value={retainedFurniture}
              onChange={(e) => setRetainedFurniture(e.target.value)}
              placeholder="e.g., Keeping vintage credenza, brass pendant light, or existing art"
              className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#DCD7CB] rounded focus:border-[#2C2A29] focus:outline-none"
            />
          </div>

          {/* Desired Delivery Timing */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#1E1E1C] block">Desired Delivery Timing</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                'Standard (8-10 weeks for custom millwork)',
                'Expedited (4-6 weeks where possible)',
                'Flexible (Align with home renovation schedule)',
              ].map((timing) => (
                <button
                  key={timing}
                  type="button"
                  onClick={() => setDesiredDeliveryTiming(timing)}
                  className={`p-2 text-xs text-left rounded border transition-colors cursor-pointer ${
                    desiredDeliveryTiming === timing
                      ? 'bg-[#2C2A29] text-white border-[#2C2A29] font-medium'
                      : 'bg-[#FAF9F6] border-[#DDD7C8] text-[#5E5C56] hover:border-[#8C887B]'
                  }`}
                >
                  {timing}
                </button>
              ))}
            </div>
          </div>

          {/* Functional Requirements */}
          <div className="space-y-3 pt-2 border-t border-[#F0EDE6]">
            <label className="text-xs font-semibold text-[#1E1E1C] block">Living Requirements & Durability</label>
            
            <label className="flex items-start gap-3 p-3 rounded-lg border border-[#EDEAE3] cursor-pointer hover:bg-[#FAF9F6]">
              <input
                type="checkbox"
                checked={childrenOrPets}
                onChange={(e) => setChildrenOrPets(e.target.checked)}
                className="mt-0.5 accent-[#2C2A29]"
              />
              <div className="text-xs">
                <span className="font-semibold text-[#1E1E1C] block">Children or Pets in Home</span>
                <span className="text-[#706E66]">
                  Specifies rounded edge chamfers, commercial spill-resistant hardwax oils, and stain-resistant seat fabrics.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-[#EDEAE3] cursor-pointer hover:bg-[#FAF9F6]">
              <input
                type="checkbox"
                checked={storageNeeded}
                onChange={(e) => setStorageNeeded(e.target.checked)}
                className="mt-0.5 accent-[#2C2A29]"
              />
              <div className="text-xs">
                <span className="font-semibold text-[#1E1E1C] block">Concealed Dining Storage Needed</span>
                <span className="text-[#706E66]">
                  Integrates a low credenza / sideboard for fine dinnerware, linens, and bar storage.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-[#EDEAE3] cursor-pointer hover:bg-[#FAF9F6]">
              <input
                type="checkbox"
                checked={accessibilityNeeds}
                onChange={(e) => setAccessibilityNeeds(e.target.checked)}
                className="mt-0.5 accent-[#2C2A29]"
              />
              <div className="text-xs">
                <span className="font-semibold text-[#1E1E1C] block">Enhanced Clearance & Mobility Access</span>
                <span className="text-[#706E66]">
                  Targets estimated 42" circulation clearances around primary walkways (preliminary check).
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-[#F0EDE6] bg-[#FAF9F6] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#706E66] hover:text-[#1E1E1C] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[#2C2A29] hover:bg-[#1E1E1C] text-white text-xs font-medium rounded shadow-sm transition-colors cursor-pointer"
          >
            Apply to Designs
          </button>
        </div>
      </div>
    </div>
  );
};
