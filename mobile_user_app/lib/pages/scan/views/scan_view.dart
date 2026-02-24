import "package:flutter/material.dart";
import "package:mobile_scanner/mobile_scanner.dart";

import "package:get/get.dart";

import "../controllers/scan_controller.dart";
import "../../../widgets/language_switcher.dart";
import "../../../widgets/theme_switcher.dart";

class ScanView extends StatefulWidget {
  const ScanView({super.key});

  @override
  State<ScanView> createState() => _ScanViewState();
}

class _ScanViewState extends State<ScanView> {
  final ScanController controller = Get.find<ScanController>();
  final MobileScannerController cameraController = MobileScannerController(
    detectionSpeed: DetectionSpeed.noDuplicates,
  );

  @override
  void dispose() {
    cameraController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("scan_barcode".tr),
        actions: const [ThemeSwitcher(), LanguageSwitcher()],
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: cameraController,
            onDetect: (capture) {
              final barcode = capture.barcodes.firstOrNull?.rawValue;
              controller.onDetectedBarcode(barcode);
            },
          ),
          Align(
            alignment: Alignment.topCenter,
            child: Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.55),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                "scan_point_camera".tr,
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
          Obx(
            () => controller.isLoading.value
                ? Container(
                    color: Colors.black45,
                    child: const Center(child: CircularProgressIndicator()),
                  )
                : const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }
}
