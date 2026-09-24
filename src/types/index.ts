export type DimensionSource = 'measured' | 'estimated' | 'manual';

export interface RoomDimension {
  valueMm: number;
  valueFtIn: string;
  source: DimensionSource;
}

export interface WallFeature {
  id: string;
  type: 'door' | 'window' | 'opening' | 'fireplace';
  wall: 'north' | 'south' | 'east' | 'west';
  offsetMm: number;
  widthMm: number;
  heightMm: number;
  notes?: string;
}

export interface RoomModel {
  length: RoomDimension; // e.g. 5480 mm (~18' 0")
  width: RoomDimension;  // e.g. 4260 mm (~14' 0")
  ceilingHeight: RoomDimension; // e.g. 2740 mm (~9' 0")
  areaSqFt: number; // e.g. 252 sq ft
  areaSqM: number;
  features: WallFeature[];
  obstacles: string[];
  scanMethod: 'lidar_scan' | 'photo_upload' | 'floor_plan' | 'manual';
  scanDate: string;
  confidenceScore: number;
}

export interface BOMComponent {
  itemNumber: number;
  partName: string;
  quantity: number;
  material: string;
  thicknessMm: number;
  widthMm: number;
  lengthMm: number;
  grainDirection: 'Lengthwise' | 'Crosswise' | 'Radial';
  joineryNote: string;
  estimatedCost: number;
}

export interface FurnitureSpecification {
  woodSpecies: string;
  grade: string;
  finishType: string;
  overallLengthMm: number;
  overallWidthMm: number;
  overallHeightMm: number;
  topThicknessMm: number;
  apronHeightMm: number;
  legDimensionsMm: string;
  overhangLengthMm: number;
  overhangBreadthMm: number;
  joineryMethod: string;
  expansionHardware: string;
  equilibriumMoistureContent: string;
  seatingCapacity: number;
  tolerancesMm: number;
  userConfirmedFields: string[];
  manufacturerReviewRequired: string[];
}

export interface DrawingPackage {
  id: string;
  packageType: 'concept_package' | 'manufacturing_package';
  drawingNumber: string;
  revision: string;
  drawnDate: string;
  approvedBy?: string;
  bom: BOMComponent[];
  generalNotes: string[];
  manufacturingQuestions: string[];
}

export interface FurnitureObject {
  id: string;
  name: string;
  category: 'table' | 'chair' | 'credenza' | 'lighting' | 'rug' | 'cabinet';
  isCustomConcept: boolean;
  style: string;
  materialSummary: string;
  dimensionsSummary: string;
  estimatedPrice: number;
  hotspot: {
    xPercent: number; // 0 - 100
    yPercent: number; // 0 - 100
    widthPercent: number;
    heightPercent: number;
  };
  specification?: FurnitureSpecification;
  drawingPackage?: DrawingPackage;
  productSku?: string;
  supplierName?: string;
  leadTimeWeeks: number;
}

export interface MaterialProduct {
  sku: string;
  name: string;
  manufacturer: string;
  category: 'flooring' | 'wall_tile' | 'wall_paint' | 'hardware' | 'textile';
  texture: string;
  finish: string;
  dimensions: string;
  pricePerUnit: number;
  priceUnit: 'sq.ft' | 'gallon' | 'box' | 'piece';
  coveragePerUnit: number; // e.g. 24 sq ft per box or 350 sq ft per gal
  supplier: string;
  purchaseUrl: string;
  sampleAvailable: boolean;
  leadTimeWeeks: number;
  inStock: boolean;
  lastUpdated: string;
  matchType: 'exact_identified' | 'visually_similar_alternative';
  matchReason: string;
  visualMatchScore: number; // 0 - 100
  swatchColor: string;
}

export interface SurfaceFinish {
  id: string;
  surfaceType: 'flooring' | 'wall_paint' | 'accent_tile' | 'ceiling';
  name: string;
  approxAreaSqFt: number;
  visualCharacteristics: {
    color: string;
    texture: string;
    finish: string;
    pattern: string;
  };
  hotspot: {
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
  };
  currentSelection: MaterialProduct;
  alternativeProducts: MaterialProduct[];
}

export interface DesignAlternative {
  id: string;
  title: string;
  tagline: string;
  styleArchetype: string;
  renderImageUrl: string;
  narrative: string;
  woodSpecies: string;
  finishType: string;
  flooringType: string;
  wallFinish: string;
  estimatedTotalBudget: number;
  furnitureObjects: FurnitureObject[];
  surfaces: SurfaceFinish[];
  circulationClearanceOk: boolean;
  parentVersionId?: string;
}

export interface ProjectPreferences {
  roomType: string;
  intendedActivities: string[];
  overallBudget: number;
  preferredStyles: string[];
  preferredWoods: string[];
  preferredColors: string[];
  neededFurniture: string[];
  retainedItems: string[];
  functionalRequirements: {
    seatingCapacity: number;
    storageNeeded: boolean;
    childrenOrPets: boolean;
    accessibilityNeeds: boolean;
    customLighting: boolean;
  };
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  roomModel: RoomModel;
  preferences: ProjectPreferences;
  designs: DesignAlternative[];
  activeDesignId: string;
}
