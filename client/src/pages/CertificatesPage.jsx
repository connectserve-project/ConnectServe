import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { certificateService } from '../services/certificateService';
import { CertificateCard } from '../components/certificates/CertificateCard';
import { CertificateViewerModal } from '../components/certificates/CertificateViewerModal';
import { QrScanner } from '../components/common/QrScanner';
import { Button } from '../components/common/Button';
import { Award, ShieldCheck, Search, CheckCircle2, AlertCircle, QrCode, Keyboard } from 'lucide-react';
import toast from 'react-hot-toast';

export const CertificatesPage = () => {
  const { code } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState([]);
  const [searchCode, setSearchCode] = useState(code || '');
  const [verifiedResult, setVerifiedResult] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMode, setVerifyMode] = useState('code'); // 'code' | 'scan'

  useEffect(() => {
    if (isAuthenticated) {
      const fetchMyCertificates = async () => {
        setLoading(true);
        try {
          const res = await certificateService.getMyCertificates();
          if (res.success && res.data) {
            setCertificates(res.data.certificates || []);
          }
        } catch (err) {
          // ignore
        } finally {
          setLoading(false);
        }
      };
      fetchMyCertificates();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (code) {
      handleVerifyByCode(code);
    }
  }, [code]);

  const handleVerifyByCode = async (codeToVerify) => {
    if (!codeToVerify.trim()) return;
    setIsVerifying(true);
    try {
      const res = await certificateService.verifyCertificate(codeToVerify.trim());
      if (res.success && res.data?.certificate) {
        setVerifiedResult(res.data.certificate);
        toast.success('Certificate successfully verified in registry!');
      }
    } catch (err) {
      setVerifiedResult('not_found');
      toast.error('Certificate not found or invalid certificate code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleQrScanned = (decodedText) => {
    if (!decodedText) return;
    let extractedCode = decodedText.trim();

    // If decodedText is a full URL, parse out the certificate code
    if (extractedCode.includes('/verify/')) {
      const parts = extractedCode.split('/verify/');
      if (parts.length > 1) {
        extractedCode = parts[1].split('?')[0].split('#')[0];
      }
    } else if (extractedCode.includes('token=')) {
      const urlParams = new URLSearchParams(extractedCode.split('?')[1] || '');
      const tokenParam = urlParams.get('token');
      if (tokenParam) extractedCode = tokenParam;
    }

    setSearchCode(extractedCode);
    setVerifyMode('code');
    handleVerifyByCode(extractedCode);
  };

  return (
    <div className="space-y-10 animate-fadeIn max-w-5xl mx-auto pb-12">
      {/* Header & Verification Portal */}
      <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-emerald-800/40 space-y-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Digital Certificate Registry</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Official Volunteering Certificates
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Verify any issued ConnectServe community certificate by code or camera QR scan, or view and download your earned awards in high-resolution PDF.
          </p>
        </div>

        {/* Input Mode Toggle Tabs */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
          <button
            onClick={() => setVerifyMode('code')}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-xl transition-colors min-h-[38px] flex items-center gap-2 ${
              verifyMode === 'code'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Enter Code
          </button>
          <button
            onClick={() => setVerifyMode('scan')}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-xl transition-colors min-h-[38px] flex items-center gap-2 ${
              verifyMode === 'scan'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Scan QR
          </button>
        </div>

        {/* Form or Camera Scanner according to mode */}
        {verifyMode === 'code' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyByCode(searchCode);
            }}
            className="flex flex-col sm:flex-row gap-2 max-w-xl"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Certificate Code (e.g. CS-2026-GRN-8492)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono uppercase"
              />
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-300" />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isVerifying}
              className="min-h-[44px]"
            >
              Verify Certificate
            </Button>
          </form>
        ) : (
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 max-w-md">
            <QrScanner
              onScan={handleQrScanned}
              onClose={() => setVerifyMode('code')}
              title="Scan Certificate QR Code"
            />
          </div>
        )}

        {/* Verification Result Notification */}
        {verifiedResult && verifiedResult !== 'not_found' && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">
                  Verified: {verifiedResult.badgeAwarded}
                </p>
                <p className="text-xs text-emerald-200">
                  Awarded to {verifiedResult.volunteerName} for {verifiedResult.hours} hours of service with {verifiedResult.organizationName}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedCert(verifiedResult)}
            >
              View Document
            </Button>
          </div>
        )}

        {verifiedResult === 'not_found' && (
          <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center gap-3 animate-fadeIn text-rose-200 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>
              Certificate code could not be verified in the platform registry. Please check the code formatting and try again.
            </span>
          </div>
        )}
      </div>

      {/* My Certificates Section (if authenticated volunteer) */}
      {isAuthenticated && user?.role === 'user' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              My Earned Certificates ({certificates.length})
            </h2>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading certificates...</div>
          ) : certificates.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
              <Award className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                No certificates earned yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once you register for community drives and your attendance is marked, verified digital certificates will be generated here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <CertificateCard
                  key={cert._id}
                  certificate={cert}
                  onView={(c) => setSelectedCert(c)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Certificate Viewer / Download PDF Modal */}
      <CertificateViewerModal
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
        certificate={selectedCert}
      />
    </div>
  );
};
