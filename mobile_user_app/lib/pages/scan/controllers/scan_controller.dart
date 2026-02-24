import "package:flutter/services.dart";
import "package:get/get.dart";
import "package:vibration/vibration.dart";

import "../../../app/routes/app_pages.dart";
import "../../../models/sugar_check_result.dart";
import "../../../services/api_service.dart";
import "../../../utils/sugar_utils.dart";

class ScanController extends GetxController {
  final ApiService _apiService = Get.find<ApiService>();

  final isLoading = false.obs;
  bool _isHandlingScan = false;

  Future<void> onDetectedBarcode(String? rawBarcode) async {
    final barcode = rawBarcode?.trim() ?? "";
    if (barcode.isEmpty || _isHandlingScan) return;

    _isHandlingScan = true;
    isLoading.value = true;
    await _feedbackOnScan();

    try {
      final product = await _apiService.getProductByBarcode(barcode);
      final servingSize = product.defaultServingSizeG <= 0
          ? 100.0
          : product.defaultServingSizeG;
      final sugarGrams = SugarUtils.gramsForServing(
        product.sugarPer100g,
        servingSize,
      );
      final result = SugarCheckResult(
        foodName: product.displayName,
        sugarPer100g: product.sugarPer100g,
        sugarGrams: sugarGrams,
        spoonCount: SugarUtils.spoonsFromGrams(sugarGrams),
        servingSizeG: servingSize,
        riskLevel: SugarUtils.riskLevelFromSugar(product.sugarPer100g),
        checkedAt: DateTime.now(),
        source: "scan",
        barcode: barcode,
        confidence: product.confidence,
        lastUpdatedAt: product.updatedAt,
      );
      Get.offNamed(Routes.RESULT, arguments: result);
    } on ProductNotFoundException {
      Get.offNamed(
        Routes.MANUAL_ADD,
        arguments: {"initialBarcode": barcode, "fromScanFallback": true},
      );
    } catch (_) {
      isLoading.value = false;
      _isHandlingScan = false;
      Get.snackbar("error".tr, "scan_fetch_failed".tr);
    }
  }

  Future<void> _feedbackOnScan() async {
    HapticFeedback.mediumImpact();
    SystemSound.play(SystemSoundType.click);
    final hasVibrator = await Vibration.hasVibrator();
    if (hasVibrator) {
      await Vibration.vibrate(duration: 100);
    }
  }
}
