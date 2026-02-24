import "package:flutter/material.dart";
import "package:get/get.dart";
import "package:intl/intl.dart";

import "../../../app/routes/app_pages.dart";
import "../../../models/sugar_check_result.dart";
import "../../../services/auth_service.dart";
import "../../../services/history_service.dart";

class ResultController extends GetxController {
  final HistoryService _historyService = Get.find<HistoryService>();
  final AuthService _authService = Get.find<AuthService>();
  late final SugarCheckResult result;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is SugarCheckResult) {
      result = args;
    } else if (args is Map<String, dynamic>) {
      result = SugarCheckResult.fromJson(args);
    } else {
      result = SugarCheckResult(
        foodName: "unknown_food".tr,
        sugarPer100g: 0,
        sugarGrams: 0,
        spoonCount: 0,
        servingSizeG: 100,
        riskLevel: "unknown",
        checkedAt: DateTime.now(),
        source: "manual",
      );
    }
    _historyService.addEntry(result);
  }

  Color riskColor(String level) {
    switch (level) {
      case "low":
        return const Color(0xFF2E7D32);
      case "medium":
        return const Color(0xFFF9A825);
      case "high":
        return const Color(0xFFC62828);
      default:
        return Colors.blueGrey;
    }
  }

  String get riskLabel {
    switch (result.riskLevel) {
      case "low":
        return "risk_low".tr;
      case "medium":
        return "risk_medium".tr;
      case "high":
        return "risk_high".tr;
      default:
        return "risk_unknown".tr;
    }
  }

  String get confidenceLabel {
    switch (result.confidence) {
      case "verified":
        return "confidence_verified".tr;
      case "community":
        return "confidence_community".tr;
      default:
        return "confidence_manual".tr;
    }
  }

  String get sourceLabel {
    return result.source == "scan" ? "source_scan".tr : "source_manual".tr;
  }

  int get dailyLimitG {
    final raw = _authService.currentUser?["dailySugarLimitG"];
    if (raw is num && raw > 0) return raw.round();
    return 25;
  }

  double get consumedG => result.sugarGrams;

  double get remainingG {
    final remain = dailyLimitG - consumedG;
    return remain > 0 ? remain : 0;
  }

  double get overLimitG {
    final over = consumedG - dailyLimitG;
    return over > 0 ? over : 0;
  }

  double get consumedPercent {
    if (dailyLimitG <= 0) return 0;
    return consumedG / dailyLimitG;
  }

  double get chartProgress {
    final value = consumedPercent;
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
  }

  String get percentText => "${(consumedPercent * 100).toStringAsFixed(0)}%";

  bool get isOverLimit => consumedG > dailyLimitG;

  String formatDateTime(DateTime value) {
    final localeCode = Get.locale?.toString() ?? "en_US";
    try {
      return DateFormat("dd MMM yyyy, HH:mm", localeCode).format(value);
    } catch (_) {
      return DateFormat("dd MMM yyyy, HH:mm").format(value);
    }
  }

  void goHistory() {
    Get.toNamed(Routes.HISTORY);
  }

  void backHome() {
    Get.offAllNamed(Routes.HOME);
  }
}
