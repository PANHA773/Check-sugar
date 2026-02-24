import 'package:get/get.dart';

import '../../pages/history/bindings/history_binding.dart';
import '../../pages/history/views/history_view.dart';
import '../../pages/home/bindings/home_binding.dart';
import '../../pages/home/views/home_view.dart';
import '../../pages/login/bindings/login_binding.dart';
import '../../pages/login/views/login_view.dart';
import '../../pages/logo/bindings/logo_binding.dart';
import '../../pages/logo/views/logo_view.dart';
import '../../pages/manual_add/bindings/manual_add_binding.dart';
import '../../pages/manual_add/views/manual_add_view.dart';
import '../../pages/register/bindings/register_binding.dart';
import '../../pages/register/views/register_view.dart';
import '../../pages/result/bindings/result_binding.dart';
import '../../pages/result/views/result_view.dart';
import '../../pages/scan/bindings/scan_binding.dart';
import '../../pages/scan/views/scan_view.dart';

part 'app_routes.dart';

// ignore_for_file: constant_identifier_names

class AppPages {
  AppPages._();

  static const INITIAL = Routes.HOME;

  static final routes = [
    GetPage(
      name: _Paths.LOGO,
      page: () => const LogoView(),
      binding: LogoBinding(),
    ),
    GetPage(
      name: _Paths.REGISTER,
      page: () => const RegisterView(),
      binding: RegisterBinding(),
    ),
    GetPage(
      name: _Paths.LOGIN,
      page: () => const LoginView(),
      binding: LoginBinding(),
    ),
    GetPage(
      name: _Paths.HOME,
      page: () => const HomeView(),
      binding: HomeBinding(),
    ),
    GetPage(
      name: _Paths.SCAN,
      page: () => const ScanView(),
      binding: ScanBinding(),
    ),
    GetPage(
      name: _Paths.RESULT,
      page: () => const ResultView(),
      binding: ResultBinding(),
    ),
    GetPage(
      name: _Paths.MANUAL_ADD,
      page: () => const ManualAddView(),
      binding: ManualAddBinding(),
    ),
    GetPage(
      name: _Paths.HISTORY,
      page: () => const HistoryView(),
      binding: HistoryBinding(),
    ),
  ];
}
