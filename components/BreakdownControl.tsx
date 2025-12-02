import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, Plus, PenLine, Trash2, X, Save, Search, 
  Printer, Edit3, RotateCcw, Check, Settings
} from 'lucide-react';
import { BreakdownAuditRecord, AQFResult, Sector, ActionPlanItem, WhyPath, EnvolvidoAnalise, Aprovacao } from '../types';
import { analyzeBreakdown } from '../services/geminiService';

// --- Modal Form for New/Edit Breakdown Record ---
interface BreakdownFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: BreakdownAuditRecord) => void;
  initialData?: BreakdownAuditRecord;
}

const BreakdownFormModal: React.FC<BreakdownFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<BreakdownAuditRecord>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {
        codigo: `QF-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        mes: new Date().toLocaleString('pt-BR', { month: 'long' }),
        setor: Sector.INJECTION,
        maquina: '',
        motivo: 'Mecânica',
        inicio: '',
        fim: '',
        duracaoMin: 0,
        ss: '',
        servicoSolicitado: '',
        servicoExecutado: '',
        conjunto: '',
        executante: '',
        aposSetup: 'Não',
        statusAQF: 'Pendente'
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
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg">
            {initialData ? 'Editar Registro de Quebra' : 'Novo Registro de Quebra'}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
             <div className="md:col-span-3 pb-2 border-b border-slate-100 mb-2">
                <h4 className="text-xs font-bold text-emerald-700 uppercase">Identificação da Ocorrência</h4>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código</label>
                <input required value={formData.codigo} onChange={e => handleChange('codigo', e.target.value)} className="w-full border border-slate-200 rounded p-2 text-sm bg-slate-50 font-mono" />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mês Ref.</label>
                <input required value={formData.mes} onChange={e => handleChange('mes', e.target.value)} className="w-full border border-slate-200 rounded p-2 text-sm" />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Solicitação (SS)</label>
                <input required value={formData.ss} onChange={e => handleChange('ss', e.target.value)} className="w-full border border-slate-200 rounded p-2 text-sm" />
             </div>
             <div className="md:col-span-3 pb-2 border-b border-slate-100 mb-2 mt-2">
                <h4 className="text-xs font-bold text-emerald-700 uppercase">Localização e Equipamento</h4>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Setor</label>
                <select value={formData.setor} onChange={e => handleChange('setor', e.target.value)} className="w-full border border-slate-200 rounded p-2 text-sm bg-white">
                   {Object.values(Sector).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
             <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Máquina</label>
                <input required value={formData.maquina} onChange={e => handleChange('maquina', e.target.value)} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="Nome do Equipamento" />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Conjunto</label>
                <input required value={formData.conjunto} onChange={e => handleChange('conjunto', e.target.value)} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="Ex: Unidade Hidráulica" />
             </div>
             <div className="md:col-span-3 pb-2 border-b border-slate-100 mb-2 mt-2">
                <h4 className="text-xs font-bold text-emerald-700 uppercase">Tempos e Classificação</h4>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data/Hora Início</label>
                <input required value={formData.inicio} onChange={e => handleChange('inicio', e.target.value)} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="DD/MM/AAAA HH:MM" />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data/Hora Fim</label>
                <input required value={formData.fim} onChange={e => handleChange('fim', e.target.value)} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="DD/MM/AAAA HH:MM" />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duração (min)</label>
                <input type="number" required value={formData.duracaoMin} onChange={e => handleChange('duracaoMin', parseInt(e.target.value))} className="w-full border border-slate-200 rounded p-2 text-sm bg-slate-50 font-bold text-slate-700" />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Motivo Macro</label>
                <select value={formData.motivo} onChange={e => handleChange('motivo', e.target.value)} className="w-full border border-slate-200 rounded p-2 text-sm bg-white">
                   <option value="Mecânica">Mecânica</option>
                   <option value="Elétrica">Elétrica</option>
                   <option value="Operacional">Operacional</option>
                </select>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Após Setup?</label>
                <select value={formData.aposSetup} onChange={e => handleChange('aposSetup', e.target.value)} className="w-full border border-slate-200 rounded p-2 text-sm bg-white">
                   <option value="Não">Não</option>
                   <option value="Sim">Sim</option>
                </select>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Executante</label>
                <input required value={formData.executante} onChange={e => handleChange('executante', e.target.value)} className="w-full border border-slate-200 rounded p-2 text-sm" />
             </div>
             <div className="md:col-span-3 pb-2 border-b border-slate-100 mb-2 mt-2">
                <h4 className="text-xs font-bold text-emerald-700 uppercase">Detalhamento Técnico</h4>
             </div>
             <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Serviço Solicitado (Sintoma)</label>
                <textarea rows={2} required value={formData.servicoSolicitado} onChange={e => handleChange('servicoSolicitado', e.target.value)} className="w-full border border-slate-200 rounded p-2 text-sm" />
             </div>
             <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Serviço Executado (Ação)</label>
                <textarea rows={2} required value={formData.servicoExecutado} onChange={e => handleChange('servicoExecutado', e.target.value)} className="w-full border border-slate-200 rounded p-2 text-sm" />
             </div>
          </div>
          <div className="flex justify-end pt-6 gap-3">
             <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Cancelar
             </button>
             <button type="submit" className="px-6 py-2.5 bg-emerald-700 text-white text-sm font-bold rounded-lg hover:bg-emerald-800 shadow-lg flex items-center gap-2">
                <Save size={18} /> Salvar Registro
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Component ---
export const BreakdownControl: React.FC<{
  records: BreakdownAuditRecord[];
  onUpdateRecord: (code: string, analysis: AQFResult) => void;
  onAddRecord: (record: BreakdownAuditRecord) => void;
  onEditRecord: (record: BreakdownAuditRecord) => void;
  onDeleteRecord: (code: string) => void;
}> = ({ records, onUpdateRecord, onAddRecord, onEditRecord, onDeleteRecord }) => {

  const [selectedRecord, setSelectedRecord] = useState<BreakdownAuditRecord | null>(records[1] || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [contextInput, setContextInput] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editableRecord, setEditableRecord] = useState<BreakdownAuditRecord | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<BreakdownAuditRecord | undefined>(undefined);
  
  const [filterSearch, setFilterSearch] = useState('');

  useEffect(() => {
    if (selectedRecord) {
      const recordWithDefaults = {
        ...selectedRecord,
        envolvidos: selectedRecord.envolvidos || [],
        aprovacoes: selectedRecord.aprovacoes || { dataEncerramento: '', responsavelManutencao: '', gestorManutencao: '', confiabilidade: '' },
        aiAnalysis: selectedRecord.aiAnalysis
      };
      setEditableRecord(JSON.parse(JSON.stringify(recordWithDefaults)));
    } else {
      setEditableRecord(null);
    }
    setIsEditing(false);
  }, [selectedRecord]);
  

  const filteredRecords = records.filter(r => 
    r.maquina.toLowerCase().includes(filterSearch.toLowerCase()) || 
    r.codigo.toLowerCase().includes(filterSearch.toLowerCase())
  );

  const handleAnalyze = async () => {
    if (!selectedRecord) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeBreakdown(
        selectedRecord.maquina,
        selectedRecord.servicoSolicitado + ". Ação executada: " + selectedRecord.servicoExecutado,
        `Contexto adicional: ${contextInput}. Motivo Macro: ${selectedRecord.motivo}. Duração: ${selectedRecord.duracaoMin}min.`
      );
      onUpdateRecord(selectedRecord.codigo, result);
      const updatedRecord = { ...selectedRecord, aiAnalysis: result, statusAQF: 'Concluída' as const };
      setSelectedRecord(updatedRecord);
    } catch (e) {
       alert("Erro na análise IA. Verifique o console para mais detalhes.");
       console.error(e);
    } finally {
       setIsAnalyzing(false);
    }
  };

  const handleOpenAdd = () => {
    setRecordToEdit(undefined);
    setIsModalOpen(true);
  };
  
  const handleOpenEdit = (e: React.MouseEvent, record: BreakdownAuditRecord) => {
    e.stopPropagation();
    setRecordToEdit(record);
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    if(confirm('Tem certeza que deseja excluir este registro? A ação não pode ser desfeita.')) {
      onDeleteRecord(code);
      if(selectedRecord?.codigo === code) {
        setSelectedRecord(null);
      }
    }
  };

  const handleSaveForm = (record: BreakdownAuditRecord) => {
    if (recordToEdit) {
      onEditRecord(record);
    } else {
      onAddRecord(record);
    }
  };

  const handleSaveEdits = () => {
    if (editableRecord) {
      onEditRecord(editableRecord);
      setSelectedRecord(editableRecord);
      setIsEditing(false);
    }
  };
  
  const EditableField: React.FC<{
    value: string;
    onChange: (value: string) => void;
    isEditing: boolean;
    multiline?: boolean;
    className?: string;
  }> = ({ value, onChange, isEditing, multiline = false, className = '' }) => {
    if (isEditing) {
      const commonClasses = "w-full h-full bg-amber-50/50 resize-none outline-none p-1 ring-1 ring-amber-300 focus:ring-2 focus:ring-amber-500 rounded-sm";
      return multiline ? (
        <textarea className={`${commonClasses} ${className}`} value={value} onChange={e => onChange(e.target.value)} />
      ) : (
        <input className={`${commonClasses} ${className}`} value={value} onChange={e => onChange(e.target.value)} />
      );
    }
    return <div className={`p-1 ${className}`}>{value || <span className="text-slate-300">...</span>}</div>;
  };
  
  // --- Safe State Update Helpers ---
  const updateEditableRecord = (updater: (prev: BreakdownAuditRecord) => BreakdownAuditRecord) => {
    setEditableRecord(prev => prev ? updater(prev) : null);
  };
  
  // FIX: This generic function is unsafe as it can be called with keys pointing to primitive values,
  // causing a runtime error on object spread. Since it's only used for 'aprovacoes',
  // it is replaced by a specific and type-safe handler 'handleAprovacoesChange'.
  const handleAprovacoesChange = (
    key: keyof Aprovacao,
    value: string
  ) => {
    updateEditableRecord(prev => ({
      ...prev,
      aprovacoes: {
        ...(prev.aprovacoes || {}),
        [key]: value,
      },
    }));
  };

  const handleAnalysisChange = <K extends keyof AQFResult, L extends keyof AQFResult[K]>(
    key1: K,
    key2: L,
    value: any
  ) => {
    updateEditableRecord(p => ({
        ...p,
        aiAnalysis: {
            ...(p.aiAnalysis as AQFResult),
            [key1]: {
                ...(p.aiAnalysis?.[key1] as object),
                [key2]: value
            }
        }
    }));
  };
  
  const addEnvolvido = () => {
    updateEditableRecord(p => ({
        ...p,
        envolvidos: [...(p.envolvidos || []), { matricula: '', nome: '', cargo: '', area: '' }]
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)] animate-fade-in">
      <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
         <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-3">
            <h3 className="font-bold text-slate-800">Registros de Quebra</h3>
             <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input 
                   className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full"
                   placeholder="Buscar por máquina ou código..."
                   value={filterSearch}
                   onChange={e => setFilterSearch(e.target.value)}
                />
             </div>
         </div>
         <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {filteredRecords.map(r => (
               <div 
                  key={r.codigo}
                  onClick={() => setSelectedRecord(r)}
                  className={`p-3 rounded-lg border-l-4 cursor-pointer transition-all group flex flex-col gap-1 ${
                     selectedRecord?.codigo === r.codigo 
                     ? 'bg-purple-50 border-purple-500 shadow-sm' 
                     : 'bg-white border-transparent hover:border-purple-300 hover:bg-slate-50'
                  }`}
               >
                  <div className="flex justify-between items-start">
                     <span className="font-bold text-slate-700 text-xs line-clamp-2 leading-tight flex-1 mr-2">{r.maquina}</span>
                     <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${r.statusAQF === 'Concluída' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {r.statusAQF}
                     </span>
                  </div>
                  
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{r.servicoSolicitado}</p>

                  <div className="flex justify-between items-end mt-2 pt-2 border-t border-slate-200/50 border-dashed">
                      <span className="text-[10px] text-slate-400 font-mono">{r.codigo}</span>
                      <div className="flex gap-1">
                          <button 
                            type="button"
                            onClick={(e) => handleOpenEdit(e, r)} 
                            className="text-slate-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded transition-colors" 
                            title="Editar Registro"
                          >
                            <PenLine size={14}/>
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => handleDelete(e, r.codigo)} 
                            className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded transition-colors" 
                            title="Excluir Registro"
                          >
                            <Trash2 size={14}/>
                          </button>
                      </div>
                  </div>
               </div>
            ))}
         </div>
         <div className="p-2 border-t border-slate-100">
            <button onClick={handleOpenAdd} className="w-full bg-emerald-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2">
               <Plus size={16}/> Novo Registro
            </button>
         </div>
      </div>

      <div className="lg:col-span-9 bg-slate-200/70 rounded-xl border border-slate-300 shadow-sm flex flex-col overflow-hidden">
         {!selectedRecord ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
               <Settings size={48} className="opacity-20 mb-2 animate-spin-slow" />
               <p className="font-medium">Selecione um registro para visualizar o formulário.</p>
            </div>
         ) : (
            <>
               <div className="p-2 bg-white/80 backdrop-blur-sm border-b border-slate-300 flex justify-between items-center sticky top-0 z-20 shadow-sm">
                  <h2 className="font-bold text-slate-700 text-sm">Formulário de Análise de Quebra e Falha - {selectedRecord.codigo}</h2>
                  <div className="flex gap-2 items-center">
                     {!selectedRecord.aiAnalysis && (
                        <button onClick={handleAnalyze} disabled={isAnalyzing} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-purple-700 shadow-sm">
                           {isAnalyzing ? 'Gerando...' : <><BrainCircuit size={14}/> Gerar Análise IA</>}
                        </button>
                     )}
                     {editableRecord?.aiAnalysis && (
                        <>
                          {isEditing ? (
                            <>
                              <button type="button" onClick={() => setIsEditing(false)} className="bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200">
                                <RotateCcw size={14}/> Cancelar
                              </button>
                              <button type="button" onClick={handleSaveEdits} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 shadow-sm">
                                <Check size={14}/> Salvar Edição
                              </button>
                            </>
                          ) : (
                            <button type="button" onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 shadow-sm">
                              <Edit3 size={14}/> Editar Análise
                            </button>
                          )}
                          <button className="text-slate-500 hover:text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg bg-white text-xs font-bold flex items-center gap-1.5">
                             <Printer size={14}/> PDF
                          </button>
                        </>
                     )}
                  </div>
               </div>
               <div className="overflow-auto flex-1 p-4 md:p-6 custom-scrollbar">
                  {editableRecord ? (
                     <div className="bg-white border-2 border-slate-400 max-w-[210mm] mx-auto shadow-lg text-[10px] font-sans text-slate-800">
                        {/* Headers */}
                        <div className="bg-[#70ad47] text-white text-center font-bold text-lg py-1 border-b-2 border-slate-500">ANÁLISE DE QUEBRA E FALHA - SEMAN</div>
                        <div className="bg-[#a9d08e] text-center font-bold border-b border-slate-400 py-0.5 text-xs">DADOS DA FALHA</div>

                        {/* Dados da Falha Grid */}
                        <div className="grid grid-cols-12 border-b border-slate-400">
                           <div className="col-span-2 p-1 font-bold bg-slate-100 border-r border-slate-400">Área:</div>
                           <div className="col-span-4 p-1 border-r border-slate-400">{selectedRecord.setor}</div>
                           <div className="col-span-2 p-1 font-bold bg-slate-100 border-r border-slate-400">Máquina:</div>
                           <div className="col-span-4 p-1">{selectedRecord.maquina}</div>
                        </div>
                        <div className="grid grid-cols-12 border-b border-slate-400">
                           <div className="col-span-2 p-1 font-bold bg-slate-100 border-r border-slate-400">Conjunto:</div>
                           <div className="col-span-4 p-1 border-r border-slate-400">{selectedRecord.conjunto}</div>
                           <div className="col-span-2 p-1 font-bold bg-slate-100 border-r border-slate-400">SS:</div>
                           <div className="col-span-4 p-1">{selectedRecord.ss}</div>
                        </div>
                        <div className="grid grid-cols-5 border-b border-slate-400 text-center font-bold bg-slate-100">
                           <div className="p-1 border-r border-slate-400">Data e Hora Início PDW</div>
                           <div className="p-1 border-r border-slate-400">Data e Hora Fim PDW</div>
                           <div className="p-1 border-r border-slate-400">Duração</div>
                           <div className="p-1 border-r border-slate-400">Hora de abertura SS:</div>
                           <div className="p-1">Desvio:</div>
                        </div>
                        <div className="grid grid-cols-5 border-b border-slate-400 text-center">
                           <div className="p-1 border-r border-slate-400">{selectedRecord.inicio}</div>
                           <div className="p-1 border-r border-slate-400">{selectedRecord.fim}</div>
                           <div className="p-1 border-r border-slate-400 font-bold">{selectedRecord.duracaoMin} min</div>
                           <div className="p-1 border-r border-slate-400">{selectedRecord.inicio?.split(' ')[1]}</div>
                           <div className="p-1">N/A</div>
                        </div>

                        {/* Descrições */}
                        <div className="grid grid-cols-[150px_1fr] border-b border-slate-400 min-h-[40px]">
                           <div className="p-1 font-bold bg-slate-100 border-r border-slate-400">Serviço Solicitação:</div>
                           <div className="p-1">{selectedRecord.servicoSolicitado}</div>
                        </div>
                        <div className="grid grid-cols-[150px_1fr] border-b border-slate-400 min-h-[60px]">
                           <div className="p-1 font-bold bg-slate-100 border-r border-slate-400">Ação imediata:</div>
                           <div className="p-1">{selectedRecord.servicoExecutado}</div>
                        </div>
                        <div className="grid grid-cols-[150px_1fr] border-b border-slate-400">
                           <div className="p-1 font-bold bg-slate-100 border-r border-slate-400">Técnico:</div>
                           <div className="p-1">{selectedRecord.executante}</div>
                        </div>
                        <div className="grid grid-cols-[150px_1fr] border-b border-slate-400">
                           <div className="p-1 font-bold bg-slate-100 border-r border-slate-400">Motivo do atendimento:</div>
                           <div className="p-1">{selectedRecord.motivo}</div>
                        </div>
                        
                        {/* Ocorrências */}
                        <div className="bg-[#a9d08e] text-center font-bold border-b border-slate-400 py-0.5 text-xs">OCORRÊNCIAS</div>
                        <div className="grid grid-cols-[250px_1fr] border-b border-slate-400"><div className="p-1 font-bold bg-slate-100 border-r border-slate-400">Foi encontrado o componente no almoxarifado?</div><div className="p-1">SIM</div></div>
                        <div className="grid grid-cols-[250px_1fr] border-b border-slate-400"><div className="p-1 font-bold bg-slate-100 border-r border-slate-400">Algum motivo para atraso?</div><div className="p-1">NÃO</div></div>

                        {editableRecord.aiAnalysis && (
                          <>
                            {/* Causa e Efeito */}
                            <div className="bg-[#a9d08e] text-center font-bold border-b border-slate-400 py-0.5 text-xs">CAUSAS E EFEITO</div>
                            <div className="grid grid-cols-[100px_1fr] border-b border-slate-400 min-h-[40px]">
                              <div className="p-1 font-bold bg-[#c6e0b4] border-r border-slate-400 flex items-center justify-center">Efeito:</div>
                              <div className="p-1 font-bold flex items-center">{selectedRecord.servicoSolicitado}</div>
                            </div>
                            <div className="grid grid-cols-4 border-b border-slate-400 text-center font-bold bg-slate-100">
                              <div className="p-1 border-r border-slate-400">Método</div>
                              <div className="p-1 border-r border-slate-400">Material</div>
                              <div className="p-1 border-r border-slate-400">Mão de Obra</div>
                              <div className="p-1">Meio Ambiente</div>
                            </div>
                            <div className="grid grid-cols-4 border-b border-slate-400 min-h-[60px]">
                                <div className="border-r border-slate-400 relative"><EditableField isEditing={isEditing} value={editableRecord.aiAnalysis.ishikawa.metodo} onChange={v => handleAnalysisChange('ishikawa', 'metodo', v)} multiline /></div>
                                <div className="border-r border-slate-400 relative"><EditableField isEditing={isEditing} value={editableRecord.aiAnalysis.ishikawa.material} onChange={v => handleAnalysisChange('ishikawa', 'material', v)} multiline /></div>
                                <div className="border-r border-slate-400 relative"><EditableField isEditing={isEditing} value={editableRecord.aiAnalysis.ishikawa.maoDeObra} onChange={v => handleAnalysisChange('ishikawa', 'maoDeObra', v)} multiline /></div>
                                <div className="relative"><EditableField isEditing={isEditing} value={editableRecord.aiAnalysis.ishikawa.meioAmbiente} onChange={v => handleAnalysisChange('ishikawa', 'meioAmbiente', v)} multiline /></div>
                            </div>
                            <div className="border-b border-slate-400 text-center font-bold bg-slate-100 p-1">Máquina</div>
                            <div className="border-b border-slate-400 min-h-[40px] relative"><EditableField isEditing={isEditing} value={editableRecord.aiAnalysis.ishikawa.maquina} onChange={v => handleAnalysisChange('ishikawa', 'maquina', v)} multiline className="text-center"/></div>
                          </>
                        )}
                        
                        {/* Dados Equipamento */}
                        <div className="bg-[#a9d08e] text-center font-bold border-b border-slate-400 py-0.5 text-xs">DADOS DO EQUIPAMENTO</div>
                        <div className="grid grid-cols-[120px_1fr_80px_1fr_80px_1fr] border-b border-slate-400">
                           <div className="p-1 font-bold bg-slate-100 border-r border-slate-400 flex items-center">Equipamento:</div>
                           <div className="border-r border-slate-400 relative"><EditableField isEditing={isEditing} value={editableRecord.maquina} onChange={v => updateEditableRecord(p => ({...p, maquina: v}))} /></div>
                           <div className="p-1 font-bold bg-slate-100 border-r border-slate-400 flex items-center">Marca:</div>
                           <div className="border-r border-slate-400 relative"><EditableField isEditing={isEditing} value={editableRecord.marca || ''} onChange={v => updateEditableRecord(p => ({...p, marca: v}))} /></div>
                           <div className="p-1 font-bold bg-slate-100 border-r border-slate-400 flex items-center">Modelo:</div>
                           <div className="relative"><EditableField isEditing={isEditing} value={editableRecord.modelo || ''} onChange={v => updateEditableRecord(p => ({...p, modelo: v}))} /></div>
                        </div>
                        <div className="grid grid-cols-[120px_1fr_80px_1fr] border-b border-slate-400">
                           <div className="p-1 font-bold bg-slate-100 border-r border-slate-400 text-[9px] leading-tight flex items-center">Monitorado por Preditiva:</div>
                           <div className="border-r border-slate-400 relative"><EditableField isEditing={isEditing} value={editableRecord.monitoradoPreditiva || 'Não'} onChange={v => updateEditableRecord(p => ({...p, monitoradoPreditiva: v as 'Sim' | 'Não'}))} /></div>
                           <div className="p-1 font-bold bg-slate-100 border-r border-slate-400 flex items-center">Evidência:</div>
                           <div className="relative"><EditableField isEditing={isEditing} value={editableRecord.evidencia || ''} onChange={v => updateEditableRecord(p => ({...p, evidencia: v}))} /></div>
                        </div>
                        
                        {editableRecord.aiAnalysis && (
                          <>
                            {/* 5 Porques */}
                            <div className="bg-[#a9d08e] text-center font-bold border-b border-slate-400 py-0.5 text-xs">ANÁLISE DOS PORQUÊS</div>
                            {(['path1', 'path2', 'path3'] as const).map((path, idx) => (
                              <React.Fragment key={path}>
                                  <div className="grid grid-cols-[1fr_200px] border-b border-slate-400 bg-slate-50">
                                    <div className="p-1 font-bold flex items-center gap-1 border-r border-slate-400">
                                        CAUSA {idx+1}: 
                                        <EditableField isEditing={isEditing} value={editableRecord.aiAnalysis.whyAnalysis[path].title} onChange={v => handleAnalysisChange('whyAnalysis', path, { ...editableRecord.aiAnalysis?.whyAnalysis[path], title: v })}/>
                                    </div>
                                    <div className="p-1 font-bold text-center">CAUSA RAIZ</div>
                                  </div>
                                  <div className="grid grid-cols-[1fr_200px] border-b border-slate-400 min-h-[80px]">
                                    <div className="border-r border-slate-400">
                                        {[0,1,2,3,4].map(i => (
                                          <div key={i} className="p-0.5 border-b border-slate-200 last:border-0 pl-1 flex">
                                              <span className="font-bold text-slate-500 whitespace-nowrap mr-1">{i+1}º Por quê?</span>
                                              <EditableField isEditing={isEditing} value={editableRecord.aiAnalysis!.whyAnalysis[path].whys[i] || ''} onChange={v => updateEditableRecord(p => { const newWhys = [...(p.aiAnalysis?.whyAnalysis[path].whys ?? [])]; newWhys[i] = v; return {...p, aiAnalysis: {...(p.aiAnalysis as AQFResult), whyAnalysis: {...p.aiAnalysis?.whyAnalysis, [path]: {...p.aiAnalysis?.whyAnalysis[path], whys: newWhys}}}};})}/>
                                          </div>
                                        ))}
                                    </div>
                                    <div className="relative"><EditableField isEditing={isEditing} value={editableRecord.aiAnalysis.whyAnalysis[path].rootCause} onChange={v => handleAnalysisChange('whyAnalysis', path, { ...editableRecord.aiAnalysis?.whyAnalysis[path], rootCause: v })} multiline className="font-bold text-red-700 text-center"/></div>
                                  </div>
                              </React.Fragment>
                            ))}

                            {/* Conclusão */}
                            <div className="bg-[#a9d08e] text-center font-bold border-b border-slate-400 py-0.5 text-xs">CONCLUSÃO</div>
                            <div className="border-b border-slate-400 min-h-[50px] relative"><EditableField isEditing={isEditing} value={editableRecord.aiAnalysis.conclusion} onChange={v => updateEditableRecord(p => ({...p, aiAnalysis: {...(p.aiAnalysis as AQFResult), conclusion: v}}))} multiline /></div>
                            
                            {/* Plano de Ação */}
                            <div className="bg-[#a9d08e] text-center font-bold border-b border-slate-400 py-0.5 text-xs">PLANO DE AÇÃO</div>
                            <div className="grid grid-cols-[1fr_100px_80px_80px] border-b border-slate-400 bg-slate-100 text-center font-bold">
                              <div className="p-1 border-r border-slate-400">O que?</div>
                              <div className="p-1 border-r border-slate-400">Quem?</div>
                              <div className="p-1 border-r border-slate-400">Quando?</div>
                              <div className="p-1">Status</div>
                            </div>
                            {editableRecord.aiAnalysis.actionPlan.map((action, i) => (
                              <div key={i} className="grid grid-cols-[1fr_100px_80px_80px] border-b border-slate-400">
                                  <div className="border-r border-slate-400 relative"><EditableField isEditing={isEditing} value={action.what} onChange={v => updateEditableRecord(p => { const newPlan = [...(p.aiAnalysis?.actionPlan ?? [])]; newPlan[i] = {...newPlan[i], what: v}; return {...p, aiAnalysis: {...(p.aiAnalysis as AQFResult), actionPlan: newPlan}}})} /></div>
                                  <div className="border-r border-slate-400 relative"><EditableField isEditing={isEditing} value={action.who} onChange={v => updateEditableRecord(p => { const newPlan = [...(p.aiAnalysis?.actionPlan ?? [])]; newPlan[i] = {...newPlan[i], who: v}; return {...p, aiAnalysis: {...(p.aiAnalysis as AQFResult), actionPlan: newPlan}}})} className="text-center"/></div>
                                  <div className="border-r border-slate-400 relative"><EditableField isEditing={isEditing} value={action.when} onChange={v => updateEditableRecord(p => { const newPlan = [...(p.aiAnalysis?.actionPlan ?? [])]; newPlan[i] = {...newPlan[i], when: v}; return {...p, aiAnalysis: {...(p.aiAnalysis as AQFResult), actionPlan: newPlan}}})} className="text-center"/></div>
                                  <div className="relative"><EditableField isEditing={isEditing} value={action.status} onChange={v => updateEditableRecord(p => { const newPlan = [...(p.aiAnalysis?.actionPlan ?? [])]; newPlan[i] = {...newPlan[i], status: v}; return {...p, aiAnalysis: {...(p.aiAnalysis as AQFResult), actionPlan: newPlan}}})} className="text-center"/></div>
                              </div>
                            ))}
                          </>
                        )}
                        {/* Envolvidos */}
                        <div className="bg-[#a9d08e] text-center font-bold border-b border-slate-400 py-0.5 text-xs flex justify-between items-center px-1">
                          ENVOLVIDOS NA ANÁLISE
                          {isEditing && <button type="button" onClick={addEnvolvido} className="text-[9px] bg-white/50 px-1 rounded hover:bg-white">+</button>}
                        </div>
                        <div className="grid grid-cols-[80px_1fr_120px_120px] border-b border-slate-400 bg-slate-100 text-center font-bold">
                           <div className="p-1 border-r border-slate-400">Matrícula</div>
                           <div className="p-1 border-r border-slate-400">Nome</div>
                           <div className="p-1 border-r border-slate-400">Cargo</div>
                           <div className="p-1">Área</div>
                        </div>
                        {(editableRecord.envolvidos || []).map((p, i) => (
                          <div key={i} className="grid grid-cols-[80px_1fr_120px_120px] border-b border-slate-400 min-h-[20px]">
                            <div className="border-r border-slate-400 relative"><EditableField isEditing={isEditing} value={p.matricula} onChange={v => updateEditableRecord(pr => {const n = [...(pr.envolvidos??[])]; n[i].matricula=v; return {...pr, envolvidos:n};})} className="text-center"/></div>
                            <div className="border-r border-slate-400 relative"><EditableField isEditing={isEditing} value={p.nome} onChange={v => updateEditableRecord(pr => {const n = [...(pr.envolvidos??[])]; n[i].nome=v; return {...pr, envolvidos:n};})} /></div>
                            <div className="border-r border-slate-400 relative"><EditableField isEditing={isEditing} value={p.cargo} onChange={v => updateEditableRecord(pr => {const n = [...(pr.envolvidos??[])]; n[i].cargo=v; return {...pr, envolvidos:n};})} /></div>
                            <div className="relative"><EditableField isEditing={isEditing} value={p.area} onChange={v => updateEditableRecord(pr => {const n = [...(pr.envolvidos??[])]; n[i].area=v; return {...pr, envolvidos:n};})} /></div>
                          </div>
                        ))}
                        

                        {/* Aprovações */}
                        <div className="bg-[#a9d08e] text-center font-bold border-b border-slate-400 py-0.5 text-xs">Aprovações</div>
                        <div className="grid grid-cols-4 border-b border-slate-400 text-center font-bold bg-slate-100">
                           <div className="p-1 border-r border-slate-400">Data de Encerramento</div>
                           <div className="p-1 border-r border-slate-400">Responsável Manutenção</div>
                           <div className="p-1 border-r border-slate-400">Gestor de Manutenção</div>
                           <div className="p-1">Confiabilidade</div>
                        </div>
                        <div className="grid grid-cols-4 min-h-[40px]">
                           <div className="border-r border-slate-400 relative"><EditableField isEditing={isEditing} value={editableRecord.aprovacoes?.dataEncerramento ?? ''} onChange={v => handleAprovacoesChange('dataEncerramento', v)} className="text-center"/></div>
                           <div className="border-r border-slate-400 relative"><EditableField isEditing={isEditing} value={editableRecord.aprovacoes?.responsavelManutencao ?? ''} onChange={v => handleAprovacoesChange('responsavelManutencao', v)} className="text-center"/></div>
                           <div className="border-r border-slate-400 relative"><EditableField isEditing={isEditing} value={editableRecord.aprovacoes?.gestorManutencao ?? ''} onChange={v => handleAprovacoesChange('gestorManutencao', v)} className="text-center"/></div>
                           <div className="relative"><EditableField isEditing={isEditing} value={editableRecord.aprovacoes?.confiabilidade ?? ''} onChange={v => handleAprovacoesChange('confiabilidade', v)} className="text-center"/></div>
                        </div>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <p className="font-medium">Aguardando geração da análise de IA...</p>
                        <p className="text-xs mt-1">Clique em "Gerar Análise IA" na barra superior.</p>
                     </div>
                  )}
               </div>
            </>
         )}
      </div>

      <BreakdownFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveForm}
        initialData={recordToEdit}
      />
    </div>
  );
};