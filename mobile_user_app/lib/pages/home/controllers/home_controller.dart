import "package:get/get.dart";

import "../../../app/routes/app_pages.dart";
import "../../../services/auth_service.dart";

class HomeController extends GetxController {
  final AuthService _authService = Get.find<AuthService>();

  Map<String, dynamic>? get _user => _authService.currentUser;

  String get ageGroup {
    final value = _user?["ageGroup"]?.toString() ?? "adult";
    if (value == "children" || value == "elderly") return value;
    return "adult";
  }

  int get dailySugarLimitG {
    final raw = _user?["dailySugarLimitG"];
    if (raw is num) return raw.round();
    return 25;
  }

  int? get age {
    final raw = _user?["age"];
    if (raw is num) return raw.round();
    return null;
  }

  String get ageGroupLabel {
    switch (ageGroup) {
      case "children":
        return "age_group_children".tr;
      case "elderly":
        return "age_group_elderly".tr;
      default:
        return "age_group_adult".tr;
    }
  }

  String get dailyLimitSpoonsText => (dailySugarLimitG / 4).toStringAsFixed(1);

  Future<void> logout() async {
    await _authService.logout();
    Get.offAllNamed(Routes.LOGIN);
  }

  void goScan() {
    Get.toNamed(Routes.SCAN);
  }

  void goManualAdd() {
    Get.toNamed(Routes.MANUAL_ADD);
  }

  void goHistory() {
    Get.toNamed(Routes.HISTORY);
  }
}
