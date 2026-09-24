import { BOMComponent, FurnitureSpecification, DrawingPackage, DesignAlternative, RoomModel } from '../types';

export interface WoodSpeciesProperty {
  commonName: string;
  botanicalName: string;
  radialShrinkage: number; // %
  tangentialShrinkage: number; // %
  expansionCoefficient: number; // delta dimension per % EMC change
  densityKgM3: number;
  jankaHardness: number;
  costMultiplier: number;
  tagline: string;
}

export const WOOD_SPECIES_DB: Record<string, WoodSpeciesProperty> = {
  oak: {
    commonName: 'Select American White Oak',
    botanicalName: 'Quercus alba',
    radialShrinkage: 5.6,
    tangentialShrinkage: 10.5,
    expansionCoefficient: 0.00365,
    densityKgM3: 755,
    jankaHardness: 1360,
    costMultiplier: 1.0,
    tagline: 'High tannin water resistance, prominent medullary rays, golden neutral tone',
  },
  walnut: {
    commonName: 'American Black Walnut',
    botanicalName: 'Juglans nigra',
    radialShrinkage: 5.5,
    tangentialShrinkage: 7.8,
    expansionCoefficient: 0.00274,
    densityKgM3: 610,
    jankaHardness: 1010,
    costMultiplier: 1.38,
    tagline: 'Deep chocolate violet hues, exceptional dimensional stability, luxury hardwood',
  },
  ash: {
    commonName: 'Blonde White Ash',
    botanicalName: 'Fraxinus americana',
    radialShrinkage: 4.9,
    tangentialShrinkage: 7.8,
    expansionCoefficient: 0.00311,
    densityKgM3: 670,
    jankaHardness: 1320,
    costMultiplier: 0.92,
    tagline: 'Ultra-bright elastic grain, prominent cathedrals, contemporary Scandinavian',
  },
  maple: {
    commonName: 'Hard Sugar Maple',
    botanicalName: 'Acer saccharum',
    radialShrinkage: 4.8,
    tangentialShrinkage: 9.9,
    expansionCoefficient: 0.00353,
    densityKgM3: 705,
    jankaHardness: 1450,
    costMultiplier: 1.05,
    tagline: 'Dense closed-pore silky grain, creamy light tones, extreme impact resistance',
  },
  cherry: {
    commonName: 'American Black Cherry',
    botanicalName: 'Prunus serotina',
    radialShrinkage: 3.7,
    tangentialShrinkage: 7.1,
    expansionCoefficient: 0.00282,
    densityKgM3: 560,
    jankaHardness: 950,
    costMultiplier: 1.15,
    tagline: 'Warm amber aging patina, fine satin texture, historic American craftsmanship',
  },
};

export const getWoodProperty = (woodName: string): WoodSpeciesProperty => {
  const lower = woodName.toLowerCase();
  if (lower.includes('walnut')) return WOOD_SPECIES_DB.walnut;
  if (lower.includes('ash')) return WOOD_SPECIES_DB.ash;
  if (lower.includes('maple')) return WOOD_SPECIES_DB.maple;
  if (lower.includes('cherry')) return WOOD_SPECIES_DB.cherry;
  return WOOD_SPECIES_DB.oak;
};

/**
 * Calculates seasonal cross-grain expansion according to the
 * USDA Forest Products Laboratory (FPL) Wood Handbook formula.
 * Standard seasonal indoor humidity swing delta = 4% EMC (e.g. 6% winter to 10% summer).
 */
export const calculateWoodMovement = (woodName: string, widthMm: number) => {
  const prop = getWoodProperty(woodName);
  const deltaEmcPercent = 4.0;
  const seasonalExpansionMm = Number((widthMm * prop.expansionCoefficient * deltaEmcPercent).toFixed(1));
  const halfMovement = Number((seasonalExpansionMm / 2).toFixed(1));

  return {
    property: prop,
    seasonalExpansionMm,
    halfMovement,
    recommendation: `Slotted joinery must allow ±${halfMovement} mm lateral expansion across the ${widthMm} mm width.`,
  };
};

