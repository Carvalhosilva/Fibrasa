


import { EquipmentNode, Sector, WorkOrder, Breakdown, BreakdownAuditRecord, MaintenanceType, PreventiveTask, PreventiveStatus, ComponentLifespan, LifespanStatus, OMPriority, OMStatus, OMType, OMCategory, MaintenancePlan, PlanStrategy, LeanColor } from './types';

// ... (MOCK_EQUIPMENT_TREE remains unchanged) ...
export const MOCK_EQUIPMENT_TREE: EquipmentNode[] = [
  {
    id: 'INJ-ES-01',
    name: 'Injetora Engel e-speed 550/70 N°1',
    type: 'Máquina',
    sector: Sector.INJECTION,
    status: 'Operando',
    model: 'e-speed 550/70',
    serial: 'ENG-2023-X99',
    criticalityClass: 'AA',
    children: [
      {
        id: 'INJ-ES-01-UF',
        name: 'UNIDADE DE FECHAMENTO',
        type: 'Subconjunto',
        sector: Sector.INJECTION,
        status: 'Operando',
        children: [
          { id: 'INJ-ES-01-UF-01', name: 'Placa porta-moldes fixa', type: 'Componente', sector: Sector.INJECTION, status: 'Operando' },
          { id: 'INJ-ES-01-UF-02', name: 'Placa porta-moldes móvel', type: 'Componente', sector: Sector.INJECTION, status: 'Operando' },
          { id: 'INJ-ES-01-UF-03', name: 'Guias lineares', type: 'Componente', sector: Sector.INJECTION, status: 'Operando' },
          { id: 'INJ-ES-01-UF-04', name: 'Buchas de guia', type: 'Componente', sector: Sector.INJECTION, status: 'Alerta' },
          { id: 'INJ-ES-01-UF-05', name: 'Sapatas da máquina (Crítico)', type: 'Componente', sector: Sector.INJECTION, status: 'Operando' },
          { id: 'INJ-ES-01-UF-06', name: 'Haste de fechamento', type: 'Componente', sector: Sector.INJECTION, status: 'Operando' },
          { id: 'INJ-ES-01-UF-07', name: 'Carros-guia', type: 'Componente', sector: Sector.INJECTION, status: 'Operando' },
          { id: 'INJ-ES-01-UF-08', name: 'Placas deslizantes', type: 'Componente', sector: Sector.INJECTION, status: 'Operando' },
          { id: 'INJ-ES-01-UF-09', name: 'Elementos de lubrificação (Graxa/Óleo)', type: 'Componente', sector: Sector.INJECTION, status: 'Operando' },
          { id: 'INJ-ES-01-UF-10', name: 'Armazenador de energia cinética', type: 'Componente', sector: Sector.INJECTION, status: 'Operando' },
          { id: 'INJ-ES-01-UF-11', name: 'Tirantes', type: 'Componente', sector: Sector.INJECTION, status: 'Operando' },
          { id: 'INJ-ES-01-UF-12', name: 'Motor da unidade de fechamento', type: 'Componente', sector: Sector.INJECTION, status: 'Operando' },
          { id: 'INJ-ES-01-UF-13', name: 'Correia dentada da unidade (Crítico)', type: 'Componente', sector: Sector.INJECTION, status: 'Alerta' },
          { id: 'INJ-ES-01-UF-14', name: 'Transdutor rotativo da correia', type: 'Componente', sector: Sector.INJECTION, status: 'Operando' }
        ]
      },
      // ... (Rest of INJ-ES-01 children)
    ]
  },
  {
    id: 'INJ-ES-02',
    name: 'Injetora Engel e-speed 550/70 N°2',
    type: 'Máquina',
    sector: Sector.INJECTION,
    status: 'Operando',
    model: 'e-speed 550/70',
    serial: 'ENG-2023-X100',
    criticalityClass: 'A',
    children: [] // Simplified for brevity in this update
  },
  {
    id: 'IMP-LIN-01',
    name: 'Linha de Aplicação de Sleeve 01',
    type: 'Máquina',
    sector: Sector.PRINTING,
    status: 'Operando',
    criticalityClass: 'B',
    children: [] // Simplified
  },
  {
    id: 'DEC-01',
    name: 'Máquina de Hot Stamping',
    type: 'Máquina',
    sector: Sector.DECORATION,
    status: 'Operando',
    criticalityClass: 'C',
    children: [] // Simplified
  }
];

