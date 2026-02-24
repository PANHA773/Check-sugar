import "package:flutter/material.dart";
import "package:get/get.dart";

import "../../../app/routes/app_pages.dart";
import "../../../models/sugar_check_result.dart";
import "../../../services/api_service.dart";
import "../../../utils/sugar_utils.dart";

class ManualAddController extends GetxController {
  final ApiService _apiService = Get.find<ApiService>();

  final formKey = GlobalKey<FormState>();
  final foodController = TextEditingController();
  final sugarController = TextEditingController();
  final servingSizeController = TextEditingController(text: "100");
  final barcodeController = TextEditingController();
  final nutritionTextController = TextEditingController();
  final fromScanFallback = false.obs;
  final isExtracting = false.obs;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is Map) {
      final barcode = args["initialBarcode"]?.toString() ?? "";
      final fallback = args["fromScanFallback"] == true;
      barcodeController.text = barcode;
      fromScanFallback.value = fallback;
    }
  }

  @override
  void onClose() {
    foodController.dispose();
    sugarController.dispose();
    servingSizeController.dispose();
    barcodeController.dispose();
    nutritionTextController.dispose();
    super.onClose();
  }

  Future<void> extractSugarFromNutritionText() async {
    final text = nutritionTextController.text.trim();
    if (text.isEmpty) {
      Get.snackbar("error".tr, "ocr_text_required".tr);
      return;
    }

    isExtracting.value = true;
    try {
      final response = await _apiService.estimateSugarFromLabel(text);
      final extracted = response["extracted"];
      if (extracted is Map && extracted["sugarPer100g"] is num) {
        final value = (extracted["sugarPer100g"] as num).toDouble();
        sugarController.text = value.toStringAsFixed(1);
        Get.snackbar(
          "success".tr,
          "ocr_extract_success".trParams({"value": value.toStringAsFixed(1)}),
        );
      } else {
        Get.snackbar("error".tr, "ocr_extract_not_found".tr);
      }
    } on ApiException catch (error) {
      Get.snackbar("error".tr, error.message);
    } finally {
      isExtracting.value = false;
    }
  }

  void submit() {
    final form = formKey.currentState;
    if (form == null || !form.validate()) return;

    final sugarPer100g = double.parse(sugarController.text.trim());
    final servingSizeG = double.parse(servingSizeController.text.trim());
    final sugarPerServing = SugarUtils.gramsForServing(
      sugarPer100g,
      servingSizeG,
    );
    final barcode = barcodeController.text.trim();

    final result = SugarCheckResult(
      foodName: foodController.text.trim(),
      sugarPer100g: sugarPer100g,
      sugarGrams: sugarPerServing,
      spoonCount: SugarUtils.spoonsFromGrams(sugarPerServing),
      servingSizeG: servingSizeG,
      riskLevel: SugarUtils.riskLevelFromSugar(sugarPer100g),
      checkedAt: DateTime.now(),
      source: "manual",
      barcode: barcode.isEmpty ? null : barcode,
      confidence: "manual",
      lastUpdatedAt: DateTime.now(),
    );

    Get.offNamed(Routes.RESULT, arguments: result);
  }

  String? validateFood(String? value) {
    if (value == null || value.trim().isEmpty) {
      return "validation_food_required".tr;
    }
    return null;
  }

  String? validateSugar(String? value) {
    if (value == null || value.trim().isEmpty) {
      return "validation_sugar_required".tr;
    }
    final parsed = double.tryParse(value.trim());
    if (parsed == null || parsed < 0) {
      return "validation_sugar_invalid".tr;
    }
    return null;
  }

  String? validateServingSize(String? value) {
    if (value == null || value.trim().isEmpty) {
      return "validation_serving_required".tr;
    }
    final parsed = double.tryParse(value.trim());
    if (parsed == null || parsed <= 0) {
      return "validation_serving_invalid".tr;
    }
    return null;
  }
}
