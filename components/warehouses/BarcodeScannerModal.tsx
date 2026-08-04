"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Barcode, Camera, CheckCircle2, AlertCircle, RefreshCw, Volume2 } from "lucide-react";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (code: string, type: "SKU" | "BIN" | "TRANSFER") => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanResult,
}) => {
  const [manualCode, setManualCode] = useState("");
  const [scannedHistory, setScannedHistory] = useState<{ code: string; type: string; time: string }[]>([]);
  const [activeScanning, setActiveScanning] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Play audio beep on scan
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Audio fallback
    }
  };

  const handleScanSubmit = (codeToProcess?: string) => {
    const code = (codeToProcess || manualCode).trim().toUpperCase();
    if (!code) return;

    let type: "SKU" | "BIN" | "TRANSFER" = "SKU";
    if (code.startsWith("REC-") || code.startsWith("PICK-") || code.startsWith("TRF-") || code.startsWith("PACK-")) {
      type = "TRANSFER";
    } else if (code.includes("-R") || code.includes("-S") || code.includes("-B")) {
      type = "BIN";
    }

    playBeep();

    setFeedback({ type: "success", text: `Scanned ${type}: ${code}` });
    setScannedHistory((prev) => [
      { code, type, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 4),
    ]);

    onScanResult(code, type);
    setManualCode("");

    setTimeout(() => {
      setFeedback(null);
    }, 3000);
  };

  // Keyboard shortcut support (Ctrl+B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Warehouse Barcode Scanner" size="md">
      <div className="space-y-5">
        {/* Camera Scanner Simulation Viewport */}
        <div className="relative bg-slate-950 rounded-2xl p-6 text-center text-white border border-slate-800 shadow-inner overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-indigo-500/10 pointer-events-none" />

          {/* Scanning Reticle Frame */}
          <div className="relative w-full h-44 border-2 border-dashed border-indigo-500/60 rounded-xl flex flex-col items-center justify-center space-y-2 bg-slate-900/60">
            {activeScanning ? (
              <>
                <div className="w-full h-0.5 bg-indigo-500 shadow-[0_0_12px_#6366f1] animate-bounce" />
                <Camera className="w-8 h-8 text-indigo-400 animate-pulse mt-4" />
                <span className="text-xs font-mono text-indigo-300">Scanning for Barcode / QR...</span>
                <span className="text-[10px] text-slate-400">Position SKU or Bin Code tag in frame</span>
              </>
            ) : (
              <div className="text-slate-400 text-xs">Camera paused</div>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> Audio Beep Enabled
            </span>
            <button
              onClick={() => setActiveScanning(!activeScanning)}
              className="text-indigo-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> {activeScanning ? "Pause Scanner" : "Resume Scanner"}
            </button>
          </div>
        </div>

        {/* Scan Feedback Banner */}
        {feedback && (
          <div
            className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
              feedback.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {feedback.text}
          </div>
        )}

        {/* Manual Barcode Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScanSubmit();
          }}
          className="flex items-center gap-2"
        >
          <div className="flex-1">
            <Input
              placeholder="Or enter barcode string (e.g. ZA-R01-S2-B01 or IP15PM-OLED-BLK)..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              autoFocus
            />
          </div>
          <Button type="submit" variant="primary" icon={<Barcode className="w-4 h-4" />}>
            Scan
          </Button>
        </form>

        {/* Quick Sample Barcodes */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
            Quick Test Barcodes
          </span>
          <div className="flex flex-wrap gap-1.5">
            {["ZA-R01-S2-B01", "IP15PM-OLED-BLK", "SAM-S24U-BAT", "REC-2026-091", "PICK-2026-440"].map((sample) => (
              <button
                key={sample}
                onClick={() => handleScanSubmit(sample)}
                className="px-2.5 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Scan History */}
        {scannedHistory.length > 0 && (
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
              Recent Scans
            </span>
            <div className="space-y-1">
              {scannedHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg"
                >
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{item.code}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="indigo" size="sm">
                      {item.type}
                    </Badge>
                    <span className="text-[10px] text-slate-400">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
