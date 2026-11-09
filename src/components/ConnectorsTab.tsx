import React from 'react';
import {
  Link2,
  Mail,
  Camera,
  CreditCard,
  Music,
  Heart,
  Car,
  CheckCircle,
  AlertCircle,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { ConnectorItem } from '../types';

interface ConnectorsTabProps {
  connectors: ConnectorItem[];
  onToggleConnect: (connectorId: string) => void;
}

export const ConnectorsTab: React.FC<ConnectorsTabProps> = ({
  connectors,
  onToggleConnect,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Mail':
        return <Mail className="w-5 h-5 text-red-400" />;
      case 'Camera':
        return <Camera className="w-5 h-5 text-pink-400" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5 text-emerald-400" />;
      case 'Music':
        return <Music className="w-5 h-5 text-green-400" />;
      case 'Heart':
        return <Heart className="w-5 h-5 text-rose-400" />;
      case 'Car':
        return <Car className="w-5 h-5 text-amber-400" />;
      default:
        return <Link2 className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0E14] text-slate-100 overflow-y-auto px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-400" />
            Connected Accounts
          </h2>
          <p className="text-xs text-slate-400">
            Secure integrations enabling autonomous background actions
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <Shield className="w-3.5 h-3.5" />
          <span>Meta Encrypted</span>
        </div>
      </div>

      {/* Connectors Grid */}
      <div className="space-y-3">
        {connectors.map((connector) => (
          <div
            key={connector.id}
            className="rounded-2xl bg-[#121724] border border-white/5 p-4 shadow-sm space-y-3 hover:border-blue-500/30 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
                  {getIcon(connector.icon)}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                    {connector.name}
                    {connector.connected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Category: <span className="capitalize">{connector.category}</span> • Sync: {connector.lastSync}
                  </span>
                </div>
              </div>

              {/* Toggle Connect Button */}
              <button
                onClick={() => onToggleConnect(connector.id)}
                aria-label={connector.connected ? `Disconnect ${connector.name}` : `Connect ${connector.name}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  connector.connected
                    ? 'bg-emerald-500/20 hover:bg-rose-500/20 text-emerald-400 hover:text-rose-400 border border-emerald-500/30 hover:border-rose-500/30'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                }`}
              >
                {connector.connected ? 'Connected' : 'Connect'}
              </button>
            </div>

            {/* Permissions Granted */}
            <div className="bg-[#0B0E14]/60 rounded-xl p-2.5 border border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Authorized Permissions
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {connector.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