export const MOCK_WORK_ORDERS: WorkOrder[] = [
  { 
    id: 'OM-2023-4501', 
    serviceRequestId: 'SS-10293',
    title: 'Troca de Filtro Hidráulico e Limpeza', 
    machineName: 'Injetora Engel e-speed', 
    sector: Sector.INJECTION,
    workCenter: 'MEC-01',
    type: OMType.P010, 
    category: OMCategory.MT,
    priority: OMPriority.C, 
    status: OMStatus.BACKLOG, 
    creationDate: '01/11/2023',
    baseDate: '15/11/2023', 
    assignedTo: 'João Planejador',
    description: 'Realizar substituição do elemento filtrante da linha de pressão e sucção. Verificar nível do óleo após procedimento. Requer parada de 2h.',
    tasks: [
      { id: '10', sequence: 10, description: 'Bloquear equipamento e drenar pressão residual', durationMinutes: 20, peopleRequired: 1, specialty: 'Mecânico' },
      { id: '20', sequence: 20, description: 'Substituir elemento filtrante HYD-55', durationMinutes: 40, peopleRequired: 1, specialty: 'Mecânico' },
      { id: '30', sequence: 30, description: 'Testar pressão e estanqueidade', durationMinutes: 30, peopleRequired: 1, specialty: 'Mecânico' }
    ],
    materials: [
      { id: 'MAT-550', code: '1000550', description: 'Elemento Filtrante Hidráulico 10µm', quantity: 1, unit: 'PC', stockStatus: 'Disponível', requisitionStatus: 'Não Gerada' },
      { id: 'MAT-900', code: '2000900', description: 'O-Ring de Vedação Tampa', quantity: 1, unit: 'PC', stockStatus: 'Indisponível', requisitionStatus: 'Pendente Aprovação', requisitionId: 'RQ-882' }
    ],
    safety: {
      lotoRequired: true,
      lotoPoints: ['Disjuntor Principal Q1', 'Válvula Esfera Tanque'],
      permitsRequired: ['PT - Permissão de Trabalho Geral']
    }
  },
];

// Deprecated mock - kept for type compatibility if any legacy code remains
export const MOCK_BREAKDOWNS: Breakdown[] = [
  { id: 'QF-55', machineId: 'IMP-03', machineName: 'Impressora Offset 6 Cores', timestamp: '27/10/2023 08:30', description: 'Rolos de tinta travaram durante a partida.', type: 'Mecânica', status: 'Aberto' },
  { id: 'QF-54', machineId: 'INJ-ES-01', machineName: 'Injetora Engel e-speed', timestamp: '25/10/2023 14:15', description: 'Erro de comunicação PLC código E404.', type: 'Elétrica', status: 'Resolvido', mttr: 45, rootCause: 'Conector Profibus solto' },
];

