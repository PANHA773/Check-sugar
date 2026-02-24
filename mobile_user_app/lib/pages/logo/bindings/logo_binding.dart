import 'package:get/get.dart';

import '../controllers/logo_controller.dart';

class LogoBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<LogoController>(LogoController());
  }
}
