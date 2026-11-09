import React, { useState, useRef } from 'react';
import {
  Folder,
  Upload,
  Search,
  FileText,
  Download,
  Trash2,
  Edit2,
  Sparkles,
  Eye,
  X,
  Check,
  History,
} from 'lucide-react';
import { addFile, renameFile, deleteFile } from '../api/client';

interface FilesViewProps {
  files: any[];
  onRefresh: () => void;
}

export const FilesView: React.FC<FilesViewProps> = ({ files, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredFiles = files.filter(
    (f) =>
      !searchQuery ||
      f.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = (event.target?.result as string) || '';
      await addFile(file.name, file.type || 'text/plain', file.size, text);
      onRefresh();
    };
    reader.readAsText(file);
  };

  const handleRenameSubmit = async (id: string) => {
    if (!editName.trim()) return;
    await renameFile(id, editName.trim());
    setEditingId(null);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this file from persistent storage?')) {
      await deleteFile(id);
      if (selectedFile?.id === id) setSelectedFile(null);
      onRefresh();
    }
  };

  const handleDownload = (f: any) => {
    const blob = new Blob([f.extractedText || f.summary || 'Content'], { type: f.fileType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070D1C] overflow-hidden p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-amber-400" />
            File Manager & Document Intelligence
          </h1>
          <p className="text-xs text-slate-400">
            Persistent storage with full-text search, summarization & versioning
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".txt,.pdf,.csv,.json,.md"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative shrink-0">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search documents by name, content, or metadata..."
          className="w-full bg-[#0F172E] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto space-y-2.5">
        {filteredFiles.map((f) => (
          <div
            key={f.id}
            onClick={() => setSelectedFile(f)}
            className="p-3.5 rounded-2xl bg-[#0F172E] border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-blue-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                {editingId === f.id ? (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1"
                  >
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-slate-950 text-white px-2 py-0.5 rounded border border-blue-500 text-xs"
                      autoFocus
                    />
                    <button
                      onClick={() => handleRenameSubmit(f.id)}
                      className="p-1 text-emerald-400 hover:text-white"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <h3 className="font-semibold text-xs text-white truncate group-hover:text-blue-400 transition-colors">
                    {f.filename}
                  </h3>
                )}
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>{(f.fileSizeBytes / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>v{f.version || 1}</span>
                  <span>•</span>
                  <span>{new Date(f.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 shrink-0"
            >
              <button
                onClick={() => setSelectedFile(f)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="View & Summarize"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setEditingId(f.id);
                  setEditName(f.filename);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Rename File"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleDownload(f)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleDelete(f.id)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                title="Delete File"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* File Preview & Summarize Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0F172E] border border-blue-500/30 rounded-2xl p-5 shadow-2xl text-slate-100 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm text-white">{selectedFile.filename}</h3>
              </div>
              <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-3 flex-1 overflow-y-auto space-y-3">
              {/* Executive Summary */}
              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs">
                <span className="font-bold text-blue-400 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Executive Summary
                </span>
                <p className="text-slate-200 leading-relaxed">{selectedFile.summary}</p>
              </div>

              {/* Raw Content Viewer */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {selectedFile.extractedText || 'No text content available'}
              </div>

              {/* Version History */}
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider block">
                  Version History
                </span>
                <div className="flex justify-between text-slate-300">
                  <span>Version {selectedFile.version || 1} (Current)</span>
                  <span className="text-slate-500 font-mono">
                    {new Date(selectedFile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-mono">
                Storage: {selectedFile.storagePath}
              </span>
              <button
                onClick={() => handleDownload(selectedFile)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
