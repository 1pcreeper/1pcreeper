import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle, Clock, Loader2, AlertCircle, Eye, 
  ExternalLink, Copy, Check, HardDrive, FileText, ArrowRight, ShieldCheck, RefreshCw, Ban, Trash2
} from 'lucide-react';
import VehicleService from '../../services/VehicleService.ts';

interface VrdApprovalQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number;
  vehicleReg: string;
  onSelectSubmissionForReview: (submission: any) => void;
  onRefreshData?: () => void;
}

export const VrdApprovalQueueModal: React.FC<VrdApprovalQueueModalProps> = ({
  isOpen,
  onClose,
  vehicleId,
  vehicleReg,
  onSelectSubmissionForReview,
  onRefreshData
}) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [confirmDeclineItem, setConfirmDeclineItem] = useState<{ id: number; fileName: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSubmissions();
    }
  }, [isOpen, vehicleId]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const res = await VehicleService.getInstance().getVrdSubmissions(vehicleId);
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      // Ensure PROCESSING and PENDING are sorted at the top rows
      list.sort((a: any, b: any) => {
        const getPriority = (status: string) => {
          if (status === 'PROCESSING') return 1;
          if (status === 'PENDING') return 2;
          if (status === 'SUCCESS') return 3;
          if (status === 'APPROVED') return 4;
          return 5;
        };
        const pDiff = getPriority(a.status) - getPriority(b.status);
        if (pDiff !== 0) return pDiff;
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      });
      setSubmissions(list);
    } catch (err) {
      console.error("Failed to load VRD submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeclineConfirm = (subId: number, fileName: string) => {
    setConfirmDeclineItem({ id: subId, fileName });
    setErrorMessage(null);
  };

  const handleExecuteDecline = async (subId: number, fileName: string) => {
    try {
      setDecliningId(subId);
      setErrorMessage(null);
      await VehicleService.getInstance().declineVrdSubmission({
        vehicleId: Number(vehicleId),
        subId: Number(subId),
        reason: 'Declined and abandoned by administrator'
      });
      setFeedbackMessage(`VRD scan "${fileName}" has been declined and abandoned.`);
      setConfirmDeclineItem(null);
      setTimeout(() => setFeedbackMessage(null), 4000);
      await loadSubmissions();
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (err: any) {
      console.error("Failed to decline VRD submission:", err);
      setErrorMessage(err.message || "Failed to decline VRD submission");
    } finally {
      setDecliningId(null);
    }
  };

  const handleCopy = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2500);
  };

  if (!isOpen) return null;

  const pendingCount = submissions.filter(s => s.status !== 'APPROVED' && s.status !== 'REJECTED').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900">VRD Staging & Waiting Approval Queue</h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-zinc-200 text-zinc-700">
                  {vehicleReg}
                </span>
                {pendingCount > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                    {pendingCount} Awaiting Review
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Staged in local MinIO Object Storage &bull; OCR particulars verification table
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadSubmissions}
              className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200 rounded-lg transition-colors"
              title="Refresh queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 min-h-0 flex-1 overflow-y-auto custom-scrollbar space-y-4">
          {feedbackMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-medium flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{feedbackMessage}</span>
              </div>
              <button onClick={() => setFeedbackMessage(null)} className="text-red-500 hover:text-red-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Informational Guidance Notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>
                VRD scans are stored in local MinIO bucket (<strong>s3://minio-local/hk-transport-vrd-bucket/vehicles/{vehicleId}/</strong>). 
                Rows in <strong className="text-emerald-700">SUCCESS</strong> stage are ready for admin verification & recommitment, or can be <strong>Declined</strong> to abandon.
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
              <p className="text-xs text-zinc-500">Loading staged VRD approval records...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-zinc-200 rounded-xl space-y-3">
              <FileText className="w-10 h-10 text-zinc-300 mx-auto" />
              <div>
                <p className="text-sm font-semibold text-zinc-700">No VRD Documents in Approval Queue</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Upload a new VRD using the "Scan VRD OCR" button to stage documents for review.
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Stage / Status</th>
                      <th className="py-3 px-4">Document File</th>
                      <th className="py-3 px-4">MinIO Storage Path</th>
                      <th className="py-3 px-4">Extracted Owner & Date</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {submissions.map((sub: any) => {
                      const isProcessing = sub.status === 'PROCESSING';
                      const isPending = sub.status === 'PENDING';
                      const isSuccess = sub.status === 'SUCCESS';
                      const isApproved = sub.status === 'APPROVED';
                      const isRejected = sub.status === 'REJECTED';

                      return (
                        <tr 
                          key={sub.id}
                          className={`transition-colors ${
                            isSuccess 
                              ? 'bg-emerald-50/20 hover:bg-emerald-50/50 cursor-pointer' 
                              : isProcessing || isPending
                                ? 'bg-amber-50/20 hover:bg-amber-50/40'
                                : isRejected
                                  ? 'bg-red-50/10 hover:bg-red-50/20 opacity-80'
                                  : 'hover:bg-zinc-50'
                          }`}
                          onClick={() => {
                            if (isSuccess) {
                              onSelectSubmissionForReview(sub);
                            }
                          }}
                        >
                          {/* Stage / Status */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {isProcessing && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                <Loader2 className="w-3 h-3 animate-spin text-amber-700" />
                                <span>PROCESSING</span>
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>PENDING</span>
                              </span>
                            )}
                            {isSuccess && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>SUCCESS</span>
                              </span>
                            )}
                            {isApproved && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                                <ShieldCheck className="w-3 h-3 text-blue-600" />
                                <span>APPROVED</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-900 border border-red-300">
                                <Ban className="w-3 h-3 text-red-600" />
                                <span>DECLINED</span>
                              </span>
                            )}
                            <div className="text-[10px] text-zinc-400 mt-1">
                              {new Date(sub.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {new Date(sub.uploadedAt).toLocaleDateString()}
                            </div>
                          </td>

                          {/* Document File */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-zinc-900">{sub.fileName}</p>
                                <span className="text-[10px] text-zinc-400 font-mono">{sub.fileSize || '1.4 MB'}</span>
                              </div>
                            </div>
                          </td>

                          {/* MinIO Storage Path */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <code className="text-[11px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded font-mono truncate max-w-[220px]" title={sub.minioPath}>
                                {sub.minioPath}
                              </code>
                              <button
                                onClick={(e) => {
                                   e.stopPropagation();
                                   handleCopy(sub.minioPath);
                                }}
                                className="p-1 text-zinc-400 hover:text-zinc-700 rounded transition-colors"
                                title="Copy MinIO Storage Path"
                              >
                                {copiedPath === sub.minioPath ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Extracted Owner & Date */}
                          <td className="py-3 px-4">
                            <div className="text-zinc-900 font-medium">
                              {sub.scannedData?.ownerNameEn || 'Owner details extracted'} 
                              {sub.scannedData?.ownerNameZh ? ` (${sub.scannedData.ownerNameZh})` : ''}
                            </div>
                            <div className="text-[10px] text-zinc-500 mt-0.5">
                              Issue Date: <strong>{sub.scannedData?.issueDate || '-'}</strong> &bull; Office: {sub.scannedData?.licensingOffice || 'Kowloon'}
                            </div>
                          </td>

                          {/* Action */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              {isSuccess ? (
                                <>
                                  <button
                                    onClick={() => onSelectSubmissionForReview(sub)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg shadow-2xs transition-colors"
                                    title="Verify particulars and commit to vehicle records"
                                  >
                                    <span>Verify & Recommit</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      handleOpenDeclineConfirm(sub.id, sub.fileName);
                                    }}
                                    disabled={decliningId === sub.id}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                                    title="Decline and abandon this scan"
                                  >
                                    <Ban className="w-3.5 h-3.5 text-red-600" />
                                    <span>Decline</span>
                                  </button>
                                </>
                              ) : isProcessing || isPending ? (
                                <>
                                  <span className="text-xs text-amber-700 font-medium inline-flex items-center gap-1 mr-2">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Analyzing...</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      handleOpenDeclineConfirm(sub.id, sub.fileName);
                                    }}
                                    disabled={decliningId === sub.id}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                                    title="Abandon this scan"
                                  >
                                    <Ban className="w-3.5 h-3.5 text-red-600" />
                                    <span>Decline</span>
                                  </button>
                                </>
                              ) : isRejected ? (
                                <span className="text-xs text-red-600 font-semibold inline-flex items-center gap-1 bg-red-50 px-2 py-1 rounded border border-red-200">
                                  <Ban className="w-3 h-3 text-red-500" />
                                  <span>Abandoned</span>
                                </span>
                              ) : (
                                <span className="text-xs text-blue-700 font-medium inline-flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Committed</span>
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
          <span>Click any <strong>SUCCESS</strong> row to review scanned particulars against the MinIO document.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* In-App Decline Confirmation Dialog (Safe in iframe environments) */}
      {confirmDeclineItem && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            if (decliningId === null) {
              setConfirmDeclineItem(null);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-red-100 text-red-700 rounded-xl flex-shrink-0">
                <Ban className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-bold text-zinc-900">Decline &amp; Abandon Scan?</h4>
                <p className="text-xs text-zinc-500 font-mono mt-0.5 truncate" title={confirmDeclineItem.fileName}>
                  {confirmDeclineItem.fileName}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to decline and abandon this VRD scan? This scan will not be committed to official vehicle records.
            </p>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setConfirmDeclineItem(null)}
                disabled={decliningId !== null}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExecuteDecline(confirmDeclineItem.id, confirmDeclineItem.fileName)}
                disabled={decliningId !== null}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                {decliningId === confirmDeclineItem.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Declining...</span>
                  </>
                ) : (
                  <>
                    <Ban className="w-3.5 h-3.5" />
                    <span>Yes, Decline &amp; Abandon</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
