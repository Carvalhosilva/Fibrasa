

import React, { useState, useRef, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { EquipmentView } from './components/EquipmentTree';
import { BreakdownControl } from './components/BreakdownControl'; 
import { PreventiveSchedule } from './components/PreventiveSchedule';
import { LifespanControl } from './components/LifespanControl';
import { MaintenancePlanning } from './components/MaintenancePlanning';
import { MaintenancePlans } from './components/MaintenancePlans'; 
import { BreakdownTracking } from './components/BreakdownTracking';
import { MOCK_EQUIPMENT_TREE, MOCK_BREAKDOWN_AUDIT_RECORDS, MOCK_WORK_ORDERS, MOCK_PREVENTIVE_SCHEDULE, MOCK_LIFESPAN } from './constants';
import { AQFResult, BreakdownAuditRecord, WorkOrder, MaintenanceType, EquipmentNode, PreventiveTask, ComponentLifespan, Month, PreventiveStatus } from './types';
import { Calendar, Plus, Filter, Download, Search, FileText, Image as ImageIcon, Box, Eye, X, UploadCloud, AlertOctagon, ExternalLink, Trash2, CheckCircle2, ClipboardList, Clock, AlertTriangle, User } from 'lucide-react';

const PlaceholderView: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center shadow-sm">
    <div className="bg-slate-50 p-6 rounded-full mb-6">
      <Filter size={40} className="text-slate-300" />
    </div>
    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
    <p className="text-slate-500 max-w-md mt-3 leading-relaxed">
      Este módulo faz parte da arquitetura funcional, mas foi simplificado para esta demonstração.
    </p>
  </div>
);

interface ServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<WorkOrder>) => void;
  targetNode: EquipmentNode | null;
}

const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({ isOpen, onClose, onSubmit, targetNode }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      setTitle(targetNode ? `Manutenção em ${targetNode.name}` : '');
      setDescription('');
    }
  }, [isOpen, targetNode]);

  if (!isOpen || !targetNode) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, machineName: targetNode.name, description });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up border border-slate-200">
         <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Nova Solicitação de Serviço</h3>
            <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
         </div>
         <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Equipamento</label>
               <input disabled value={targetNode.name} className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-600 text-sm font-medium"/>
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Título</label>
               <input 
                  autoFocus 
                  value={title} 
                  onChange={e=>setTitle(e.target.value)} 
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm"
               />
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Descrição</label>
               <textarea 
                  rows={4} 
                  value={description} 
                  onChange={e=>setDescription(e.target.value)} 
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm"
               />
            </div>
            <div className="flex justify-end pt-2 gap-3">
               <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg font-bold">Cancelar</button>
               <button type="submit" className="bg-emerald-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-emerald-800">Criar</button>
            </div>
         </form>
      </div>
    </div>
  );
};

