
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Clock, ClipboardList } from 'lucide-react';

const dataAvailability = [
  { name: 'Seg', availability: 92 },
  { name: 'Ter', availability: 88 },
  { name: 'Qua', availability: 95 },
  { name: 'Qui', availability: 85 },
  { name: 'Sex', availability: 91 },
  { name: 'Sab', availability: 96 },
  { name: 'Dom', availability: 98 },
];

const dataCost = [
  { name: 'Inj', cost: 4000 },
  { name: 'Imp', cost: 2400 },
  { name: 'Dec', cost: 2400 },
  { name: 'Ctr', cost: 1200 },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard title="Disponibilidade Global" value="92.4%" change="+2.1%" good icon="activity" />
        <KPICard title="MTBF (Médio)" value="142 h" change="-5.0%" good={false} icon="trend" />
        <KPICard title="MTTR (Médio)" value="45 min" change="-12%" good icon="clock" />
        <KPICard title="Backlog Manutenção" value="18 OS" change="+2" good={false} icon="list" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(16,185,129,0.1)] border border-slate-100 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Tendência de Disponibilidade</h3>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Últimos 7 dias</span>
          </div>
          <div className="flex-1 w-full min-h-0 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataAvailability}>
                <defs>
                  <linearGradient id="colorAvail" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4'}}
                />
                <Area type="monotone" dataKey="availability" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorAvail)" activeDot={{ r: 6, fill: '#047857', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(16,185,129,0.1)] border border-slate-100 flex flex-col h-[400px]">
           <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Custo por Setor (R$)</h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md">Mês Atual</span>
          </div>
           <div className="flex-1 w-full min-h-0 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataCost}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} />
                <Tooltip 
                  cursor={{fill: '#f0fdf4'}} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)', fontSize: '12px' }} 
                />
                <Bar dataKey="cost" name="Custo" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

const KPICard: React.FC<{ title: string, value: string, change: string, good: boolean, icon: string }> = ({ title, value, change, good, icon }) => {
  const Icon = {
    activity: Activity,
    trend: TrendingUp,
    clock: Clock,
    list: ClipboardList,
  }[icon] || Activity;

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 group">
      <div className="flex justify-between items-start">
        <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</h4>
        <div className={`p-1.5 rounded-full ${good ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'} transition-colors group-hover:bg-slate-100`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-3xl font-bold text-slate-800 tracking-tight">{value}</span>
        <div className={`flex items-center text-xs font-bold ${good ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'} px-2 py-0.5 rounded-full`}>
          {good ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
          {change}
        </div>
      </div>
    </div>
  );
};
