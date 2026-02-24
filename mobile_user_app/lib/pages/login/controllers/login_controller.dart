import "package:flutter/material.dart";
import "package:get/get.dart";

import "../../../app/routes/app_pages.dart";
import "../../../services/api_service.dart";
import "../../../services/auth_service.dart";

class LoginController extends GetxController {
  final AuthService _authService = Get.find<AuthService>();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final isSubmitting = false.obs;

  @override
  void onClose() {
    emailController.dispose();
    passwordController.dispose();
    super.onClose();
  }

  Future<void> login() async {
    FocusManager.instance.primaryFocus?.unfocus();

    final email = emailController.text.trim();
    final password = passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      Get.snackbar(
        "validation_title".tr,
        "validation_email_password_required".tr,
      );
      return;
    }

    isSubmitting.value = true;
    try {
      await _authService.login(email: email, password: password);
      await Future<void>.delayed(const Duration(milliseconds: 16));
      Get.offAllNamed(Routes.HOME);
    } on ApiException catch (error) {
      Get.snackbar("login_failed".tr, error.message);
    } catch (_) {
      Get.snackbar("login_failed".tr, "unexpected_error".tr);
    } finally {
      isSubmitting.value = false;
    }
  }

  void goToRegister() {
    Get.toNamed(Routes.REGISTER);
  }
}
