
import React, { useState } from 'react';
import { Hourglass, AlertOctagon, History, PenLine, Save, AlertTriangle, X, Box } from 'lucide-react';
import { ComponentLifespan, LifespanStatus } from '../types';

interface Props {
  items: ComponentLifespan[];
  onUpdateReading: (id: string, newHours: number) => void;
}

export const LifespanControl: React.FC<Props> = ({ items, onUpdateReading }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempReading, setTempReading] = useState<string>('');
  const [historyItem, setHistoryItem] = useState<ComponentLifespan | null>(null);

  const calculateStatus = (current: number, max: number): LifespanStatus => {
    const percentage = (current / max) * 100;
    if (percentage >= 100) return LifespanStatus.EXCEEDED;
    if (percentage >= 85) return LifespanStatus.CRITICAL;
    if (percentage >= 70) return LifespanStatus.WARNING;
    return LifespanStatus.OK;
  };

  const getStatusColor = (status: LifespanStatus) => {
    switch (status) {
      case LifespanStatus.OK: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case LifespanStatus.WARNING: return 'bg-amber-100 text-amber-800 border-amber-200';
      case LifespanStatus.CRITICAL: return 'bg-orange-100 text-orange-800 border-orange-200';
      case LifespanStatus.EXCEEDED: return 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse';
    }
  };

  const getProgressBarColor = (status: LifespanStatus) => {
    switch (status) {
        case LifespanStatus.OK: return 'bg-emerald-500';
        case LifespanStatus.WARNING: return 'bg-amber-500';
        case LifespanStatus.CRITICAL: return 'bg-orange-500';
        case LifespanStatus.EXCEEDED: return 'bg-rose-600';
    }
  };

  const startEditing = (item: ComponentLifespan) => {
    setEditingId(item.id);
    setTempReading(item.currentHours.toString());
  };

  const saveReading = (id: string) => {
    const val = parseFloat(tempReading);
    if (!isNaN(val)) {
      onUpdateReading(id, val);
    }
    setEditingId(null);
  };

  // Summary Stats
  const criticalCount = items.filter(i => calculateStatus(i.currentHours, i.maxLifeHours) === LifespanStatus.CRITICAL).length;
  const exceededCount = items.filter(i => calculateStatus(i.currentHours, i.maxLifeHours) === LifespanStatus.EXCEEDED).length;

  return (
    <>
      <div className="space-y-6 h-full flex flex-col">
        {/* Header & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 text-slate-600 rounded-xl"><Hourglass size={24} /></div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monitorados</h3>
                    <p className="text-3xl font-bold text-slate-800 tracking-tight">{items.length}</p>
                  </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><AlertTriangle size={24} /></div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Atenção (&gt;85%)</h3>
                    <p className="text-3xl font-bold text-orange-600 tracking-tight">{criticalCount}</p>
                  </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><AlertOctagon size={24} /></div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Excedidos (&gt;100%)</h3>
                    <p className="text-3xl font-bold text-rose-600 tracking-tight">{exceededCount}</p>
                  </div>
              </div>
            </div>
        </div>

        {/* Table List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-white">
            <h3 className="font-bold text-slate-800 text-lg">Status de Vida Útil</h3>
          </div>
          <div className="overflow-auto flex-1">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/80 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Componente / Máquina</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Leitura Atual</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-1/4">Desgaste (%)</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Vida Útil (Max)</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Restante</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Últ. Atualização</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Ação</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-50">
                {items.map((item) => {
                  const percentage = Math.min(100, (item.currentHours / item.maxLifeHours) * 100);
                  const status = calculateStatus(item.currentHours, item.maxLifeHours);
                  const remaining = item.maxLifeHours - item.currentHours;
                  const isCycle = item.unit === 'Ciclos';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="flex flex-col cursor-pointer p-1 -ml-1 group"
                          onClick={() => setHistoryItem(item)}
                          title="Clique para ver histórico de trocas"
                        >
                          <span className="text-sm font-bold text-emerald-700 group-hover:text-emerald-900 group-hover:underline decoration-emerald-300 underline-offset-2 transition-all">{item.component}</span>
                          <span className="text-xs text-slate-500 font-medium">{item.machine}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2.5 py-1 inline-flex text-[10px] leading-4 font-bold rounded-full border uppercase tracking-wide shadow-sm ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {editingId === item.id ? (
                            <input 
                              autoFocus
                              className="w-24 text-right border border-emerald-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white font-mono text-sm"
                              value={tempReading}
                              onChange={e => setTempReading(e.target.value)}
                              onBlur={() => saveReading(item.id)}
                              onKeyDown={e => e.key === 'Enter' && saveReading(item.id)}
                            />
                        ) : (
                            <div className="text-sm font-bold text-slate-700 font-mono">
                              {item.currentHours.toLocaleString('pt-BR')} 
                              <span className="text-slate-400 font-medium ml-1 text-xs">{isCycle ? 'cic' : 'h'}</span>
                            </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="w-full flex items-center gap-3">
                          <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(status)}`} 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-slate-600 w-12 text-right">{percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500 font-mono">
                        {item.maxLifeHours.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-sm font-bold font-mono ${remaining < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                          {remaining.toLocaleString('pt-BR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div className="flex items-center gap-1.5 font-medium">
                            <History size={14} className="text-slate-300"/> {item.lastReadingDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => startEditing(item)}
                          className="text-emerald-600 hover:text-white hover:bg-emerald-600 p-2 rounded-lg transition-colors shadow-sm"
                          title="Editar Leitura"
                        >
                          {editingId === item.id ? <Save size={16} /> : <PenLine size={16} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* History Modal */}
      {historyItem && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up border border-slate-100">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                      <h3 className="font-bold text-slate-800 text-lg">Histórico de Trocas</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2">
                        <Box size={12}/> {historyItem.component} <span className="text-slate-300">|</span> {historyItem.machine}
                      </p>
                  </div>
                  <button onClick={() => setHistoryItem(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={20} />
                  </button>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto p-6">
                  <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50">
                          <tr>
                              <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider rounded-l-lg">Data</th>
                              <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Leitura</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Motivo</th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider rounded-r-lg">Técnico</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                          {historyItem.history && historyItem.history.length > 0 ? (
                              historyItem.history.map((h, i) => (
                                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="px-6 py-4 text-sm text-slate-700 font-bold">{h.date}</td>
                                      <td className="px-6 py-4 text-sm text-slate-600 text-right font-mono">{h.readingAtExchange.toLocaleString('pt-BR')}</td>
                                      <td className="px-6 py-4 text-sm">
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${
                                              h.reason.toLowerCase().includes('preventiva') ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
                                              'bg-rose-50 border-rose-100 text-rose-700'
                                          }`}>
                                              {h.reason}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4 text-sm text-slate-600 font-medium flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                          {h.technician.charAt(0)}
                                        </div>
                                        {h.technician}
                                      </td>
                                  </tr>
                              ))
                          ) : (
                              <tr><td colSpan={4} className="p-12 text-center text-slate-400">Nenhum registro histórico encontrado.</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
              <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setHistoryItem(null)}
                  className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Fechar Histórico
                </button>
              </div>
          </div>
        </div>
      )}
    </>
  );
};