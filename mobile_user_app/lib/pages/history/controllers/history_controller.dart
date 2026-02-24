import "package:get/get.dart";
import "package:intl/intl.dart";

import "../../../models/sugar_check_result.dart";
import "../../../services/auth_service.dart";
import "../../../services/history_service.dart";

class HistoryController extends GetxController {
  final HistoryService _historyService = Get.find<HistoryService>();
  final AuthService _authService = Get.find<AuthService>();
  final isLoading = false.obs;
  final items = <SugarCheckResult>[].obs;

  @override
  void onInit() {
    super.onInit();
    reload();
  }

  Future<void> reload() async {
    isLoading.value = true;
    items.assignAll(await _historyService.getHistory());
    isLoading.value = false;
  }

  Future<void> clearHistory() async {
    await _historyService.clearHistory();
    await reload();
  }

  int get dailyLimitG {
    final raw = _authService.currentUser?["dailySugarLimitG"];
    if (raw is num && raw > 0) return raw.round();
    return 25;
  }

  List<SugarCheckResult> get todayItems {
    final now = DateTime.now();
    return items.where((item) => _isSameDay(item.checkedAt, now)).toList();
  }

  int get todayCount => todayItems.length;

  double get todayConsumedG {
    return todayItems.fold(0.0, (sum, item) => sum + item.sugarGrams);
  }

  double get todayProgress {
    if (dailyLimitG <= 0) return 0;
    final value = todayConsumedG / dailyLimitG;
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
  }

  double get todayPercentValue {
    if (dailyLimitG <= 0) return 0;
    return todayConsumedG / dailyLimitG;
  }

  String get todayPercentText =>
      "${(todayPercentValue * 100).toStringAsFixed(0)}%";

  bool get isTodayOverLimit => todayConsumedG > dailyLimitG;

  double get todayRemainingG {
    final value = dailyLimitG - todayConsumedG;
    return value > 0 ? value : 0;
  }

  double get todayOverLimitG {
    final value = todayConsumedG - dailyLimitG;
    return value > 0 ? value : 0;
  }

  String riskLabel(String level) {
    switch (level) {
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

  String confidenceLabel(String confidence) {
    switch (confidence) {
      case "verified":
        return "confidence_verified".tr;
      case "community":
        return "confidence_community".tr;
      default:
        return "confidence_manual".tr;
    }
  }

  String formatDate(DateTime dateTime) {
    final localeCode = Get.locale?.toString() ?? "en_US";
    try {
      return DateFormat("dd MMM yyyy, HH:mm", localeCode).format(dateTime);
    } catch (_) {
      return DateFormat("dd MMM yyyy, HH:mm").format(dateTime);
    }
  }

  bool _isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }
}
