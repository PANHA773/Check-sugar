import "package:flutter/material.dart";
import "package:get/get.dart";
import "package:get_storage/get_storage.dart";

class LocaleService extends GetxService {
  static const String _localeKey = "app_locale";
  final GetStorage _storage = GetStorage();

  Locale get currentLocale {
    final code = _storage.read<String>(_localeKey);
    if (code == "km") return const Locale("km", "KH");
    return const Locale("en", "US");
  }

  bool get isKhmer => currentLocale.languageCode == "km";

  Future<void> setLocale(Locale locale) async {
    await _storage.write(_localeKey, locale.languageCode);
    Get.updateLocale(locale);
  }

  Future<void> switchToEnglish() async {
    await setLocale(const Locale("en", "US"));
  }

  Future<void> switchToKhmer() async {
    await setLocale(const Locale("km", "KH"));
  }
}
