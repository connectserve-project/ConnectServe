import React, { useRef, useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatDate } from '../../utils/dateUtils';
import { Download, Share2, Award, ShieldCheck, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

export const CertificateViewerModal = ({ isOpen, onClose, certificate }) => {
  const certRef = useRef(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!certificate) return null;

  const handleDownloadPDF = async () => {
    if (!certRef.current) return;
    setIsGeneratingPDF(true);
    const toastId = toast.loading('Generating high-resolution PDF certificate...');

    try {
      const element = certRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`ConnectServe_Certificate_${certificate.certificateCode}.pdf`);

      toast.success('Certificate downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error('[PDF Generation Error]', error);
      toast.error('Failed to generate PDF.', { id: toastId });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCopyVerifyUrl = () => {
    const verifyUrl = `${window.location.origin}/verify/${certificate.certificateCode}`;
    navigator.clipboard.writeText(verifyUrl);
    toast.success('Public verification link copied to clipboard!');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Digital Certificate of Service" maxWidth="max-w-4xl">
      <div className="space-y-5">
        {/* Actions header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Verification ID:</span>
            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              {certificate.certificateCode}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyVerifyUrl}
              icon={Share2}
            >
              Copy Verification URL
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownloadPDF}
              isLoading={isGeneratingPDF}
              icon={Download}
            >
              Download Official PDF
            </Button>
          </div>
        </div>

        {/* Certificate Canvas Document (Ornate Landscape Layout) */}
        <div className="overflow-x-auto p-1">
          <div
            ref={certRef}
            className="w-[800px] min-h-[560px] mx-auto bg-white text-slate-900 p-10 rounded-2xl shadow-xl relative border-[12px] border-double border-emerald-800 flex flex-col justify-between select-none"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-emerald-700" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-emerald-700" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-emerald-700" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-emerald-700" />

            {/* Top Header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-emerald-800">
                <Award className="w-9 h-9" />
                <span className="text-2xl font-bold tracking-widest uppercase font-sans">
                  ConnectServe
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-emerald-900 tracking-wide uppercase pt-2">
                Certificate of Appreciation
              </h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-sans font-semibold">
                Official Recognition for Outstanding Community Service
              </p>
            </div>

            {/* Main Presentation Body */}
            <div className="text-center my-6 space-y-4">
              <p className="text-sm italic text-slate-600">This certifies that</p>
              <h2 className="text-3xl font-bold text-slate-900 font-sans border-b-2 border-emerald-700/40 inline-block px-8 pb-1">
                {certificate.volunteerName}
              </h2>
              <p className="text-sm text-slate-700 max-w-xl mx-auto leading-relaxed pt-2">
                has successfully completed <strong className="text-emerald-800 font-sans">{certificate.hours} verified volunteer hours</strong> and demonstrated exceptional dedication, leadership, and community spirit for
              </p>
              <h3 className="text-xl font-bold text-emerald-900 italic">
                "{certificate.eventTitle}"
              </h3>
            </div>

            {/* Bottom Footer: Signature, Organization, Official Seal, Verification */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-3 items-end text-center font-sans text-xs">
              {/* Organization signature */}
              <div className="space-y-1">
                <div className="font-serif italic text-base text-emerald-900 font-bold border-b border-slate-400 pb-1 max-w-[180px] mx-auto">
                  {certificate.organizationName}
                </div>
                <p className="font-bold text-slate-800">{certificate.organizationName}</p>
                <p className="text-[10px] text-slate-400">Authorized Organizing Partner</p>
              </div>

              {/* Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-dashed border-emerald-700 flex flex-col items-center justify-center text-emerald-800 p-1">
                  <ShieldCheck className="w-6 h-6" />
                  <span className="text-[8px] font-bold uppercase tracking-tighter mt-0.5">Verified</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Issued: {formatDate(certificate.issueDate)}
                </p>
              </div>

              {/* QR Code + Unique ID & System Signature */}
              <div className="space-y-1 flex flex-col items-center">
                <QRCodeSVG
                  value={`${window.location.origin}/verify/${certificate.certificateCode}`}
                  size={72}
                  fgColor="#065f46"
                  bgColor="#ffffff"
                  level="M"
                  style={{ border: '2px solid #d1fae5', borderRadius: 6, padding: 4 }}
                />
                <p className="font-mono text-[9px] font-bold text-slate-600 mt-1 tracking-tight">
                  {certificate.certificateCode}
                </p>
                <p className="font-bold text-slate-800 text-[10px]">ConnectServe Registry</p>
                <p className="text-[9px] text-slate-400">Scan to Verify Certificate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
