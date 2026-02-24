import "package:flutter/material.dart";
import "package:flutter_test/flutter_test.dart";
import "package:get/get.dart";

import "package:mobile_user_app/app/translations/app_translations.dart";
import "package:mobile_user_app/pages/logo/views/logo_view.dart";

void main() {
  testWidgets("Logo page renders", (tester) async {
    await tester.pumpWidget(
      GetMaterialApp(
        translations: AppTranslations(),
        locale: const Locale("en", "US"),
        fallbackLocale: const Locale("en", "US"),
        home: const LogoView(),
      ),
    );
    expect(find.text("Sugar Check"), findsOneWidget);
  });
}
