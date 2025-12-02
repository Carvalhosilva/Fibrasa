
import React, { useState } from 'react';
import { AlertOctagon, BrainCircuit, CheckCircle, Clock, Save, FileText, ChevronRight, AlertTriangle } from 'lucide-react';
import { Breakdown, AQFResult } from '../types';
import { analyzeBreakdown } from '../services/geminiService';

interface Props {
  breakdowns: Breakdown[];
  onAddBreakdown: (b: Breakdown) => void;
  onUpdateBreakdown: (id: string, result: AQFResult) => void;
}

export const BreakdownManager: React.FC<Props> = ({ breakdowns, onAddBreakdown, onUpdateBreakdown }) => {
  const [selectedBreakdown, setSelectedBreakdown] = useState<Breakdown | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [contextInput, setContextInput] = useState("");

  const handleAnalyze = async () => {
    if (!selectedBreakdown) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeBreakdown(
        selectedBreakdown.machineName,
        selectedBreakdown.description,
        contextInput
      );
      onUpdateBreakdown(selectedBreakdown.id, result);
      setSelectedBreakdown({ ...selectedBreakdown, aiAnalysis: result });
    } catch (e) {
      alert("Falha na análise. Verifique sua chave de API.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Left: List of Breakdowns */}
      <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Falhas Recentes</h3>
            <p className="text-xs text-slate-400 font-medium">Registro de paradas e anomalias</p>
          </div>
          <span className="bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1 rounded-full border border-rose-200 shadow-sm">
            {breakdowns.filter(b => b.status === 'Aberto').length} Abertos
          </span>
        </div>
        <div className="overflow-y-auto flex-1 p-3 space-y-3 bg-slate-50/50">
          {breakdowns.map(item => (
            <div 
              key={item.id}
              onClick={() => { setSelectedBreakdown(item); setContextInput(""); }}
              className={`
                p-4 rounded-xl border cursor-pointer transition-all relative group
                ${selectedBreakdown?.id === item.id 
                  ? 'bg-white border-emerald-500 ring-1 ring-emerald-500 shadow-md' 
                  : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                }
              `}
            >
              {selectedBreakdown?.id === item.id && <div className="absolute left-0 top-4 bottom-4 w-1 bg-emerald-500 rounded-r-full"></div>}
              
              <div className="flex justify-between items-start mb-2 pl-2">
                <span className="font-bold text-slate-800 text-sm leading-tight">{item.machineName}</span>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{item.timestamp.split(' ')[0]}</span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 mb-3 pl-2 leading-relaxed">{item.description}</p>
              <div className="flex gap-2 pl-2">
                 <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wide ${item.status === 'Resolvido' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                   {item.status}
                 </span>
                 {item.aiAnalysis && (
                   <span className="text-[10px] px-2 py-0.5 rounded border bg-purple-50 border-purple-100 text-purple-700 flex items-center gap-1 font-bold shadow-sm">
                     <BrainCircuit size={10} /> IA Analisado
                   </span>
                 )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Detail & Analysis */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        {selectedBreakdown ? (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 bg-white">
              <div className="flex justify-between items-start">
                <div>
                   <div className="flex items-center gap-2 mb-2">
                      <span className="bg-slate-100 text-slate-500 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-200">
                        {selectedBreakdown.id}
                      </span>
                      {selectedBreakdown.aiAnalysis && (
                        <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                          <BrainCircuit size={10}/> Análise Inteligente Ativa
                        </span>
                      )}
                   </div>
                   <h2 className="text-2xl font-bold text-slate-800 leading-tight">{selectedBreakdown.machineName}</h2>
                   <div className="flex items-center gap-3 text-sm text-slate-500 mt-2 font-medium">
                     <div className="flex items-center gap-1"><Clock size={14} className="text-slate-400"/> {selectedBreakdown.timestamp}</div>
                     <span className="text-slate-300">|</span>
                     <div className="flex items-center gap-1"><AlertTriangle size={14} className="text-slate-400"/> {selectedBreakdown.type}</div>
                   </div>
                </div>
                {selectedBreakdown.status === 'Aberto' && (
                  <button className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all uppercase tracking-wide">
                    Encerrar O.S.
                  </button>
                )}
              </div>
              
              <div className="mt-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FileText size={14} /> Relato do Operador
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed font-medium">
                  {selectedBreakdown.description}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 scroll-smooth">
              {!selectedBreakdown.aiAnalysis ? (
                <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl border border-emerald-100/50 shadow-sm max-w-2xl mx-auto mt-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-xl shadow-sm border border-purple-200">
                      <BrainCircuit size={32} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-xl">Análise de Causa Raiz (AQF)</h3>
                      <p className="text-sm text-slate-500">Inteligência Artificial aplicada à engenharia de confiabilidade</p>
                    </div>
                  </div>
                  
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                    Contexto Adicional (Opcional)
                  </label>
                  <textarea 
                    className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none mb-6 shadow-sm bg-white"
                    rows={3}
                    placeholder="Ex: O operador notou vibração excessiva antes da parada..."
                    value={contextInput}
                    onChange={(e) => setContextInput(e.target.value)}
                  />
                  
                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className={`
                      w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md
                      ${isAnalyzing 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                      }
                    `}
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center gap-2">Processando dados da máquina...</span>
                    ) : (
                      <>Gerar Diagnóstico Avançado <BrainCircuit size={18} /></>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                   <div className="flex items-center justify-between">
                     <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                       <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
                       Diagnóstico Técnico
                     </h3>
                     <span className={`px-4 py-1.5 rounded-full text-xs font-bold border shadow-sm ${
                        (selectedBreakdown.aiAnalysis.severityScore || 0) > 7 
                          ? 'bg-rose-50 text-rose-700 border-rose-100' 
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                     }`}>
                       Criticidade: {selectedBreakdown.aiAnalysis.severityScore || '-'}/10
                     </span>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                         <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 pb-3 border-b border-slate-50">
                           <AlertOctagon size={16} className="text-amber-500" /> Hipóteses de Causa Raiz
                         </h4>
                         <ul className="space-y-3">
                           {[
                              selectedBreakdown.aiAnalysis.whyAnalysis.path1.rootCause,
                              selectedBreakdown.aiAnalysis.whyAnalysis.path2.rootCause,
                              selectedBreakdown.aiAnalysis.whyAnalysis.path3.rootCause
                           ].filter(Boolean).map((cause, idx) => (
                             <li key={idx} className="text-sm text-slate-700 flex items-start gap-2.5 leading-relaxed">
                               <div className="min-w-[6px] h-[6px] rounded-full bg-slate-300 mt-1.5"></div>
                               {cause}
                             </li>
                           ))}
                         </ul>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                         <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 pb-3 border-b border-slate-50">
                           <CheckCircle size={16} className="text-emerald-500" /> Plano de Ação Recomendado
                         </h4>
                         <div className="space-y-2">
                           {selectedBreakdown.aiAnalysis.actionPlan.slice(0, 3).map((action, i) => (
                             <div key={i} className="text-sm text-slate-700 leading-relaxed font-medium bg-emerald-50/30 p-2 rounded-lg border border-emerald-50">
                               <span className="font-bold text-emerald-800">{action.what}</span> <span className="text-xs text-emerald-600">({action.who})</span>
                             </div>
                           ))}
                         </div>
                      </div>
                   </div>

                   <div className="bg-gradient-to-r from-emerald-50 to-white p-5 rounded-xl border border-emerald-100 shadow-sm">
                      <h4 className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
                         <Save size={16} /> Conclusão Técnica
                      </h4>
                      <p className="text-sm text-emerald-900 leading-relaxed font-medium">{selectedBreakdown.aiAnalysis.conclusion}</p>
                   </div>
                   
                   <div className="flex justify-end pt-2">
                      <button 
                        onClick={() => setSelectedBreakdown({ ...selectedBreakdown, aiAnalysis: undefined })}
                        className="text-xs font-bold text-slate-400 hover:text-purple-600 flex items-center gap-1 transition-colors uppercase tracking-wide"
                      >
                        <BrainCircuit size={14} /> Refazer Análise
                      </button>
                   </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-300">
            <div className="bg-slate-50 p-6 rounded-full mb-4 border border-slate-100">
               <AlertTriangle size={48} className="opacity-20 text-slate-500" />
            </div>
            <p className="font-medium text-slate-400">Selecione uma falha para ver detalhes</p>
          </div>
        )}
      </div>
    </div>
  );
};