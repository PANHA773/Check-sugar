import "package:flutter/material.dart";

import "package:get/get.dart";

import "../controllers/home_controller.dart";
import "../../../widgets/language_switcher.dart";
import "../../../widgets/theme_switcher.dart";

class HomeView extends GetView<HomeController> {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text("app_title".tr),
        actions: [
          const ThemeSwitcher(),
          const LanguageSwitcher(),
          IconButton(
            onPressed: controller.logout,
            icon: const Icon(Icons.logout_rounded),
            tooltip: "logout".tr,
          ),
          const SizedBox(width: 6),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark
                ? const [Color(0xFF0F1720), Color(0xFF121A24)]
                : const [Color(0xFFE6F7EF), Color(0xFFF6F7FB)],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(18, 12, 18, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _FadeSlide(
                  delayMs: 0,
                  child: _HeroCard(
                    title: "home_easy_check".tr,
                    subtitle: "home_description".tr,
                  ),
                ),
                const SizedBox(height: 14),
                _FadeSlide(
                  delayMs: 80,
                  child: _DailyLimitCard(
                    ageGroup: controller.ageGroupLabel,
                    age: controller.age,
                    sugarLimitG: controller.dailySugarLimitG,
                    sugarLimitSpoons: controller.dailyLimitSpoonsText,
                  ),
                ),
                const SizedBox(height: 18),
                _FadeSlide(
                  delayMs: 150,
                  child: _ActionCard(
                    title: "scan_food".tr,
                    subtitle: "scan_barcode".tr,
                    icon: Icons.qr_code_scanner_rounded,
                    accent: const Color(0xFF158F62),
                    onTap: controller.goScan,
                  ),
                ),
                const SizedBox(height: 12),
                _FadeSlide(
                  delayMs: 230,
                  child: _ActionCard(
                    title: "manual_add_food".tr,
                    subtitle: "manual_add".tr,
                    icon: Icons.edit_note_rounded,
                    accent: const Color(0xFF3C7BEA),
                    onTap: controller.goManualAdd,
                  ),
                ),
                const SizedBox(height: 12),
                _FadeSlide(
                  delayMs: 300,
                  child: _ActionCard(
                    title: "view_history".tr,
                    subtitle: "history".tr,
                    icon: Icons.history_rounded,
                    accent: const Color(0xFF9656D9),
                    onTap: controller.goHistory,
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

class _HeroCard extends StatelessWidget {
  const _HeroCard({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF0D8C5A), Color(0xFF24AF79)],
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0D8C5A).withValues(alpha: 0.28),
            blurRadius: 22,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white.withValues(alpha: 0.2),
            ),
            child: const Icon(
              Icons.health_and_safety_rounded,
              color: Colors.white,
              size: 30,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  subtitle,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.white.withValues(alpha: 0.92),
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DailyLimitCard extends StatelessWidget {
  const _DailyLimitCard({
    required this.ageGroup,
    required this.age,
    required this.sugarLimitG,
    required this.sugarLimitSpoons,
  });

  final String ageGroup;
  final int? age;
  final int sugarLimitG;
  final String sugarLimitSpoons;

  @override
  Widget build(BuildContext context) {
    final surface = Theme.of(context).colorScheme.surface;
    final border = Theme.of(context).dividerColor.withValues(
      alpha: Theme.of(context).brightness == Brightness.dark ? 0.45 : 0.25,
    );
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Color(0xFFE8F4FF),
            ),
            child: const Icon(
              Icons.monitor_heart_rounded,
              color: Color(0xFF2E7BE8),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "daily_limit_title".tr,
                  style: Theme.of(
                    context,
                  ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 4),
                Text("age_group_value".trParams({"value": ageGroup})),
                if (age != null)
                  Text("age_value".trParams({"value": age.toString()})),
                const SizedBox(height: 2),
                Text(
                  "daily_limit_value".trParams({
                    "grams": sugarLimitG.toString(),
                    "spoons": sugarLimitSpoons,
                  }),
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  const _ActionCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.accent,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final Color accent;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surface = Theme.of(context).colorScheme.surface;
    final border = Theme.of(context).dividerColor.withValues(
      alpha: Theme.of(context).brightness == Brightness.dark ? 0.45 : 0.25,
    );
    return Material(
      color: surface,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Ink(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: border),
          ),
          child: Row(
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: accent.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: accent),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      subtitle,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Theme.of(context).brightness == Brightness.dark
                            ? Colors.white70
                            : Colors.black54,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(Icons.chevron_right_rounded, color: Colors.grey.shade500),
            ],
          ),
        ),
      ),
    );
  }
}

class _FadeSlide extends StatelessWidget {
  const _FadeSlide({required this.child, required this.delayMs});

  final Widget child;
  final int delayMs;

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 420 + delayMs),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) {
        final dy = (1 - value) * 10;
        return Opacity(
          opacity: value,
          child: Transform.translate(offset: Offset(0, dy), child: child),
        );
      },
      child: child,
    );
  }
}
