
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Network, 
  ClipboardList, 
  AlertTriangle, 
  Settings, 
  Menu, 
  X,
  Database,
  FileText,
  BookOpen,
  CalendarClock,
  Hourglass,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileCode, // Icon for Plans
  BarChart3 // NEW ICON
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [logoError, setLogoError] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'equipment', label: 'Árvore de Ativos', icon: Network },
    { id: 'plans', label: 'Planos de Manutenção', icon: FileCode }, // New Item
    { id: 'work-orders', label: 'Planejamento da Manutenção', icon: ClipboardList },
    { id: 'preventive', label: 'Cronograma Preventivas', icon: CalendarClock },
    { id: 'lifespan', label: 'Controle Vida Útil', icon: Hourglass },
    { id: 'breakdowns', label: 'Análise de Quebra e Falha', icon: AlertTriangle },
    { id: 'breakdown-tracking', label: 'Acompanhamento de Quebras', icon: BarChart3 },
    { id: 'manuals', label: 'Manuais Técnicos', icon: BookOpen },
    { id: 'inventory', label: 'Estoque / Peças', icon: Database },
    { id: 'contracts', label: 'Contratos', icon: FileText },
  ];

  const activeItem = menuItems.find(i => i.id === activeView);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-600">
      {/* Sidebar - Dark Theme with Floating Logo Card */}
      <aside 
        className={`
          ${isSidebarOpen ? 'w-72' : 'w-20'} 
          bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] flex flex-col shadow-2xl z-30
        `}
      >
        {/* Header with Logo Card */}
        <div className="h-24 flex items-center justify-center px-3 bg-slate-900 shrink-0 relative transition-all">
          <div className={`
            bg-white transition-all duration-300 ease-in-out flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)] overflow-hidden
            ${isSidebarOpen ? 'w-full py-2 px-4 rounded-xl mx-2' : 'w-10 h-10 rounded-full p-1'}
          `}>
             {isSidebarOpen ? (
                !logoError ? (
                  <img 
                    src="https://fibrasa.com.br/wp-content/themes/fibrasa/assets/images/logo.png" 
                    alt="Fibrasa" 
                    className="w-full h-10 object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="font-bold text-xl text-emerald-700 tracking-tighter">FIBRASA</span>
                )
             ) : (
                <div className="w-full h-full flex items-center justify-center bg-white">
                   <span className="font-bold text-xl text-emerald-700 leading-none pb-1">f</span>
                </div>
             )}
          </div>

          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="absolute -right-3 top-1/2 -translate-y-1/2 p-1 bg-slate-800 text-slate-400 hover:text-white border border-slate-700 rounded-full transition-colors shadow-sm z-50 hover:bg-emerald-600 hover:border-emerald-600"
          >
            {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent w-full"></div>

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar px-3 bg-slate-900">
          <p className={`px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 transition-opacity duration-300 ${!isSidebarOpen && 'opacity-0 text-center hidden'}`}>
            Módulos do Sistema
          </p>
          
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  w-full flex items-center px-3 py-3.5 rounded-xl transition-all duration-200 group relative mb-1
                  ${isActive 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-900/30 font-medium' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
                title={!isSidebarOpen ? item.label : ''}
              >
                <div className={`
                  ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'} 
                  transition-colors min-w-[24px] flex justify-center
                `}>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {isSidebarOpen && (
                  <span className="ml-3 text-sm whitespace-nowrap tracking-wide">{item.label}</span>
                )}
                
                {/* Active Indicator Pips */}
                {!isSidebarOpen && isActive && (
                  <div className="absolute right-2 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <button className="flex items-center w-full px-3 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors group">
            <Settings size={20} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
            {isSidebarOpen && <span className="ml-3 text-sm font-medium">Configurações</span>}
          </button>
          <button className="flex items-center w-full px-3 py-3 mt-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors group">
            <LogOut size={20} className="text-slate-500 group-hover:text-rose-400 transition-colors" />
            {isSidebarOpen && <span className="ml-3 text-sm font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-100">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-20 sticky top-0 border-b border-slate-200/80 backdrop-blur-md bg-white/90">
          <div className="flex items-center gap-4">
             <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-slate-400">
                {activeItem?.icon && React.createElement(activeItem.icon, { size: 20 })}
             </div>
             <div>
                <h2 className="text-lg font-bold text-slate-800 capitalize tracking-tight leading-none">
                  {activeItem?.label || activeView}
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-medium hidden sm:block">Gestão de Manutenção Inteligente</p>
             </div>
          </div>
          
          <div className="flex items-center space-x-6">
             <div className="hidden md:flex items-center text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse"></span>
                Online
             </div>
             
             <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
             
             <div className="flex items-center gap-3 cursor-pointer group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-700 leading-none group-hover:text-emerald-700 transition-colors">Admin</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Gestor PCM</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold border-2 border-slate-200 shadow-md group-hover:border-emerald-500 transition-colors">
                  FB
                </div>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 scroll-smooth bg-slate-100">
          <div className="max-w-[1600px] mx-auto h-full animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
