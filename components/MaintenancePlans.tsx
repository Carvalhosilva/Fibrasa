import React, { useState, useMemo } from 'react';
import { 
  FileText, Search, Plus, Filter, AlertTriangle, CheckCircle2, 
  ChevronRight, ArrowLeft, Save, AlertOctagon, Info, FileCode, CheckSquare
} from 'lucide-react';
import { 
  MOCK_MAINTENANCE_PLANS, MOCK_EQUIPMENT_TREE 
} from '../constants';
import { 
  MaintenancePlan, PlanStrategy, LeanColor, PlanTask, EquipmentNode 
} from '../types';

// --- Helper function to flatten the tree for the select dropdown ---
const flattenEquipmentTree = (nodes: EquipmentNode[]): { id: string; name: string; displayName: string; criticalityClass?: 'AA' | 'A' | 'B' | 'C'; }[] => {
  const flatList: { id: string; name: string; displayName: string; criticalityClass?: 'AA' | 'A' | 'B' | 'C'; }[] = [];
  
  const traverse = (node: EquipmentNode, level: number) => {
    flatList.push({
      id: node.id,
      name: node.name,
      displayName: `${'\u00A0\u00A0'.repeat(level*2)} ${node.name}`, // Indent with non-breaking spaces
      criticalityClass: node.criticalityClass,
    });
    if (node.children) {
      node.children.forEach(child => traverse(child, level + 1));
    }
  };

  nodes.forEach(node => traverse(node, 0));
  return flatList;
};


// --- Task Classification Logic (Table 1 - PT-MAN-GMAN-00-0001) ---
const calculateLeanColor = (
  crit: 'Alta' | 'Média' | 'Baixa',
  freq: 'Alta' | 'Média' | 'Baixa',
  comp: 'Alta' | 'Média' | 'Baixa'
): LeanColor => {
  // Logic simplified from the standard's matrix concept for implementation
  // High Criticality tasks generally push towards Red/Yellow
  if (crit === 'Alta') {
    if (comp === 'Alta' || comp === 'Média') return LeanColor.RED;
    return LeanColor.YELLOW;
  }
  if (crit === 'Média') {
    if (comp === 'Alta') return LeanColor.YELLOW;
    if (freq === 'Alta') return LeanColor.YELLOW;
    return LeanColor.GREEN;
  }
  // Low Criticality
  if (comp === 'Alta') return LeanColor.YELLOW;
  return LeanColor.GREEN;
};

interface Props {
  onNavigate?: (view: string) => void;
}

