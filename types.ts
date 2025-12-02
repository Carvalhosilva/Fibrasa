


export enum Sector {
  INJECTION = 'Injeção',
  PRINTING = 'Impressão',
  DECORATION = 'Decoração',
  CONTRACTS = 'Contratos'
}

export enum Criticality {
  A = 'A - Crítico',
  B = 'B - Importante',
  C = 'C - Regular'
}

export enum MaintenanceType {
  PREVENTIVE = 'Preventiva',
  CORRECTIVE = 'Corretiva',
  PREDICTIVE = 'Preditiva'
}

export interface EquipmentNode {
  id: string;
  name: string;
  type: 'Máquina' | 'Subconjunto' | 'Componente' | 'Item';
  sector: Sector;
  status: 'Operando' | 'Parado' | 'Alerta' | 'Manutenção';
  children?: EquipmentNode[];
  model?: string;
  serial?: string;
  installationDate?: string;
  criticalityClass?: 'AA' | 'A' | 'B' | 'C'; // Added for PT-MAN-GMAN-00-0001
}

// Legacy breakdown type (kept for compatibility if needed, but AuditRecord is preferred)
export interface Breakdown {
  id: string;
  machineId: string;
  machineName: string;
  timestamp: string;
  description: string;
  type: 'Mecânica' | 'Elétrica' | 'Operacional' | 'Outros';
  status: 'Aberto' | 'Em Análise' | 'Resolvido';
  mttr?: number; // Minutos
  rootCause?: string;
  aiAnalysis?: AQFResult;
}

// --- New Strict Types for Breakdown Control (Audit Compliance) ---

export interface EnvolvidoAnalise {
  matricula: string;
  nome: string;
  cargo: string;
  area: string;
}

export interface Aprovacao {
  dataEncerramento: string;
  responsavelManutencao: string;

  gestorManutencao: string;
  confiabilidade: string;
}

export interface BreakdownAuditRecord {
  codigo: string;
  mes: string;
  setor: Sector;
  maquina: string;
  motivo: string; // Tipo da falha/Motivo Macro
  inicio: string; // DD/MM/YYYY HH:mm
  fim: string;    // DD/MM/YYYY HH:mm
  duracaoMin: number;
  ss: string; // Solicitação de Serviço
  servicoSolicitado: string;
  servicoExecutado: string;
  conjunto: string;
  executante: string;
  aposSetup: 'Sim' | 'Não';

  // DADOS DO EQUIPAMENTO fields
  marca?: string;
  modelo?: string;
  monitoradoPreditiva?: 'Sim' | 'Não';
  evidencia?: string;
  
  // AI/Analysis fields (extending the form)
  aiAnalysis?: AQFResult;
  statusAQF: 'Pendente' | 'Concluída';

  // Manual fields for the form
  envolvidos?: EnvolvidoAnalise[];
  aprovacoes?: Aprovacao;
}

export interface WhyPath {
  title: string; // Causa 1: Ajuste incorreto...
  rootCause: string; // Causa Raiz desta linha
  whys: string[]; // Array of up to 5 strings
}

export interface ActionPlanItem {
  what: string;
  who: string;
  when: string;
  status: string;
}

export interface AQFResult {
  // Ishikawa / Causas e Efeito
  ishikawa: {
    metodo: string;
    material: string;
    maoDeObra: string;
    meioAmbiente: string;
    maquina: string;
  };
  
  // 5 Porquês (Up to 3 paths)
  whyAnalysis: {
    path1: WhyPath;
    path2: WhyPath;
    path3: WhyPath;
  };

  // Conclusão e Plano
  conclusion: string;
  actionPlan: ActionPlanItem[];
  
  // Metadata for simple display if needed
  severityScore?: number; 
}

// --- Novos Tipos para PCM Avançado (PT-MAN-GMAN-00-0006) ---

export enum OMPriority {
  A = 'A - Urgência (24h)',
  B = 'B - Data Fixa (72h)',
  C = 'C - Baixa/Rotina',
  Z = 'Z - Carteira Reserva'
}

export enum OMType {
  C010 = 'C010 - Corretiva Imediata',
  C020 = 'C020 - Corretiva Diferida',
  P010 = 'P010 - Preventiva Sistemática',
  P030 = 'P030 - Inspeção / Sensitiva',
  P050 = 'P050 - Preditiva',
  P060 = 'P060 - Preventiva Condicional',
  I010 = 'I010 - Melhoria / Reforma'
}

export enum OMCategory {
  MC = 'MC - Manutenção Corretiva',
  MT = 'MT - Manutenção Preventiva',
  IM = 'IM - Inspeção e Medição',
  MD = 'MD - Manutenção por Condição',
  IP = 'IP - Inspeção Preditiva',
  ML = 'ML - Melhorias',
  RE = 'RE - Reforma'
}

