import "dart:async";

import "package:get/get.dart";

import "../../../app/routes/app_pages.dart";

class LogoController extends GetxController {
  Timer? _redirectTimer;

  @override
  void onReady() {
    super.onReady();
    _redirectTimer = Timer(const Duration(milliseconds: 800), _goNext);
  }

  @override
  void onClose() {
    _redirectTimer?.cancel();
    super.onClose();
  }

  void _goNext() {
    if (isClosed) return;
    if (Get.currentRoute != Routes.LOGO) return;
    Get.offAllNamed(Routes.HOME);
  }
}