const ManualsLibrary: React.FC = () => <PlaceholderView title="Biblioteca de Manuais" />;

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [breakdownRecords, setBreakdownRecords] = useState<BreakdownAuditRecord[]>(MOCK_BREAKDOWN_AUDIT_RECORDS);
  const [equipmentTree, setEquipmentTree] = useState<EquipmentNode[]>(MOCK_EQUIPMENT_TREE);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(MOCK_WORK_ORDERS);
  const [preventiveTasks, setPreventiveTasks] = useState<PreventiveTask[]>(MOCK_PREVENTIVE_SCHEDULE);
  const [lifespanItems, setLifespanItems] = useState<ComponentLifespan[]>(MOCK_LIFESPAN);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceRequestTarget, setServiceRequestTarget] = useState<EquipmentNode | null>(null);

  // --- Breakdown Handlers ---
  const handleAddBreakdownRecord = (record: BreakdownAuditRecord) => setBreakdownRecords([record, ...breakdownRecords]);
  const handleEditBreakdownRecord = (record: BreakdownAuditRecord) => setBreakdownRecords(prev => prev.map(r => r.codigo === record.codigo ? record : r));
  const handleDeleteBreakdownRecord = (codigo: string) => setBreakdownRecords(prev => prev.filter(r => r.codigo !== codigo));
  const handleUpdateBreakdownAnalysis = (code: string, result: AQFResult) => {
    setBreakdownRecords(prev => prev.map(r => r.codigo === code ? { ...r, aiAnalysis: result, statusAQF: 'Concluída' } : r));
  };

  // --- Equipment Tree Handlers (LÓGICA RECURSIVA E IMUTÁVEL) ---

  // 1. ADICIONAR
  const handleAddEquipment = (parentId: string | null, newNode: EquipmentNode) => {
    if (!parentId) {
      setEquipmentTree(prev => [...prev, newNode]);
      return;
    }
    
    const addRecursive = (nodes: EquipmentNode[]): EquipmentNode[] => {
      return nodes.map(node => {
        if (node.id === parentId) {
          const newChildren = node.children ? [...node.children, newNode] : [newNode];
          return { ...node, children: newChildren };
        }
        if (node.children) {
          return { ...node, children: addRecursive(node.children) };
        }
        return node;
      });
    };
    
    setEquipmentTree(prev => addRecursive(prev));
  };

  // 2. EDITAR
  const handleEditEquipment = (originalId: string, updatedNode: EquipmentNode) => {
    const editRecursive = (nodes: EquipmentNode[]): EquipmentNode[] => {
      return nodes.map(node => {
        if (node.id === originalId) {
          return { ...updatedNode, children: node.children };
        }
        if (node.children) {
          return { ...node, children: editRecursive(node.children) };
        }
        return node;
      });
    };
    setEquipmentTree(prev => editRecursive(prev));
  };

  // 3. EXCLUIR (SOLUÇÃO DEFINITIVA E PRECISA COM CONFIRMAÇÃO)
  const handleDeleteEquipment = (nodeId: string) => {
    if (!nodeId) return;
    
    // CORREÇÃO: Adicionada a caixa de confirmação de segurança.
    if (!window.confirm("Tem certeza que deseja excluir este item e todos os seus subcomponentes? Esta ação não pode ser desfeita.")) {
      return;
    }

    // Função Pura e Recursiva: Não modifica a árvore original, mas cria uma nova.
    const removeNodeRecursively = (nodes: EquipmentNode[], idToRemove: string): EquipmentNode[] => {
      // Usa .filter para remover o item no nível atual e .map para processar os filhos.
      return nodes
        .filter(node => node.id !== idToRemove)
        .map(node => {
          // Se o nó tiver filhos, chama esta mesma função para a lista de filhos.
          if (node.children && node.children.length > 0) {
            // CRÍTICO: Retorna um *novo objeto de nó* com a lista de filhos já filtrada e atualizada.
            // Isso garante a imutabilidade em cascata, forçando o React a detectar a mudança.
            return { ...node, children: removeNodeRecursively(node.children, idToRemove) };
          }
          // Se não houver filhos, retorna o nó como está.
          return node;
        });
    };

    // Atualização Funcional: Garante que a operação seja executada sobre o estado mais recente da árvore.
    setEquipmentTree(prevTree => removeNodeRecursively(prevTree, nodeId));
  };


  const handleOpenServiceRequest = (node: EquipmentNode) => {
    setServiceRequestTarget(node);
    setIsServiceModalOpen(true);
  };

  const handleCreateWorkOrder = (data: Partial<WorkOrder>) => {
    const newOrder: any = {
      id: `OM-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      serviceRequestId: `SS-${Math.floor(Math.random() * 10000)}`,
      title: data.title || 'Nova Solicitação',
      machineName: data.machineName || '',
      type: 'C010 - Corretiva Imediata', 
      category: 'MC - Manutenção Corretiva',
      priority: 'C - Baixa/Rotina',
      status: 'Backlog (Aguardando Planejamento)',
      creationDate: new Date().toLocaleDateString('pt-BR'),
      baseDate: new Date().toLocaleDateString('pt-BR'),
      description: data.description || '',
      tasks: [], materials: [], safety: { lotoRequired: false, permitsRequired: [] }
    };
    setWorkOrders([newOrder, ...workOrders]);
    setActiveView('work-orders'); 
    setIsServiceModalOpen(false);
  };

  const handleUpdateWorkOrder = (id: string, updates: Partial<WorkOrder>) => {
    setWorkOrders(prev => prev.map(order => order.id === id ? { ...order, ...updates } : order));
  };

  const handleUpdatePreventiveStatus = (taskId: string, month: Month, status: PreventiveStatus) => {
    setPreventiveTasks(prev => prev.map(task => task.id === taskId ? { ...task, schedule: { ...task.schedule, [month]: status } } : task));
  };

  const handleUpdateLifespan = (id: string, newHours: number) => {
    setLifespanItems(prev => prev.map(item => item.id === id ? { ...item, currentHours: newHours, lastReadingDate: new Date().toLocaleDateString('pt-BR') } : item));
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'equipment': 
        return <EquipmentView 
          data={equipmentTree} 
          onAddNode={handleAddEquipment} 
          onEditNode={handleEditEquipment} 
          onDeleteNode={handleDeleteEquipment}
          onRequestService={handleOpenServiceRequest} 
        />;
      case 'plans': return <MaintenancePlans />; 
      case 'work-orders': 
        return <MaintenancePlanning orders={workOrders} onUpdateOrder={handleUpdateWorkOrder} onCreateOrder={handleCreateWorkOrder} />;
      case 'preventive': return <PreventiveSchedule tasks={preventiveTasks} onUpdateStatus={handleUpdatePreventiveStatus} />;
      case 'lifespan': return <LifespanControl items={lifespanItems} onUpdateReading={handleUpdateLifespan} />;
      case 'breakdowns': 
        return <BreakdownControl 
          records={breakdownRecords} 
          onUpdateRecord={handleUpdateBreakdownAnalysis} 
          onAddRecord={handleAddBreakdownRecord}
          onEditRecord={handleEditBreakdownRecord}
          onDeleteRecord={handleDeleteBreakdownRecord}
        />;
      case 'breakdown-tracking': return <BreakdownTracking 
          records={breakdownRecords} 
          onAddRecord={handleAddBreakdownRecord}
          onEditRecord={handleEditBreakdownRecord}
          onDeleteRecord={handleDeleteBreakdownRecord}
        />;
      case 'manuals': return <ManualsLibrary />;
      default: return <PlaceholderView title={activeView} />;
    }
  };

  return (
    <Layout activeView={activeView} onNavigate={setActiveView}>
      {renderContent()}
      <ServiceRequestModal 
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSubmit={handleCreateWorkOrder}
        targetNode={serviceRequestTarget}
      />
    </Layout>
  );
}