import "package:flutter/material.dart";
import "package:get/get.dart";

import "../services/locale_service.dart";

class LanguageSwitcher extends StatelessWidget {
  const LanguageSwitcher({super.key});

  @override
  Widget build(BuildContext context) {
    final localeService = Get.isRegistered<LocaleService>()
        ? Get.find<LocaleService>()
        : null;
    final isKhmer =
        localeService?.isKhmer ?? (Get.locale?.languageCode == "km");

    return PopupMenuButton<String>(
      icon: const Icon(Icons.language),
      tooltip: "language".tr,
      onSelected: (value) {
        if (value == "km") {
          if (localeService != null) {
            localeService.switchToKhmer();
          } else {
            Get.updateLocale(const Locale("km", "KH"));
          }
        } else {
          if (localeService != null) {
            localeService.switchToEnglish();
          } else {
            Get.updateLocale(const Locale("en", "US"));
          }
        }
      },
      itemBuilder: (_) => [
        PopupMenuItem(
          value: "en",
          child: Row(
            children: [
              Icon(
                isKhmer ? Icons.radio_button_unchecked : Icons.check_circle,
                size: 18,
              ),
              const SizedBox(width: 8),
              Text("english".tr),
            ],
          ),
        ),
        PopupMenuItem(
          value: "km",
          child: Row(
            children: [
              Icon(
                isKhmer ? Icons.check_circle : Icons.radio_button_unchecked,
                size: 18,
              ),
              const SizedBox(width: 8),
              Text("khmer".tr),
            ],
          ),
        ),
      ],
    );
  }
}
