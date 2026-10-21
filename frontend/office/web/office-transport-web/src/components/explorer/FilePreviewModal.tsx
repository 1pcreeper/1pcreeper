import React, { useState } from 'react';
import { 
  X, Copy, Check, FileText, Download, HardDrive, 
  Sheet, ShieldCheck, FileCode, Image as ImageIcon,
  Archive, File, ZoomIn, ZoomOut, CheckCircle
} from 'lucide-react';

interface FilePreviewModalProps {
  file: any;
  previewData: any;
  onClose: () => void;
  onCopyPath: (path: string) => void;
  copiedPath: string | null;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  previewData,
  onClose,
  onCopyPath,
  copiedPath
}) => {
  const [activeSheet, setActiveSheet] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);

  if (!file) return null;

  const ext = (file.fileType || file.fileName?.split('.').pop() || 'txt').toLowerCase();
  const nasPath = file.nasPath || `\\\\HK-OFFICE-NAS\\TransportDept\\Vehicles\\${file.vehicleId ? `${file.vehicleId}\\` : ''}${file.folder || 'General'}\\${file.fileName}`;

  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext);
  const isSheet = ['xlsx', 'xls', 'csv'].includes(ext);
  const isDoc = ['docx', 'doc'].includes(ext);
  const isPdf = ext === 'pdf';
  const isCodeOrText = ['txt', 'log', 'json', 'xml', 'yaml', 'yml', 'js', 'ts', 'html', 'css', 'py', 'sh', 'sql'].includes(ext);

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const getFormatBadgeStyle = () => {
    if (isPdf) return 'bg-red-50 text-red-700 border-red-200';
    if (isDoc) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (isSheet) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (isImage) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (isCodeOrText) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-zinc-100 text-zinc-700 border-zinc-300';
  };

  const getFormatIcon = () => {
    if (isPdf) return <FileText className="w-5 h-5 text-red-600" />;
    if (isDoc) return <FileText className="w-5 h-5 text-blue-600" />;
    if (isSheet) return <Sheet className="w-5 h-5 text-emerald-600" />;
    if (isImage) return <ImageIcon className="w-5 h-5 text-purple-600" />;
    if (isCodeOrText) return <FileCode className="w-5 h-5 text-amber-600" />;
    if (['zip', 'rar', '7z', 'tar'].includes(ext)) return <Archive className="w-5 h-5 text-indigo-600" />;
    return <File className="w-5 h-5 text-zinc-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-5xl h-[92vh] max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-3.5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-xl border flex-shrink-0 ${getFormatBadgeStyle()}`}>
              {getFormatIcon()}
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 truncate">{file.fileName}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border tracking-wider ${getFormatBadgeStyle()}`}>
                  .{ext} PREVIEW
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                <span>Folder: <strong className="text-zinc-700 font-medium">{file.folder || 'General'}</strong></span>
                <span>&bull;</span>
                <span>Size: <strong className="text-zinc-700 font-medium">{file.fileSize || '1.2 MB'}</strong></span>
                <span>&bull;</span>
                <span>Modified: {new Date(file.uploadedAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <button
              onClick={() => onCopyPath(nasPath)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors shadow-2xs"
              title="Copy Office NAS File Location"
            >
              {copiedPath === nasPath ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Copy NAS Path</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 transition-colors shadow-2xs"
              title="Download file"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>{downloadSuccess ? 'Downloaded' : 'Download'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors ml-1"
              title="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Office NAS Path Info Bar */}
        <div className="px-6 py-2 bg-blue-50/80 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900 flex-shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <HardDrive className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="font-semibold text-blue-950 flex-shrink-0">Office NAS Location:</span>
            <code className="font-mono bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-800 truncate select-all text-[11px]">
              {nasPath}
            </code>
          </div>
          <button
            onClick={() => onCopyPath(nasPath)}
            className="flex-shrink-0 ml-3 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline"
          >
            {copiedPath === nasPath ? 'Copied to Clipboard' : 'Copy Full Path'}
          </button>
        </div>

        {/* Modal Scrollable Content Preview Area */}
        <div className="p-4 sm:p-6 min-h-0 flex-1 overflow-y-auto bg-zinc-100/80 flex flex-col items-center custom-scrollbar">
          {/* 1. PDF PREVIEW */}
          {isPdf && (
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-md border border-zinc-200 p-6 sm:p-10 space-y-6 relative overflow-hidden my-2 flex-shrink-0">
              {/* Document Watermark Stamp */}
              <div className="absolute top-10 right-10 border-2 border-red-300 text-red-500 font-serif font-black px-4 py-1.5 rounded-lg rotate-12 uppercase tracking-widest text-xs opacity-70 pointer-events-none select-none">
                VERIFIED OFFICIAL &bull; HKSAR
              </div>

              {/* PDF Header */}
              <div className="text-center border-b-2 border-zinc-800 pb-5">
                <div className="flex justify-center mb-2">
                  <div className="w-11 h-11 rounded-full bg-zinc-900 text-white flex items-center justify-center font-serif text-base font-bold shadow-xs">
                    HK
                  </div>
                </div>
                <h1 className="text-xs sm:text-sm font-serif font-bold uppercase tracking-widest text-zinc-900">
                  The Government of the Hong Kong Special Administrative Region
                </h1>
                <h2 className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mt-0.5">
                  Transport Department &bull; Licensing & Operations Division
                </h2>
                <div className="mt-3 inline-block bg-zinc-100 px-4 py-1 rounded text-xs font-bold text-zinc-800 tracking-wide border border-zinc-300">
                  {previewData?.pdfData?.documentTitle || file.fileName.replace(/\.pdf$/i, '')}
                </div>
              </div>

              {/* Certificate Details */}
              <div className="flex justify-between items-center text-xs text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                <div>
                  <span className="text-zinc-400">CERT NO:</span>{' '}
                  <strong className="font-mono text-zinc-800">{previewData?.pdfData?.certNo || 'HKTD-CERT-2024-8891'}</strong>
                </div>
                <div>
                  <span className="text-zinc-400">ISSUE DATE:</span>{' '}
                  <strong className="text-zinc-800">{previewData?.pdfData?.issueDate || new Date().toLocaleDateString('en-GB')}</strong>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>VALIDATED</span>
                </div>
              </div>

              {/* Particulars Table */}
              <div>
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2.5">
                  Vehicle Registration Particulars
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs border border-zinc-200 rounded-lg p-4 bg-zinc-50/50">
                  {previewData?.pdfData?.particulars ? (
                    Object.entries(previewData.pdfData.particulars).map(([key, val]: any) => (
                      <div key={key} className="border-b border-zinc-200/60 pb-2">
                        <div className="text-[11px] text-zinc-500">{key}</div>
                        <div className="font-semibold text-zinc-900 mt-0.5">{String(val)}</div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="border-b border-zinc-200 pb-2">
                        <div className="text-[11px] text-zinc-500">Registration Mark</div>
                        <div className="font-bold text-zinc-900">AB1234</div>
                      </div>
                      <div className="border-b border-zinc-200 pb-2">
                        <div className="text-[11px] text-zinc-500">Chassis No (VIN)</div>
                        <div className="font-mono font-semibold text-zinc-900">VIN88291039821</div>
                      </div>
                      <div className="border-b border-zinc-200 pb-2">
                        <div className="text-[11px] text-zinc-500">Make & Model</div>
                        <div className="font-semibold text-zinc-900">TOYOTA COROLLA</div>
                      </div>
                      <div className="border-b border-zinc-200 pb-2">
                        <div className="text-[11px] text-zinc-500">Class of Vehicle</div>
                        <div className="font-semibold text-zinc-900">PRIVATE CAR</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Certification & Signatures */}
              <div className="border-t border-zinc-200 pt-5 text-xs text-zinc-600 space-y-4">
                <p className="leading-relaxed text-zinc-700 italic">
                  {previewData?.pdfData?.remarks || 
                    "This document certifies that the vehicle registered above conforms with all vehicle safety, environmental emissions, and roadworthiness regulations enacted under Cap. 374 of the Laws of Hong Kong."}
                </p>
                <div className="flex justify-between items-end pt-4">
                  <div>
                    <div className="font-mono text-[10px] text-zinc-400">QR VERIFICATION SIGNATURE</div>
                    <div className="w-16 h-16 bg-zinc-100 border border-zinc-300 rounded p-1 flex items-center justify-center font-mono text-[8px] text-zinc-400 text-center">
                      [ DIGITAL QR ]
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-8 font-serif italic text-zinc-700 text-sm flex items-end justify-end">
                      H.K. Wong (Authorized Officer)
                    </div>
                    <div className="border-t border-zinc-400 w-44 text-[11px] text-zinc-500 pt-1">
                      For Commissioner for Transport
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. DOCX PREVIEW */}
          {isDoc && (
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-md border border-zinc-200 overflow-hidden flex flex-col my-2 flex-shrink-0">
              <div className="bg-zinc-100 border-b border-zinc-200 px-4 py-2 flex items-center justify-between text-xs text-zinc-600">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-blue-700">Word Document</span>
                  <span className="text-zinc-300">|</span>
                  <span className="font-mono text-zinc-500">Calibri &bull; 11 pt</span>
                </div>
                <span className="text-[11px] text-zinc-400">Official Transport Record</span>
              </div>

              <div className="p-8 sm:p-12 space-y-6 text-zinc-800 leading-relaxed font-sans text-sm">
                <div className="border-b-2 border-blue-900 pb-4">
                  <div className="text-xs font-bold text-blue-900 tracking-wider uppercase">
                    {previewData?.docxData?.department || "Transport Department Fleet Operations Unit"}
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-zinc-900 mt-2">
                    {previewData?.docxData?.documentTitle || file.fileName.replace(/\.(docx|doc)$/i, '')}
                  </h1>
                  <div className="text-xs text-zinc-500 mt-1">
                    Ref: <span className="font-mono font-medium text-zinc-700">{previewData?.docxData?.referenceNo || 'MEMO/HKTD/2024/09-0042'}</span> &bull; Date: {previewData?.docxData?.date || new Date().toLocaleDateString('en-GB')}
                  </div>
                </div>

                <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 text-xs space-y-1.5 text-zinc-700">
                  <div><strong>TO:</strong> {previewData?.docxData?.to || "All Authorized Fleet Personnel"}</div>
                  <div><strong>FROM:</strong> {previewData?.docxData?.from || "Senior Logistics Officer"}</div>
                  <div><strong>SUBJECT:</strong> {previewData?.docxData?.subject || file.fileName}</div>
                </div>

                {previewData?.docxData?.sections ? (
                  previewData.docxData.sections.map((sec: any, idx: number) => (
                    <div key={idx} className="space-y-1.5">
                      <h3 className="font-bold text-blue-950 text-xs sm:text-sm">{sec.heading}</h3>
                      <p className="text-xs text-zinc-700 leading-relaxed">{sec.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="space-y-4 text-xs text-zinc-700">
                    <p>
                      This administrative document records the operational governance and statutory compliance requirements for the vehicle asset.
                    </p>
                  </div>
                )}

                <div className="pt-6 border-t border-zinc-200 text-xs text-zinc-500 flex justify-between">
                  <div>Document Status: <strong>Approved & Digitally Archived</strong></div>
                  <div>Office NAS File Sync: <strong>Verified</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* 3. XLSX / CSV PREVIEW */}
          {isSheet && (
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-md border border-zinc-200 overflow-hidden flex flex-col my-2 flex-shrink-0">
              <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <Sheet className="w-4 h-4" />
                    {ext.toUpperCase()} Spreadsheet
                  </span>
                  <span className="text-zinc-300">|</span>
                  <div className="flex items-center gap-2 font-mono text-zinc-600 bg-white px-2 py-0.5 border border-zinc-200 rounded text-[11px]">
                    <span className="text-zinc-400 font-bold">fx</span>
                    <span>=SUM(F4:F8)</span>
                  </div>
                </div>
                <div className="text-[11px] text-zinc-500 font-medium">
                  {previewData?.xlsxData?.sheets?.[activeSheet]?.rows?.length || 5} records loaded
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-100 text-zinc-700 border-b border-zinc-200 font-semibold">
                      <th className="p-2.5 w-10 text-center bg-zinc-200/70 border-r border-zinc-300 font-mono text-[10px] text-zinc-500">
                        #
                      </th>
                      {previewData?.xlsxData?.sheets?.[activeSheet]?.columns ? (
                        previewData.xlsxData.sheets[activeSheet].columns.map((col: string, idx: number) => (
                          <th key={idx} className="p-2.5 border-r border-zinc-200 last:border-r-0 whitespace-nowrap">
                            {col}
                          </th>
                        ))
                      ) : (
                        <>
                          <th className="p-2.5 border-r border-zinc-200">Record ID</th>
                          <th className="p-2.5 border-r border-zinc-200">Date</th>
                          <th className="p-2.5 border-r border-zinc-200">Service Category</th>
                          <th className="p-2.5 border-r border-zinc-200">Vendor / Garage</th>
                          <th className="p-2.5 border-r border-zinc-200">Mileage (km)</th>
                          <th className="p-2.5 border-r border-zinc-200">Cost (HKD)</th>
                          <th className="p-2.5">Status</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 font-mono">
                    {previewData?.xlsxData?.sheets?.[activeSheet]?.rows ? (
                      previewData.xlsxData.sheets[activeSheet].rows.map((row: string[], rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-emerald-50/40 transition-colors">
                          <td className="p-2.5 text-center bg-zinc-50 border-r border-zinc-200 text-zinc-400 text-[10px]">
                            {rIdx + 1}
                          </td>
                          {row.map((cell: string, cIdx: number) => (
                            <td key={cIdx} className="p-2.5 border-r border-zinc-200 last:border-r-0 text-zinc-800 whitespace-nowrap">
                              {cell === 'APPROVED' ? (
                                <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                  {cell}
                                </span>
                              ) : (
                                cell
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-zinc-400 font-sans">
                          No spreadsheet records available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-zinc-50 border-t border-zinc-200 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="bg-white border border-zinc-300 rounded px-3 py-1 text-xs font-bold text-emerald-800 shadow-2xs">
                  {previewData?.xlsxData?.sheets?.[activeSheet]?.sheetName || "Sheet 1"}
                </div>
                {previewData?.xlsxData?.sheets?.[activeSheet]?.summary && (
                  <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-zinc-600">
                    {Object.entries(previewData.xlsxData.sheets[activeSheet].summary).map(([k, v]: any) => (
                      <div key={k} className="flex items-center gap-1.5">
                        <span className="text-zinc-500">{k}:</span>
                        <strong className="text-zinc-900 font-semibold">{String(v)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. IMAGE PREVIEW (PNG, JPG, JPEG, WEBP, GIF, SVG) */}
          {isImage && (
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-md border border-zinc-200 overflow-hidden flex flex-col my-2 flex-shrink-0">
              <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-zinc-800">{file.fileName}</span>
                  <span className="text-zinc-400">&bull;</span>
                  <span className="text-zinc-500 font-mono text-[11px] uppercase">{ext} Image</span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setImageZoom(prev => Math.max(0.5, prev - 0.25))}
                    className="p-1 hover:bg-zinc-200 rounded text-zinc-600"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono text-zinc-600 px-1">{Math.round(imageZoom * 100)}%</span>
                  <button 
                    onClick={() => setImageZoom(prev => Math.min(2.5, prev + 0.25))}
                    className="p-1 hover:bg-zinc-200 rounded text-zinc-600"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-6 bg-zinc-900/5 flex items-center justify-center min-h-[350px] overflow-auto">
                {previewData?.imageData?.url ? (
                  <img 
                    src={previewData.imageData.url} 
                    alt={file.fileName}
                    style={{ transform: `scale(${imageZoom})`, transformOrigin: 'center center' }}
                    className="max-h-[500px] object-contain rounded shadow transition-transform duration-150"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center max-w-md bg-white border border-zinc-200 rounded-xl shadow-xs">
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl mb-3">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                    <h4 className="text-sm font-bold text-zinc-800">{file.fileName}</h4>
                    <p className="text-xs text-zinc-500 mt-1">
                      Office NAS Image Asset &bull; Resolution: 1920 &times; 1080 &bull; {file.fileSize || '2.1 MB'}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Synchronized with Office NAS Storage Node</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
                <span>Color Space: <strong>RGB 24-bit</strong></span>
                <span>Location: <code className="font-mono text-zinc-700 text-[11px]">{nasPath}</code></span>
              </div>
            </div>
          )}

          {/* 5. CODE / TEXT PREVIEW (TXT, LOG, JSON, XML, YAML, MD, etc.) */}
          {isCodeOrText && (
            <div className="w-full max-w-3xl bg-zinc-950 rounded-xl shadow-xl border border-zinc-800 overflow-hidden flex flex-col text-zinc-300 font-mono text-xs my-2 flex-shrink-0">
              <div className="bg-zinc-900 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-zinc-400 text-xs ml-2 font-sans font-medium">{file.fileName}</span>
                </div>
                <span className="text-[11px] text-zinc-500 uppercase">{ext} &bull; UTF-8</span>
              </div>

              <div className="p-4 sm:p-6 overflow-x-auto leading-relaxed whitespace-pre font-mono">
                {previewData?.txtData?.content || `// Content for ${file.fileName}\n// Archived in Office NAS repository`}
              </div>
            </div>
          )}

          {/* 6. GENERIC / BINARY / ARCHIVE / OTHER PREVIEW */}
          {!isPdf && !isDoc && !isSheet && !isImage && !isCodeOrText && (
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-md border border-zinc-200 p-8 sm:p-10 text-center flex flex-col items-center my-4 flex-shrink-0">
              <div className="p-5 bg-zinc-100 text-zinc-700 rounded-2xl mb-4 border border-zinc-200 shadow-2xs">
                {getFormatIcon()}
              </div>

              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded uppercase border mb-2 ${getFormatBadgeStyle()}`}>
                .{ext} DOCUMENT ASSET
              </span>

              <h3 className="text-base font-bold text-zinc-900 mb-1">{file.fileName}</h3>
              <p className="text-xs text-zinc-500 max-w-md mb-6">
                This document is stored on the Office NAS network storage repository under the vehicle folder.
              </p>

              <div className="w-full text-left bg-zinc-50 rounded-xl border border-zinc-200 p-4 text-xs space-y-2.5 mb-6">
                <div className="flex justify-between pb-2 border-b border-zinc-200">
                  <span className="text-zinc-500">File Allocation Size:</span>
                  <span className="font-semibold text-zinc-800">{file.fileSize || '2.5 MB'}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-zinc-200">
                  <span className="text-zinc-500">Storage Folder:</span>
                  <span className="font-semibold text-zinc-800">{file.folder || 'General'}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-zinc-200">
                  <span className="text-zinc-500">Last Synced Date:</span>
                  <span className="font-semibold text-zinc-800">{new Date(file.uploadedAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Checksum Hash:</span>
                  <span className="font-mono text-zinc-600 text-[11px]">SHA-256: e3b0c44298fc1c14...</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onCopyPath(nasPath)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded-lg shadow-2xs transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy NAS Location</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadSuccess ? 'Downloaded' : 'Download File'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Actions */}
        <div className="px-6 py-3 border-t border-zinc-200 bg-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Scroll inside window to view full document particulars & signatures</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onCopyPath(nasPath)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Path</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-2xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
