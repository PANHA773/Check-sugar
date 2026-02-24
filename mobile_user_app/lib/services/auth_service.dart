import "package:get/get.dart";
import "package:get_storage/get_storage.dart";

import "api_service.dart";

class AuthService extends GetxService {
  static const String _currentUserKey = "auth_current_user";

  final GetStorage _storage = GetStorage();
  late final ApiService _apiService;

  bool get isLoggedIn => currentUser != null;

  Map<String, dynamic>? get currentUser {
    final dynamic value = _storage.read(_currentUserKey);
    if (value is Map<String, dynamic>) return value;
    if (value is Map) {
      return value.map((key, data) => MapEntry(key.toString(), data));
    }
    return null;
  }

  @override
  void onInit() {
    super.onInit();
    _apiService = Get.find<ApiService>();
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password,
    int? age,
    int? birthYear,
  }) async {
    try {
      await _apiService.register(
        name: name,
        email: email,
        password: password,
        age: age,
        birthYear: birthYear,
      );
      return true;
    } on ApiException {
      rethrow;
    }
  }

  Future<bool> login({required String email, required String password}) async {
    try {
      final response = await _apiService.login(
        email: email,
        password: password,
      );
      final dynamic user = response["user"];
      if (user is! Map) {
        throw ApiException("Invalid login response");
      }

      final normalizedUser = user.map(
        (key, value) => MapEntry(key.toString(), value),
      );
      await _storage.write(_currentUserKey, normalizedUser);
      return true;
    } on ApiException {
      rethrow;
    }
  }

  Future<void> logout() async {
    await _storage.remove(_currentUserKey);
  }
}
