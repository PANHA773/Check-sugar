import "package:flutter/material.dart";
import "package:get/get.dart";

import "../../../app/routes/app_pages.dart";
import "../../../services/api_service.dart";
import "../../../services/auth_service.dart";
import "../../../utils/age_sugar_profile.dart";

class RegisterController extends GetxController {
  final AuthService _authService = Get.find<AuthService>();
  final nameController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final confirmPasswordController = TextEditingController();
  final ageController = TextEditingController();
  final birthYearController = TextEditingController();
  final isSubmitting = false.obs;
  final selectedAge = RxnInt();
  final ageGroup = "adult".obs;
  final dailySugarLimitG = 25.obs;

  @override
  void onInit() {
    super.onInit();
    ageController.addListener(_syncAgePreview);
    birthYearController.addListener(_syncAgePreview);
    _syncAgePreview();
  }

  @override
  void onClose() {
    nameController.dispose();
    emailController.dispose();
    passwordController.dispose();
    confirmPasswordController.dispose();
    ageController.dispose();
    birthYearController.dispose();
    super.onClose();
  }

  void _syncAgePreview() {
    final age = AgeSugarProfile.parseAge(
      ageText: ageController.text,
      birthYearText: birthYearController.text,
    );
    selectedAge.value = age;
    if (age == null) {
      ageGroup.value = "adult";
      dailySugarLimitG.value = 25;
      return;
    }

    final profile = AgeSugarProfile.fromAge(age);
    ageGroup.value = profile.ageGroup;
    dailySugarLimitG.value = profile.dailySugarLimitG;
  }

  String groupLabel(String value) {
    switch (value) {
      case "children":
        return "age_group_children".tr;
      case "elderly":
        return "age_group_elderly".tr;
      default:
        return "age_group_adult".tr;
    }
  }

  Future<void> register() async {
    final name = nameController.text.trim();
    final email = emailController.text.trim();
    final password = passwordController.text;
    final confirmPassword = confirmPasswordController.text;
    final ageText = ageController.text.trim();
    final birthYearText = birthYearController.text.trim();

    if (name.isEmpty || email.isEmpty || password.isEmpty) {
      Get.snackbar("validation_title".tr, "validation_register_required".tr);
      return;
    }
    if (password != confirmPassword) {
      Get.snackbar("validation_title".tr, "validation_password_mismatch".tr);
      return;
    }

    final hasAge = ageText.isNotEmpty;
    final hasBirthYear = birthYearText.isNotEmpty;
    if (!hasAge && !hasBirthYear) {
      Get.snackbar(
        "validation_title".tr,
        "validation_age_or_birth_required".tr,
      );
      return;
    }

    int? age;
    int? birthYear;
    if (hasAge) {
      age = int.tryParse(ageText);
      if (age == null || age < 0 || age > 120) {
        Get.snackbar("validation_title".tr, "validation_age_invalid".tr);
        return;
      }
    }
    if (hasBirthYear) {
      birthYear = int.tryParse(birthYearText);
      final currentYear = AgeSugarProfile.currentYear();
      if (birthYear == null || birthYear < 1900 || birthYear > currentYear) {
        Get.snackbar("validation_title".tr, "validation_birth_year_invalid".tr);
        return;
      }
    }

    isSubmitting.value = true;
    try {
      await _authService.register(
        name: name,
        email: email,
        password: password,
        age: age,
        birthYear: birthYear,
      );
      Get.snackbar("success".tr, "account_created_login".tr);
      Get.offAllNamed(Routes.LOGIN);
    } on ApiException catch (error) {
      Get.snackbar("register_failed".tr, error.message);
    } catch (_) {
      Get.snackbar("register_failed".tr, "unexpected_error".tr);
    } finally {
      isSubmitting.value = false;
    }
  }

  void backToLogin() {
    Get.back();
  }
}
