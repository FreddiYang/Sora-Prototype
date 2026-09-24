import React from 'react';
import { Download, FileText, Sparkles, Sliders } from 'lucide-react';

interface TopNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenPreferences: () => void;
  onOpenDrawingExport: () => void;
  projectName: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  onOpenPreferences,
  onOpenDrawingExport,
  projectName,
}) => {
  const navItems = [
    { id: 'spatial-model', label: 'Room Spatial Model' },
    { id: 'designs', label: 'AI Room Designs' },
    { id: 'furniture-spec', label: 'Custom Furniture' },
    { id: 'drawings', label: 'Fabrication Drawings' },
    { id: 'materials', label: 'Material Sourcing' },
    { id: 'budget', label: 'Budget & BOM' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E8E6DF] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onTabChange('designs')}
            className="text-left group cursor-pointer focus-visible:outline-none"
          >
            <span className="font-serif text-2xl tracking-tight text-[#1E1E1C] group-hover:text-[#5C4033] transition-colors">
              Atelier Spatial
            </span>
          </button>
          <span className="hidden sm:inline-block text-[#CCC9BF] font-light">|</span>
          <span className="hidden sm:inline-block text-xs text-[#706E66] truncate max-w-[200px]">
            {projectName}
          </span>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3 py-1.5 text-xs font-medium tracking-wide transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-[#2C2A29] text-[#1E1E1C] font-semibold'
                    : 'border-transparent text-[#706E66] hover:text-[#1E1E1C] hover:border-[#D1CEBF]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenPreferences}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#4A4843] hover:text-[#1E1E1C] hover:bg-[#F0EDE6] rounded transition-colors whitespace-nowrap cursor-pointer"
            title="Edit Room Needs & Preferences"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preferences</span>
          </button>

          <button
            onClick={onOpenDrawingExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#FAF9F6] bg-[#2C2A29] hover:bg-[#1E1E1C] rounded transition-all shadow-sm hover:shadow whitespace-nowrap cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Package</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center overflow-x-auto px-4 py-2 bg-[#F5F3EC] border-t border-[#E8E6DF] scrollbar-none">
        <div className="flex space-x-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-2.5 py-1 text-xs whitespace-nowrap rounded ${
                activeTab === item.id
                  ? 'bg-[#2C2A29] text-white font-medium'
                  : 'text-[#5E5C56] hover:text-[#1E1E1C]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
