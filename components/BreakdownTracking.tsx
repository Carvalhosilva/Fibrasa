
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BreakdownAuditRecord, Sector } from '../types';
import { TrendingDown, Clock, AlertTriangle, Wrench, Plus, PenLine, Trash2, X, Save } from 'lucide-react';

interface Props {
  records: BreakdownAuditRecord[];
  onAddRecord: (record: BreakdownAuditRecord) => void;
  onEditRecord: (record: BreakdownAuditRecord) => void;
  onDeleteRecord: (code: string) => void;
}

const KPICard: React.FC<{ title: string; value: string | number; subtitle: string; icon: React.ElementType; color: string }> = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className={`text-3xl font-bold ${color} tracking-tight`}>{value}</p>
        <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('700', '50').replace('600', '50')} ${color}`}>
        <Icon size={24} />
      </div>
    </div>
);

// --- Form Modal for Adding/Editing Records ---
interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: BreakdownAuditRecord) => void;
  initialData?: BreakdownAuditRecord | null;
}

const RecordFormModal: React.FC<RecordFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<BreakdownAuditRecord>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {
        codigo: `QF-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        mes: new Date().toLocaleString('pt-BR', { month: 'long' }),
        setor: Sector.INJECTION,
        statusAQF: 'Pendente',
        aposSetup: 'Não',
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (field: keyof BreakdownAuditRecord, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as BreakdownAuditRecord);
  };
  
  const formFields: { key: keyof BreakdownAuditRecord, label: string, type: 'text' | 'number' | 'select', options?: any[] }[] = [
    { key: 'mes', label: 'mês', type: 'text' },
    { key: 'setor', label: 'setor', type: 'select', options: Object.values(Sector) },
    { key: 'maquina', label: 'máquina', type: 'text' },
    { key: 'motivo', label: 'motivo', type: 'text' },
    { key: 'inicio', label: 'início', type: 'text' },
    { key: 'fim', label: 'fim', type: 'text' },
    { key: 'duracaoMin', label: 'duração (min)', type: 'number' },
    { key: 'ss', label: 'ss', type: 'text' },
    { key: 'servicoSolicitado', label: 'serviço solicitado', type: 'text' },
    { key: 'servicoExecutado', label: 'serviço executado', type: 'text' },
    { key: 'conjunto', label: 'conjunto', type: 'text' },
    { key: 'executante', label: 'executante', type: 'text' },
    { key: 'aposSetup', label: 'após setup', type: 'select', options: ['Sim', 'Não'] },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">{initialData ? 'Editar Lançamento' : 'Adicionar Lançamento'}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formFields.map(f => (
              <div key={f.key} className={['servicoSolicitado', 'servicoExecutado'].includes(f.key) ? 'md:col-span-2' : ''}>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{f.label}</label>
                {f.type === 'select' ? (
                  <select
                    value={(formData as any)[f.key] || ''}
                    onChange={e => handleChange(f.key, e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 text-sm bg-white"
                  >
                    {f.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    required
                    value={(formData as any)[f.key] || ''}
                    onChange={e => handleChange(f.key, e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 text-sm"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4 gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg font-medium">Cancelar</button>
            <button type="submit" className="bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md flex items-center gap-2">
              <Save size={16}/> Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const BreakdownTracking: React.FC<Props> = ({ records, onAddRecord, onEditRecord, onDeleteRecord }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [recordToEdit, setRecordToEdit] = useState<BreakdownAuditRecord | null>(null);

    const handleOpenAdd = () => {
      setRecordToEdit(null);
      setIsModalOpen(true);
    };

    const handleOpenEdit = (record: BreakdownAuditRecord) => {
      setRecordToEdit(record);
      setIsModalOpen(true);
    };
    
    const handleDelete = (code: string) => {
        if (window.confirm('Tem certeza que deseja excluir este registro? A ação não pode ser desfeita.')) {
            onDeleteRecord(code);
        }
    };
    
    const handleSave = (record: BreakdownAuditRecord) => {
      if (recordToEdit) {
        onEditRecord(record);
      } else {
        onAddRecord(record);
      }
      setIsModalOpen(false);
    };
    
    // --- Data Processing for KPIs and Charts ---
    const currentMonthName = new Date().toLocaleString('pt-BR', { month: 'long' });
    const recordsThisMonth = records.filter(r => r.mes.toLowerCase() === currentMonthName.toLowerCase());
    const totalBreakdownsMonth = recordsThisMonth.length;
    
    // Calculation for Daily Average
    const daysInMonthPassed = new Date().getDate();
    const dailyAverageBreakdowns = daysInMonthPassed > 0 ? (totalBreakdownsMonth / daysInMonthPassed) : 0;
    
    const pendingAQF = records.filter(r => r.statusAQF === 'Pendente').length;
    
    const breakdownsBySector = records.reduce((acc, r) => {
        acc[r.setor] = (acc[r.setor] || 0) + 1;
        return acc;
    }, {} as Record<Sector, number>);
    const mostCriticalSector = Object.entries(breakdownsBySector).sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Chart 1: Quantidade de falha por equipamento (Top 5)
    const breakdownsByMachine = records.reduce((acc, r) => {
      acc[r.maquina] = (acc[r.maquina] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const machineChartData = Object.entries(breakdownsByMachine)
      .map(([name, count]) => ({ name: name.length > 20 ? name.substring(0, 18) + '...' : name, quantidade: count as number, fullName: name }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5); // Top 5

    // Chart 2: Quantidade de S.S por falha (Baseado em Serviço Executado)
    const ssByService = records.reduce((acc, r) => {
        const service = r.servicoExecutado || 'Não especificado';
        // Group by service description (truncated for chart key)
        const key = service.length > 25 ? service.substring(0, 25) + '...' : service;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const serviceChartData = Object.entries(ssByService)
      .map(([name, count]) => ({ name, quantidade: count as number }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5); // Top 5

    return (
        <div className="space-y-6 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Quebras no Mês" value={totalBreakdownsMonth} subtitle={`em ${currentMonthName}`} icon={TrendingDown} color="text-rose-600"/>
                <KPICard title="Média Diária de Quebra" value={dailyAverageBreakdowns.toFixed(1)} subtitle="no mês atual" icon={Clock} color="text-amber-600"/>
                <KPICard title="AQFs Pendentes" value={pendingAQF} subtitle="Análises de Causa Raiz" icon={AlertTriangle} color="text-slate-600"/>
                <KPICard title="Setor Mais Crítico" value={mostCriticalSector} subtitle="com mais ocorrências" icon={Wrench} color="text-indigo-600"/>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px] flex flex-col">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Top 5 Equipamentos com Mais Falhas</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={machineChartData} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9"/>
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                            <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px' }}/>
                            <Bar dataKey="quantidade" name="Falhas" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px] flex flex-col">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Top 5 Causas de SS</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={serviceChartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                            <XAxis dataKey="name" tick={{ fontSize: 10 }}/>
                            <YAxis/>
                            <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px' }}/>
                            <Bar dataKey="quantidade" name="SS" fill="#8b5cf6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Lançamentos de Quebra</h3>
                    <button onClick={handleOpenAdd} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700">
                       <Plus size={14}/> Adicionar Lançamento
                    </button>
                 </div>
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                            <th className="px-4 py-3 text-left">Máquina</th>
                            <th className="px-4 py-3 text-left">Duração (min)</th>
                            <th className="px-4 py-3 text-left">Motivo</th>
                            <th className="px-4 py-3 text-left">Data</th>
                            <th className="px-4 py-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {records.slice(0, 10).map(r => ( // Show last 10
                            <tr key={r.codigo} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 font-medium text-slate-700">{r.maquina}</td>
                                <td className="px-4 py-3 text-slate-600 font-mono text-center">{r.duracaoMin}</td>
                                <td className="px-4 py-3 text-slate-600">{r.motivo}</td>
                                <td className="px-4 py-3 text-slate-500 text-xs font-mono">{r.inicio.split(' ')[0]}</td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex gap-1 justify-center">
                                        <button type="button" onClick={() => handleOpenEdit(r)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><PenLine size={14}/></button>
                                        <button type="button" onClick={() => handleDelete(r.codigo)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"><Trash2 size={14}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <RecordFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={recordToEdit}
                />
            )}
        </div>
    );
};