// --- New Audit-Compliant Breakdown Records ---
export const MOCK_BREAKDOWN_AUDIT_RECORDS: BreakdownAuditRecord[] = [
  {
    codigo: 'QF-2023-1120',
    mes: 'Novembro',
    setor: Sector.INJECTION,
    maquina: 'Injetora Engel e-speed 550/70 N°1',
    motivo: 'Elétrica',
    inicio: '20/11/2023 08:30',
    fim: '20/11/2023 10:45',
    duracaoMin: 135,
    ss: 'SS-5501',
    servicoSolicitado: 'Máquina parou com alarme de temperatura no drive principal.',
    servicoExecutado: 'Substituição do ventilador do painel do inversor e limpeza do dissipador.',
    conjunto: 'Painel Elétrico Principal',
    executante: 'Carlos Eletricista',
    aposSetup: 'Não',
    statusAQF: 'Pendente',
    marca: 'ENGEL',
    modelo: 'e-speed 550/70',
    monitoradoPreditiva: 'Sim',
    evidencia: '',
    envolvidos: [],
    aprovacoes: {
      dataEncerramento: '',
      responsavelManutencao: '',
      gestorManutencao: '',
      confiabilidade: '',
    }
  },
  {
    codigo: 'QF-2023-1115',
    mes: 'Novembro',
    setor: Sector.PRINTING,
    maquina: 'Linha de Aplicação de Sleeve 01',
    motivo: 'Mecânica',
    inicio: '15/11/2023 14:00',
    fim: '15/11/2023 15:30',
    duracaoMin: 90,
    ss: 'SS-5480',
    servicoSolicitado: 'Faca de corte travando, rótulos saindo mastigados.',
    servicoExecutado: 'Ajuste da folga da faca e contra-faca. Lubrificação do eixo cames.',
    conjunto: 'Sistema de Corte',
    executante: 'Roberto Mecânico',
    aposSetup: 'Sim',
    statusAQF: 'Concluída',
    marca: 'SLEEVEMASTER',
    modelo: 'SM-2000',
    monitoradoPreditiva: 'Não',
    evidencia: 'Foto do desgaste da faca',
    aiAnalysis: {
      ishikawa: {
        metodo: 'Setup de corte sem padronização clara',
        material: 'Lâmina de corte com desgaste prematuro',
        maoDeObra: 'Ajuste manual dependente de habilidade',
        meioAmbiente: 'Ambiente com vibração normal de operação',
        maquina: 'Folga excessiva no mecanismo de corte'
      },
      whyAnalysis: {
        path1: {
            title: 'Corte Irregular',
            rootCause: 'Desgaste da lâmina não identificado',
            whys: ['Rótulos mastigados', 'Lâmina cega', 'Uso além da vida útil']
        },
        path2: {
            title: 'Folga no mecanismo',
            rootCause: 'Falta de ajuste periódico',
            whys: ['Movimento lateral da faca', 'Parafusos de fixação soltos']
        },
        path3: {
            title: 'Erro operacional',
            rootCause: 'Falta de gabarito de ajuste',
            whys: ['Ajuste visual impreciso', 'Variação entre operadores']
        }
      },
      conclusion: 'Falha originada por desgaste de lâmina combinado com ajuste inadequado (folga). Requer padronização do setup.',
      actionPlan: [
        { what: 'Treinamento de operadores no padrão de setup', who: 'Gestão', when: '20/11/2023', status: 'Concluído' },
        { what: 'Criar gabarito de ajuste rápido (Poka-yoke)', who: 'Engenharia', when: '15/12/2023', status: 'Planejado' }
      ],
      severityScore: 6
    },
    envolvidos: [
      { matricula: '12345', nome: 'Roberto Mecânico', cargo: 'Mecânico Líder', area: 'Manutenção' },
      { matricula: '54321', nome: 'Ana Operadora', cargo: 'Operador de Máquina', area: 'Produção' },
    ],
    aprovacoes: {
      dataEncerramento: '16/11/2023',
      responsavelManutencao: 'Carlos Supervisor',
      gestorManutencao: 'Fernando Gerente',
      confiabilidade: 'Equipe PCM',
    }
  },
  {
    codigo: 'QF-2023-1005',
    mes: 'Outubro',
    setor: Sector.DECORATION,
    maquina: 'Máquina de Hot Stamping',
    motivo: 'Operacional',
    inicio: '05/10/2023 09:00',
    fim: '05/10/2023 09:20',
    duracaoMin: 20,
    ss: 'SS-5100',
    servicoSolicitado: 'Fita de hot stamping rompendo constantemente.',
    servicoExecutado: 'Ajuste de tensão da fita e temperatura do cabeçote.',
    conjunto: 'Cabeçote de Aplicação',
    executante: 'Operador Líder',
    aposSetup: 'Sim',
    statusAQF: 'Pendente',
    marca: '',
    modelo: '',
    monitoradoPreditiva: 'Não',
    evidencia: '',
    envolvidos: [],
    aprovacoes: {
      dataEncerramento: '',
      responsavelManutencao: '',
      gestorManutencao: '',
      confiabilidade: '',
    }
  }
];

