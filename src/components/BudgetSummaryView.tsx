import React, { useState } from 'react';
import { Project, DesignAlternative, FurnitureObject, SurfaceFinish } from '../types';
import { 
  DollarSign, 
  Download, 
  Printer, 
  FileText, 
  Hammer, 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  Clock
} from 'lucide-react';

interface BudgetSummaryViewProps {
  project: Project;
  activeDesign: DesignAlternative;
  onOpenDrawingPackage: (furniture: FurnitureObject) => void;
}

export const BudgetSummaryView: React.FC<BudgetSummaryViewProps> = ({
  project,
  activeDesign,
  onOpenDrawingPackage,
}) => {
  const [rfqSent, setRfqSent] = useState(false);

  // Categorize costs
  const customFurniture = activeDesign.furnitureObjects.filter((f) => f.isCustomConcept);
  const catalogFurniture = activeDesign.furnitureObjects.filter((f) => !f.isCustomConcept);
  
  const customFurnitureCost = customFurniture.reduce((sum, f) => sum + f.estimatedPrice, 0);
  const catalogFurnitureCost = catalogFurniture.reduce((sum, f) => sum + f.estimatedPrice, 0);

  // Surface finishes cost (with 10% waste allowance)
  const surfaceCosts = activeDesign.surfaces.map((s) => {
    const grossArea = Math.ceil(s.approxAreaSqFt * 1.1);
    const prod = s.currentSelection;
    let cost = 0;
    if (prod.priceUnit === 'sq.ft') {
      cost = Math.round(grossArea * prod.pricePerUnit);
    } else {
      const units = Math.ceil(grossArea / prod.coveragePerUnit);
      cost = Math.round(units * prod.pricePerUnit);
    }
    return {
      surface: s,
      grossArea,
      cost,
    };
  });

  const totalSurfacesCost = surfaceCosts.reduce((sum, s) => sum + s.cost, 0);
  const deliveryAndInstallCost = 1450; // White-glove millwork delivery & surface prep
  const totalCommittedBudget = customFurnitureCost + catalogFurnitureCost + totalSurfacesCost + deliveryAndInstallCost;
  const initialBudget = project.preferences.overallBudget;
  const budgetDelta = totalCommittedBudget - initialBudget;

  const handlePrint = () => {
    window.print();
  };

  const handleSendRfq = () => {
    setRfqSent(true);
    setTimeout(() => setRfqSent(false), 4000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 print:p-0 print:space-y-4">
      {/* Header */}
      <div className="border-b border-[#E8E6DF] pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4 no-print">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#8C887B]">
            Project Accounting & Procurement
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1C] mt-1 font-normal">
            Project BOM & Procurement Package
          </h1>
          <p className="text-sm text-[#5E5C56] mt-1.5 max-w-2xl">
            Unified purchase specification combining bespoke shop millwork, retail catalog orders, and architectural surface takeoffs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-[#FAF9F6] hover:bg-[#EFECE6] text-[#1E1E1C] border border-[#DDD7C8] text-xs font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Procurement PDF</span>
          </button>

          <button
            onClick={handleSendRfq}
            className="px-4 py-2 bg-[#2C2A29] hover:bg-[#1E1E1C] text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Millwork RFQ Package</span>
          </button>
        </div>
      </div>

      {rfqSent && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 animate-fade-in no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Fabrication RFQ Package compiled with dimensioned CAD drawings and BOM. Ready to transmit to local woodworking guild.
          </span>
        </div>
      )}

      {/* High-Level Budget Tracker Bar */}
      <div className="bg-white rounded-lg border border-[#E8E6DF] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F0EDE6]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1C]">
              Budget Allocation Overview
            </span>
            <span className="text-xs text-[#706E66] ml-2">
              Based on "{activeDesign.title}"
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-[#8C887B]">Target Budget: </span>
              <span className="font-mono font-medium text-[#1E1E1C]">${initialBudget.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[#8C887B]">Committed: </span>
              <span className="font-mono font-bold text-[#1E1E1C]">${totalCommittedBudget.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[#8C887B]">Variance: </span>
              <span className={`font-mono font-medium ${budgetDelta > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {budgetDelta > 0 ? `+$${budgetDelta.toLocaleString()}` : `-$${Math.abs(budgetDelta).toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>

        {/* Proportional Cost Breakdown Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#EAE6DD]">
            <div
              style={{ width: `${(customFurnitureCost / totalCommittedBudget) * 100}%` }}
              className="bg-[#5C4033] h-full"
              title={`Custom Millwork: $${customFurnitureCost.toLocaleString()}`}
            ></div>
            <div
              style={{ width: `${(catalogFurnitureCost / totalCommittedBudget) * 100}%` }}
              className="bg-[#8C7058] h-full"
              title={`Catalog Furniture: $${catalogFurnitureCost.toLocaleString()}`}
            ></div>
            <div
              style={{ width: `${(totalSurfacesCost / totalCommittedBudget) * 100}%` }}
              className="bg-[#A89886] h-full"
              title={`Surfaces & Finishes: $${totalSurfacesCost.toLocaleString()}`}
            ></div>
            <div
              style={{ width: `${(deliveryAndInstallCost / totalCommittedBudget) * 100}%` }}
              className="bg-[#D1C7BA] h-full"
              title={`Delivery & Setup: $${deliveryAndInstallCost.toLocaleString()}`}
            ></div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-[#706E66] pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#5C4033]"></span>
              <span>Custom Millwork (${customFurnitureCost.toLocaleString()})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#8C7058]"></span>
              <span>Catalog Sourced (${catalogFurnitureCost.toLocaleString()})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#A89886]"></span>
              <span>Surfaces & Floors (${totalSurfacesCost.toLocaleString()})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#D1C7BA]"></span>
              <span>Logistics & Installation (${deliveryAndInstallCost.toLocaleString()})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Custom Commissioned Furniture */}
      <div className="bg-white rounded-lg border border-[#E8E6DF] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#F0EDE6]">
          <div className="flex items-center gap-2">
            <Hammer className="w-4 h-4 text-[#5C4033]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1C]">
              1. Custom Solid Wood Millwork (To Be Commissioned)
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold text-[#1E1E1C]">
            Subtotal: ${customFurnitureCost.toLocaleString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[#706E66] border-b border-[#E8E6DF] bg-[#FAF9F6]">
              <tr>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3">Lumber & Finish Spec</th>
                <th className="py-2.5 px-3">Dimensions</th>
                <th className="py-2.5 px-3">CAD Package Status</th>
                <th className="py-2.5 px-3">Lead Time</th>
                <th className="py-2.5 px-3 text-right">Shop Estimate</th>
                <th className="py-2.5 px-3 text-right no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB]">
              {customFurniture.map((f) => (
                <tr key={f.id} className="hover:bg-[#FAF9F6]">
                  <td className="py-3 px-3 font-medium text-[#1E1E1C]">
                    <div>{f.name}</div>
                    <span className="text-[10px] text-[#8C887B]">Millwork Workshop Spec</span>
                  </td>
                  <td className="py-3 px-3 text-[#5E5C56] max-w-xs">{f.materialSummary}</td>
                  <td className="py-3 px-3 font-mono text-[#1E1E1C]">{f.dimensionsSummary.split('(')[0].trim()}</td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                      {f.drawingPackage?.revision || 'Rev B'} Complete
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#706E66]">{f.leadTimeWeeks} Weeks</td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-[#1E1E1C]">
                    ${f.estimatedPrice.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right no-print">
                    <button
                      onClick={() => onOpenDrawingPackage(f)}
                      className="text-xs text-[#5C4033] hover:text-[#1E1E1C] font-medium underline cursor-pointer"
                    >
                      View CAD
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Catalog Products */}
      <div className="bg-white rounded-lg border border-[#E8E6DF] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#F0EDE6]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#5C4033]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1C]">
              2. Sourced Catalog Furniture & Fixtures
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold text-[#1E1E1C]">
            Subtotal: ${catalogFurnitureCost.toLocaleString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[#706E66] border-b border-[#E8E6DF] bg-[#FAF9F6]">
              <tr>
                <th className="py-2.5 px-3">Item Name</th>
                <th className="py-2.5 px-3">Supplier / Brand</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">Dimensions</th>
                <th className="py-2.5 px-3">Availability</th>
                <th className="py-2.5 px-3 text-right">Retail Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB]">
              {catalogFurniture.map((f) => (
                <tr key={f.id} className="hover:bg-[#FAF9F6]">
                  <td className="py-3 px-3 font-medium text-[#1E1E1C]">{f.name}</td>
                  <td className="py-3 px-3 text-[#5E5C56]">{f.supplierName}</td>
                  <td className="py-3 px-3 font-mono text-[#706E66]">{f.productSku}</td>
                  <td className="py-3 px-3 font-mono text-[#1E1E1C]">{f.dimensionsSummary}</td>
                  <td className="py-3 px-3 text-[#706E66]">{f.leadTimeWeeks} Weeks</td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-[#1E1E1C]">
                    ${f.estimatedPrice.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Surface Materials Takeoff */}
      <div className="bg-white rounded-lg border border-[#E8E6DF] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#F0EDE6]">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#5C4033]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1C]">
              3. Architectural Surfaces & Finishes (Floors & Walls)
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold text-[#1E1E1C]">
            Subtotal: ${totalSurfacesCost.toLocaleString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[#706E66] border-b border-[#E8E6DF] bg-[#FAF9F6]">
              <tr>
                <th className="py-2.5 px-3">Surface Application</th>
                <th className="py-2.5 px-3">Selected Product & Manufacturer</th>
                <th className="py-2.5 px-3 font-mono">Net Area</th>
                <th className="py-2.5 px-3 font-mono">Gross (+10% Waste)</th>
                <th className="py-2.5 px-3">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Total Surface Material</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB]">
              {surfaceCosts.map(({ surface, grossArea, cost }) => (
                <tr key={surface.id} className="hover:bg-[#FAF9F6]">
                  <td className="py-3 px-3 font-medium text-[#1E1E1C]">{surface.name}</td>
                  <td className="py-3 px-3 text-[#5E5C56]">
                    <div>{surface.currentSelection.name}</div>
                    <span className="text-[10px] text-[#8C887B]">
                      {surface.currentSelection.manufacturer} · SKU {surface.currentSelection.sku}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">{surface.approxAreaSqFt} sq ft</td>
                  <td className="py-3 px-3 font-mono font-medium text-[#1E1E1C]">{grossArea} sq ft</td>
                  <td className="py-3 px-3 font-mono text-[#706E66]">
                    ${surface.currentSelection.pricePerUnit.toFixed(2)} / {surface.currentSelection.priceUnit}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-[#1E1E1C]">
                    ${cost.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Project Summary Card */}
      <div className="bg-[#FAF8F5] rounded-lg border-2 border-[#2C2A29] p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-xs uppercase tracking-wider text-[#8C887B] font-semibold">
            All-Inclusive Procurement Total
          </span>
          <div className="font-serif text-3xl text-[#1E1E1C]">
            ${totalCommittedBudget.toLocaleString()} USD
          </div>
          <p className="text-xs text-[#5E5C56]">
            Includes custom fabrication, catalog hardware, surface materials (+10% cut allowance), and white-glove assembly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSendRfq}
            className="px-5 py-3 bg-[#2C2A29] hover:bg-[#1E1E1C] text-white text-xs font-medium rounded shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Millwork RFQ Package</span>
          </button>
        </div>
      </div>
    </div>
  );
};
