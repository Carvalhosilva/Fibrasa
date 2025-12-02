

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, ChevronDown, Monitor, Box, Disc, Activity, PenTool, Plus, X, Wrench, PenLine, Trash2, Search, Filter, FolderOpen, MoreHorizontal } from 'lucide-react';
import { EquipmentNode, Sector } from '../types';

// --- Helper de Filtragem Recursiva ---
const filterTreeHelper = (nodes: EquipmentNode[], term: string): EquipmentNode[] => {
  if (!term) return nodes;
  
  return nodes.reduce((acc: EquipmentNode[], node) => {
    // Verifica se o nó atual corresponde
    const matchesSelf = node.name.toLowerCase().includes(term.toLowerCase()) || 
                        node.id.toLowerCase().includes(term.toLowerCase());
    
    // Filtra os filhos recursivamente
    const filteredChildren = node.children ? filterTreeHelper(node.children, term) : [];
    
    // Se o nó atual der match OU tiver filhos que deram match, inclui no resultado
    if (matchesSelf || filteredChildren.length > 0) {
      acc.push({
        ...node,
        children: filteredChildren
      });
    }
    
    return acc;
  }, []);
};

// --- Props do Item da Árvore ---
interface TreeNodeProps {
  node: EquipmentNode;
  level: number;
  onAddChild: (parentId: string, parentSector: Sector) => void;
  onEditNode: (node: EquipmentNode) => void;
  onDeleteNode: (id: string) => void;
  onRequestService: (node: EquipmentNode) => void;
  isFiltered: boolean;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}

