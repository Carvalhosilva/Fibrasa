
import React, { useState } from 'react';
import { CalendarClock, Filter, ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertTriangle, XCircle, MinusCircle, Search } from 'lucide-react';
import { PreventiveTask, PreventiveStatus, Month, Sector } from '../types';

interface Props {
  tasks: PreventiveTask[];
  onUpdateStatus: (taskId: string, month: Month, status: PreventiveStatus) => void;
}

const MONTHS: Month[] = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const PreventiveSchedule: React.FC<Props> = ({ tasks, onUpdateStatus }) => {
  const [sectorFilter, setSectorFilter] = useState<Sector | 'Todos'>('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = tasks.filter(t => {
    const matchesSector = sectorFilter === 'Todos' || t.sector === sectorFilter;
    const matchesSearch = t.machine.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.task.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSector && matchesSearch;
  });

  const getStatusIcon = (status: PreventiveStatus) => {
    switch (status) {
      case PreventiveStatus.DONE: return <CheckCircle2 size={18} className="text-emerald-600" />;
      case PreventiveStatus.PROGRAMMED: return <Clock size={18} className="text-sky-500" />;
      case PreventiveStatus.LATE: return <AlertTriangle size={18} className="text-rose-500" />;
      case PreventiveStatus.RESCHEDULED: return <ChevronRight size={18} className="text-amber-500" />;
      default: return <MinusCircle size={14} className="text-slate-200" />;
    }
  };

  const getStatusColor = (status: PreventiveStatus) => {
    switch (status) {
      case PreventiveStatus.DONE: return 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200';
      case PreventiveStatus.PROGRAMMED: return 'bg-sky-50 hover:bg-sky-100 border-sky-200';
      case PreventiveStatus.LATE: return 'bg-rose-50 hover:bg-rose-100 border-rose-200';
      case PreventiveStatus.RESCHEDULED: return 'bg-amber-50 hover:bg-amber-100 border-amber-200';
      case PreventiveStatus.NA: return 'bg-slate-50 opacity-40';
      default: return '';
    }
  };

  const handleCycleStatus = (task: PreventiveTask, month: Month) => {
    const current = task.schedule[month];
    const order = [
      PreventiveStatus.NA,
      PreventiveStatus.PROGRAMMED,
      PreventiveStatus.DONE,
      PreventiveStatus.LATE,
      PreventiveStatus.RESCHEDULED
    ];
    const nextIndex = (order.indexOf(current) + 1) % order.length;
    onUpdateStatus(task.id, month, order[nextIndex]);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-slate-200 gap-4">
        <div className="flex items-center gap-3 text-slate-700">
           <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
             <CalendarClock size={24} />
           </div>
           <div>
             <h2 className="font-bold text-lg leading-tight">Plano Mestre de Manutenção</h2>
             <p className="text-xs text-slate-400 font-medium">Cronograma anual de preventivas</p>
           </div>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
           <div className="relative flex-1 md:flex-none">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               placeholder="Buscar máquina ou tarefa..."
               className="pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-full md:w-72 bg-slate-50 hover:bg-white transition-all"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
           
           <select 
              className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white text-slate-700 font-medium cursor-pointer"
              value={sectorFilter}
              onChange={e => setSectorFilter(e.target.value as any)}
           >
              <option value="Todos">Todos os Setores</option>
              {Object.values(Sector).map(s => <option key={s} value={s}>{s}</option>)}
           </select>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
         <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-slate-100">
               <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                     <th className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[240px] border-r border-slate-100">Equipamento / Tarefa</th>
                     {MONTHS.map(m => (
                        <th key={m} className="px-2 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider w-[70px] border-r border-slate-50 last:border-0">{m}</th>
                     ))}
                  </tr>
               </thead>
               <tbody className="bg-white divide-y divide-slate-50">
                  {filteredTasks.length === 0 ? (
                     <tr>
                        <td colSpan={13} className="px-6 py-12 text-center text-slate-400 flex flex-col items-center justify-center w-full">
                           <CalendarClock size={40} className="opacity-20 mb-3" />
                           <span className="font-medium">Nenhuma preventiva encontrada.</span>
                        </td>
                     </tr>
                  ) : (
                     filteredTasks.map(task => (
                        <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-5 py-4 border-r border-slate-100">
                              <div className="font-bold text-sm text-slate-700">{task.machine}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{task.task}</div>
                              <div className="flex gap-2 mt-2">
                                 <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200 font-bold uppercase">{task.frequency}</span>
                                 <span className="text-[10px] bg-emerald-50 px-2 py-0.5 rounded text-emerald-700 border border-emerald-100 font-bold uppercase">{task.sector}</span>
                              </div>
                           </td>
                           {MONTHS.map(m => (
                              <td key={m} className="p-1.5 text-center border-r border-slate-50 last:border-0 align-middle">
                                 <button
                                    onClick={() => handleCycleStatus(task, m)}
                                    className={`
                                       w-full h-12 rounded-lg flex items-center justify-center transition-all border
                                       ${getStatusColor(task.schedule[m])}
                                    `}
                                    title={`${m}: ${task.schedule[m]} (Clique para alterar)`}
                                 >
                                    {getStatusIcon(task.schedule[m])}
                                 </button>
                              </td>
                           ))}
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
         <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-6 text-xs font-bold text-slate-500 justify-center uppercase tracking-wide">
             <div className="flex items-center gap-2"><Clock size={16} className="text-sky-500"/> Programado</div>
             <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600"/> Realizado</div>
             <div className="flex items-center gap-2"><AlertTriangle size={16} className="text-rose-500"/> Atrasado</div>
             <div className="flex items-center gap-2"><ChevronRight size={16} className="text-amber-500"/> Reprogramado</div>
             <div className="flex items-center gap-2"><MinusCircle size={16} className="text-slate-300"/> N/A</div>
         </div>
      </div>
    </div>
  );
};