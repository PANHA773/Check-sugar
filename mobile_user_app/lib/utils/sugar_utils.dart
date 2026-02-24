class SugarUtils {
  const SugarUtils._();

  static double spoonsFromGrams(double grams) {
    return grams / 4.0;
  }

  static double gramsForServing(double sugarPer100g, double servingSizeG) {
    return (sugarPer100g * servingSizeG) / 100.0;
  }

  static String riskLevelFromSugar(double gramsPer100g) {
    if (gramsPer100g <= 5) return "low";
    if (gramsPer100g <= 22.5) return "medium";
    return "high";
  }

  static String riskLabel(String level) {
    switch (level) {
      case "low":
        return "Low sugar";
      case "medium":
        return "Medium sugar";
      case "high":
        return "High sugar";
      default:
        return "Unknown";
    }
  }
}
