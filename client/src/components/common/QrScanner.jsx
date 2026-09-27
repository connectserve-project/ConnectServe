import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from './Button';

export const QrScanner = ({ onScan, onClose, title = 'Scan QR Code' }) => {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    const scannerId = 'connectserve-qr-reader';
    const html5Qrcode = new Html5Qrcode(scannerId);
    scannerRef.current = html5Qrcode;

    const startCamera = async () => {
      try {
        setError(null);
        setIsScanning(true);
        await html5Qrcode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (decodedText) {
              // Pause or stop scanner on successful decode
              try {
                html5Qrcode.stop().catch(() => {});
              } catch (_) {}
              onScan(decodedText);
            }
          },
          (errorMessage) => {
            // Ignore standard frame decoding errors
          }
        );
        setCameraActive(true);
      } catch (err) {
        console.error('QR Scanner camera start error:', err);
        setError('Camera permission denied or camera unavailable on this device.');
      } finally {
        setIsScanning(false);
      }
    };

    startCamera();

    return () => {
      if (html5Qrcode && html5Qrcode.isScanning) {
        html5Qrcode.stop().catch(() => {}).finally(() => {
          html5Qrcode.clear();
        });
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4 text-center">
      {/* Container header */}
      <div className="flex items-center justify-between w-full pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Camera className="w-4 h-4 text-emerald-600" />
          {title}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Camera Video Viewport */}
      <div className="relative w-full max-w-sm aspect-square bg-slate-950 rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-inner flex flex-col items-center justify-center">
        <div id="connectserve-qr-reader" className="w-full h-full object-cover"></div>

        {error && (
          <div className="absolute inset-0 bg-slate-900/95 p-6 flex flex-col items-center justify-center space-y-3 text-rose-300 text-xs text-center z-20">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <p>{error}</p>
            <p className="text-[11px] text-slate-400">
              Please ensure camera permissions are granted in your browser.
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
        Position the QR code within the camera frame to scan automatically.
      </p>
    </div>
  );
};
