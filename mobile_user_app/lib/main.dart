import "package:flutter/material.dart";
import "package:get/get.dart";
import "package:get_storage/get_storage.dart";
import "package:intl/date_symbol_data_local.dart";

import "app/routes/app_pages.dart";
import "app/translations/app_translations.dart";
import "pages/logo/views/logo_view.dart";
import "services/api_service.dart";
import "services/auth_service.dart";
import "services/history_service.dart";
import "services/locale_service.dart";
import "services/theme_service.dart";

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await GetStorage.init();
  await initializeDateFormatting("en_US");
  await initializeDateFormatting("km_KH");

  Get.put(ApiService(), permanent: true);
  Get.put(HistoryService(), permanent: true);
  Get.put(AuthService(), permanent: true);
  Get.put(LocaleService(), permanent: true);
  Get.put(ThemeService(), permanent: true);

  runApp(const SugarCheckApp());
}

class SugarCheckApp extends StatelessWidget {
  const SugarCheckApp({super.key});

  @override
  Widget build(BuildContext context) {
    final localeService = Get.find<LocaleService>();
    final themeService = Get.find<ThemeService>();
    return Obx(
      () => GetMaterialApp(
        title: "app_title".tr,
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF138A5A),
            brightness: Brightness.light,
          ),
          scaffoldBackgroundColor: const Color(0xFFF4F7F5),
          useMaterial3: true,
        ),
        darkTheme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF138A5A),
            brightness: Brightness.dark,
          ),
          scaffoldBackgroundColor: const Color(0xFF0F1419),
          useMaterial3: true,
        ),
        themeMode: themeService.themeMode.value,
        translations: AppTranslations(),
        locale: localeService.currentLocale,
        fallbackLocale: const Locale("en", "US"),
        initialRoute: AppPages.INITIAL,
        getPages: AppPages.routes,
        unknownRoute: GetPage(name: Routes.LOGO, page: () => const LogoView()),
      ),
    );
  }
}
