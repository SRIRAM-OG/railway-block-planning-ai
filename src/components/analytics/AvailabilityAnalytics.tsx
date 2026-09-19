import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { TrendingUp, BarChart2, ShieldCheck, Zap, Layers } from 'lucide-react';

export const AvailabilityAnalytics: React.FC = () => {
  const availabilityData = [
    { day: 'Mon', availability: 95.2, target: 95.0, downtime: 140 },
    { day: 'Tue', availability: 96.1, target: 95.0, downtime: 110 },
    { day: 'Wed', availability: 94.8, target: 95.0, downtime: 160 },
    { day: 'Thu', availability: 97.4, target: 95.0, downtime: 80 },
    { day: 'Fri', availability: 96.8, target: 95.0, downtime: 95 },
    { day: 'Sat', availability: 98.2, target: 95.0, downtime: 50 },
    { day: 'Sun', availability: 97.1, target: 95.0, downtime: 75 },
  ];

  const deptData = [
    { name: 'Engineering', blocks: 14, hours: 28 },
    { name: 'S&T Signals', blocks: 10, hours: 16 },
    { name: 'TRD Traction', blocks: 8, hours: 14 },
  ];

  const pieData = [
    { name: 'Utilized Block Hours', value: 58, color: '#3b82f6' },
    { name: 'Bundled Shadow Savings', value: 24, color: '#10b981' },
    { name: 'Idle / Buffer Slots', value: 18, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-emerald-400" />
          Operational Asset Availability & AI Efficiency Analytics
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Closed-loop performance metrics quantifying corridor uptime improvements and block utilization yields
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Asset Availability Trend Area Chart */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              7-Day Corridor Infrastructure Asset Availability Trend (%)
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
              Avg: 96.5% Uptime
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={availabilityData}>
                <defs>
                  <linearGradient id="availGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[90, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="availability" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#availGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Block Utilization Pie */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" />
            Block Time Yield Breakdown
          </h3>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {pieData.map(p => (
              <div key={p.name} className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                  {p.name}
                </span>
                <span className="font-mono font-bold text-white">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
