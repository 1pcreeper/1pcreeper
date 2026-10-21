import React, { useState } from 'react';
import { 
  FileText, Sheet, FileCode, Copy, Check, HardDrive, 
  ExternalLink, Download, ShieldCheck, RefreshCw,
  Folder, Image as ImageIcon, Archive, File, ZoomIn, ZoomOut, CheckCircle
} from 'lucide-react';

interface InlineFilePreviewProps {
  file: any | null;
  previewData: any | null;
  loading: boolean;
  onCopyPath: (path: string) => void;
  copiedPath: string | null;
  onOpenModal?: () => void;
}

export const InlineFilePreview: React.FC<InlineFilePreviewProps> = ({
  file,
  previewData,
  loading,
  onCopyPath,
  copiedPath,
  onOpenModal
}) => {
  const [activeSheet, setActiveSheet] = useState(0);
  const [downloadNotice, setDownloadNotice] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-400 min-h-[500px] h-full text-center bg-white rounded-xl border border-zinc-200 shadow-2xs">
        <div className="p-4 bg-zinc-100 rounded-full mb-3">
          <FileText className="w-10 h-10 text-zinc-300" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-700">No Document Selected</h3>
        <p className="text-xs text-zinc-500 max-w-sm mt-1">
          Select a file from the Directory Tree View on the left to preview its content.
        </p>
      </div>
    );
  }

  const ext = (file.fileType || file.fileName?.split('.').pop() || 'txt').toLowerCase();
  const nasPath = file.nasPath || `\\\\HK-OFFICE-NAS\\TransportDept\\Vehicles\\${file.vehicleId ? `${file.vehicleId}\\` : ''}${file.folder || 'General'}\\${file.fileName}`;

  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext);
  const isSheet = ['xlsx', 'xls', 'csv'].includes(ext);
  const isDoc = ['docx', 'doc'].includes(ext);
  const isPdf = ext === 'pdf';
  const isCodeOrText = ['txt', 'log', 'json', 'xml', 'yaml', 'yml', 'js', 'ts', 'html', 'css', 'py', 'sh', 'sql'].includes(ext);

  const handleDownload = () => {
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 2000);
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
    <div className="flex flex-col h-full bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden">
      {/* Top Header */}
      <div className="px-5 py-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2 rounded-lg border flex-shrink-0 ${getFormatBadgeStyle()}`}>
            {getFormatIcon()}
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-900 truncate">{file.fileName}</h3>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${getFormatBadgeStyle()}`}>
                .{ext} PREVIEW
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
              <span className="flex items-center gap-1 text-zinc-600">
                <Folder className="w-3 h-3 text-amber-500" />
                {file.folder || 'General'}
              </span>
              <span>&bull;</span>
              <span>{file.fileSize || '1.2 MB'}</span>
              <span>&bull;</span>
              <span>{new Date(file.uploadedAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onCopyPath(nasPath)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors shadow-2xs"
            title="Copy Office NAS File Location"
          >
            {copiedPath === nasPath ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Path Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-500" />
                <span>Copy Path</span>
              </>
            )}
          </button>

          {onOpenModal && (
            <button
              onClick={onOpenModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 transition-colors shadow-2xs"
              title="Pop out in fullscreen modal"
            >
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Pop Out</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Office NAS Path Info Strip */}
      <div className="px-5 py-2 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between text-xs text-blue-950 flex-shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <HardDrive className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span className="font-semibold text-blue-900 flex-shrink-0 text-xs">Office NAS:</span>
          <code className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-800 truncate select-all">
            {nasPath}
          </code>
        </div>
        <button
          onClick={() => onCopyPath(nasPath)}
          className="flex-shrink-0 ml-3 text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1"
        >
          {copiedPath === nasPath ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Scrollable File Preview Viewport */}
      <div className="p-4 sm:p-6 min-h-0 flex-1 overflow-y-auto bg-zinc-100/70 flex flex-col items-center custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-2 text-zinc-500 my-auto">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-xs font-medium">Rendering document preview...</span>
          </div>
        ) : (
          <>
            {/* 1. PDF PREVIEW */}
            {isPdf && (
              <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-zinc-200 p-6 sm:p-10 space-y-6 relative overflow-hidden my-2 flex-shrink-0">
                <div className="absolute top-10 right-8 border-2 border-red-300 text-red-500 font-serif font-black px-3 py-1.5 rounded-lg rotate-12 uppercase tracking-widest text-[11px] opacity-80 pointer-events-none select-none">
                  OFFICIALLY VERIFIED &bull; HKSAR
                </div>

                <div className="text-center border-b-2 border-zinc-800 pb-5">
                  <div className="flex justify-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-serif text-sm font-bold">
                      HK
                    </div>
                  </div>
                  <h1 className="text-xs sm:text-sm font-serif font-bold uppercase tracking-widest text-zinc-900">
                    The Government of the Hong Kong Special Administrative Region
                  </h1>
                  <h2 className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mt-0.5">
                    Transport Department &bull; Licensing & Operations Division
                  </h2>
                  <div className="mt-3 inline-block bg-zinc-100 px-3.5 py-1 rounded text-xs font-bold text-zinc-800 tracking-wide border border-zinc-300">
                    {previewData?.pdfData?.documentTitle || file.fileName.replace(/\.pdf$/i, '')}
                  </div>
                </div>

                <div className="flex flex-wrap justify-between items-center text-xs text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-200 gap-2">
                  <div>
                    <span className="text-zinc-400">CERTIFICATE NO:</span>{' '}
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

                <div>
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2.5">
                    Vehicle Registration Particulars
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs border border-zinc-200 rounded-lg p-3 bg-zinc-50/50">
                    {previewData?.pdfData?.particulars ? (
                      Object.entries(previewData.pdfData.particulars).map(([key, val]: any) => (
                        <div key={key} className="border-b border-zinc-200/60 pb-2">
                          <div className="text-[10px] text-zinc-500">{key}</div>
                          <div className="font-semibold text-zinc-900 mt-0.5">{String(val)}</div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="border-b border-zinc-200 pb-2">
                          <div className="text-[10px] text-zinc-500">Registration Mark</div>
                          <div className="font-bold text-zinc-900">AB1234</div>
                        </div>
                        <div className="border-b border-zinc-200 pb-2">
                          <div className="text-[10px] text-zinc-500">Chassis No (VIN)</div>
                          <div className="font-mono font-semibold text-zinc-900">VIN88291039821</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t border-zinc-200 pt-5 text-xs text-zinc-600 space-y-4">
                  <p className="leading-relaxed text-zinc-700 italic">
                    {previewData?.pdfData?.remarks || "Conforms with all vehicle statutory roadworthiness regulations."}
                  </p>
                  <div className="flex justify-between items-end pt-3">
                    <div className="w-16 h-16 bg-zinc-100 border border-zinc-300 rounded p-1 flex items-center justify-center font-mono text-[8px] text-zinc-400 text-center">
                      [ QR SIGNATURE ]
                    </div>
                    <div className="text-right">
                      <div className="font-serif italic text-zinc-700 text-sm">H.K. Wong (Authorized)</div>
                      <div className="border-t border-zinc-400 w-40 text-[10px] text-zinc-500 pt-0.5">
                        For Commissioner for Transport
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. DOCX PREVIEW */}
            {isDoc && (
              <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col my-2 flex-shrink-0">
                <div className="bg-zinc-100 border-b border-zinc-200 px-4 py-2 flex items-center justify-between text-xs text-zinc-600">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-blue-700">Word Document</span>
                    <span className="text-zinc-300">|</span>
                    <span className="font-mono text-zinc-500">Calibri &bull; 11 pt</span>
                  </div>
                  <span className="text-[11px] text-zinc-400">Page 1 of 1</span>
                </div>

                <div className="p-8 sm:p-10 space-y-5 text-zinc-800 leading-relaxed font-sans text-xs sm:text-sm">
                  <div className="border-b-2 border-blue-900 pb-3">
                    <div className="text-xs font-bold text-blue-900 tracking-wider uppercase">
                      {previewData?.docxData?.department || "Transport Department Fleet Operations Unit"}
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-zinc-900 mt-1">
                      {previewData?.docxData?.documentTitle || file.fileName.replace(/\.(docx|doc)$/i, '')}
                    </h2>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      Ref: <span className="font-mono font-medium text-zinc-700">{previewData?.docxData?.referenceNo || 'MEMO/HKTD/2024'}</span>
                    </div>
                  </div>

                  <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 text-xs space-y-1 text-zinc-700">
                    <div><strong>TO:</strong> {previewData?.docxData?.to || "All Authorized Fleet Personnel"}</div>
                    <div><strong>SUBJECT:</strong> {previewData?.docxData?.subject || file.fileName}</div>
                  </div>

                  {previewData?.docxData?.sections ? (
                    previewData.docxData.sections.map((sec: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <h4 className="font-bold text-blue-950 text-xs sm:text-sm">{sec.heading}</h4>
                        <p className="text-xs text-zinc-700 leading-relaxed">{sec.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-700">Administrative operational memorandum record for this asset.</p>
                  )}
                </div>
              </div>
            )}

            {/* 3. XLSX / CSV PREVIEW */}
            {isSheet && (
              <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col my-2 flex-shrink-0">
                <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sheet className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-emerald-800">{file.fileName}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    {previewData?.xlsxData?.sheets?.[activeSheet]?.rows?.length || 5} records
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-100 text-zinc-700 border-b border-zinc-200 font-semibold">
                        <th className="p-2 w-8 text-center bg-zinc-200/70 border-r border-zinc-300 font-mono text-[10px] text-zinc-500">#</th>
                        {previewData?.xlsxData?.sheets?.[activeSheet]?.columns?.map((col: string, idx: number) => (
                          <th key={idx} className="p-2 border-r border-zinc-200 last:border-r-0 whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 font-mono text-[11px]">
                      {previewData?.xlsxData?.sheets?.[activeSheet]?.rows?.map((row: string[], rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-emerald-50/40">
                          <td className="p-2 text-center bg-zinc-50 border-r border-zinc-200 text-zinc-400 text-[10px]">{rIdx + 1}</td>
                          {row.map((cell: string, cIdx: number) => (
                            <td key={cIdx} className="p-2 border-r border-zinc-200 last:border-r-0 text-zinc-800 whitespace-nowrap">
                              {cell === 'APPROVED' ? (
                                <span className="bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded text-[10px] font-bold">{cell}</span>
                              ) : cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-zinc-50 border-t border-zinc-200 p-2.5 flex items-center justify-between text-xs text-zinc-600">
                  <span className="font-bold text-emerald-800">{previewData?.xlsxData?.sheets?.[activeSheet]?.sheetName || "Data Records"}</span>
                  <span>Office NAS Synchronized</span>
                </div>
              </div>
            )}

            {/* 4. IMAGE PREVIEW */}
            {isImage && (
              <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col my-2 flex-shrink-0">
                <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-zinc-800">{file.fileName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setImageZoom(prev => Math.max(0.5, prev - 0.25))}
                      className="p-1 hover:bg-zinc-200 rounded text-zinc-600"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono text-zinc-600 px-1">{Math.round(imageZoom * 100)}%</span>
                    <button 
                      onClick={() => setImageZoom(prev => Math.min(2.5, prev + 0.25))}
                      className="p-1 hover:bg-zinc-200 rounded text-zinc-600"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-zinc-900/5 flex items-center justify-center min-h-[300px] overflow-auto">
                  {previewData?.imageData?.url ? (
                    <img 
                      src={previewData.imageData.url} 
                      alt={file.fileName}
                      style={{ transform: `scale(${imageZoom})`, transformOrigin: 'center center' }}
                      className="max-h-[420px] object-contain rounded shadow transition-transform duration-150"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm bg-white border border-zinc-200 rounded-xl shadow-xs">
                      <div className="p-3 bg-purple-50 text-purple-600 rounded-xl mb-2">
                        <ImageIcon className="w-10 h-10" />
                      </div>
                      <h4 className="text-xs font-bold text-zinc-800">{file.fileName}</h4>
                      <p className="text-[11px] text-zinc-500 mt-1">Resolution: 1920 &times; 1080 &bull; {file.fileSize || '2.1 MB'}</p>
                      <div className="mt-2.5 flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        <span>Synchronized with NAS Node</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. CODE / TEXT PREVIEW */}
            {isCodeOrText && (
              <div className="w-full max-w-3xl bg-zinc-950 rounded-xl shadow-md border border-zinc-800 overflow-hidden flex flex-col text-zinc-300 font-mono text-xs my-2 flex-shrink-0">
                <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="text-zinc-400 text-xs ml-2 font-medium">{file.fileName}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 uppercase">{ext}</span>
                </div>

                <div className="p-4 sm:p-5 overflow-x-auto leading-relaxed whitespace-pre font-mono text-[11px]">
                  {previewData?.txtData?.content || `// Content for ${file.fileName}\n// Archived in Office NAS repository`}
                </div>
              </div>
            )}

            {/* 6. GENERIC / BINARY / ARCHIVE PREVIEW */}
            {!isPdf && !isDoc && !isSheet && !isImage && !isCodeOrText && (
              <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-zinc-200 p-6 text-center flex flex-col items-center my-4 flex-shrink-0">
                <div className="p-4 bg-zinc-100 text-zinc-700 rounded-2xl mb-3 border border-zinc-200">
                  {getFormatIcon()}
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border mb-2 ${getFormatBadgeStyle()}`}>
                  .{ext} ASSET
                </span>

                <h4 className="text-sm font-bold text-zinc-900 mb-1">{file.fileName}</h4>
                <p className="text-xs text-zinc-500 mb-4">
                  Office NAS Document &bull; {file.fileSize || '2.5 MB'}
                </p>

                <div className="w-full text-left bg-zinc-50 rounded-lg border border-zinc-200 p-3 text-xs space-y-1.5 mb-4">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Folder:</span>
                    <span className="font-semibold text-zinc-800">{file.folder || 'General'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Date:</span>
                    <span className="font-semibold text-zinc-800">{new Date(file.uploadedAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => onCopyPath(nasPath)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy NAS Location</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-zinc-50 border-t border-zinc-200 text-[11px] text-zinc-500 flex items-center justify-between flex-shrink-0">
        <span>Scroll vertically to view entire document and signatures</span>
        <button
          onClick={() => onCopyPath(nasPath)}
          className="text-blue-600 hover:underline font-medium"
        >
          {copiedPath === nasPath ? 'Copied' : 'Copy NAS Path'}
        </button>
      </div>
    </div>
  );
};
