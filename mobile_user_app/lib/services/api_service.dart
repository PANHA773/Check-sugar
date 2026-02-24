import "package:dio/dio.dart";

import "../config/api_config.dart";
import "../models/product_lookup.dart";

class ApiException implements Exception {
  ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class ProductNotFoundException extends ApiException {
  ProductNotFoundException(this.barcode)
    : super("Product not found for barcode: $barcode", statusCode: 404);

  final String barcode;
}

class ApiService {
  ApiService({Dio? dio, String? baseUrl})
    : _dio =
          dio ??
          Dio(
            BaseOptions(
              baseUrl: baseUrl ?? ApiConfig.baseUrl,
              connectTimeout: const Duration(seconds: 10),
              receiveTimeout: const Duration(seconds: 10),
              sendTimeout: const Duration(seconds: 10),
              headers: {"Content-Type": "application/json"},
            ),
          );

  final Dio _dio;

  void setAuthToken(String? token) {
    if (token == null || token.trim().isEmpty) {
      _dio.options.headers.remove("Authorization");
      return;
    }
    _dio.options.headers["Authorization"] = "Bearer $token";
  }

  Future<Map<String, dynamic>> healthCheck() async {
    try {
      final response = await _dio.get("/health");
      return _asMap(response.data);
    } on DioException catch (error) {
      throw _mapDioError(error);
    }
  }

  Future<Map<String, dynamic>> getSugarScore(double sugarPer100g) async {
    try {
      final response = await _dio.get("/sugar-score/$sugarPer100g");
      return _asMap(response.data);
    } on DioException catch (error) {
      throw _mapDioError(error);
    }
  }

  Future<ProductLookup> getProductByBarcode(String barcode) async {
    final encodedBarcode = Uri.encodeComponent(barcode.trim());
    try {
      final response = await _dio.get("/products/barcode/$encodedBarcode");
      return ProductLookup.fromJson(_asMap(response.data));
    } on DioException catch (error) {
      if (error.response?.statusCode == 404) {
        throw ProductNotFoundException(barcode);
      }
      throw _mapDioError(error);
    }
  }

  Future<Map<String, dynamic>> estimateSugarFromLabel(String labelText) async {
    try {
      final response = await _dio.post(
        "/products/ocr/estimate",
        data: {"labelText": labelText},
      );
      return _asMap(response.data);
    } on DioException catch (error) {
      throw _mapDioError(error);
    }
  }

  Future<Map<String, dynamic>> getProducts({
    Map<String, dynamic>? params,
  }) async {
    try {
      final response = await _dio.get("/products", queryParameters: params);
      return _asMap(response.data);
    } on DioException catch (error) {
      throw _mapDioError(error);
    }
  }

  Future<Map<String, dynamic>> getProductStats() async {
    try {
      final response = await _dio.get("/products/stats/summary");
      return _asMap(response.data);
    } on DioException catch (error) {
      throw _mapDioError(error);
    }
  }

  Future<Map<String, dynamic>> createProduct(
    Map<String, dynamic> payload,
  ) async {
    try {
      final response = await _dio.post("/products", data: payload);
      return _asMap(response.data);
    } on DioException catch (error) {
      throw _mapDioError(error);
    }
  }

  Future<Map<String, dynamic>> updateProduct(
    String id,
    Map<String, dynamic> payload,
  ) async {
    try {
      final response = await _dio.put("/products/$id", data: payload);
      return _asMap(response.data);
    } on DioException catch (error) {
      throw _mapDioError(error);
    }
  }

  Future<void> deleteProduct(String id) async {
    try {
      await _dio.delete("/products/$id");
    } on DioException catch (error) {
      throw _mapDioError(error);
    }
  }

  Future<Map<String, dynamic>> getUsers({Map<String, dynamic>? params}) async {
    try {
      final response = await _dio.get("/users", queryParameters: params);
      return _asMap(response.data);
    } on DioException catch (error) {
      throw _mapDioError(error);
    }
  }

  Future<Map<String, dynamic>> getUserStats() async {
    try {
      final response = await _dio.get("/users/stats/summary");
      return _asMap(response.data);
    } on DioException catch (error) {
      throw _mapDioError(error);
    }
  }

  Future<Map<String, dynamic>> createUser(Map<String, dynamic> payload) async {
    try {
      final response = await _dio.post("/users", data: payload);
      return _asMap(response.data);
    } on DioException catch (error) {
      throw _mapDioError(error);
    }
  }

  Future<Map<String, dynamic>> updateUser(
    String id,
    Map<String, dynamic> payload,
  ) async {
    try {
      final response = await _dio.put("/users/$id", data: payload);
      return _asMap(response.data);
    } on DioException catch (error) {
      throw _mapDioError(error);
    }
  }

  Future<void> deleteUser(String id) async {
    try {
      await _dio.delete("/users/$id");
    } on DioException catch (error) {
      throw _mapDioError(error);
    }
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    int? age,
    int? birthYear,
  }) async {
    try {
      final Map<String, dynamic> payload = {
        "name": name,
        "email": email,
        "password": password,
      };
      if (age != null) {
        payload["age"] = age;
      }
      if (birthYear != null) {
        payload["birthYear"] = birthYear;
      }

      final response = await _dio.post("/auth/register", data: payload);
      return _asMap(response.data);
    } on DioException catch (error) {
      throw _mapDioError(error);
    }
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        "/auth/login",
        data: {"email": email, "password": password},
      );
      return _asMap(response.data);
    } on DioException catch (error) {
      throw _mapDioError(error);
    }
  }

  ApiException _mapDioError(DioException error) {
    final statusCode = error.response?.statusCode;
    final data = error.response?.data;
    if (data is Map && data["message"] is String) {
      return ApiException(data["message"] as String, statusCode: statusCode);
    }
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.sendTimeout ||
        error.type == DioExceptionType.connectionError) {
      return ApiException("Network error, please check your connection");
    }
    return ApiException("Request failed", statusCode: statusCode);
  }

  Map<String, dynamic> _asMap(dynamic value) {
    if (value is Map<String, dynamic>) return value;
    if (value is Map) {
      return value.map((key, v) => MapEntry(key.toString(), v));
    }
    throw ApiException("Invalid response format");
  }
}