/**
 * Dynamically generates a verified Bill of Materials (BOM) for the dining table
 * based on exact user-configured dimensions and wood species.
 */
export const generateTableBOM = (
  spec: FurnitureSpecification,
  woodSpecies: string
): BOMComponent[] => {
  const length = spec.overallLengthMm || 2400;
  const width = spec.overallWidthMm || 950;
  const height = spec.overallHeightMm || 750;
  const topThickness = spec.topThicknessMm || 42;
  const breadboardWidth = 120; // standard breadboard end width
  const coreLength = length - breadboardWidth * 2; // e.g. 2400 - 240 = 2160; 1800 - 240 = 1560
  const prop = getWoodProperty(woodSpecies);
  const costMult = prop.costMultiplier;

  // Board feet estimate for core slab:
  const coreBoardFeet = ((coreLength / 25.4) * (width / 25.4) * (topThickness / 25.4)) / 144;
  const coreCost = Math.round(coreBoardFeet * 18 * costMult + 350); // material + edge-gluing labor

  const breadboardCost = Math.round(140 * costMult * 2);
  const legHeight = height - topThickness;
  const legsCost = Math.round(300 * costMult * 2);
  const spreadersCost = Math.round(110 * costMult * 2);
  const shoesCost = Math.round(150 * costMult * 2);
  const stretcherLength = length - 2 * (spec.overhangLengthMm || 280);
  const stretcherCost = Math.round(220 * costMult);

  return [
    {
      itemNumber: 1,
      partName: 'Tabletop Core Planks (Edge-Glued Billets)',
      quantity: 1,
      material: `${prop.commonName} (FAS Rift-Sawn)`,
      thicknessMm: topThickness,
      widthMm: width,
      lengthMm: coreLength,
      grainDirection: 'Lengthwise',
      joineryNote: 'Alternating annular ring orientation; internal domino alignment biscuits every 200mm',
      estimatedCost: coreCost,
    },
    {
      itemNumber: 2,
      partName: 'Breadboard End Caps',
      quantity: 2,
      material: `${prop.commonName} (Quarter-Sawn)`,
      thicknessMm: topThickness,
      widthMm: breadboardWidth,
      lengthMm: width,
      grainDirection: 'Lengthwise',
      joineryNote: `Center glued tenon; outer mortises slotted ±${Math.max(5, Math.round(width * prop.expansionCoefficient * 2))}mm with loose blind pegs`,
      estimatedCost: breadboardCost,
    },
    {
      itemNumber: 3,
      partName: 'Trestle Legs (A-Frame Uprights)',
      quantity: 4,
      material: `${prop.commonName} (Solid Billet)`,
      thicknessMm: 80,
      widthMm: 80,
      lengthMm: legHeight,
      grainDirection: 'Lengthwise',
      joineryNote: 'Compound angled haunched mortise into top sub-spreader and floor shoe',
      estimatedCost: legsCost,
    },
    {
      itemNumber: 4,
      partName: 'Top Sub-Frame Spreaders',
      quantity: 2,
      material: prop.commonName,
      thicknessMm: 45,
      widthMm: 70,
      lengthMm: Math.round(width * 0.83),
      grainDirection: 'Lengthwise',
      joineryNote: 'Counterbored slots for heavy-gauge figure-8 tabletop expansion clips',
      estimatedCost: spreadersCost,
    },
    {
      itemNumber: 5,
      partName: 'Lower Floor Shoes (Beveled Base)',
      quantity: 2,
      material: prop.commonName,
      thicknessMm: 65,
      widthMm: 90,
      lengthMm: Math.round(width * 0.86),
      grainDirection: 'Lengthwise',
      joineryNote: 'Recessed threaded inserts for M8 concealed stainless steel leveling glides',
      estimatedCost: shoesCost,
    },
    {
      itemNumber: 6,
      partName: 'Longitudinal Center Stretcher Beam',
      quantity: 1,
      material: `${prop.commonName} (Quarter-Sawn)`,
      thicknessMm: 40,
      widthMm: 120,
      lengthMm: stretcherLength,
      grainDirection: 'Lengthwise',
      joineryNote: 'Through-tenons secured with removable tapered walnut or oak locking keys',
      estimatedCost: stretcherCost,
    },
    {
      itemNumber: 7,
      partName: 'Hardware & Leveling Glides Kit',
      quantity: 1,
      material: '304 Stainless Steel & Cold-Rolled Carbon Steel',
      thicknessMm: 3,
      widthMm: 25,
      lengthMm: 45,
      grainDirection: 'Lengthwise',
      joineryNote: '12x Figure-8 desktop fasteners, 4x M8 heavy-duty adjustable nylon-padded glides',
      estimatedCost: 110,
    },
  ];
};

