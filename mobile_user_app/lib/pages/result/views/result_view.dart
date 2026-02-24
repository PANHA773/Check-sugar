import "package:flutter/material.dart";

import "package:get/get.dart";

import "../../../widgets/language_switcher.dart";
import "../../../widgets/theme_switcher.dart";
import "../controllers/result_controller.dart";

class ResultView extends GetView<ResultController> {
  const ResultView({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final result = controller.result;
    final riskColor = controller.riskColor(result.riskLevel);

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text("result".tr),
        actions: const [
          ThemeSwitcher(),
          LanguageSwitcher(),
          SizedBox(width: 8),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark
                ? const [Color(0xFF0F1720), Color(0xFF121A24)]
                : const [Color(0xFFEAF5FF), Color(0xFFF8FAFC)],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(18, 10, 18, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _TopCard(
                  title: result.foodName,
                  riskLabel: controller.riskLabel,
                  confidenceLabel: controller.confidenceLabel,
                  sourceLabel: controller.sourceLabel,
                  riskColor: riskColor,
                ),
                const SizedBox(height: 14),
                _DiagramCard(
                  progress: controller.chartProgress,
                  percentText: controller.percentText,
                  consumedG: controller.consumedG,
                  limitG: controller.dailyLimitG.toDouble(),
                  remainingG: controller.remainingG,
                  overLimitG: controller.overLimitG,
                  isOverLimit: controller.isOverLimit,
                ),
                const SizedBox(height: 14),
                _DetailsCard(
                  sugarPerServingG: result.sugarGrams,
                  spoonCount: result.spoonCount,
                  sugarPer100g: result.sugarPer100g,
                  servingSizeG: result.servingSizeG,
                  barcode: result.barcode,
                  lastUpdatedAt: result.lastUpdatedAt == null
                      ? null
                      : controller.formatDateTime(result.lastUpdatedAt!),
                ),
                const SizedBox(height: 18),
                FilledButton.icon(
                  onPressed: controller.goHistory,
                  icon: const Icon(Icons.history_rounded),
                  label: Text("view_history".tr),
                  style: FilledButton.styleFrom(
                    minimumSize: const Size.fromHeight(54),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                OutlinedButton.icon(
                  onPressed: controller.backHome,
                  icon: const Icon(Icons.home_rounded),
                  label: Text("back_home".tr),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size.fromHeight(52),
                    side: const BorderSide(color: Color(0xFFC6D4E8)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
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

class _TopCard extends StatelessWidget {
  const _TopCard({
    required this.title,
    required this.riskLabel,
    required this.confidenceLabel,
    required this.sourceLabel,
    required this.riskColor,
  });

  final String title;
  final String riskLabel;
  final String confidenceLabel;
  final String sourceLabel;
  final Color riskColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF2F72DE), Color(0xFF53A6FC)],
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2F72DE).withValues(alpha: 0.22),
            blurRadius: 22,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _Tag(
                text: riskLabel,
                icon: Icons.warning_amber_rounded,
                iconColor: riskColor,
              ),
              _Tag(text: confidenceLabel, icon: Icons.verified_user_outlined),
              _Tag(text: sourceLabel, icon: Icons.info_outline),
            ],
          ),
        ],
      ),
    );
  }
}

class _DiagramCard extends StatelessWidget {
  const _DiagramCard({
    required this.progress,
    required this.percentText,
    required this.consumedG,
    required this.limitG,
    required this.remainingG,
    required this.overLimitG,
    required this.isOverLimit,
  });

  final double progress;
  final String percentText;
  final double consumedG;
  final double limitG;
  final double remainingG;
  final double overLimitG;
  final bool isOverLimit;

  @override
  Widget build(BuildContext context) {
    final surface = Theme.of(context).colorScheme.surface;
    final border = Theme.of(context).dividerColor.withValues(
      alpha: Theme.of(context).brightness == Brightness.dark ? 0.45 : 0.25,
    );
    final accent = isOverLimit
        ? const Color(0xFFC62828)
        : const Color(0xFF0E8A5A);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 14,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            "sugar_diagram_title".tr,
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 2),
          Text(
            "sugar_diagram_subtitle".tr,
            style: Theme.of(
              context,
            ).textTheme.bodySmall?.copyWith(color: Colors.black54),
          ),
          const SizedBox(height: 16),
          Center(
            child: SizedBox(
              width: 140,
              height: 140,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  SizedBox(
                    width: 140,
                    height: 140,
                    child: CircularProgressIndicator(
                      value: progress,
                      strokeWidth: 12,
                      backgroundColor: const Color(0xFFEAF0F8),
                      color: accent,
                    ),
                  ),
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        percentText,
                        style: Theme.of(context).textTheme.headlineSmall
                            ?.copyWith(fontWeight: FontWeight.w800),
                      ),
                      Text(
                        "of_daily_limit".tr,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: _MetricTile(
                  label: "consumed_label".tr,
                  value: "${consumedG.toStringAsFixed(1)} g",
                  valueColor: const Color(0xFF1F4A82),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _MetricTile(
                  label: "daily_limit_short".tr,
                  value: "${limitG.toStringAsFixed(0)} g",
                  valueColor: const Color(0xFF0E8A5A),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: _MetricTile(
                  label: isOverLimit
                      ? "over_limit_label".tr
                      : "remaining_label".tr,
                  value:
                      "${(isOverLimit ? overLimitG : remainingG).toStringAsFixed(1)} g",
                  valueColor: isOverLimit
                      ? const Color(0xFFC62828)
                      : const Color(0xFF2E7D32),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MetricTile extends StatelessWidget {
  const _MetricTile({
    required this.label,
    required this.value,
    required this.valueColor,
  });

  final String label;
  final String value;
  final Color valueColor;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1B2531) : const Color(0xFFF5F8FC),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: Theme.of(
              context,
            ).textTheme.labelSmall?.copyWith(color: Colors.black54),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
              color: valueColor,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailsCard extends StatelessWidget {
  const _DetailsCard({
    required this.sugarPerServingG,
    required this.spoonCount,
    required this.sugarPer100g,
    required this.servingSizeG,
    required this.barcode,
    required this.lastUpdatedAt,
  });

  final double sugarPerServingG;
  final double spoonCount;
  final double sugarPer100g;
  final double servingSizeG;
  final String? barcode;
  final String? lastUpdatedAt;

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
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "result_details".tr,
            style: Theme.of(
              context,
            ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 8),
          Text(
            "sugar_value".trParams({
              "value": sugarPerServingG.toStringAsFixed(1),
            }),
          ),
          Text(
            "spoons_value".trParams({"value": spoonCount.toStringAsFixed(1)}),
          ),
          Text(
            "sugar_per_100g_value".trParams({
              "value": sugarPer100g.toStringAsFixed(1),
            }),
          ),
          Text(
            "serving_size_value".trParams({
              "value": servingSizeG.toStringAsFixed(0),
            }),
          ),
          if (barcode != null && barcode!.isNotEmpty)
            Text("barcode_value".trParams({"value": barcode!})),
          if (lastUpdatedAt != null)
            Text("last_updated_value".trParams({"value": lastUpdatedAt!})),
        ],
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  const _Tag({required this.text, required this.icon, this.iconColor});

  final String text;
  final IconData icon;
  final Color? iconColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.18),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: iconColor ?? Colors.white),
          const SizedBox(width: 6),
          Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
