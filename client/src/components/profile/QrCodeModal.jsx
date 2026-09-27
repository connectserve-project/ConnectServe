import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { QrCode, Download, ShieldCheck, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const QrCodeModal = ({ isOpen, onClose, user, qrToken }) => {
  const qrRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  if (!user) return null;

  const handleDownload = () => {
    try {
      const canvas = qrRef.current?.querySelector('canvas');
      if (!canvas) return;
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `connectserve-qr-${user.username || user.name || 'volunteer'}.png`;
      link.click();
      toast.success('QR Code downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download QR code.');
    }
  };

  const handleCopy = () => {
    if (!qrToken) return;
    navigator.clipboard.writeText(qrToken);
    setCopied(true);
    toast.success('QR Token copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="My Volunteer QR Code"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center space-y-5 py-2">
        {/* User Badge */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-3 px-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 w-full">
          <Avatar src={user.avatar} size="md" />
          <div className="text-left min-w-0 flex-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
              {user.name}
            </h4>
            <p className="text-xs text-slate-500 truncate">
              @{user.username || 'volunteer'} • Volunteer
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* QR Canvas Display Container */}
        <div
          ref={qrRef}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/30 shadow-card flex flex-col items-center justify-center space-y-3"
        >
          {qrToken ? (
            <QRCodeCanvas
              value={qrToken}
              size={200}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: '/favicon.ico',
                x: undefined,
                y: undefined,
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
              Generating QR Code...
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 p-3.5 rounded-2xl text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm leading-relaxed">
          <p className="font-medium">
            Show this QR code to an organization at an event to mark your attendance.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full pt-1">
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            icon={Download}
            onClick={handleDownload}
            disabled={!qrToken}
          >
            Download QR
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={copied ? Check : Copy}
            onClick={handleCopy}
            disabled={!qrToken}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
