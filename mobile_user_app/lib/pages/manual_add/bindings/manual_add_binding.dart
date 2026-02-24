import 'package:get/get.dart';

import '../controllers/manual_add_controller.dart';

class ManualAddBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ManualAddController>(() => ManualAddController());
  }
}