export const MOCK_PREVENTIVE_SCHEDULE: PreventiveTask[] = [
  {
    id: 'PV-001',
    machine: 'Injetora Engel 01',
    component: 'Filtro de Óleo Hidráulico',
    task: 'Substituição do Elemento Filtrante',
    frequency: 'Semestral',
    sector: Sector.INJECTION,
    responsible: 'Mecânica',
    schedule: {
      'Jan': PreventiveStatus.DONE, 'Fev': PreventiveStatus.NA, 'Mar': PreventiveStatus.NA, 
      'Abr': PreventiveStatus.NA, 'Mai': PreventiveStatus.NA, 'Jun': PreventiveStatus.LATE,
      'Jul': PreventiveStatus.NA, 'Ago': PreventiveStatus.NA, 'Set': PreventiveStatus.NA,
      'Out': PreventiveStatus.NA, 'Nov': PreventiveStatus.NA, 'Dez': PreventiveStatus.PROGRAMMED
    }
  },
];

export const MOCK_LIFESPAN: ComponentLifespan[] = [
  {
    id: 'LS-01',
    machine: 'Injetora Engel 01',
    component: 'Fuso Plastificador',
    sector: Sector.INJECTION,
    installDate: '15/01/2020',
    maxLifeHours: 25000,
    currentHours: 18500,
    lastReadingDate: '25/10/2023',
    unit: 'Horas',
    history: [
      { date: '15/01/2020', readingAtExchange: 24500, reason: 'Preventiva (Desgaste)', technician: 'Carlos S.' },
      { date: '10/01/2018', readingAtExchange: 23000, reason: 'Quebra Prematura', technician: 'João D.' }
    ]
  },
];

export const MOCK_MAINTENANCE_PLANS: MaintenancePlan[] = [
  {
    id: 'MP-001',
    planCode: 'PLN-INJ-001',
    assetId: 'INJ-ES-01',
    assetName: 'Injetora Engel e-speed 550/70 N°1',
    assetCriticality: 'AA',
    strategy: PlanStrategy.PREDICTIVE,
    frequencyValue: 1,
    frequencyUnit: 'Mês',
    pfInterval: 90, // dias
    workCenter: 'PRED-01',
    status: 'Ativo',
    impactsNR13: false,
    impactsISO9001: true,
    impactsISO14001: false,
    tasks: [
      {
        id: 'T1',
        sequence: 10,
        description: 'Coletar assinatura de vibração motor principal (Espectro)',
        leanColor: LeanColor.GREEN,
        criticity: 'Baixa',
        frequency: 'Média',
        complexity: 'Alta'
      },
      {
        id: 'T2',
        sequence: 20,
        description: 'Termografia painel principal Q1 e Q2',
        leanColor: LeanColor.YELLOW,
        criticity: 'Média',
        frequency: 'Média',
        complexity: 'Média',
        checklistRequired: true
      }
    ]
  },
  {
    id: 'MP-002',
    planCode: 'PLN-IMP-055',
    assetId: 'IMP-LIN-01',
    assetName: 'Linha de Aplicação de Sleeve 01',
    assetCriticality: 'B',
    strategy: PlanStrategy.SENSITIVE,
    frequencyValue: 1,
    frequencyUnit: 'Semana',
    workCenter: 'OPER-01',
    status: 'Em Revisão',
    impactsNR13: false,
    impactsISO9001: false,
    impactsISO14001: false,
    tasks: [
       {
        id: 'T1',
        sequence: 10,
        description: 'Verificar vazamento de vapor na linha de entrada',
        leanColor: LeanColor.RED,
        criticity: 'Alta',
        frequency: 'Alta',
        complexity: 'Baixa',
        standardCode: 'IMPR-SE-0051'
      }
    ]
  }
];