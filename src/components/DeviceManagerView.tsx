import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Layers,
  Shield,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { toggleDeviceAutomation } from '../api/client';

interface DeviceManagerViewProps {
  devices: any[];
  onRefresh: () => void;
}

export const DeviceManagerView: React.FC<DeviceManagerViewProps> = ({
  devices,
  onRefresh,
}) => {
  const [selectedDevice, setSelectedDevice] = useState<any | null>(devices[0] || null);

  const handleToggle = async (deviceId: string) => {
    await toggleDeviceAutomation(deviceId);
    onRefresh();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070D1C] overflow-hidden p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-400" />
            Device Manager & Mobile WorkManager
          </h1>
          <p className="text-xs text-slate-400">
            Native Android (Intents & WorkManager) and iOS (App Intents & BackgroundTasks)
          </p>
        </div>

        <button
          onClick={() => alert('New Device Enrollment: Scan QR code from mobile companion app to register device.')}
          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Connect Device</span>
        </button>
      </div>

      {/* Device Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((dev) => (
          <div
            key={dev.id}
            onClick={() => setSelectedDevice(dev)}
            className={`p-4 rounded-2xl bg-[#0F172E] border cursor-pointer transition-all space-y-3 ${
              selectedDevice?.id === dev.id
                ? 'border-blue-500/60 ring-1 ring-blue-500/40'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-blue-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    {dev.deviceName}
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {dev.osVersion} • Heartbeat: {dev.lastHeartbeat}
                  </span>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  dev.automationEnabled
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {dev.automationEnabled ? 'Automation ON' : 'Automation OFF'}
              </span>
            </div>

            {/* Architecture Details */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {dev.platform === 'android' ? 'Android Architecture' : 'iOS Architecture'}
              </span>
              <p className="text-[11px]">
                {dev.platform === 'android'
                  ? 'Permitted Intents, Notification Listener Service, WorkManager background executor.'
                  : 'App Intents, Siri Shortcuts runtime, Share Extensions & official BackgroundTasks API.'}
              </p>
            </div>

            {/* Toggle Automation Button */}
            <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs">
              <span className="text-slate-400 text-[11px]">
                {dev.availableApps?.length || 0} Queryable Apps
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(dev.id);
                }}
                className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors ${
                  dev.automationEnabled
                    ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                }`}
              >
                {dev.automationEnabled ? 'Disable Automation' : 'Enable Automation'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Device Available Apps & Intent Inspector */}
      {selectedDevice && (
        <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-[#0F172E] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider">
              Queryable Apps on {selectedDevice.deviceName}
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Strict sandbox permissions enforced
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {selectedDevice.availableApps?.map((app: any, idx: number) => (
              <div
                key={idx}
                className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between gap-2"
              >
                <div>
                  <h4 className="font-semibold text-white">{app.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    Package: {app.packageName}
                  </span>
                  <span className="text-[10px] text-blue-400 font-mono block">
                    Intent: {app.intentAction}
                  </span>
                </div>

                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                  PERMITTED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
