class AgeSugarProfile {
  const AgeSugarProfile({
    required this.ageGroup,
    required this.dailySugarLimitG,
  });

  final String ageGroup;
  final int dailySugarLimitG;

  double get dailySugarLimitSpoons => dailySugarLimitG / 4.0;

  static int currentYear() => DateTime.now().year;

  static int? parseAge({String? ageText, String? birthYearText}) {
    final rawAge = ageText?.trim() ?? "";
    if (rawAge.isNotEmpty) {
      final value = int.tryParse(rawAge);
      if (value != null && value >= 0 && value <= 120) {
        return value;
      }
      return null;
    }

    final rawBirthYear = birthYearText?.trim() ?? "";
    if (rawBirthYear.isEmpty) return null;

    final birthYear = int.tryParse(rawBirthYear);
    final year = currentYear();
    if (birthYear == null || birthYear < 1900 || birthYear > year) {
      return null;
    }

    final computed = year - birthYear;
    if (computed < 0 || computed > 120) return null;
    return computed;
  }

  static AgeSugarProfile fromAge(int age) {
    if (age <= 12) {
      return const AgeSugarProfile(ageGroup: "children", dailySugarLimitG: 15);
    }
    if (age <= 59) {
      return const AgeSugarProfile(ageGroup: "adult", dailySugarLimitG: 25);
    }
    return const AgeSugarProfile(ageGroup: "elderly", dailySugarLimitG: 20);
  }
}
