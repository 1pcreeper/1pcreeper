import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import VehicleService from '../services/VehicleService.ts';
import { FilePreviewModal } from '../components/explorer/FilePreviewModal.tsx';
import { InlineFilePreview } from '../components/explorer/InlineFilePreview.tsx';
import { NewFolderModal } from '../components/explorer/NewFolderModal.tsx';
import { NewFileModal } from '../components/explorer/NewFileModal.tsx';
import { DeleteConfirmModal } from '../components/explorer/DeleteConfirmModal.tsx';
import { 
  ArrowLeft, Folder, FolderOpen, FileText, Sheet, FileCode, 
  FolderPlus, FilePlus, Trash2, Copy, Check, ChevronRight, 
  ChevronDown, Search, HardDrive, RefreshCw, Eye, ExternalLink,
  Shield, Server, Car, Info, CornerDownRight, Image as ImageIcon,
  Archive, File
} from 'lucide-react';

interface FolderTreeNode {
  id: number;
  name: string;
  parent: string | null;
  children: FolderTreeNode[];
}

export function VehicleExplorer() {
  const { id } = useParams<{ id: string }>();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Explorer Navigation & Selection State
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Modals and dynamic preview state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isNewFileOpen, setIsNewFileOpen] = useState(false);
  const [folderModalParent, setFolderModalParent] = useState<string | null>(null);
  const [fileModalFolder, setFileModalFolder] = useState<string>('General');
  const [deleteItem, setDeleteItem] = useState<{ type: 'file' | 'folder'; id?: number; name: string } | null>(null);

  // Copy Path Notification state
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchExplorerData();
  }, [id]);

  const loadPreviewContent = async (fileId: number) => {
    try {
      setPreviewLoading(true);
      const res = await VehicleService.getInstance().getFileContent(fileId);
      setPreviewContent(res.data || res);
    } catch (err) {
      console.error("Failed to load file preview:", err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSelectFile = (file: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedFile(file);
    setSelectedFolder(file.folder || 'General');
    loadPreviewContent(file.id);
  };

  const fetchExplorerData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await VehicleService.getInstance().getVehicleExplorer(Number(id));
      const explorerData: any = res.data || res;
      setData(explorerData);

      // Auto-expand all folders initially
      if (explorerData.folders) {
        const initialExpanded: Record<string, boolean> = {};
        explorerData.folders.forEach((f: any) => {
          initialExpanded[f.name] = true;
        });
        setExpandedFolders(prev => ({ ...initialExpanded, ...prev }));
      }

      // Automatically select file for immediate right-pane preview
      if (explorerData.files && explorerData.files.length > 0) {
        const fileToSelect = selectedFile 
          ? explorerData.files.find((f: any) => f.id === selectedFile.id) || explorerData.files[0]
          : explorerData.files[0];
        
        setSelectedFile(fileToSelect);
        setSelectedFolder(fileToSelect.folder || 'General');
        loadPreviewContent(fileToSelect.id);
      }
    } catch (err: any) {
      console.error("Failed to load vehicle explorer:", err);
      setError(err.message || "Failed to load Office NAS file explorer");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setToastMessage(`Copied NAS Path: ${path}`);
    setTimeout(() => {
      setCopiedPath(null);
      setToastMessage(null);
    }, 3000);
  };

  const toggleFolderExpand = (folderName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const expandAllFolders = () => {
    if (!data?.folders) return;
    const allExp: Record<string, boolean> = {};
    data.folders.forEach((f: any) => {
      allExp[f.name] = true;
    });
    setExpandedFolders(allExp);
  };

  const collapseAllFolders = () => {
    setExpandedFolders({});
  };

  const handleOpenFilePreviewModal = async (file: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setSelectedFile(file);
      setIsPreviewOpen(true);
      if (!previewContent || selectedFile?.id !== file.id) {
        await loadPreviewContent(file.id);
      }
    } catch (err) {
      console.error("Failed to load file preview:", err);
    }
  };

  const handleCreateFolder = async (name: string, parent: string | null) => {
    await VehicleService.getInstance().createExplorerFolder(Number(id), name, parent);
    await fetchExplorerData();
    setSelectedFolder(name);
    setExpandedFolders(prev => ({ 
      ...prev, 
      [name]: true,
      ...(parent ? { [parent]: true } : {})
    }));
    setToastMessage(`Created folder "${name}"${parent ? ` inside "${parent}"` : ''}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateFile = async (fileData: { 
    fileName: string; 
    folder: string; 
    fileType: string; 
    content?: string; 
    fileSize?: string;
    fileUrl?: string;
  }) => {
    const res = await VehicleService.getInstance().createExplorerFile(Number(id), fileData);
    const newFile: any = res.data || res;
    await fetchExplorerData();
    setSelectedFolder(fileData.folder);
    setExpandedFolders(prev => ({ ...prev, [fileData.folder]: true }));
    if (newFile) {
      setSelectedFile(newFile);
      loadPreviewContent(newFile.id);
    }
    setToastMessage(`Saved file "${fileData.fileName}" to folder "${fileData.folder}"`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    try {
      await VehicleService.getInstance().deleteExplorerItem(Number(id), {
        type: deleteItem.type,
        id: deleteItem.id,
        folderName: deleteItem.name,
        name: deleteItem.name
      });
      if (deleteItem.type === 'folder') {
        if (selectedFolder === deleteItem.name) {
          setSelectedFolder(null);
        }
        if (selectedFile?.folder === deleteItem.name) {
          setSelectedFile(null);
          setPreviewContent(null);
        }
      }
      if (deleteItem.type === 'file' && selectedFile?.id === deleteItem.id) {
        setSelectedFile(null);
        setPreviewContent(null);
      }
      await fetchExplorerData();
      setToastMessage(`Deleted ${deleteItem.type}: "${deleteItem.name}"`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      setToastMessage(err.message || `Failed to delete ${deleteItem.type}`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Group files by folder name
  const filesByFolder = useMemo(() => {
    const map: Record<string, any[]> = {};
    if (data?.files) {
      data.files.forEach((file: any) => {
        const folder = file.folder || 'General';
        if (!map[folder]) map[folder] = [];
        if (!searchQuery.trim() || file.fileName.toLowerCase().includes(searchQuery.toLowerCase())) {
          map[folder].push(file);
        }
      });
    }
    return map;
  }, [data?.files, searchQuery]);

  // Build hierarchical folder tree (root folders & nested children)
  const folderTree = useMemo<FolderTreeNode[]>(() => {
    if (!data?.folders) return [];

    const folders = data.folders as any[];
    const nodeMap: Record<string, FolderTreeNode> = {};

    // Initialize nodes
    folders.forEach(f => {
      nodeMap[f.name] = {
        id: f.id,
        name: f.name,
        parent: f.parent || null,
        children: []
      };
    });

    const roots: FolderTreeNode[] = [];

    // Connect parents and children
    folders.forEach(f => {
      const node = nodeMap[f.name];
      if (f.parent && nodeMap[f.parent]) {
        nodeMap[f.parent].children.push(node);
      } else {
        roots.push(node);
      }
    });

    // If searching, keep nodes that match or have matching files/descendants
    if (!searchQuery.trim()) {
      return roots;
    }

    const q = searchQuery.toLowerCase();
    const filterTree = (nodes: FolderTreeNode[]): FolderTreeNode[] => {
      return nodes.reduce<FolderTreeNode[]>((acc, node) => {
        const selfMatch = node.name.toLowerCase().includes(q);
        const folderFiles = filesByFolder[node.name] || [];
        const fileMatch = folderFiles.length > 0;
        const matchingChildren = filterTree(node.children);

        if (selfMatch || fileMatch || matchingChildren.length > 0) {
          acc.push({
            ...node,
            children: matchingChildren
          });
        }
        return acc;
      }, []);
    };

    return filterTree(roots);
  }, [data?.folders, filesByFolder, searchQuery]);

  const currentNasPath = useMemo(() => {
    const base = data?.nasRoot || `\\\\HK-OFFICE-NAS\\TransportDept\\Vehicles\\${id}`;
    if (selectedFile) {
      return selectedFile.nasPath || `${base}\\${selectedFile.folder || 'General'}\\${selectedFile.fileName}`;
    }
    if (selectedFolder) {
      return `${base}\\${selectedFolder}`;
    }
    return base;
  }, [data?.nasRoot, id, selectedFolder, selectedFile]);

  const getFileIcon = (file: any) => {
    const ext = (file.fileType || file.fileName?.split('.').pop() || 'txt').toLowerCase();
    if (ext === 'pdf') return <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />;
    if (['docx', 'doc'].includes(ext)) return <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />;
    if (['xlsx', 'xls', 'csv'].includes(ext)) return <Sheet className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) return <ImageIcon className="w-4 h-4 text-purple-500 flex-shrink-0" />;
    if (['zip', 'rar', '7z', 'tar'].includes(ext)) return <Archive className="w-4 h-4 text-indigo-500 flex-shrink-0" />;
    if (['txt', 'log', 'json', 'xml', 'yaml'].includes(ext)) return <FileCode className="w-4 h-4 text-amber-500 flex-shrink-0" />;
    return <File className="w-4 h-4 text-zinc-500 flex-shrink-0" />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-zinc-600">Connecting to Office NAS repository...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl space-y-3">
          <h2 className="text-base font-bold">Failed to load Office NAS Explorer</h2>
          <p className="text-xs">{error || 'Vehicle record not found.'}</p>
          <Link
            to={`/vehicles/${id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-red-800 underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Vehicle Details
          </Link>
        </div>
      </div>
    );
  }

  const { vehicle } = data;

  // Open New Folder modal with specific parent
  const openNewFolderModal = (parentFolder: string | null = null, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFolderModalParent(parentFolder);
    setIsNewFolderOpen(true);
  };

  // Open New File modal in specific folder
  const openNewFileModal = (targetFolder: string = 'General', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFileModalFolder(targetFolder);
    setIsNewFileOpen(true);
  };

  // Recursive Tree Node Renderer for Nested Folders
  const renderFolderNode = (node: FolderTreeNode, depth: number = 0) => {
    const isExpanded = !!expandedFolders[node.name];
    const isFolderSelected = selectedFolder === node.name;
    const folderFiles = filesByFolder[node.name] || [];
    const hasChildren = node.children.length > 0 || folderFiles.length > 0;
    const paddingLeftClass = depth === 0 ? 'pl-2' : depth === 1 ? 'pl-6' : depth === 2 ? 'pl-10' : 'pl-14';

    return (
      <div key={node.id || node.name} className="space-y-0.5">
        {/* Folder Header Row */}
        <div 
          onClick={() => {
            setSelectedFolder(node.name);
            if (selectedFile && selectedFile.folder !== node.name) {
              setSelectedFile(null);
              setPreviewContent(null);
            }
          }}
          className={`group flex items-center justify-between pr-2 py-1.5 rounded-lg cursor-pointer transition-colors text-xs ${paddingLeftClass} ${
            isFolderSelected 
              ? 'bg-blue-100 text-blue-950 font-semibold ring-1 ring-blue-300' 
              : 'hover:bg-zinc-100 text-zinc-800'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Expand / Collapse Toggle Button */}
            <button
              type="button"
              onClick={(e) => toggleFolderExpand(node.name, e)}
              className="p-1 text-zinc-400 hover:text-zinc-700 rounded transition-colors flex-shrink-0"
              title={isExpanded ? 'Collapse folder' : 'Expand folder'}
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              )}
            </button>

            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-amber-500 flex-shrink-0" />
            )}

            <span className="truncate font-medium">{node.name}</span>
            {depth > 0 && (
              <span className="text-[10px] text-zinc-400 font-mono hidden group-hover:inline">
                (nested)
              </span>
            )}
          </div>

          {/* Quick Action Badges and Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-1">
            <span className="text-[10px] text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-100 font-mono" title={`${folderFiles.length} files`}>
              {folderFiles.length}
            </span>

            {/* Quick action: Create nested subfolder */}
            <button
              onClick={(e) => openNewFolderModal(node.name, e)}
              className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-blue-700 hover:bg-blue-50 rounded transition-all"
              title={`Create subfolder inside "${node.name}"`}
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>

            {/* Quick action: Upload / create file in this folder */}
            <button
              onClick={(e) => openNewFileModal(node.name, e)}
              className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-all"
              title={`Upload file to "${node.name}"`}
            >
              <FilePlus className="w-3.5 h-3.5" />
            </button>

            {/* Quick action: Copy folder path */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopyPath(`${data.nasRoot}\\${node.name}`);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-800 rounded transition-opacity"
              title="Copy folder NAS path"
            >
              <Copy className="w-3 h-3" />
            </button>

            {/* Quick action: Delete folder */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteItem({ type: 'folder', id: node.id, name: node.name });
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-700 hover:bg-red-50 rounded transition-all"
              title={`Delete folder "${node.name}" and all contents`}
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </button>
          </div>
        </div>

        {/* When Expanded: Render Child Folders & Contained Files */}
        {isExpanded && (
          <div className="space-y-0.5 border-l border-zinc-200 ml-4 pl-1">
            {/* 1. Recursively Render Nested Subfolders */}
            {node.children.map(childNode => renderFolderNode(childNode, depth + 1))}

            {/* 2. Render Files Inside this Folder */}
            {folderFiles.length > 0 ? (
              folderFiles.map((file: any) => {
                const isFileSelected = selectedFile?.id === file.id;
                const ext = (file.fileType || file.fileName?.split('.').pop() || 'txt').toUpperCase();

                return (
                  <div
                    key={file.id}
                    onClick={(e) => handleSelectFile(file, e)}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all text-xs ${
                      isFileSelected
                        ? 'bg-blue-600 text-white font-medium shadow-xs'
                        : 'hover:bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      <div className={isFileSelected ? 'text-white' : ''}>
                        {getFileIcon(file)}
                      </div>
                      <span className="truncate">{file.fileName}</span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                        isFileSelected 
                          ? 'bg-blue-700 text-blue-100' 
                          : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        {ext}
                      </span>

                      {/* Popout preview modal */}
                      <button
                        onClick={(e) => handleOpenFilePreviewModal(file, e)}
                        className={`p-1 rounded transition-opacity ${
                          isFileSelected
                            ? 'text-blue-100 hover:text-white'
                            : 'opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-blue-600'
                        }`}
                        title="Open preview popout"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>

                      {/* Copy file path */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyPath(file.nasPath);
                        }}
                        className={`p-1 rounded transition-opacity ${
                          isFileSelected
                            ? 'text-blue-100 hover:text-white'
                            : 'opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-800'
                        }`}
                        title="Copy file NAS path"
                      >
                        <Copy className="w-3 h-3" />
                      </button>

                      {/* Delete file */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteItem({ type: 'file', id: file.id, name: file.fileName });
                        }}
                        className={`p-1 rounded transition-opacity ${
                          isFileSelected
                            ? 'text-blue-100 hover:text-red-200'
                            : 'opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-600'
                        }`}
                        title="Delete file"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : node.children.length === 0 ? (
              <div className="py-1 px-3 text-[11px] text-zinc-400 italic flex items-center gap-1.5">
                <span>Empty directory</span>
                <span>&bull;</span>
                <button
                  onClick={(e) => openNewFolderModal(node.name, e)}
                  className="text-blue-600 hover:underline font-normal"
                >
                  + Subfolder
                </button>
                <span>&bull;</span>
                <button
                  onClick={(e) => openNewFileModal(node.name, e)}
                  className="text-emerald-600 hover:underline font-normal"
                >
                  + Upload
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-zinc-700 flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-medium truncate max-w-sm">{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Vehicle Summary Bar */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to={`/vehicles/${id}`}
              className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors border border-zinc-200 shadow-2xs"
              title="Return to Vehicle Record"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                  {vehicle.registrationMark}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {vehicle.make} {vehicle.model} ({vehicle.yearOfManufacture}) &bull; Chassis VIN: {vehicle.chassisNo}
              </p>
            </div>
          </div>

          {/* Quick NAS Root Info & Copy */}
          <div className="flex items-center gap-2 bg-zinc-50 p-2 rounded-lg border border-zinc-200 text-xs">
            <Server className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            <div className="truncate max-w-xs sm:max-w-md font-mono text-[11px] text-zinc-700">
              {currentNasPath}
            </div>
            <button
              onClick={() => handleCopyPath(currentNasPath)}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100 transition-colors shadow-2xs flex-shrink-0"
              title="Copy Office NAS Location"
            >
              {copiedPath === currentNasPath ? 'Copied!' : 'Copy Path'}
            </button>
          </div>
        </div>
      </div>

      {/* Content Bar: Search, New Folder, New File, Delete, Tree Expanders */}
      <div className="bg-white rounded-xl border border-zinc-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search folders or files in directory tree..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Content Bar Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Create Folder button (defaults to selectedFolder in tree view for nested creation) */}
          <button
            onClick={() => openNewFolderModal(selectedFolder)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-2xs"
            title={selectedFolder ? `Create subfolder inside "${selectedFolder}"` : 'Create folder at root'}
          >
            <FolderPlus className="w-3.5 h-3.5 text-blue-600" />
            <span>{selectedFolder ? 'New Subfolder' : 'New Folder'}</span>
          </button>

          {/* Create File button (allows any format) */}
          <button
            onClick={() => openNewFileModal(selectedFolder || 'General')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-2xs"
            title="Upload any file format"
          >
            <FilePlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>New File</span>
          </button>

          {/* Delete Action Buttons */}
          {selectedFolder && (
            <button
              onClick={() => {
                const fNode = data.folders?.find((f: any) => f.name === selectedFolder);
                setDeleteItem({ type: 'folder', id: fNode?.id, name: selectedFolder });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors shadow-2xs"
              title={`Delete folder "${selectedFolder}" and all its contents`}
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Delete Folder</span>
            </button>
          )}

          {selectedFile && (
            <button
              onClick={() => {
                setDeleteItem({ type: 'file', id: selectedFile.id, name: selectedFile.fileName });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors shadow-2xs"
              title={`Delete file "${selectedFile.fileName}"`}
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Delete File</span>
            </button>
          )}

          {!selectedFolder && !selectedFile && (
            <button
              disabled
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-400 bg-zinc-50 border border-zinc-200 opacity-60 rounded-lg cursor-not-allowed shadow-2xs"
              title="Select a folder or file to delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}

          {/* Copy Path for selected item */}
          <button
            onClick={() => handleCopyPath(currentNasPath)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-lg transition-colors shadow-2xs"
            title="Copy path of current selection"
          >
            <Copy className="w-3.5 h-3.5 text-zinc-600" />
            <span>Copy Path</span>
          </button>

          <div className="h-5 w-px bg-zinc-200 mx-1 hidden sm:block" />

          {/* Tree View Toggle Controls */}
          <button
            onClick={expandAllFolders}
            className="px-2 py-1.5 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAllFolders}
            className="px-2 py-1.5 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Main Explorer Workspace: Split View with Tree (Left) & File Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Side: Directory Tree View (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden flex flex-col h-[calc(100vh-270px)] min-h-[580px]">
          <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-zinc-600" />
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Directory Tree View</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-medium">
              <span>{data.folders?.length || 0} folders</span>
              <span>&bull;</span>
              <span>{data.files?.length || 0} files</span>
            </div>
          </div>

          <div className="p-3 overflow-y-auto flex-grow divide-y divide-zinc-100 space-y-1 custom-scrollbar">
            {/* Root Node */}
            <div 
              onClick={() => {
                setSelectedFolder(null);
              }}
              className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                selectedFolder === null 
                  ? 'bg-blue-50 text-blue-900 border border-blue-200 font-semibold' 
                  : 'hover:bg-zinc-50 text-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2 text-xs truncate">
                <Server className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="truncate">{data.nasRoot || `\\\\HK-OFFICE-NAS\\TransportDept\\Vehicles\\${id}`}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => openNewFolderModal(null, e)}
                  className="p-1 text-zinc-400 hover:text-blue-700 hover:bg-blue-100 rounded"
                  title="Create folder at root"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                  ROOT
                </span>
              </div>
            </div>

            {/* Hierarchical Nested Folders in Tree */}
            <div className="pt-2 space-y-1">
              {folderTree.length > 0 ? (
                folderTree.map((node) => renderFolderNode(node, 0))
              ) : (
                <div className="p-8 text-center text-zinc-400 text-xs">
                  {searchQuery ? 'No matching folders or files.' : 'No directories available.'}
                </div>
              )}
            </div>
          </div>

          {/* Directory Tree Footer Status */}
          <div className="p-2.5 bg-zinc-50 border-t border-zinc-200 text-[11px] text-zinc-500 flex items-center justify-between flex-shrink-0">
            <span>
              {selectedFolder ? (
                <>Active folder: <strong className="text-zinc-800">{selectedFolder}</strong></>
              ) : (
                'Root directory selected'
              )}
            </span>
            <button
              onClick={() => openNewFolderModal(selectedFolder)}
              className="text-blue-600 hover:underline font-semibold"
            >
              + Add Subfolder
            </button>
          </div>
        </div>

        {/* Right Side: File Preview (lg:col-span-7) with scrolling allowed */}
        <div className="lg:col-span-7 flex flex-col h-[calc(100vh-270px)] min-h-[580px]">
          <InlineFilePreview
            file={selectedFile}
            previewData={previewContent}
            loading={previewLoading}
            onCopyPath={handleCopyPath}
            copiedPath={copiedPath}
            onOpenModal={() => {
              if (selectedFile) setIsPreviewOpen(true);
            }}
          />
        </div>
      </div>

      {/* 1. Modal for Fullscreen File Preview Popout (Supports scrollable viewport and any format) */}
      {isPreviewOpen && selectedFile && (
        <FilePreviewModal
          file={selectedFile}
          previewData={previewContent}
          onClose={() => {
            setIsPreviewOpen(false);
          }}
          onCopyPath={handleCopyPath}
          copiedPath={copiedPath}
        />
      )}

      {/* 2. Modal for Creating Nested Folder */}
      <NewFolderModal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
        onSubmit={handleCreateFolder}
        existingFolders={data?.folders || []}
        defaultParent={folderModalParent ?? selectedFolder}
        vehicleReg={vehicle?.registrationMark}
        vehicleId={id || vehicle?.id}
        nasRoot={data?.nasRoot || `\\\\HK-OFFICE-NAS\\TransportDept\\Vehicles\\${id}`}
      />

      {/* 3. Modal for Uploading / Creating File of ANY format */}
      <NewFileModal
        isOpen={isNewFileOpen}
        onClose={() => setIsNewFileOpen(false)}
        onSubmit={handleCreateFile}
        existingFolders={data?.folders || []}
        currentFolder={fileModalFolder || selectedFolder || 'General'}
        vehicleReg={vehicle?.registrationMark}
        vehicleId={id || vehicle?.id}
        nasRoot={data?.nasRoot || `\\\\HK-OFFICE-NAS\\TransportDept\\Vehicles\\${id}`}
      />

      {/* 4. Modal for Confirming Delete */}
      <DeleteConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDeleteConfirm}
        item={deleteItem}
      />
    </div>
  );
}
