/**
 * Shared measurement and currency formatters with strict unit handling.
 * Carries remainder inches cleanly into feet (prevents values like 17' 12").
 */

export const mmToFeetInches = (mm: number): string => {
  if (!mm || isNaN(mm) || mm <= 0) return `0' 0"`;
  const totalInches = Math.round(mm / 25.4);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}' ${inches}"`;
};

export const formatMm = (mm: number): string => {
  if (!mm || isNaN(mm)) return '0 mm';
  return `${Math.round(mm).toLocaleString()} mm`;
};

export const formatCurrency = (amount: number): string => {
  if (isNaN(amount)) return '$0';
  return `$${Math.round(amount).toLocaleString()}`;
};

export const formatSqFt = (sqFt: number): string => {
  if (isNaN(sqFt)) return '0 sq ft';
  return `${Math.round(sqFt).toLocaleString()} sq ft`;
};
