import React, { useState } from 'react';
import { INITIAL_PROJECT } from './data/initialData';
import { Project, DesignAlternative, FurnitureObject, SurfaceFinish, MaterialProduct, RoomModel, ProjectPreferences } from './types';
import { TopNav } from './components/TopNav';
import { RoomCaptureView } from './components/RoomCaptureView';
import { DesignExplorerView } from './components/DesignExplorerView';
import { FurnitureSpecEditor } from './components/FurnitureSpecEditor';
import { DrawingPackageView } from './components/DrawingPackageView';
import { MaterialDiscoveryPanel } from './components/MaterialDiscoveryPanel';
import { BudgetSummaryView } from './components/BudgetSummaryView';
import { PreferencesModal } from './components/PreferencesModal';

export default function App() {
  const [project, setProject] = useState<Project>(INITIAL_PROJECT);
  const [activeTab, setActiveTab] = useState<string>('designs');
  const [isPreferencesOpen, setIsPreferencesOpen] = useState<boolean>(false);

  // Active design
  const activeDesign = project.designs.find((d) => d.id === project.activeDesignId) || project.designs[0];

  // Active custom furniture object (default to the solid oak dining table)
  const [activeFurniture, setActiveFurniture] = useState<FurnitureObject>(
    activeDesign.furnitureObjects[0]
  );

  // Active surface finish (default to flooring)
  const [activeSurface, setActiveSurface] = useState<SurfaceFinish | null>(
    activeDesign.surfaces[0] || null
  );

  // Handlers
  const handleSelectDesign = (designId: string) => {
    setProject((prev) => ({
      ...prev,
      activeDesignId: designId,
    }));
    const newDesign = project.designs.find((d) => d.id === designId);
    if (newDesign && newDesign.furnitureObjects.length > 0) {
      setActiveFurniture(newDesign.furnitureObjects[0]);
    }
  };

  const handleUpdateDesign = (updatedDesign: DesignAlternative) => {
    setProject((prev) => ({
      ...prev,
      designs: prev.designs.map((d) => (d.id === updatedDesign.id ? updatedDesign : d)),
    }));
  };

  const handleUpdateRoomModel = (updatedRoomModel: RoomModel) => {
    setProject((prev) => ({
      ...prev,
      roomModel: updatedRoomModel,
    }));
  };

  const handleSavePreferences = (updatedPreferences: ProjectPreferences) => {
    setProject((prev) => ({
      ...prev,
      preferences: updatedPreferences,
    }));
  };

  const handleNavigateToCustomFurniture = (furniture: FurnitureObject) => {
    setActiveFurniture(furniture);
    setActiveTab('furniture-spec');
  };

  const handleNavigateToMaterials = (surface: SurfaceFinish) => {
    setActiveSurface(surface);
    setActiveTab('materials');
  };

  const handleUpdateFurniture = (updatedFurniture: FurnitureObject) => {
    setActiveFurniture(updatedFurniture);
    // Also sync back to active design
    const updatedFurnitureList = activeDesign.furnitureObjects.map((f) =>
      f.id === updatedFurniture.id ? updatedFurniture : f
    );
    const updatedDesign: DesignAlternative = {
      ...activeDesign,
      furnitureObjects: updatedFurnitureList,
    };
    handleUpdateDesign(updatedDesign);
  };

  const handleSelectMaterialProduct = (surfaceId: string, product: MaterialProduct) => {
    const updatedSurfaces = activeDesign.surfaces.map((s) => {
      if (s.id === surfaceId) {
        return {
          ...s,
          currentSelection: product,
        };
      }
      return s;
    });

    const updatedDesign: DesignAlternative = {
      ...activeDesign,
      surfaces: updatedSurfaces,
      flooringType: surfaceId.includes('flr') ? product.name : activeDesign.flooringType,
      wallFinish: surfaceId.includes('wll') ? product.name : activeDesign.wallFinish,
    };

    handleUpdateDesign(updatedDesign);
    const updatedActiveSurf = updatedSurfaces.find((s) => s.id === surfaceId);
    if (updatedActiveSurf) {
      setActiveSurface(updatedActiveSurf);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1E1E1C] flex flex-col font-sans selection:bg-[#EAE4D7] selection:text-[#1E1E1C]">
      {/* Top Bar Navigation */}
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenPreferences={() => setIsPreferencesOpen(true)}
        onOpenDrawingExport={() => setActiveTab('drawings')}
        projectName={project.name}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {activeTab === 'spatial-model' && (
          <RoomCaptureView
            roomModel={project.roomModel}
            onUpdateRoomModel={handleUpdateRoomModel}
            onProceedToDesigns={() => setActiveTab('designs')}
          />
        )}

        {activeTab === 'designs' && (
          <DesignExplorerView
            designs={project.designs}
            activeDesign={activeDesign}
            onSelectDesign={handleSelectDesign}
            onUpdateDesign={handleUpdateDesign}
            onNavigateToCustomFurniture={handleNavigateToCustomFurniture}
            onNavigateToMaterials={handleNavigateToMaterials}
            roomModel={project.roomModel}
          />
        )}

        {activeTab === 'furniture-spec' && (
          <FurnitureSpecEditor
            furniture={activeFurniture}
            onUpdateFurniture={handleUpdateFurniture}
            onOpenDrawingPackage={() => setActiveTab('drawings')}
          />
        )}

        {activeTab === 'drawings' && (
          <DrawingPackageView
            furniture={activeFurniture}
            onBackToEditor={() => setActiveTab('furniture-spec')}
          />
        )}

        {activeTab === 'materials' && (
          <MaterialDiscoveryPanel
            surface={activeSurface}
            allSurfaces={activeDesign.surfaces}
            onSwitchSurface={(s) => setActiveSurface(s)}
            onSelectProduct={handleSelectMaterialProduct}
            onOrderSample={(prod) => console.log('Sample requested for SKU:', prod.sku)}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetSummaryView
            project={project}
            activeDesign={activeDesign}
            onOpenDrawingPackage={(furn) => {
              setActiveFurniture(furn);
              setActiveTab('drawings');
            }}
          />
        )}
      </main>

      {/* Project Preferences Modal */}
      <PreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        preferences={project.preferences}
        onSavePreferences={handleSavePreferences}
      />
    </div>
  );
}
