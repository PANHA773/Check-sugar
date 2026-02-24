import "dart:convert";

import "package:shared_preferences/shared_preferences.dart";

import "../models/sugar_check_result.dart";

class HistoryService {
  static const _storageKey = "sugar_check_history";
  static const _maxEntries = 300;

  Future<List<SugarCheckResult>> getHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_storageKey);
    if (raw == null || raw.isEmpty) return [];

    final dynamic decoded = jsonDecode(raw);
    if (decoded is! List) return [];

    return decoded
        .whereType<Map>()
        .map(
          (item) => SugarCheckResult.fromJson(Map<String, dynamic>.from(item)),
        )
        .toList();
  }

  Future<void> addEntry(SugarCheckResult entry) async {
    final history = await getHistory();
    history.insert(0, entry);
    if (history.length > _maxEntries) {
      history.removeRange(_maxEntries, history.length);
    }

    final payload = history.map((item) => item.toJson()).toList();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_storageKey, jsonEncode(payload));
  }

  Future<void> clearHistory() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_storageKey);
  }
}
