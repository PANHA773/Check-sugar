export function getSugarLevel(sugarPer100g) {
  const sugar = Number(sugarPer100g);
  if (Number.isNaN(sugar) || sugar < 0) {
    return "unknown";
  }
  if (sugar <= 5) return "low";
  if (sugar <= 22.5) return "medium";
  return "high";
}