/**
 * Dynamically generates a verified Bill of Materials (BOM) for the credenza
 * based on exact user-configured dimensions and wood species.
 */
export const generateCredenzaBOM = (
  spec: FurnitureSpecification,
  woodSpecies: string
): BOMComponent[] => {
  const length = spec.overallLengthMm || 2000;
  const depth = spec.overallWidthMm || 480;
  const height = spec.overallHeightMm || 680;
  const prop = getWoodProperty(woodSpecies);
  const costMult = prop.costMultiplier;

  return [
    {
      itemNumber: 1,
      partName: 'Carcass Top & Bottom Solid Panels',
      quantity: 2,
      material: `${prop.commonName} (Rift-Sawn Core)`,
      thicknessMm: 22,
      widthMm: depth,
      lengthMm: length,
      grainDirection: 'Lengthwise',
      joineryNote: '45-degree mitered waterfall edge joinery with internal #20 domino alignment tenons',
      estimatedCost: Math.round(620 * costMult),
    },
    {
      itemNumber: 2,
      partName: 'Carcass Side Gable Ends',
      quantity: 2,
      material: `${prop.commonName} (Solid Billet)`,
      thicknessMm: 22,
      widthMm: depth,
      lengthMm: height - 80, // minus plinth base
      grainDirection: 'Lengthwise',
      joineryNote: 'Continuous waterfall grain match wrapping down from top panel',
      estimatedCost: Math.round(380 * costMult),
    },
    {
      itemNumber: 3,
      partName: 'Honed Travertine Top Inlay Slab',
      quantity: 1,
      material: 'Roman Honed Travertine (Filled & Sealed)',
      thicknessMm: 20,
      widthMm: depth - 60,
      lengthMm: length - 80,
      grainDirection: 'Lengthwise',
      joineryNote: 'Recessed 6mm reveal supported on anti-deflection neoprene isolation tape',
      estimatedCost: 890,
    },
    {
      itemNumber: 4,
      partName: 'Fluted Tambour Sliding Door Wraps',
      quantity: 2,
      material: `${prop.commonName} Reeds on Heavy Canvas`,
      thicknessMm: 14,
      widthMm: height - 120,
      lengthMm: Math.round(length * 0.55),
      grainDirection: 'Crosswise',
      joineryNote: '12mm solid reeded profiles bonded to Belgian linen duck; lubricated track guides',
      estimatedCost: Math.round(760 * costMult),
    },
    {
      itemNumber: 5,
      partName: 'Architectural Recessed Plinth Base',
      quantity: 1,
      material: `${prop.commonName} (Solid Frame)`,
      thicknessMm: 60,
      widthMm: depth - 80,
      lengthMm: length - 100,
      grainDirection: 'Lengthwise',
      joineryNote: 'Concealed steel corner gussets with 6x M8 micro-adjustable leveling feet',
      estimatedCost: Math.round(340 * costMult),
    },
    {
      itemNumber: 6,
      partName: 'Interior Adjustable Shelves & Divider',
      quantity: 3,
      material: `${prop.commonName} (FAS White Wood)`,
      thicknessMm: 19,
      widthMm: depth - 80,
      lengthMm: Math.round((length - 60) / 2),
      grainDirection: 'Lengthwise',
      joineryNote: 'Solid wood edge-banding on 32mm spaced line-bored solid brass sleeve pins',
      estimatedCost: Math.round(280 * costMult),
    },
    {
      itemNumber: 7,
      partName: 'Tambour Glide Track Hardware & Stops',
      quantity: 1,
      material: 'Extruded Brass Track & Delrin Sliders',
      thicknessMm: 8,
      widthMm: 20,
      lengthMm: length * 2,
      grainDirection: 'Lengthwise',
      joineryNote: 'CNC-routed continuous radius corner track with felt soft-stops',
      estimatedCost: 190,
    },
  ];
};

