import "package:flutter/material.dart";

import "package:get/get.dart";

import "../controllers/history_controller.dart";
import "../../../widgets/language_switcher.dart";
import "../../../widgets/theme_switcher.dart";

class HistoryView extends GetView<HistoryController> {
  const HistoryView({super.key});

  Color _levelColor(String level) {
    switch (level) {
      case "low":
        return const Color(0xFF2E7D32);
      case "medium":
        return const Color(0xFFEF8F00);
      case "high":
        return const Color(0xFFC62828);
      default:
        return Colors.blueGrey;
    }
  }

  String _sourceLabel(String source) {
    return source == "scan" ? "source_scan".tr : "source_manual".tr;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text("history".tr),
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
                : const [Color(0xFFE9F3FF), Color(0xFFF8FAFC)],
          ),
        ),
        child: SafeArea(
          child: Obx(() {
            if (controller.isLoading.value) {
              return const _LoadingState();
            }

            if (controller.items.isEmpty) {
              return _EmptyState(text: "no_history".tr);
            }

            return RefreshIndicator(
              onRefresh: controller.reload,
              child: ListView.separated(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(16, 10, 16, 22),
                itemCount: controller.items.length + 2,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  if (index == 0) {
                    return _HistoryHeroCard(
                      count: controller.items.length,
                      todayCount: controller.todayCount,
                    );
                  }

                  if (index == 1) {
                    return _DailySummaryCard(
                      progress: controller.todayProgress,
                      percentText: controller.todayPercentText,
                      consumedG: controller.todayConsumedG,
                      limitG: controller.dailyLimitG.toDouble(),
                      remainingG: controller.todayRemainingG,
                      overLimitG: controller.todayOverLimitG,
                      isOverLimit: controller.isTodayOverLimit,
                    );
                  }

                  final item = controller.items[index - 2];
                  final levelColor = _levelColor(item.riskLevel);

                  return _HistoryItemCard(
                    title: item.foodName,
                    sugarText: "sugar_value".trParams({
                      "value": item.sugarGrams.toStringAsFixed(1),
                    }),
                    spoonsText: "spoons_value".trParams({
                      "value": item.spoonCount.toStringAsFixed(1),
                    }),
                    servingText: "serving_size_value".trParams({
                      "value": item.servingSizeG.toStringAsFixed(0),
                    }),
                    confidenceText: "confidence_value".trParams({
                      "value": controller.confidenceLabel(item.confidence),
                    }),
                    timeText: "time_value".trParams({
                      "value": controller.formatDate(item.checkedAt),
                    }),
                    sourceText: _sourceLabel(item.source),
                    riskText: controller.riskLabel(item.riskLevel),
                    riskColor: levelColor,
                  );
                },
              ),
            );
          }),
        ),
      ),
      floatingActionButton: Obx(
        () => controller.items.isEmpty
            ? const SizedBox.shrink()
            : FloatingActionButton.extended(
                onPressed: controller.clearHistory,
                tooltip: "clear_history".tr,
                icon: const Icon(Icons.delete_outline_rounded),
                label: Text("clear_history".tr),
              ),
      ),
    );
  }
}

class _HistoryHeroCard extends StatelessWidget {
  const _HistoryHeroCard({required this.count, required this.todayCount});

  final int count;
  final int todayCount;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF306FDF), Color(0xFF4AA0FC)],
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF306FDF).withValues(alpha: 0.24),
            blurRadius: 22,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white.withValues(alpha: 0.2),
            ),
            child: const Icon(Icons.history_rounded, color: Colors.white),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "history".tr,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  "history_entries_value".trParams({
                    "total": count.toString(),
                    "today": todayCount.toString(),
                  }),
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.white.withValues(alpha: 0.94),
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

class _DailySummaryCard extends StatelessWidget {
  const _DailySummaryCard({
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
            "history_today_summary".tr,
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
              width: 126,
              height: 126,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  SizedBox(
                    width: 126,
                    height: 126,
                    child: CircularProgressIndicator(
                      value: progress,
                      strokeWidth: 11,
                      backgroundColor: const Color(0xFFEAF0F8),
                      color: accent,
                    ),
                  ),
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        percentText,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
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
          const SizedBox(height: 12),
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
          _MetricTile(
            label: isOverLimit ? "over_limit_label".tr : "remaining_label".tr,
            value:
                "${(isOverLimit ? overLimitG : remainingG).toStringAsFixed(1)} g",
            valueColor: isOverLimit
                ? const Color(0xFFC62828)
                : const Color(0xFF2E7D32),
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

class _HistoryItemCard extends StatelessWidget {
  const _HistoryItemCard({
    required this.title,
    required this.sugarText,
    required this.spoonsText,
    required this.servingText,
    required this.confidenceText,
    required this.timeText,
    required this.sourceText,
    required this.riskText,
    required this.riskColor,
  });

  final String title;
  final String sugarText;
  final String spoonsText;
  final String servingText;
  final String confidenceText;
  final String timeText;
  final String sourceText;
  final String riskText;
  final Color riskColor;

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
            blurRadius: 14,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Chip(
                visualDensity: VisualDensity.compact,
                label: Text(riskText),
                labelStyle: TextStyle(
                  color: riskColor,
                  fontWeight: FontWeight.w600,
                ),
                backgroundColor: riskColor.withValues(alpha: 0.08),
                side: BorderSide(color: riskColor.withValues(alpha: 0.28)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(sugarText),
          Text(spoonsText),
          Text(servingText),
          Text(confidenceText),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(
                Icons.access_time_rounded,
                size: 16,
                color: Colors.black45,
              ),
              const SizedBox(width: 5),
              Expanded(
                child: Text(
                  timeText,
                  style: Theme.of(
                    context,
                  ).textTheme.bodySmall?.copyWith(color: Colors.black54),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0F4FA),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  sourceText,
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF516274),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _LoadingState extends StatelessWidget {
  const _LoadingState();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 10),
          Text("loading".tr, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    final surface = Theme.of(context).colorScheme.surface;
    final border = Theme.of(context).dividerColor.withValues(
      alpha: Theme.of(context).brightness == Brightness.dark ? 0.45 : 0.25,
    );
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: surface,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: border),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.history_toggle_off_rounded,
                size: 44,
                color: Color(0xFF69809A),
              ),
              const SizedBox(height: 10),
              Text(text, textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }
}