// --- Componente de Nó Individual ---
const TreeNode: React.FC<TreeNodeProps> = ({ 
  node, level, onAddChild, onEditNode, onDeleteNode, onRequestService, isFiltered, selectedNodeId, onSelectNode 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true); 
  
  // Se estiver filtrando, força a expansão
  useEffect(() => {
    if (isFiltered) setIsCollapsed(false);
  }, [isFiltered]);

  const hasChildren = node.children && node.children.length > 0;
  const isSelected = node.id === selectedNodeId;

  const getIcon = (type: string) => {
    switch (type) {
      case 'Máquina': return <Monitor className={isSelected ? "text-emerald-700" : "text-emerald-600"} size={18} />;
      case 'Subconjunto': return <Box className={isSelected ? "text-indigo-600" : "text-indigo-500"} size={16} />;
      case 'Componente': return <Disc className={isSelected ? "text-slate-500" : "text-slate-400"} size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Operando': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Parado': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Alerta': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Manutenção': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="select-none relative">
      {/* Linha do Item - Clique seleciona o item */}
      <div 
        onClick={(e) => {
          e.stopPropagation(); // Impede propagação para pais
          onSelectNode(node.id);
        }}
        className={`
          flex items-center py-2 px-3 transition-all border-b border-slate-50 relative cursor-pointer
          ${level === 0 ? 'mt-1 rounded-t-lg' : ''}
          ${isSelected 
            ? 'bg-emerald-50 border-emerald-200 shadow-sm z-10' 
            : 'hover:bg-slate-50'
          }
        `}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        {/* Conector Visual (Linhas da Árvore) */}
        {level > 0 && (
          <div className="absolute left-0 top-0 bottom-0 border-l border-slate-200" style={{ left: `${level * 24 - 12}px` }}></div>
        )}
        {level > 0 && (
          <div className="absolute top-1/2 w-3 border-t border-slate-200" style={{ left: `${level * 24 - 12}px` }}></div>
        )}

        {/* Botão de Expansão */}
        <div className="w-6 shrink-0 flex justify-center z-10 relative">
          {hasChildren ? (
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsCollapsed(!isCollapsed); }}
              className="p-0.5 rounded hover:bg-slate-200 text-slate-400 transition-colors focus:outline-none"
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
          ) : (
            <span className="w-4" />
          )}
        </div>
        
        {/* Ícone */}
        <span className="mr-3 shrink-0 relative z-10">{getIcon(node.type)}</span>
        
        {/* Dados do Item */}
        <div className="flex-1 flex items-center justify-between overflow-hidden gap-4 min-w-0">
          <div className="flex flex-col min-w-0">
             <span className={`text-sm truncate ${level === 0 ? 'text-slate-800 font-bold' : 'text-slate-700 font-medium'} ${isSelected ? 'text-emerald-900 font-bold' : ''}`}>
               {node.name}
             </span>
             <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono truncate hidden sm:inline-block ${isSelected ? 'text-emerald-600/70' : 'text-slate-400'}`}>
                  {node.id}
                </span>
             </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            {/* Status Badge */}
            {!isSelected && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide whitespace-nowrap ${getStatusColor(node.status)}`}>
                {node.status}
              </span>
            )}
            
            {/* 
                BOTÕES DE AÇÃO - VISÍVEIS APENAS SE SELECIONADO 
            */}
            {isSelected && (
              <div className="flex items-center gap-1 animate-fade-in absolute right-2 bg-white p-1 rounded-lg border border-emerald-200 shadow-md z-20">
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRequestService(node); }}
                  className="p-1.5 text-slate-500 hover:text-white hover:bg-amber-500 rounded transition-colors"
                  title="Abrir Solicitação de Serviço"
                >
                  <Wrench size={14} />
                </button>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onEditNode(node); }}
                  className="p-1.5 text-slate-500 hover:text-white hover:bg-blue-600 rounded transition-colors"
                  title="Editar Item"
                >
                  <PenLine size={14} />
                </button>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onAddChild(node.id, node.sector); setIsCollapsed(false); }}
                  className="p-1.5 text-emerald-600 hover:text-white hover:bg-emerald-600 rounded transition-colors"
                  title="Adicionar Subitem"
                >
                  <Plus size={14} />
                </button>
                <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id); }}
                  className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-600 rounded transition-colors"
                  title="Excluir Item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Filhos (Recursivo) */}
      {!isCollapsed && hasChildren && (
        <div className="relative">
          {node.children!.map(child => (
            <TreeNode 
              key={child.id} 
              node={child} 
              level={level + 1} 
              onAddChild={onAddChild} 
              onEditNode={onEditNode}
              onDeleteNode={onDeleteNode}
              onRequestService={onRequestService}
              isFiltered={isFiltered}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Modal de Formulário (Add/Edit) ---
interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (node: EquipmentNode, originalId?: string) => void;
  parentId: string | null;
  parentSector: Sector | null;
  initialData?: EquipmentNode | null;
}

const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({ isOpen, onClose, onSave, parentId, parentSector, initialData }) => {
  const [formData, setFormData] = useState<Partial<EquipmentNode>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({
            name: '',
            id: '',
            type: parentId ? 'Subconjunto' : 'Máquina',
            sector: parentSector || Sector.INJECTION,
            status: 'Operando',
            children: []
        });
      }
    }
  }, [isOpen, initialData, parentId, parentSector]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      alert("O nome é obrigatório.");
      return;
    }

    // Gera ID se vazio
    const finalId = formData.id?.trim() || `${formData.type?.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 10000)}`;

    const newNode: EquipmentNode = {
      id: finalId,
      name: formData.name.trim(),
      type: formData.type || 'Item',
      sector: initialData ? formData.sector! : (parentSector || formData.sector!),
      status: formData.status || 'Operando',
      children: initialData?.children || [], // Mantém filhos se for edição
      model: formData.model,
      serial: formData.serial
    };
    
    onSave(newNode, initialData?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            {initialData ? <PenLine size={18} className="text-blue-600"/> : <Plus size={18} className="text-emerald-600"/>}
            {initialData ? 'Editar Item' : 'Novo Item'}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nome *</label>
            <input 
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              value={formData.name || ''}
              onChange={e => setFormData({...formData, name: e.target.value})}
              autoFocus
              placeholder="Ex: Motor Principal"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">ID (Opcional)</label>
              <input 
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 font-mono"
                value={formData.id || ''}
                onChange={e => setFormData({...formData, id: e.target.value})}
                placeholder="Auto"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tipo</label>
              <select 
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as any})}
              >
                <option value="Máquina">Máquina</option>
                <option value="Subconjunto">Subconjunto</option>
                <option value="Componente">Componente</option>
                <option value="Item">Item</option>
              </select>
            </div>
          </div>

          {!parentId && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Setor</label>
              <select 
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white"
                value={formData.sector}
                onChange={e => setFormData({...formData, sector: e.target.value as any})}
              >
                {Object.values(Sector).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-50 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg font-bold">Cancelar</button>
            <button type="submit" className="px-6 py-2 text-sm bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 font-bold shadow-md">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Componente Principal ---
interface EquipmentViewProps {
  data: EquipmentNode[];
  onAddNode: (parentId: string | null, node: EquipmentNode) => void;
  onEditNode: (originalId: string, node: EquipmentNode) => void;
  onDeleteNode: (id: string) => void;
  onRequestService: (node: EquipmentNode) => void;
}

export const EquipmentView: React.FC<EquipmentViewProps> = ({ data, onAddNode, onEditNode, onDeleteNode, onRequestService }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('All');
  
  // Controle de Seleção
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Controle de Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [targetParent, setTargetParent] = useState<{ id: string | null, sector: Sector | null }>({ id: null, sector: null });
  const [editingNode, setEditingNode] = useState<EquipmentNode | null>(null);

  // Lógica de Filtragem (Memoizada)
  const displayedData = useMemo(() => {
    let filtered = data;
    
    // 1. Filtro de Setor (apenas raízes)
    if (sectorFilter !== 'All') {
      filtered = filtered.filter(n => n.sector === sectorFilter);
    }

    // 2. Filtro de Texto (Recursivo)
    if (searchTerm.trim()) {
      filtered = filterTreeHelper(filtered, searchTerm.trim());
    }

    return filtered;
  }, [data, sectorFilter, searchTerm]);

  // Actions
  const openAddRoot = () => {
    setEditingNode(null);
    setTargetParent({ id: null, sector: null });
    setModalOpen(true);
  };

  const openAddChild = (pid: string, psector: Sector) => {
    setEditingNode(null);
    setTargetParent({ id: pid, sector: psector });
    setModalOpen(true);
  };

  const openEdit = (node: EquipmentNode) => {
    setEditingNode(node);
    setTargetParent({ id: null, sector: null }); // Não relevante para edição
    setModalOpen(true);
  };

  const handleSaveModal = (node: EquipmentNode, originalId?: string) => {
    if (editingNode && originalId) {
      onEditNode(originalId, node);
    } else {
      onAddNode(targetParent.id, node);
    }
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-fade-in" onClick={() => setSelectedNodeId(null)}>
      {/* Barra de Ferramentas */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-100">
               <PenTool size={20} />
            </div>
            <div>
               <h2 className="font-bold text-slate-800 text-lg leading-tight">Hierarquia de Ativos</h2>
               <p className="text-xs text-slate-400 font-medium">Cadastre máquinas, conjuntos e componentes</p>
            </div>
         </div>
         
         <div className="flex flex-1 gap-3 w-full md:w-auto justify-end">
            <div className="relative flex-1 md:max-w-xs">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                 placeholder="Buscar peça, máquina..."
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                className="pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 outline-none cursor-pointer hover:bg-white transition-colors appearance-none"
                value={sectorFilter}
                onChange={e => setSectorFilter(e.target.value)}
              >
                <option value="All">Todos Setores</option>
                {Object.values(Sector).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); openAddRoot(); }}
              className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-800 transition-all shadow-md flex items-center gap-2"
            >
              <Plus size={16} /> <span className="hidden sm:inline">Nova Raiz</span>
            </button>
         </div>
      </div>

      {/* Árvore Container */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
        <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-slate-50/30">
          {displayedData.length > 0 ? (
            displayedData.map(node => (
              <TreeNode 
                key={node.id} 
                node={node} 
                level={0}
                onAddChild={openAddChild}
                onEditNode={openEdit}
                onDeleteNode={onDeleteNode}
                onRequestService={onRequestService}
                isFiltered={!!searchTerm}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />
            ))
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
               <FolderOpen size={48} className="mb-4" />
               <span className="font-medium">Nenhum item encontrado.</span>
             </div>
          )}
        </div>
        <div className="p-2 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-400 text-center font-medium">
            {displayedData.length} itens raiz visualizados • Clique no item para ver opções
        </div>
      </div>

      <AddEquipmentModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleSaveModal}
        parentId={targetParent.id}
        parentSector={targetParent.sector}
        initialData={editingNode}
      />
    </div>
  );
};