export enum OMStatus {
  BACKLOG = 'Backlog (Aguardando Planejamento)',
  PLANNING = 'Em Planejamento',
  WAITING_MAT = 'Aguardando Material',
  READY = 'Liberado para Programação',
  PROGRAMMED = 'Programado',
  EXECUTING = 'Em Execução',
  FINISHED = 'Encerrado',
  CANCELED = 'Cancelado'
}

export interface OMTask {
  id: string;
  sequence: number;
  description: string;
  durationMinutes: number;
  peopleRequired: number;
  specialty: string; // Mecânico, Eletricista, etc.
}

export interface OMMaterial {
  id: string;
  code: string;
  description: string;
  quantity: number;
  unit: string;
  stockStatus: 'Disponível' | 'Indisponível' | 'Reservado';
  requisitionStatus: 'Não Gerada' | 'Pendente Aprovação' | 'Aprovada' | 'Em Trânsito' | 'Entregue';
  requisitionId?: string;
  leadTimeDays?: number;
}

export interface OMSafety {
  lotoRequired: boolean;
  lotoPoints?: string[];
  permitsRequired: string[]; // PT, Espaço Confinado, Altura
  notes?: string;
}

export interface WorkOrder {
  id: string;
  serviceRequestId: string; // Vinculo com Solicitação de Serviço (antiga Nota PM)
  title: string;
  machineName: string;
  sector: Sector;
  workCenter: string; // Centro de Trabalho
  
  // Classificações
  type: OMType;
  category: OMCategory;
  priority: OMPriority;
  status: OMStatus;
  
  // Datas
  creationDate: string;
  baseDate: string; // Data base para inicio
  limitDate?: string; // Data limite ( SLA)
  
  // Planejamento Detalhado
  description?: string;
  assignedTo?: string; // Planejador responsável
  
  tasks: OMTask[];
  materials: OMMaterial[];
  safety: OMSafety;
  
  totalEstimatedTime?: number; // minutos
  totalEstimatedCost?: number;
}

export interface KPI {
  availability: number;
  mtbf: number;
  mttr: number;
  cost: number;
}

export type Month = 'Jan' | 'Fev' | 'Mar' | 'Abr' | 'Mai' | 'Jun' | 'Jul' | 'Ago' | 'Set' | 'Out' | 'Nov' | 'Dez';

export enum PreventiveStatus {
  PROGRAMMED = 'Programado',
  DONE = 'Realizado',
  LATE = 'Atrasado',
  RESCHEDULED = 'Reprogramado',
  NA = 'N/A'
}

export interface PreventiveTask {
  id: string;
  machine: string;
  component: string;
  task: string;
  frequency: 'Mensal' | 'Bimestral' | 'Trimestral' | 'Semestral' | 'Anual';
  sector: Sector;
  schedule: Record<Month, PreventiveStatus>;
  responsible: string;
}

export enum LifespanStatus {
  OK = 'OK',
  WARNING = 'Atenção',
  CRITICAL = 'Crítico',
  EXCEEDED = 'Excedido'
}

export interface LifespanHistoryEntry {
  date: string;
  readingAtExchange: number;
  reason: string;
  technician: string;
}

export interface ComponentLifespan {
  id: string;
  machine: string;
  component: string;
  sector: Sector;
  installDate: string;
  maxLifeHours: number;
  currentHours: number;
  lastReadingDate: string;
  unit: 'Horas' | 'Ciclos';
  history?: LifespanHistoryEntry[];
}

// --- Planos de Manutenção (PT-MAN-GMAN-00-0001) ---

export enum PlanStrategy {
  PREDICTIVE = 'Manutenção Preditiva',
  PREVENTIVE_TIME = 'Preventiva por Tempo',
  PREVENTIVE_COUNTER = 'Preventiva por Contador',
  SENSITIVE = 'Inspeção Sensitiva',
  DETECTIVE = 'Manutenção Detectiva',
  REDESIGN = 'Reprojeto'
}

export enum LeanColor {
  GREEN = 'Verde',
  YELLOW = 'Amarelo',
  RED = 'Vermelho'
}

export interface PlanTask {
  id: string;
  sequence: number;
  description: string;
  leanColor: LeanColor;
  
  // Classification Matrix inputs
  criticity: 'Alta' | 'Média' | 'Baixa';
  frequency: 'Alta' | 'Média' | 'Baixa';
  complexity: 'Alta' | 'Média' | 'Baixa';
  
  standardCode?: string; // XXXX-SE-9999 (Required for Red)
  checklistRequired?: boolean; // Required for Yellow
}

export interface MaintenancePlan {
  id: string; // Internal ID
  planCode: string; // CMMS Code
  assetId: string;
  assetName: string;
  assetCriticality: 'AA' | 'A' | 'B' | 'C';
  
  strategy: PlanStrategy;
  frequencyValue: number;
  frequencyUnit: string;
  
  // P-F Curve logic for predictive
  pfInterval?: number;
  
  workCenter: string;
  status: 'Ativo' | 'Em Revisão' | 'Obsoleto';
  tasks: PlanTask[];
  
  impactsNR13: boolean;
  impactsISO9001: boolean;
  impactsISO14001: boolean;
}