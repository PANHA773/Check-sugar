class SugarCheckResult {
  SugarCheckResult({
    required this.foodName,
    required this.sugarPer100g,
    required this.sugarGrams,
    required this.spoonCount,
    required this.servingSizeG,
    required this.riskLevel,
    required this.checkedAt,
    required this.source,
    this.barcode,
    this.confidence = "manual",
    this.lastUpdatedAt,
  });

  final String foodName;
  final double sugarPer100g;
  final double sugarGrams;
  final double spoonCount;
  final double servingSizeG;
  final String riskLevel;
  final DateTime checkedAt;
  final String source;
  final String? barcode;
  final String confidence;
  final DateTime? lastUpdatedAt;

  Map<String, dynamic> toJson() {
    return {
      "foodName": foodName,
      "sugarPer100g": sugarPer100g,
      "sugarGrams": sugarGrams,
      "spoonCount": spoonCount,
      "servingSizeG": servingSizeG,
      "riskLevel": riskLevel,
      "checkedAt": checkedAt.toIso8601String(),
      "source": source,
      "barcode": barcode,
      "confidence": confidence,
      "lastUpdatedAt": lastUpdatedAt?.toIso8601String(),
    };
  }

  factory SugarCheckResult.fromJson(Map<String, dynamic> json) {
    return SugarCheckResult(
      foodName: json["foodName"]?.toString() ?? "",
      sugarPer100g: (json["sugarPer100g"] as num?)?.toDouble() ?? 0,
      sugarGrams: (json["sugarGrams"] as num?)?.toDouble() ?? 0,
      spoonCount: (json["spoonCount"] as num?)?.toDouble() ?? 0,
      servingSizeG: (json["servingSizeG"] as num?)?.toDouble() ?? 100,
      riskLevel: json["riskLevel"]?.toString() ?? "unknown",
      checkedAt:
          DateTime.tryParse(json["checkedAt"]?.toString() ?? "") ??
          DateTime.now(),
      source: json["source"]?.toString() ?? "manual",
      barcode: json["barcode"]?.toString(),
      confidence: json["confidence"]?.toString() ?? "manual",
      lastUpdatedAt: DateTime.tryParse(json["lastUpdatedAt"]?.toString() ?? ""),
    );
  }
}
