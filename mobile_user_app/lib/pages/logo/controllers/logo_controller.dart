import "package:get/get.dart";

import "../../../app/routes/app_pages.dart";
import "../../../services/auth_service.dart";

class LogoController extends GetxController {
  final AuthService _authService = Get.find<AuthService>();

  @override
  void onInit() {
    super.onInit();
    Future<void>.delayed(const Duration(seconds: 2), _goNext);
  }

  void _goNext() {
    if (_authService.isLoggedIn) {
      Get.offAllNamed(Routes.HOME);
      return;
    }
    Get.offAllNamed(Routes.LOGIN);
  }
}
