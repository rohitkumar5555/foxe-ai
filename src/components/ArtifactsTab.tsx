import React, { useState } from 'react';
import {
  FolderArchive,
  Search,
  FileText,
  FileSpreadsheet,
  FileCode,
  MapPin,
  Download,
  Copy,
  Check,
  X,
  Eye,
} from 'lucide-react';
import { ArtifactItem } from '../types';
import { filterArtifacts } from '../utils/agentEngine';

interface ArtifactsTabProps {
  artifacts: ArtifactItem[];
}

export const ArtifactsTab: React.FC<ArtifactsTabProps> = ({ artifacts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactItem | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = filterArtifacts(artifacts, searchQuery, activeCategory);

  const getCategoryIcon = (cat: ArtifactItem['category']) => {
    switch (cat) {
      case 'spreadsheet':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      case 'itinerary':
        return <MapPin className="w-5 h-5 text-blue-400" />;
      case 'summary':
        return <FileText className="w-5 h-5 text-amber-400" />;
      default:
        return <FileCode className="w-5 h-5 text-purple-400" />;
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0E14] text-slate-100 overflow-y-auto px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-purple-400" />
            Library & Artifacts
          </h2>
          <p className="text-xs text-slate-400">
            Files, spreadsheets & summaries compiled by Muse
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
          {artifacts.length} files
        </span>
      </div>

      {/* Search & Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents, spreadsheets, receipts..."
            className="w-full bg-[#121724] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          {['all', 'itinerary', 'spreadsheet', 'summary'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full capitalize whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Artifacts Grid */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No artifacts found matching your filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedArtifact(item)}
              className="rounded-2xl bg-[#121724] border border-white/5 p-3.5 hover:border-blue-500/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
                  {getCategoryIcon(item.category)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-xs text-white truncate group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{item.size}</span>
                    <span>•</span>
                    <span>{item.createdDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedArtifact(item);
                  }}
                  className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white"
                  title="View document"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Artifact Preview Modal */}
      {selectedArtifact && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#121724] border border-blue-500/30 rounded-2xl p-5 shadow-2xl text-slate-100 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                  {getCategoryIcon(selectedArtifact.category)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-white truncate">
                    {selectedArtifact.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">{selectedArtifact.size} • {selectedArtifact.createdDate}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedArtifact(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="my-4 flex-1 overflow-y-auto bg-[#0B0E14] rounded-xl p-4 font-mono text-xs text-slate-300 border border-white/5 whitespace-pre-wrap leading-relaxed">
              {selectedArtifact.content}
            </div>

            {/* Tags and Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <div className="flex items-center gap-1.5">
                {selectedArtifact.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-slate-400 border border-white/5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(selectedArtifact.content)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => alert(`Simulated download for: ${selectedArtifact.title}`)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
