import "package:flutter/material.dart";

import "package:get/get.dart";

import "../controllers/logo_controller.dart";
import "../../../widgets/language_switcher.dart";
import "../../../widgets/theme_switcher.dart";

class LogoView extends GetView<LogoController> {
  const LogoView({super.key});

  @override
  Widget build(BuildContext context) {
    // Force controller resolution so redirect logic always starts.
    controller;

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final titleColor = isDark ? Colors.white : const Color(0xFF0B1B2C);
    final subtitleColor = isDark ? Colors.white70 : const Color(0xFF4B5B70);
    final shellColor = isDark
        ? const Color(0xFF0E1727).withValues(alpha: 0.9)
        : Colors.white.withValues(alpha: 0.78);

    return Scaffold(
      body: DecoratedBox(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: isDark
                ? const [Color(0xFF070D18), Color(0xFF101A2B), Color(0xFF121E34)]
                : const [Color(0xFFEAF7F2), Color(0xFFF1F5FF), Color(0xFFF9FCFF)],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Stack(
              children: [
                Positioned(
                  top: 0,
                  right: 0,
                  child: Container(
                    decoration: BoxDecoration(
                      color: shellColor,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.12)
                            : const Color(0xFFC8D6E8).withValues(alpha: 0.7),
                      ),
                    ),
                    child: const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [ThemeSwitcher(), LanguageSwitcher()],
                      ),
                    ),
                  ),
                ),
                Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 430),
                    child: Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: shellColor,
                        borderRadius: BorderRadius.circular(30),
                        border: Border.all(
                          color: isDark
                              ? Colors.white.withValues(alpha: 0.12)
                              : const Color(0xFFD7E2F0).withValues(alpha: 0.85),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: (isDark ? const Color(0xFF0B1220) : const Color(0xFF6C7A92))
                                .withValues(alpha: 0.18),
                            blurRadius: 14,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 84,
                            height: 84,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(24),
                              gradient: const LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [Color(0xFF10B981), Color(0xFF14B8A6)],
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF10B981).withValues(alpha: 0.3),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.health_and_safety_rounded,
                              size: 44,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 20),
                          Text(
                            "app_title".tr,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.2,
                              color: titleColor,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            "logo_subtitle".tr,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              height: 1.4,
                              fontSize: 15,
                              color: subtitleColor,
                            ),
                          ),
                          const SizedBox(height: 24),
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.4,
                                  color: isDark
                                      ? const Color(0xFF5EEAD4)
                                      : const Color(0xFF0F9F73),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Text(
                                "loading".tr,
                                style: TextStyle(
                                  fontWeight: FontWeight.w600,
                                  color: isDark
                                      ? const Color(0xFFA5C4E5)
                                      : const Color(0xFF48627A),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
