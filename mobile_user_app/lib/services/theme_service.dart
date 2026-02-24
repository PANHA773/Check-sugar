import "package:flutter/material.dart";
import "package:get/get.dart";
import "package:get_storage/get_storage.dart";

class ThemeService extends GetxService {
  static const String _themeModeKey = "app_theme_mode";

  final GetStorage _storage = GetStorage();
  final themeMode = ThemeMode.system.obs;

  @override
  void onInit() {
    super.onInit();
    final raw = _storage.read(_themeModeKey)?.toString();
    switch (raw) {
      case "light":
        themeMode.value = ThemeMode.light;
        break;
      case "dark":
        themeMode.value = ThemeMode.dark;
        break;
      default:
        themeMode.value = ThemeMode.system;
    }
  }

  bool get isDark {
    if (themeMode.value == ThemeMode.dark) return true;
    if (themeMode.value == ThemeMode.light) return false;
    final brightness =
        WidgetsBinding.instance.platformDispatcher.platformBrightness;
    return brightness == Brightness.dark;
  }

  void toggleTheme() {
    setThemeMode(isDark ? ThemeMode.light : ThemeMode.dark);
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    themeMode.value = mode;
    await _storage.write(_themeModeKey, mode.name);
  }
}
