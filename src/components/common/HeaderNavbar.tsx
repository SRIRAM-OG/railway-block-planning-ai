import React from 'react';
import aiLogo from '../../assets/ai_platform_logo.jpg';
import { 
  Train, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  FileText, 
  Bot, 
  UserCheck, 
  Clock, 
  BarChart2, 
  AlertTriangle,
  Calendar,
  Sparkles
} from 'lucide-react';
import { ViewTab, UserRole, CorridorInfo } from '../../types';

interface HeaderNavbarProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  selectedCorridor: CorridorInfo;
  corridors: CorridorInfo[];
  setSelectedCorridor: (corridor: CorridorInfo) => void;
  activeConflictsCount: number;
  onOpenArchitectureModal: () => void;
  onOpenGeminiAssistant: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  selectedCorridor,
  corridors,
  setSelectedCorridor,
  activeConflictsCount,
  onOpenArchitectureModal,
  onOpenGeminiAssistant,
}) => {
  const [timeStr, setTimeStr] = React.useState<string>('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { tab: ViewTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'COMMAND_CENTER', label: 'Command Center', icon: <Train className="w-4 h-4" /> },
    { tab: 'CORRIDOR_GANTT', label: '24h Corridor Timeline', icon: <Layers className="w-4 h-4" /> },
    { tab: 'INGESTION_STREAM', label: 'TMS / SMMS Feed', icon: <BarChart2 className="w-4 h-4" /> },
    { tab: 'PRIORITY_AI', label: 'AI Priority Engine', icon: <Cpu className="w-4 h-4" /> },
    { tab: 'MULTI_DEPT_BUNDLE', label: 'Multi-Dept Co-Scheduling', icon: <ShieldCheck className="w-4 h-4" /> },
    { tab: 'WEEKLY_PLANNER', label: 'Weekly Planner', icon: <Calendar className="w-4 h-4" /> },
    { tab: 'ANALYTICS', label: 'Availability & KPIs', icon: <BarChart2 className="w-4 h-4" /> },
    { tab: 'APPROVAL_LEDGER', label: 'E-Sign Ledger', icon: <UserCheck className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Division */}
        <div className="flex items-center space-x-3">
          <div className="rounded-lg shadow-md overflow-hidden border border-blue-400/30 w-10 h-10 flex-shrink-0">
            <img src={aiLogo} alt="AI Platform" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                AI PLATFORM
              </h1>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE SIMULATOR
              </span>
            </div>
            <p className="text-xs text-slate-400">
              AI-Powered Automatic Block Planning • Operational Availability Engine
            </p>
          </div>
        </div>

        {/* Corridor Selector & Clock */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Corridor Selection */}
          <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-md border border-slate-700">
            <span className="text-slate-400 font-medium">Corridor:</span>
            <select
              value={selectedCorridor.id}
              onChange={(e) => {
                const found = corridors.find(c => c.id === e.target.value);
                if (found) setSelectedCorridor(found);
              }}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              {corridors.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                  {c.code} ({c.name})
                </option>
              ))}
            </select>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-md border border-slate-700">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 font-medium">Role:</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as UserRole)}
              className="bg-transparent text-indigo-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="SECTION_CONTROLLER" className="bg-slate-900 text-slate-200">Section Controller</option>
              <option value="DIVISIONAL_APPROVER" className="bg-slate-900 text-slate-200">Divisional Approver</option>
              <option value="ENGINEERING_PLANNER" className="bg-slate-900 text-slate-200">Engineering Planner</option>
              <option value="ST_PLANNER" className="bg-slate-900 text-slate-200">S&T Planner</option>
              <option value="TRD_PLANNER" className="bg-slate-900 text-slate-200">Traction Planner</option>
            </select>
          </div>

          {/* Operational Clock */}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800 font-mono text-amber-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{timeStr || '21:54:00 IST'}</span>
          </div>

          {/* Quick Action Buttons */}
          <button
            onClick={onOpenGeminiAssistant}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded-md font-medium transition-all shadow-md text-xs border border-purple-400/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </button>

          <button
            onClick={onOpenArchitectureModal}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md font-medium border border-slate-700 transition-all text-xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>PDR Specs & Docs</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex items-center space-x-1 overflow-x-auto border-t border-slate-800/80 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-medium whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-slate-800/60 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <span className={isActive ? 'text-blue-400' : 'text-slate-500'}>{item.icon}</span>
              <span>{item.label}</span>
              {item.tab === 'COMMAND_CENTER' && activeConflictsCount > 0 && (
                <span className="ml-1 bg-rose-500/20 text-rose-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-rose-500/40 animate-pulse flex items-center gap-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {activeConflictsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
