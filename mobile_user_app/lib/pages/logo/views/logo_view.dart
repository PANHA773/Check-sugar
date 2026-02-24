import "package:flutter/material.dart";

import "package:get/get.dart";

import "../controllers/logo_controller.dart";
import "../../../widgets/language_switcher.dart";
import "../../../widgets/theme_switcher.dart";

class LogoView extends GetView<LogoController> {
  const LogoView({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      body: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark
                ? const [Color(0xFF0F1720), Color(0xFF121A24)]
                : const [Color(0xFFE5F5ED), Color(0xFFF4F7F5)],
          ),
        ),
        child: Stack(
          children: [
            const Positioned(
              top: 8,
              right: 0,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [ThemeSwitcher(), LanguageSwitcher()],
              ),
            ),
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const CircleAvatar(
                  radius: 52,
                  backgroundColor: Color(0xFF138A5A),
                  child: Icon(
                    Icons.health_and_safety_outlined,
                    size: 56,
                    color: Colors.white,
                  ),
                ),
                SizedBox(height: 18),
                Text(
                  "app_title".tr,
                  style: TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.w700,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  "logo_subtitle".tr,
                  style: TextStyle(
                    color: isDark ? Colors.white70 : Colors.black54,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                const CircularProgressIndicator(),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
