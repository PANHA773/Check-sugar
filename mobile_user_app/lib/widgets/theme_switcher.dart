import "package:flutter/material.dart";
import "package:get/get.dart";

import "../services/theme_service.dart";

class ThemeSwitcher extends StatelessWidget {
  const ThemeSwitcher({super.key});

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<ThemeService>()) {
      return const SizedBox.shrink();
    }

    final themeService = Get.find<ThemeService>();

    return Obx(
      () => IconButton(
        onPressed: themeService.toggleTheme,
        tooltip: themeService.isDark ? "light_mode".tr : "dark_mode".tr,
        icon: Icon(
          themeService.isDark
              ? Icons.light_mode_rounded
              : Icons.dark_mode_rounded,
        ),
      ),
    );
  }
}