/**
 * Calculates furniture price accurately from component BOM and millwork labor.
 */
export const calculateFurniturePrice = (
  bom: BOMComponent[],
  category: string
): number => {
  const materialAndComponentTotal = bom.reduce((sum, item) => sum + item.estimatedCost, 0);
  // Add skilled handcraft finishing, assembly, and quality assurance
  const assemblyAndFinishingLabor = category === 'table' ? 850 : 750;
  return materialAndComponentTotal + assemblyAndFinishingLabor;
};

/**
 * Single source of truth calculation for complete design project budget.
 * Derives current costs from real line items, distinguishes from original estimate,
 * and synchronizes surface takeoffs with the room model.
 */
export const calculateDesignBudget = (
  design: DesignAlternative,
  roomModel: RoomModel
) => {
  const customItems = design.furnitureObjects.filter((f) => f.isCustomConcept);
  const catalogItems = design.furnitureObjects.filter((f) => !f.isCustomConcept);

  const customFurnitureCost = customItems.reduce((sum, f) => sum + f.estimatedPrice, 0);
  const catalogFurnitureCost = catalogItems.reduce((sum, f) => sum + f.estimatedPrice, 0);

  // Surface finishes cost derived from exact room dimensions
  const surfaceCosts = design.surfaces.map((s) => {
    // If flooring, always use current room model area; otherwise surface area
    const effectiveNetArea = s.surfaceType === 'flooring' ? roomModel.areaSqFt : s.approxAreaSqFt;
    const grossArea = Math.ceil(effectiveNetArea * 1.1); // 10% waste allowance
    const prod = s.currentSelection;
    let cost = 0;
    if (prod.priceUnit === 'sq.ft') {
      cost = Math.round(grossArea * prod.pricePerUnit);
    } else {
      const units = Math.ceil(grossArea / prod.coveragePerUnit);
      cost = Math.round(units * prod.pricePerUnit);
    }
    return {
      surfaceId: s.id,
      surfaceName: s.name,
      surfaceType: s.surfaceType,
      netArea: effectiveNetArea,
      grossArea,
      cost,
      product: prod,
    };
  });

  const totalSurfacesCost = surfaceCosts.reduce((sum, s) => sum + s.cost, 0);
  const deliveryAndInstallCost = 1450; // White-glove millwork delivery & installation

  const currentTotalCost = customFurnitureCost + catalogFurnitureCost + totalSurfacesCost + deliveryAndInstallCost;
  const originalEstimate = design.estimatedTotalBudget;
  const deltaFromEstimate = currentTotalCost - originalEstimate;

  return {
    customFurnitureCost,
    catalogFurnitureCost,
    totalFurnitureCost: customFurnitureCost + catalogFurnitureCost,
    surfaceCosts,
    totalSurfacesCost,
    deliveryAndInstallCost,
    currentTotalCost,
    originalEstimate,
    deltaFromEstimate,
    isOutOfDate: design.isOutOfDate || false,
    outOfDateReason: design.outOfDateReason,
  };
};
