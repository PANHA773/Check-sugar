import "package:flutter/material.dart";

import "package:get/get.dart";

import "../controllers/manual_add_controller.dart";
import "../../../widgets/language_switcher.dart";
import "../../../widgets/theme_switcher.dart";

class ManualAddView extends GetView<ManualAddController> {
  const ManualAddView({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text("manual_add".tr),
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
                : const [Color(0xFFEAF6FF), Color(0xFFF7F9FC)],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(18, 10, 18, 24),
            child: Form(
              key: controller.formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _Reveal(
                    delayMs: 0,
                    child: _HeaderCard(
                      title: "manual_add".tr,
                      subtitle: "per_serving_or_100g".tr,
                    ),
                  ),
                  const SizedBox(height: 14),
                  Obx(
                    () => controller.fromScanFallback.value
                        ? _Reveal(
                            delayMs: 60,
                            child: _FallbackBanner(text: "manual_fallback".tr),
                          )
                        : const SizedBox.shrink(),
                  ),
                  Obx(
                    () => controller.fromScanFallback.value
                        ? const SizedBox(height: 14)
                        : const SizedBox.shrink(),
                  ),
                  _Reveal(
                    delayMs: 120,
                    child: _FormCard(
                      child: Column(
                        children: [
                          _ModernTextField(
                            controller: controller.foodController,
                            label: "food_name".tr,
                            icon: Icons.fastfood_rounded,
                            validator: controller.validateFood,
                          ),
                          const SizedBox(height: 12),
                          _ModernTextField(
                            controller: controller.sugarController,
                            label: "sugar_per_100g".tr,
                            icon: Icons.cake_rounded,
                            keyboardType: const TextInputType.numberWithOptions(
                              decimal: true,
                            ),
                            validator: controller.validateSugar,
                          ),
                          const SizedBox(height: 12),
                          _ModernTextField(
                            controller: controller.servingSizeController,
                            label: "serving_size_g".tr,
                            helperText: "serving_size_help".tr,
                            icon: Icons.straighten_rounded,
                            keyboardType: const TextInputType.numberWithOptions(
                              decimal: true,
                            ),
                            validator: controller.validateServingSize,
                          ),
                          const SizedBox(height: 12),
                          _ModernTextField(
                            controller: controller.barcodeController,
                            label: "barcode_optional".tr,
                            icon: Icons.qr_code_rounded,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  _Reveal(
                    delayMs: 200,
                    child: _FormCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(
                            "ocr_beta_text".tr,
                            style: Theme.of(context).textTheme.titleSmall
                                ?.copyWith(fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            "ocr_beta_help".tr,
                            style: Theme.of(context).textTheme.bodySmall
                                ?.copyWith(color: Colors.black54),
                          ),
                          const SizedBox(height: 10),
                          _ModernTextField(
                            controller: controller.nutritionTextController,
                            label: "ocr_beta_text".tr,
                            icon: Icons.document_scanner_rounded,
                            minLines: 3,
                            maxLines: 5,
                          ),
                          const SizedBox(height: 10),
                          Obx(
                            () => OutlinedButton.icon(
                              onPressed: controller.isExtracting.value
                                  ? null
                                  : controller.extractSugarFromNutritionText,
                              icon: controller.isExtracting.value
                                  ? const SizedBox(
                                      width: 16,
                                      height: 16,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                      ),
                                    )
                                  : const Icon(Icons.auto_awesome_rounded),
                              label: Text("ocr_extract".tr),
                              style: OutlinedButton.styleFrom(
                                minimumSize: const Size.fromHeight(50),
                                side: const BorderSide(
                                  color: Color(0xFFBFD3EE),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  _Reveal(
                    delayMs: 260,
                    child: FilledButton.icon(
                      onPressed: controller.submit,
                      icon: const Icon(Icons.save_outlined),
                      label: Text("save_calculate".tr),
                      style: FilledButton.styleFrom(
                        minimumSize: const Size.fromHeight(56),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _HeaderCard extends StatelessWidget {
  const _HeaderCard({required this.title, required this.subtitle});

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
          colors: [Color(0xFF2E74D8), Color(0xFF4B9AF7)],
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2E74D8).withValues(alpha: 0.24),
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
            child: const Icon(Icons.edit_note_rounded, color: Colors.white),
          ),
          const SizedBox(width: 12),
          Expanded(
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
                const SizedBox(height: 6),
                Text(
                  subtitle,
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

class _FallbackBanner extends StatelessWidget {
  const _FallbackBanner({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF3A2E1C) : const Color(0xFFFFF6E8),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDark ? const Color(0xFF6E5231) : const Color(0xFFF3D5A4),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.info_outline_rounded, color: Color(0xFFA86B00)),
          const SizedBox(width: 8),
          Expanded(child: Text(text)),
        ],
      ),
    );
  }
}

class _FormCard extends StatelessWidget {
  const _FormCard({required this.child});

  final Widget child;

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
      child: child,
    );
  }
}

class _ModernTextField extends StatelessWidget {
  const _ModernTextField({
    required this.controller,
    required this.label,
    required this.icon,
    this.helperText,
    this.keyboardType,
    this.validator,
    this.minLines,
    this.maxLines,
  });

  final TextEditingController controller;
  final String label;
  final IconData icon;
  final String? helperText;
  final TextInputType? keyboardType;
  final String? Function(String?)? validator;
  final int? minLines;
  final int? maxLines;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      validator: validator,
      minLines: minLines,
      maxLines: maxLines,
      decoration: InputDecoration(
        labelText: label,
        helperText: helperText,
        prefixIcon: Icon(icon),
        filled: true,
        fillColor: isDark ? const Color(0xFF1B2531) : const Color(0xFFF7F9FC),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(
            color: isDark ? const Color(0xFF314356) : const Color(0xFFD4DEEC),
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(
            color: isDark ? const Color(0xFF314356) : const Color(0xFFD4DEEC),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFF5B93E7), width: 1.4),
        ),
      ),
    );
  }
}

class _Reveal extends StatelessWidget {
  const _Reveal({required this.child, required this.delayMs});

  final Widget child;
  final int delayMs;

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 420 + delayMs),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) {
        final offsetY = (1 - value) * 10;
        return Opacity(
          opacity: value,
          child: Transform.translate(offset: Offset(0, offsetY), child: child),
        );
      },
      child: child,
    );
  }
}
