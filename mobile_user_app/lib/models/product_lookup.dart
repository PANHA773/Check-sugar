class ProductLookup {
  ProductLookup({
    required this.id,
    required this.barcode,
    required this.nameKh,
    required this.nameEn,
    required this.brand,
    required this.sugarPer100g,
    required this.sugarPerServingG,
    required this.defaultServingSizeG,
    required this.sugarLevel,
    required this.confidence,
    this.updatedAt,
    this.lastVerifiedAt,
  });

  final String id;
  final String barcode;
  final String nameKh;
  final String nameEn;
  final String brand;
  final double sugarPer100g;
  final double sugarPerServingG;
  final double defaultServingSizeG;
  final String sugarLevel;
  final String confidence;
  final DateTime? updatedAt;
  final DateTime? lastVerifiedAt;

  String get displayName {
    if (nameKh.trim().isNotEmpty) return nameKh;
    if (nameEn.trim().isNotEmpty) return nameEn;
    return "Unknown product";
  }

  factory ProductLookup.fromJson(Map<String, dynamic> json) {
    return ProductLookup(
      id: json["_id"]?.toString() ?? "",
      barcode: json["barcode"]?.toString() ?? "",
      nameKh: json["nameKh"]?.toString() ?? "",
      nameEn: json["nameEn"]?.toString() ?? "",
      brand: json["brand"]?.toString() ?? "",
      sugarPer100g: (json["sugarPer100g"] as num?)?.toDouble() ?? 0,
      sugarPerServingG: (json["sugarPerServingG"] as num?)?.toDouble() ?? 0,
      defaultServingSizeG:
          (json["defaultServingSizeG"] as num?)?.toDouble() ?? 100,
      sugarLevel: json["sugarLevel"]?.toString() ?? "unknown",
      confidence: json["confidence"]?.toString() ?? "manual",
      updatedAt: DateTime.tryParse(json["updatedAt"]?.toString() ?? ""),
      lastVerifiedAt: DateTime.tryParse(
        json["lastVerifiedAt"]?.toString() ?? "",
      ),
    );
  }
}