export const MaintenancePlans: React.FC<Props> = () => {
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [plans, setPlans] = useState<MaintenancePlan[]>(MOCK_MAINTENANCE_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<MaintenancePlan | null>(null);
  
  // Editor State
  const [formData, setFormData] = useState<Partial<MaintenancePlan>>({});
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<PlanTask>>({
    criticity: 'Baixa', frequency: 'Baixa', complexity: 'Baixa'
  });

  // Memoize the flattened tree to avoid recalculating on every render
  const flatAssetList = useMemo(() => flattenEquipmentTree(MOCK_EQUIPMENT_TREE), []);

  const handleEdit = (plan: MaintenancePlan) => {
    setFormData(JSON.parse(JSON.stringify(plan))); // Deep copy
    setSelectedPlan(plan);
    setView('edit');
  };

  const handleNew = () => {
    setFormData({
      id: `MP-${Date.now()}`,
      planCode: 'PLN-NOV-000',
      status: 'Em Revisão',
      tasks: [],
      impactsNR13: false,
      impactsISO9001: false,
      impactsISO14001: false,
      assetCriticality: 'C' // Default
    });
    setSelectedPlan(null);
    setView('edit');
  };

  const handleSavePlan = () => {
    if (selectedPlan) {
      setPlans(prev => prev.map(p => p.id === selectedPlan.id ? { ...p, ...formData } as MaintenancePlan : p));
    } else {
      setPlans(prev => [...prev, formData as MaintenancePlan]);
    }
    setView('list');
  };

  // --- Task Modal Logic ---
  const openTaskModal = () => {
    setCurrentTask({
      id: `T-${Date.now()}`,
      sequence: ((formData.tasks?.length || 0) + 1) * 10,
      criticity: 'Baixa',
      frequency: 'Baixa',
      complexity: 'Baixa',
      description: ''
    });
    setTaskModalOpen(true);
  };

  const saveTask = () => {
    const color = calculateLeanColor(
      currentTask.criticity as any, 
      currentTask.frequency as any, 
      currentTask.complexity as any
    );
    
    let standardCode = undefined;
    if (color === LeanColor.RED) {
      // Auto-generate standard code per 3.4.1 (XXXX - SE - 9999)
      const areaCode = "GMAN"; // Mock Area Code
      const serviceCode = "M";   // Mock Service Code
      const seq = Math.floor(Math.random() * 9000) + 1000;
      standardCode = `${areaCode}-${serviceCode}-${seq}`;
    }

    const newTask: PlanTask = {
      ...currentTask as PlanTask,
      leanColor: color,
      standardCode: standardCode,
      checklistRequired: color === LeanColor.YELLOW
    };

    setFormData(prev => ({
      ...prev,
      tasks: [...(prev.tasks || []), newTask]
    }));
    setTaskModalOpen(false);
  };

  // --- Views ---

  const ListView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <div>
           <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
             <FileText size={20} className="text-emerald-700"/> Planos de Manutenção
           </h2>
           <p className="text-xs text-slate-400 font-medium">Gestão de Estratégias (PT-MAN-GMAN-00-0001)</p>
        </div>
        <button 
          onClick={handleNew}
          className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-800 transition-all shadow-md flex items-center gap-2"
        >
          <Plus size={16} /> Novo Plano
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Código / Ativo</th>
              <th className="px-6 py-4">Estratégia</th>
              <th className="px-6 py-4">Frequência</th>
              <th className="px-6 py-4">Criticidade Ativo</th>
              <th className="px-6 py-4 text-center">Tarefas</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {plans.map(plan => (
              <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-700">{plan.planCode}</div>
                  <div className="text-xs text-slate-500">{plan.assetName}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium border border-slate-200">
                    {plan.strategy}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 font-mono">
                  {plan.frequencyValue} {plan.frequencyUnit}
                </td>
                <td className="px-6 py-4">
                   <span className={`font-bold px-2 py-0.5 rounded text-xs border ${
                      plan.assetCriticality.includes('A') ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                   }`}>
                     {plan.assetCriticality}
                   </span>
                </td>
                <td className="px-6 py-4 text-center text-slate-600 font-bold">{plan.tasks.length}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold border ${
                    plan.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {plan.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => handleEdit(plan)}
                    className="text-emerald-600 hover:bg-emerald-50 p-2 rounded transition-colors font-medium text-xs"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const EditView = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => setView('list')} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="font-bold text-xl text-slate-800">{formData.planCode}</h2>
          <p className="text-xs text-slate-400">Editando Plano de Manutenção</p>
        </div>
      </div>

      {/* Header Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Ativo (Item de Manutenção)</label>
          <select 
            className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={formData.assetId || ''}
            onChange={e => {
              const selectedId = e.target.value;
              const asset = flatAssetList.find(a => a.id === selectedId);
              if (asset) {
                setFormData({
                  ...formData,
                  assetId: asset.id,
                  assetName: asset.name,
                  assetCriticality: asset.criticalityClass || 'C',
                });
              } else {
                 setFormData({
                  ...formData,
                  assetId: '',
                  assetName: '',
                  assetCriticality: 'C'
                });
              }
            }}
          >
             <option value="">Selecione um ativo...</option>
             {flatAssetList.map(asset => (
                <option key={asset.id} value={asset.id}>
                    {asset.displayName}
                </option>
             ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Criticidade do Ativo</label>
          <select 
            className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-700 text-sm font-medium outline-none"
            value={formData.assetCriticality}
            onChange={e => setFormData({ ...formData, assetCriticality: e.target.value as any })}
          >
            <option value="AA">AA - Estratégico</option>
            <option value="A">A - Crítico</option>
            <option value="B">B - Importante</option>
            <option value="C">C - Regular</option>
          </select>
        </div>

        <div>
           <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Estratégia</label>
           <select 
             className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
             value={formData.strategy}
             onChange={e => setFormData({ ...formData, strategy: e.target.value as any })}
           >
             {Object.values(PlanStrategy).map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
           </select>
        </div>

        {/* Validation Warning for P-F Curve */}
        {(formData.assetCriticality === 'AA' || formData.assetCriticality === 'A') && formData.strategy !== PlanStrategy.PREDICTIVE && (
          <div className="col-span-2 bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-3">
             <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
             <div>
               <p className="text-sm font-bold text-amber-800">Recomendação Normativa (Item 3.2.1)</p>
               <p className="text-xs text-amber-700">Para ativos de criticidade AA ou A, deve-se priorizar a <strong>Manutenção Preditiva</strong>. Caso inviável, justifique no campo de observações.</p>
             </div>
          </div>
        )}

        {/* P-F Curve Inputs */}
        {formData.strategy === PlanStrategy.PREDICTIVE && (
           <div className="col-span-2 bg-sky-50 border border-sky-100 p-4 rounded-lg">
              <h4 className="text-xs font-bold text-sky-700 uppercase mb-3 flex items-center gap-2">
                 <Info size={14}/> Parâmetros Preditivos (Curva P-F)
              </h4>
              <div className="flex gap-4 items-end">
                 <div className="flex-1">
                    <label className="text-xs text-sky-600 font-medium">Intervalo P-F Estimado (Dias)</label>
                    <input 
                      type="number" 
                      className="w-full mt-1 p-2 border border-sky-200 rounded text-sm" 
                      value={formData.pfInterval || ''}
                      onChange={e => setFormData({...formData, pfInterval: parseInt(e.target.value)})}
                      placeholder="Ex: 90"
                    />
                 </div>
                 <div className="flex-1">
                    <label className="text-xs text-sky-600 font-medium">Frequência Calculada (1/{formData.assetCriticality === 'AA' ? '3' : '2'} P-F)</label>
                    <div className="mt-1 p-2 bg-white border border-sky-200 rounded text-sm font-bold text-sky-800">
                       {formData.pfInterval ? Math.floor(formData.pfInterval / (formData.assetCriticality === 'AA' ? 3 : 2)) + ' Dias' : '-'}
                    </div>
                 </div>
              </div>
           </div>
        )}
        
        <div className="col-span-2 flex gap-6 border-t border-slate-100 pt-4">
           <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
              <input type="checkbox" checked={formData.impactsNR13} onChange={e => setFormData({...formData, impactsNR13: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-500" />
              Impacta NR-13 (Caldeiras/Vasos)
           </label>
           <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
              <input type="checkbox" checked={formData.impactsISO9001} onChange={e => setFormData({...formData, impactsISO9001: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-500" />
              Impacta Qualidade (ISO 9001)
           </label>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
               <CheckSquare size={18} className="text-slate-500"/> Lista de Tarefas
            </h3>
            <button onClick={openTaskModal} className="text-xs font-bold text-emerald-700 hover:text-emerald-800 uppercase flex items-center gap-1">
               <Plus size={14} /> Adicionar Tarefa
            </button>
         </div>
         <table className="w-full text-sm text-left">
            <thead className="bg-white text-slate-400 font-bold uppercase text-[10px]">
               <tr>
                  <th className="px-6 py-3 border-r border-slate-50">Seq.</th>
                  <th className="px-6 py-3 border-r border-slate-50">Descrição</th>
                  <th className="px-6 py-3 border-r border-slate-50 text-center">Classificação Lean</th>
                  <th className="px-6 py-3">Padrão / Checklist</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {formData.tasks?.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50">
                     <td className="px-6 py-3 font-mono text-slate-500">{task.sequence}</td>
                     <td className="px-6 py-3 font-medium text-slate-700">{task.description}</td>
                     <td className="px-6 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                           task.leanColor === LeanColor.GREEN ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                           task.leanColor === LeanColor.YELLOW ? 'bg-amber-100 text-amber-800 border-amber-200' :
                           'bg-rose-100 text-rose-800 border-rose-200'
                        }`}>
                           {task.leanColor}
                        </span>
                     </td>
                     <td className="px-6 py-3">
                        {task.standardCode && (
                           <div className="flex items-center gap-2 text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-100 w-fit">
                              <FileCode size={12} /> <span className="text-[10px] font-mono font-bold">{task.standardCode}</span>
                           </div>
                        )}
                        {task.checklistRequired && !task.standardCode && (
                           <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-100 w-fit">
                              <CheckSquare size={12} /> <span className="text-[10px] font-bold">Checklist</span>
                           </div>
                        )}
                     </td>
                  </tr>
               ))}
               {(!formData.tasks || formData.tasks.length === 0) && (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhuma tarefa cadastrada.</td></tr>
               )}
            </tbody>
         </table>
      </div>

      <div className="flex justify-end pt-4">
         <button 
           onClick={handleSavePlan}
           className="bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-800 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
         >
            <Save size={18} /> Salvar Plano
         </button>
      </div>

      {/* Task Classification Modal (The Wizard) */}
      {taskModalOpen && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 animate-fade-in-up">
               <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-800">Classificação da Tarefa (Padrão Lean)</h3>
                  <button onClick={() => setTaskModalOpen(false)}><ArrowLeft size={20} className="text-slate-400"/></button>
               </div>
               <div className="p-6 space-y-6">
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Descrição da Tarefa</label>
                     <textarea 
                        className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        rows={3}
                        value={currentTask.description}
                        onChange={e => setCurrentTask({...currentTask, description: e.target.value})}
                     />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                     <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Criticidade</label>
                        <select 
                           className="w-full border border-slate-200 rounded p-2 text-sm bg-white"
                           value={currentTask.criticity}
                           onChange={e => setCurrentTask({...currentTask, criticity: e.target.value as any})}
                        >
                           <option value="Baixa">Baixa</option>
                           <option value="Média">Média</option>
                           <option value="Alta">Alta</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Frequência</label>
                        <select 
                           className="w-full border border-slate-200 rounded p-2 text-sm bg-white"
                           value={currentTask.frequency}
                           onChange={e => setCurrentTask({...currentTask, frequency: e.target.value as any})}
                        >
                           <option value="Baixa">Baixa (Anual)</option>
                           <option value="Média">Média (Mensal)</option>
                           <option value="Alta">Alta (Semanal)</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Complexidade</label>
                        <select 
                           className="w-full border border-slate-200 rounded p-2 text-sm bg-white"
                           value={currentTask.complexity}
                           onChange={e => setCurrentTask({...currentTask, complexity: e.target.value as any})}
                        >
                           <option value="Baixa">Baixa</option>
                           <option value="Média">Média</option>
                           <option value="Alta">Alta</option>
                        </select>
                     </div>
                  </div>

                  {/* Live Preview of Result */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center justify-between">
                     <span className="text-sm font-bold text-slate-600">Resultado da Classificação:</span>
                     {(() => {
                        const color = calculateLeanColor(currentTask.criticity as any, currentTask.frequency as any, currentTask.complexity as any);
                        return (
                           <span className={`px-3 py-1 rounded text-xs font-bold uppercase border flex items-center gap-2 ${
                              color === LeanColor.GREEN ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                              color === LeanColor.YELLOW ? 'bg-amber-100 text-amber-800 border-amber-200' :
                              'bg-rose-100 text-rose-800 border-rose-200'
                           }`}>
                              {color === LeanColor.RED && <AlertOctagon size={14}/>}
                              Padrão {color}
                           </span>
                        );
                     })()}
                  </div>
                  
                  <button onClick={saveTask} className="w-full bg-emerald-700 text-white py-3 rounded-lg font-bold hover:bg-emerald-800 transition-colors">
                     Confirmar e Adicionar
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );

  return view === 'list' ? <ListView /> : <EditView />;
};