import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { QrScanner } from '../common/QrScanner';
import { eventService } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';
import { CheckCircle, XCircle, Award, Clock, Users, Loader2, QrCode, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const AttendanceModal = ({ isOpen, onClose, eventId, onUpdated }) => {
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  // scanningRegId: the _id of the registration currently being scanned (null = no scanner open)
  const [scanningRegId, setScanningRegId] = useState(null);
  const [isScanningApi, setIsScanningApi] = useState(false);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await eventService.getEventApplicants(eventId);
      if (res.success && res.data) {
        setEvent(res.data.event);
        setRegistrations(res.data.registrations || []);
      }
    } catch (err) {
      toast.error('Failed to load applicants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && eventId) {
      setScanningRegId(null);
      fetchApplicants();
    }
  }, [isOpen, eventId]);

  // Called when QR scanner reads a code — marks attendance via QR token
  const handleQrScanned = async (decodedToken) => {
    if (isScanningApi) return;
    setIsScanningApi(true);
    try {
      const res = await eventService.scanAttendance(eventId, decodedToken);
      if (res.success) {
        toast.success(res.message || 'Attendance marked & certificate issued!');
        setScanningRegId(null);
        await fetchApplicants();
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or unregistered QR code.';
      toast.error(msg);
    } finally {
      setIsScanningApi(false);
    }
  };

  // Manual mark attendance (without QR) for a specific registration
  const handleManualAttendance = async (reg) => {
    setProcessingId(reg._id);
    try {
      const res = await registrationService.markAttendance(reg._id, true, event.hoursGranted);
      if (res.success) {
        toast.success(`Attendance marked! ${event.hoursGranted} hrs & certificate awarded.`);
        setScanningRegId(null);
        setRegistrations(prev =>
          prev.map(r =>
            r._id === reg._id
              ? { ...r, attended: true, status: 'attended', certificateIssued: true }
              : r
          )
        );
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      toast.error('Failed to mark attendance.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleStatusChange = async (regId, newStatus) => {
    setProcessingId(regId);
    try {
      const res = await registrationService.updateStatus(regId, newStatus);
      if (res.success) {
        toast.success(`Application ${newStatus}`);
        setRegistrations(prev =>
          prev.map(r => (r._id === regId ? { ...r, status: newStatus } : r))
        );
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      toast.error('Failed to update status.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event ? `Manage Volunteers: ${event.title}` : 'Volunteer Management'}
      maxWidth="max-w-2xl"
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-500">Loading volunteer roster...</p>
        </div>
      ) : registrations.length === 0 ? (
        <div className="text-center py-10 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No volunteer applications received yet.
          </p>
          <p className="text-xs text-slate-500">
            When volunteers apply for this drive, they will appear here for approval and attendance logging.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stats bar */}
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-xs gap-2 flex-wrap">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Total Applicants: {registrations.length}
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {event.hoursGranted} Hours per attendee
            </span>
          </div>

          {/* Volunteer list */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[60vh] overflow-y-auto pr-1">
            {registrations.map((reg) => {
              const isProcessing = processingId === reg._id;
              const isScanningThis = scanningRegId === reg._id;

              return (
                <div key={reg._id} className="py-3.5 space-y-3">
                  {/* Row: volunteer info + action buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Volunteer info */}
                    <div className="flex items-center gap-3">
                      <Avatar src={reg.user?.avatar} size="md" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {reg.user?.name}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">
                          {reg.user?.email} • {reg.user?.volunteerHours || 0} lifetime hrs
                        </p>
                        {reg.notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-0.5">
                            "{reg.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                      {/* STEP 1 — Pending: Accept / Reject */}
                      {reg.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={isProcessing}
                            onClick={() => handleStatusChange(reg._id, 'approved')}
                            icon={CheckCircle}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={isProcessing}
                            onClick={() => handleStatusChange(reg._id, 'rejected')}
                            icon={XCircle}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {/* STEP 2 — Approved: Scan QR to mark attended */}
                      {reg.status === 'approved' && !reg.attended && (
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={isProcessing}
                          onClick={() => setScanningRegId(isScanningThis ? null : reg._id)}
                          icon={QrCode}
                        >
                          {isScanningThis ? 'Close Scanner' : 'Scan QR'}
                        </Button>
                      )}

                      {/* STEP 3 — Attended: badge */}
                      {reg.attended && (
                        <span className="text-xs text-emerald-600 font-semibold px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" /> Attended (Cert Issued ✓)
                        </span>
                      )}

                      {/* Rejected badge */}
                      {reg.status === 'rejected' && (
                        <span className="text-xs text-rose-500 font-semibold px-2 py-1 bg-rose-50 dark:bg-rose-950/40 rounded-lg">
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Inline QR Scanner — shown only for the row being scanned */}
                  {isScanningThis && (
                    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <QrCode className="w-3.5 h-3.5" />
                          Ask <span className="font-bold">{reg.user?.name}</span> to show their QR code
                        </p>
                        <button
                          onClick={() => setScanningRegId(null)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <QrScanner
                        onScan={handleQrScanned}
                        onClose={() => setScanningRegId(null)}
                        title={`Scan ${reg.user?.name}'s QR Code`}
                      />

                      {/* Manual fallback */}
                      <div className="flex items-center gap-2 pt-1 border-t border-emerald-100 dark:border-emerald-900">
                        <p className="text-xs text-slate-500 flex-1">No QR available?</p>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isProcessing || isScanningApi}
                          onClick={() => handleManualAttendance(reg)}
                          icon={CheckCircle}
                        >
                          Mark Manually
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
};
