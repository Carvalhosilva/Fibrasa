


import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Filter, Search, Plus, Calendar, AlertTriangle, 
  CheckCircle2, Clock, Package, MoreHorizontal, User, Tag, 
  Hammer, AlertOctagon, FileText, ChevronRight, Briefcase, 
  Truck, HardHat, Lock, ArrowRight, X
} from 'lucide-react';
import { 
  WorkOrder, OMStatus, OMPriority, OMType, OMCategory, 
  OMTask, OMMaterial, Sector 
} from '../types';

interface MaintenancePlanningProps {
  orders: WorkOrder[];
  onUpdateOrder: (id: string, updates: Partial<WorkOrder>) => void;
  onCreateOrder: (order: Partial<WorkOrder>) => void;
}

// --- Helper: Visual Mapping for Status ---
const getStatusDisplay = (status: OMStatus) => {
  switch (status) {
    case OMStatus.BACKLOG:
      return { label: 'Backlog', fullLabel: 'Aguardando Planej.', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Clock };
    case OMStatus.PLANNING:
      return { label: 'Planejando', fullLabel: 'Em Planejamento', color: 'bg-sky-50 text-sky-700 border-sky-200', icon: ClipboardList };
    case OMStatus.WAITING_MAT:
      return { label: 'Aguard. Mat.', fullLabel: 'Aguardando Material', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Package };
    case OMStatus.READY:
      return { label: 'Liberado', fullLabel: 'Liberado p/ Prog.', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
    case OMStatus.PROGRAMMED:
      return { label: 'Programado', fullLabel: 'Programado', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Calendar };
    case OMStatus.EXECUTING:
      return { label: 'Executando', fullLabel: 'Em Execução', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: HardHat };
    case OMStatus.FINISHED:
      return { label: 'Encerrado', fullLabel: 'Encerrado', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: CheckCircle2 };
    case OMStatus.CANCELED:
      return { label: 'Cancelado', fullLabel: 'Cancelado', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: X };
    default:
      return { label: 'Indefinido', fullLabel: status, color: 'bg-slate-50 text-slate-500 border-slate-200', icon: AlertTriangle };
  }
};

// --- KPI Card Component ---
const PlanningKPI: React.FC<{ label: string; value: number; color: string; icon: any }> = ({ label, value, color, icon: Icon }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
    <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('700', '50').replace('600', '50')} ${color}`}>
      <Icon size={20} />
    </div>
  </div>
);

// --- Detail Modal Component ---
interface DetailModalProps {
  order: WorkOrder;
  onClose: () => void;
  onSave: (id: string, updates: Partial<WorkOrder>) => void;
}

const OMDetailModal: React.FC<DetailModalProps> = ({ order, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'tarefas' | 'materiais' | 'seguranca'>('geral');
  const [formData, setFormData] = useState<WorkOrder>(order);
  const [isDirty, setIsDirty] = useState(false);

  // Form Handlers
  const handleInputChange = (field: keyof WorkOrder, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleTaskAdd = () => {
    const newTask: OMTask = {
      id: Date.now().toString(),
      sequence: (formData.tasks.length + 1) * 10,
      description: 'Nova tarefa...',
      durationMinutes: 60,
      peopleRequired: 1,
      specialty: 'Mecânico'
    };
    setFormData(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    setIsDirty(true);
  };

  const generateRQs = () => {
    // Mock RQ generation logic
    const updatedMaterials = formData.materials.map(m => 
      m.stockStatus !== 'Disponível' && m.requisitionStatus === 'Não Gerada'
        ? { ...m, requisitionStatus: 'Pendente Aprovação' as const, requisitionId: `RQ-${Math.floor(Math.random()*1000)}` }
        : m
    );
    setFormData(prev => ({ ...prev, materials: updatedMaterials }));
    setIsDirty(true);
    alert('Requisições de Compra geradas com sucesso!');
  };

  const validateAndRelease = () => {
    // Validation logic per standard
    if (formData.materials.some(m => m.stockStatus === 'Indisponível' && m.requisitionStatus !== 'Em Trânsito' && m.requisitionStatus !== 'Entregue')) {
      alert('Impossível Liberar: Existem materiais pendentes sem previsão de entrega.');
      return;
    }
    handleInputChange('status', OMStatus.READY);
    onSave(formData.id, { ...formData, status: OMStatus.READY });
    onClose();
  };

  const statusVisual = getStatusDisplay(formData.status);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-slate-800 text-white text-xs font-mono font-bold px-2 py-0.5 rounded">{formData.id}</span>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Solicitação: {formData.serviceRequestId}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">{formData.title}</h2>
          </div>
          <div className="flex items-center gap-3">
             <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 shadow-sm ${statusVisual.color}`}>
               <statusVisual.icon size={16} />
               {statusVisual.fullLabel}
             </span>
             <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
               <X size={20} />
             </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-2 border-b border-slate-100 bg-white flex gap-6 overflow-x-auto">
          {[
            { id: 'geral', label: 'Dados Gerais', icon: FileText },
            { id: 'tarefas', label: 'Tarefas e Recursos', icon: ClipboardList },
            { id: 'materiais', label: 'Materiais (RQs)', icon: Package },
            { id: 'seguranca', label: 'Segurança (LOTO)', icon: Lock },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 pb-3 pt-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'border-emerald-600 text-emerald-700' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'}
              `}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {/* TAB: GERAL */}
          {activeTab === 'geral' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Briefcase size={16} className="text-emerald-600"/> Classificação do Serviço
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Tipo de OM</label>
                      <select 
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                      >
                        {Object.values(OMType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Categoria</label>
                      <select 
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                      >
                        {Object.values(OMCategory).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Prioridade (Matriz)</label>
                      <select 
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        value={formData.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                      >
                        {Object.values(OMPriority).map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Centro de Trabalho</label>
                      <input 
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 font-medium text-slate-700 outline-none"
                        value={formData.workCenter}
                        onChange={(e) => handleInputChange('workCenter', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <FileText size={16} className="text-emerald-600"/> Detalhamento Técnico
                  </h3>
                  <textarea 
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 font-medium text-slate-700 outline-none min-h-[120px]"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-6">
                 <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <Calendar size={16} className="text-emerald-600"/> Datas Críticas
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Data Base (Início)</label>
                        <input type="date" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 outline-none" value={formData.baseDate ? formData.baseDate.split('/').reverse().join('-') : ''} readOnly />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Data Limite (SLA)</label>
                        <input type="date" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 outline-none" value={formData.limitDate ? formData.limitDate.split('/').reverse().join('-') : ''} readOnly />
                      </div>
                    </div>
                 </div>

                 <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100 shadow-sm">
                    <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide mb-2">Status do Planejamento</h3>
                    <p className="text-xs text-emerald-700 mb-4">Verifique todas as pendências antes de liberar.</p>
                    <ul className="space-y-2 text-sm">
                       <li className="flex items-center gap-2">
                          {formData.tasks.length > 0 ? <CheckCircle2 size={16} className="text-emerald-600"/> : <AlertTriangle size={16} className="text-amber-500"/>}
                          <span className="text-slate-700">Tarefas definidas</span>
                       </li>
                       <li className="flex items-center gap-2">
                          {formData.materials.every(m => m.stockStatus === 'Disponível' || m.requisitionStatus !== 'Não Gerada') ? <CheckCircle2 size={16} className="text-emerald-600"/> : <AlertTriangle size={16} className="text-amber-500"/>}
                          <span className="text-slate-700">Materiais equacionados</span>
                       </li>
                       <li className="flex items-center gap-2">
                          {formData.safety.lotoRequired ? <CheckCircle2 size={16} className="text-emerald-600"/> : <CheckCircle2 size={16} className="text-slate-400"/>}
                          <span className="text-slate-700">Análise de Risco (LOTO)</span>
                       </li>
                    </ul>
                 </div>
              </div>
            </div>
          )}

          {/* TAB: TAREFAS */}
          {activeTab === 'tarefas' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 border-r border-slate-100 w-16 text-center">Seq.</th>
                    <th className="px-6 py-3 border-r border-slate-100">Descrição da Operação</th>
                    <th className="px-6 py-3 border-r border-slate-100 w-32">Especialidade</th>
                    <th className="px-6 py-3 border-r border-slate-100 w-24 text-center">Pessoas</th>
                    <th className="px-6 py-3 w-24 text-center">Duração (min)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {formData.tasks.map((task, idx) => (
                     <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-6 py-3 text-center font-mono text-slate-400">{task.sequence}</td>
                       <td className="px-6 py-3 font-medium text-slate-700">{task.description}</td>
                       <td className="px-6 py-3">
                         <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 text-xs font-bold">{task.specialty}</span>
                       </td>
                       <td className="px-6 py-3 text-center">{task.peopleRequired}</td>
                       <td className="px-6 py-3 text-center font-mono">{task.durationMinutes}</td>
                     </tr>
                   ))}
                   <tr>
                     <td colSpan={5} className="px-6 py-3 bg-slate-50/50">
                        <button onClick={handleTaskAdd} className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wide hover:text-emerald-800 transition-colors">
                          <Plus size={16} /> Adicionar Tarefa
                        </button>
                     </td>
                   </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: MATERIAIS */}
          {activeTab === 'materiais' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3 border-r border-slate-100 w-24">Código</th>
                      <th className="px-6 py-3 border-r border-slate-100">Descrição do Material</th>
                      <th className="px-6 py-3 border-r border-slate-100 w-24 text-center">Qtd.</th>
                      <th className="px-6 py-3 border-r border-slate-100 w-32">Estoque</th>
                      <th className="px-6 py-3">Status RQ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {formData.materials.map(mat => (
                      <tr key={mat.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 font-mono text-slate-500 text-xs">{mat.code}</td>
                        <td className="px-6 py-3 font-medium text-slate-700">{mat.description}</td>
                        <td className="px-6 py-3 text-center">{mat.quantity} {mat.unit}</td>
                        <td className="px-6 py-3">
                           <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                              mat.stockStatus === 'Disponível' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                           }`}>
                             {mat.stockStatus}
                           </span>
                        </td>
                        <td className="px-6 py-3">
                           {mat.requisitionId ? (
                              <div className="flex flex-col">
                                <span className="font-mono text-xs font-bold text-slate-600">{mat.requisitionId}</span>
                                <span className="text-[10px] text-slate-400">{mat.requisitionStatus}</span>
                              </div>
                           ) : (
                              <span className="text-slate-300 italic text-xs">N/A</span>
                           )}
                        </td>
                      </tr>
                    ))}
                    {formData.materials.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-400">Nenhum material previsto.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {formData.materials.some(m => m.stockStatus !== 'Disponível' && m.requisitionStatus === 'Não Gerada') && (
                 <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <AlertTriangle className="text-amber-600" size={24} />
                       <div>
                         <p className="font-bold text-amber-800 text-sm">Materiais Indisponíveis</p>
                         <p className="text-xs text-amber-700">É necessário gerar Requisição de Compra (RQ) para os itens faltantes.</p>
                       </div>
                    </div>
                    <button 
                      onClick={generateRQs}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide shadow-sm transition-colors"
                    >
                      Gerar RQs em Lote
                    </button>
                 </div>
              )}
            </div>
          )}

           {/* TAB: SEGURANÇA */}
           {activeTab === 'seguranca' && (
             <div className="grid grid-cols-2 gap-6 animate-fade-in">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                   <h3 className="text-sm font-bold text-rose-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                     <Lock size={16} /> Bloqueio e Etiquetagem (LOTO)
                   </h3>
                   <div className="flex items-center gap-4 mb-6">
                      <div className={`p-4 rounded-lg border flex-1 text-center cursor-pointer transition-all ${formData.safety.lotoRequired ? 'bg-rose-50 border-rose-200 shadow-sm ring-1 ring-rose-200' : 'bg-slate-50 border-slate-200 opacity-50'}`} onClick={() => handleInputChange('safety', {...formData.safety, lotoRequired: true})}>
                         <p className="font-bold text-rose-700">NECESSÁRIO</p>
                         <p className="text-xs text-rose-500">Bloqueio de Energias</p>
                      </div>
                      <div className={`p-4 rounded-lg border flex-1 text-center cursor-pointer transition-all ${!formData.safety.lotoRequired ? 'bg-emerald-50 border-emerald-200 shadow-sm ring-1 ring-emerald-200' : 'bg-slate-50 border-slate-200 opacity-50'}`} onClick={() => handleInputChange('safety', {...formData.safety, lotoRequired: false})}>
                         <p className="font-bold text-emerald-700">NÃO APLICÁVEL</p>
                         <p className="text-xs text-emerald-500">Serviço sem energias perigosas</p>
                      </div>
                   </div>
                   
                   {formData.safety.lotoRequired && (
                     <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase">Pontos de Bloqueio Identificados</label>
                        {formData.safety.lotoPoints?.map((pt, i) => (
                           <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100 text-sm font-medium text-slate-700">
                              <Lock size={12} className="text-rose-500" /> {pt}
                           </div>
                        ))}
                     </div>
                   )}
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                   <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                     <FileText size={16} /> Permissões de Trabalho (PT)
                   </h3>
                   <div className="space-y-2">
                      {['Trabalho em Altura', 'Espaço Confinado', 'Trabalho a Quente', 'Elétrica (NR10)'].map(perm => {
                         const isActive = formData.safety.permitsRequired.includes(perm);
                         return (
                           <div key={perm} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded transition-colors">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${isActive ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                                 {isActive && <CheckCircle2 size={10} />}
                              </div>
                              <span className={`text-sm ${isActive ? 'font-bold text-slate-800' : 'text-slate-500'}`}>{perm}</span>
                           </div>
                         );
                      })}
                   </div>
                </div>
             </div>
           )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
           <div className="text-xs text-slate-400 font-medium">
             {isDirty ? 'Alterações não salvas' : 'Todas as alterações salvas'}
           </div>
           <div className="flex gap-3">
              <button 
                onClick={() => onSave(formData.id, formData)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Salvar Rascunho
              </button>
              <button 
                onClick={validateAndRelease}
                className="px-6 py-2.5 bg-emerald-700 text-white text-sm font-bold rounded-lg hover:bg-emerald-800 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                Liberar para Programação <ArrowRight size={16}/>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};


// --- Main Component ---
export const MaintenancePlanning: React.FC<MaintenancePlanningProps> = ({ orders, onUpdateOrder }) => {
  const [filterPriority, setFilterPriority] = useState<string>('Todos');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [filterSearch, setFilterSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  // Derived State
  const filteredOrders = orders.filter(o => {
     if (filterPriority !== 'Todos' && !o.priority.startsWith(filterPriority)) return false;
     if (filterStatus !== 'Todos' && o.status !== filterStatus) return false;
     if (filterSearch && !o.title.toLowerCase().includes(filterSearch.toLowerCase()) && !o.id.toLowerCase().includes(filterSearch.toLowerCase())) return false;
     return true;
  });

  const kpiBacklog = orders.filter(o => o.status === OMStatus.BACKLOG || o.status === OMStatus.PLANNING).length;
  const kpiPriorityA = orders.filter(o => o.priority.startsWith('A')).length;
  const kpiWaitingMat = orders.filter(o => o.status === OMStatus.WAITING_MAT).length;
  const kpiReady = orders.filter(o => o.status === OMStatus.READY).length;

  const handleSaveDetail = (id: string, updates: Partial<WorkOrder>) => {
    onUpdateOrder(id, updates);
    setSelectedOrder(null);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header & KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <PlanningKPI label="Total em Backlog" value={kpiBacklog} color="text-slate-700" icon={ClipboardList} />
         <PlanningKPI label="Prioridade A (Urgente)" value={kpiPriorityA} color="text-rose-600" icon={AlertOctagon} />
         <PlanningKPI label="Aguardando Material" value={kpiWaitingMat} color="text-amber-600" icon={Package} />
         <PlanningKPI label="Pronto p/ Programar" value={kpiReady} color="text-emerald-600" icon={Calendar} />
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
         <div className="flex gap-4 w-full md:w-auto overflow-x-auto">
            <div className="relative">
               <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <select 
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
               >
                  <option value="Todos">Todas Prioridades</option>
                  <option value="A">Prioridade A</option>
                  <option value="B">Prioridade B</option>
                  <option value="C">Prioridade C</option>
                  <option value="Z">Carteira Z</option>
               </select>
            </div>
            <select 
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
            >
                <option value="Todos">Todos Status</option>
                {Object.values(OMStatus).map(s => <option key={s} value={s}>{getStatusDisplay(s).label}</option>)}
            </select>
         </div>

         <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
               className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
               placeholder="Buscar por OM, Título ou Nota..."
               value={filterSearch}
               onChange={(e) => setFilterSearch(e.target.value)}
            />
         </div>
      </div>

      {/* Planning List (Table) */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
         <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-slate-100">
               <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10">
                  <tr>
                     <th className="px-5 py-3 text-left w-28">OM / Nota</th>
                     <th className="px-5 py-3 text-left">Descrição do Serviço</th>
                     <th className="px-5 py-3 text-center w-24">Prioridade</th>
                     <th className="px-5 py-3 text-left w-36">Status</th>
                     <th className="px-5 py-3 text-left w-32">Tipo/Categ.</th>
                     <th className="px-5 py-3 text-left w-28">Data Base</th>
                     <th className="px-5 py-3 text-center w-24">Ações</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 bg-white">
                  {filteredOrders.length === 0 ? (
                     <tr><td colSpan={7} className="p-12 text-center text-slate-400 font-medium">Nenhuma Ordem de Manutenção encontrada no filtro.</td></tr>
                  ) : (
                     filteredOrders.map(om => {
                        const statusVisual = getStatusDisplay(om.status);
                        return (
                           <tr key={om.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => setSelectedOrder(om)}>
                              <td className="px-5 py-4">
                                 <div className="font-bold text-slate-700 text-xs">{om.id}</div>
                                 <div className="text-[10px] text-slate-400 font-mono mt-0.5">{om.serviceRequestId}</div>
                              </td>
                              <td className="px-5 py-4">
                                 <div className="font-bold text-sm text-slate-800">{om.title}</div>
                                 <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-slate-500 flex items-center gap-1"><Tag size={10} /> {om.machineName}</span>
                                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200">{om.workCenter}</span>
                                 </div>
                              </td>
                              <td className="px-5 py-4 text-center">
                                 <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border ${
                                    om.priority.startsWith('A') ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                    om.priority.startsWith('B') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    om.priority.startsWith('C') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    'bg-slate-50 text-slate-600 border-slate-200'
                                 }`}>
                                    {om.priority.charAt(0)}
                                 </span>
                              </td>
                              <td className="px-5 py-4 whitespace-nowrap">
                                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border shadow-sm ${statusVisual.color}`}>
                                    <statusVisual.icon size={12} />
                                    {statusVisual.label}
                                 </span>
                              </td>
                              <td className="px-5 py-4">
                                 <div className="text-xs font-medium text-slate-600">{om.type.split(' - ')[0]}</div>
                                 <div className="text-[10px] text-slate-400">{om.category.split(' - ')[0]}</div>
                              </td>
                              <td className="px-5 py-4 text-xs font-mono text-slate-600">
                                 {om.baseDate}
                              </td>
                              <td className="px-5 py-4 text-center">
                                 <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                    <MoreHorizontal size={18} />
                                 </button>
                              </td>
                           </tr>
                        );
                     })
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {selectedOrder && (
        <OMDetailModal 
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSave={handleSaveDetail}
        />
      )}
    </div>
  );
};