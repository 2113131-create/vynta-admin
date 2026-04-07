/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { AnalystContext } from './gemini';

export type ProjectStatus = 'active' | 'configuring' | 'paused';

export type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  users: number;
  sessionsToday: number;
  uptime: string;
  logo: string;
  gradientFrom: string;
  gradientTo: string;
  voice: string;
  model: string;
  systemPrompt: string;
  scrapeUrl: string;
  supabaseUrl: string;
};

export type DashboardData = {
  kpis: {
    usuariosHoy: number;
    tasaCompletado: number;
    categoriaPopular: string;
    tiempoPromedio: string;
    trendUsuarios: number;
    trendCompletado: number;
    trendTiempo: number;
  };
  categoriasCompletado: Array<{ name: string; value: number; fill: string }>;
  noticiasSalteadas: Array<{ id: number; title: string; category: string; skips: number }>;
  preguntasFrecuentes: Array<{ id: number; question: string; count: number }>;
  horariosPico: Array<{ hour: string; sesiones: number }>;
  users: Array<{ id: string; name: string; email: string; role: string; sessions: number; lastActive: string }>;
  sessions: Array<{ id: string; user: string; date: string; duration: string; categories: string[]; completed: boolean }>;
  conversations: Array<{ id: string; user: string; question: string; answer: string; category: string; flagged: boolean }>;
};

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Cadena 3',
    status: 'active',
    users: 1247,
    sessionsToday: 8450,
    uptime: '99.9%',
    logo: 'C3',
    gradientFrom: '#2563eb',
    gradientTo: '#1d4ed8',
    voice: 'Mario (Cadena 3)',
    model: 'llama-3.3-70b-versatile',
    systemPrompt:
      'Sos el presentador de noticias de Cadena 3. Tu tono es profesional, cercano y cordobés. Resumí las noticias de forma clara y concisa.',
    scrapeUrl: 'https://cadena3.com',
    supabaseUrl: 'https://abcxyz.supabase.co',
  },
  {
    id: 'p2',
    name: 'Clarín',
    status: 'configuring',
    users: 0,
    sessionsToday: 0,
    uptime: '-',
    logo: 'CL',
    gradientFrom: '#dc2626',
    gradientTo: '#991b1b',
    voice: 'Locutora Noticias',
    model: 'llama-3.3-70b-versatile',
    systemPrompt:
      'Sos el presentador de Clarín. Tu tono es neutral, informativo y porteño. Presentá las noticias con precisión y brevedad.',
    scrapeUrl: 'https://clarin.com',
    supabaseUrl: 'https://defpqr.supabase.co',
  },
  {
    id: 'p3',
    name: 'La Nación',
    status: 'paused',
    users: 450,
    sessionsToday: 0,
    uptime: '98.5%',
    logo: 'LN',
    gradientFrom: '#4b5563',
    gradientTo: '#1f2937',
    voice: 'Voz Neutra',
    model: 'llama-3.3-70b-versatile',
    systemPrompt:
      'Sos el presentador de La Nación. Tu tono es formal, objetivo y sofisticado. Priorizá la claridad y la profundidad informativa.',
    scrapeUrl: 'https://lanacion.com.ar',
    supabaseUrl: 'https://ghijkl.supabase.co',
  },
];

const DATA_BY_PROJECT: Record<string, DashboardData> = {
  p1: {
    kpis: {
      usuariosHoy: 1247,
      tasaCompletado: 68,
      categoriaPopular: 'Deportes',
      tiempoPromedio: '4m 12s',
      trendUsuarios: 12.5,
      trendCompletado: 3.2,
      trendTiempo: -1.5,
    },
    categoriasCompletado: [
      { name: 'Deportes', value: 82, fill: '#3b82f6' },
      { name: 'Política', value: 71, fill: '#6366f1' },
      { name: 'Economía', value: 58, fill: '#8b5cf6' },
      { name: 'Espectáculos', value: 43, fill: '#a855f7' },
      { name: 'Policiales', value: 35, fill: '#d946ef' },
    ],
    noticiasSalteadas: [
      { id: 1, title: 'Reforma tributaria: los puntos clave del proyecto', category: 'Economía', skips: 312 },
      { id: 2, title: 'Mercado de pases: las altas y bajas del fútbol argentino', category: 'Deportes', skips: 201 },
      { id: 3, title: 'Aumento de combustibles a partir de mañana', category: 'Economía', skips: 150 },
      { id: 4, title: 'Declaraciones cruzadas en el Congreso', category: 'Política', skips: 120 },
      { id: 5, title: 'Nuevo escándalo mediático nacional', category: 'Espectáculos', skips: 95 },
    ],
    preguntasFrecuentes: [
      { id: 1, question: '¿Qué pasó con el dólar?', count: 89 },
      { id: 2, question: '¿Cuándo juega River?', count: 67 },
      { id: 3, question: '¿Cómo está el clima en Córdoba?', count: 45 },
      { id: 4, question: '¿Hay paro de colectivos?', count: 32 },
      { id: 5, question: '¿Quién ganó las elecciones?', count: 28 },
    ],
    horariosPico: [
      { hour: '00h', sesiones: 120 },
      { hour: '03h', sesiones: 50 },
      { hour: '06h', sesiones: 450 },
      { hour: '07h', sesiones: 1200 },
      { hour: '08h', sesiones: 1500 },
      { hour: '09h', sesiones: 900 },
      { hour: '12h', sesiones: 1100 },
      { hour: '13h', sesiones: 1300 },
      { hour: '15h', sesiones: 600 },
      { hour: '18h', sesiones: 1400 },
      { hour: '19h', sesiones: 1600 },
      { hour: '21h', sesiones: 800 },
      { hour: '23h', sesiones: 300 },
    ],
    users: [
      { id: 'usr_1', name: 'Juan Pérez', email: 'juan@example.com', role: 'listener', sessions: 45, lastActive: 'Hace 2 horas' },
      { id: 'usr_2', name: 'María Gómez', email: 'maria@example.com', role: 'listener', sessions: 12, lastActive: 'Hace 5 horas' },
      { id: 'usr_3', name: 'Carlos Ruiz', email: 'carlos@example.com', role: 'listener', sessions: 89, lastActive: 'Ayer' },
      { id: 'usr_4', name: 'Ana Fernández', email: 'ana@example.com', role: 'listener', sessions: 34, lastActive: 'Hace 1 hora' },
      { id: 'usr_5', name: 'Luis Martínez', email: 'luis@example.com', role: 'listener', sessions: 67, lastActive: 'Hace 3 horas' },
    ],
    sessions: [
      { id: 'ses_1', user: 'Juan Pérez', date: '2026-04-06 08:30', duration: '4m 12s', categories: ['Deportes', 'Política'], completed: true },
      { id: 'ses_2', user: 'María Gómez', date: '2026-04-06 09:15', duration: '1m 45s', categories: ['Economía'], completed: false },
      { id: 'ses_3', user: 'Carlos Ruiz', date: '2026-04-06 07:20', duration: '6m 30s', categories: ['Espectáculos', 'Política', 'Policiales'], completed: true },
      { id: 'ses_4', user: 'Ana Fernández', date: '2026-04-06 12:05', duration: '3m 10s', categories: ['Deportes'], completed: true },
      { id: 'ses_5', user: 'Luis Martínez', date: '2026-04-06 13:40', duration: '5m 22s', categories: ['Economía', 'Política'], completed: false },
    ],
    conversations: [
      {
        id: 'conv_1', user: 'Juan Pérez',
        question: '¿Qué pasó con el dólar blue hoy?',
        answer: 'El dólar blue cerró hoy a $1.285 para la venta, marcando una suba de $15 respecto al cierre anterior.',
        category: 'Economía', flagged: false,
      },
      {
        id: 'conv_2', user: 'María Gómez',
        question: '¿A qué hora juega Talleres?',
        answer: 'Talleres juega hoy a las 21:30 contra Boca Juniors por la Copa Argentina.',
        category: 'Deportes', flagged: true,
      },
      {
        id: 'conv_3', user: 'Carlos Ruiz',
        question: 'Resumime las noticias de política',
        answer: 'En política hoy, el Congreso debate la nueva ley de alquileres. Además, el presidente se reunió con gobernadores para definir el reparto de fondos coparticipables.',
        category: 'Política', flagged: false,
      },
    ],
  },
  p2: {
    kpis: { usuariosHoy: 0, tasaCompletado: 0, categoriaPopular: '-', tiempoPromedio: '-', trendUsuarios: 0, trendCompletado: 0, trendTiempo: 0 },
    categoriasCompletado: [],
    noticiasSalteadas: [],
    preguntasFrecuentes: [],
    horariosPico: [],
    users: [],
    sessions: [],
    conversations: [],
  },
  p3: {
    kpis: {
      usuariosHoy: 450,
      tasaCompletado: 54,
      categoriaPopular: 'Política',
      tiempoPromedio: '3m 45s',
      trendUsuarios: -8.2,
      trendCompletado: -2.1,
      trendTiempo: 0.8,
    },
    categoriasCompletado: [
      { name: 'Política', value: 74, fill: '#3b82f6' },
      { name: 'Economía', value: 65, fill: '#6366f1' },
      { name: 'Internacional', value: 52, fill: '#8b5cf6' },
      { name: 'Cultura', value: 38, fill: '#a855f7' },
      { name: 'Tecnología', value: 30, fill: '#d946ef' },
    ],
    noticiasSalteadas: [
      { id: 1, title: 'Sesión ordinaria del Congreso: puntos en debate', category: 'Política', skips: 88 },
      { id: 2, title: 'Variación del índice de inflación mensual', category: 'Economía', skips: 74 },
      { id: 3, title: 'Cumbre del G7: acuerdos y diferencias', category: 'Internacional', skips: 61 },
    ],
    preguntasFrecuentes: [
      { id: 1, question: '¿Cómo impacta la inflación en mi bolsillo?', count: 42 },
      { id: 2, question: '¿Qué resolvió el Congreso hoy?', count: 31 },
      { id: 3, question: '¿Qué pasa con las elecciones?', count: 27 },
    ],
    horariosPico: [
      { hour: '06h', sesiones: 80 },
      { hour: '07h', sesiones: 310 },
      { hour: '08h', sesiones: 420 },
      { hour: '09h', sesiones: 290 },
      { hour: '12h', sesiones: 350 },
      { hour: '13h', sesiones: 380 },
      { hour: '18h', sesiones: 410 },
      { hour: '19h', sesiones: 450 },
      { hour: '21h', sesiones: 200 },
    ],
    users: [
      { id: 'usr_a', name: 'Sofía Torres', email: 'sofia@example.com', role: 'listener', sessions: 28, lastActive: 'Hace 1 día' },
      { id: 'usr_b', name: 'Martín López', email: 'martin@example.com', role: 'listener', sessions: 15, lastActive: 'Hace 2 días' },
    ],
    sessions: [
      { id: 'ses_a', user: 'Sofía Torres', date: '2026-04-05 08:10', duration: '3m 55s', categories: ['Política', 'Economía'], completed: true },
      { id: 'ses_b', user: 'Martín López', date: '2026-04-05 09:30', duration: '2m 10s', categories: ['Internacional'], completed: false },
    ],
    conversations: [
      {
        id: 'conv_a', user: 'Sofía Torres',
        question: '¿Qué pasó en el Congreso ayer?',
        answer: 'Ayer el Congreso sesionó hasta la madrugada debatiendo el presupuesto 2026. No hubo acuerdo y la sesión fue levantada sin resolución.',
        category: 'Política', flagged: false,
      },
    ],
  },
};

export function getProjectData(projectId: string): DashboardData {
  return DATA_BY_PROJECT[projectId] ?? DATA_BY_PROJECT['p1'];
}

export function buildAnalystContext(project: Project, data: DashboardData): AnalystContext {
  return {
    projectName: project.name,
    kpis: data.kpis,
    categoriasCompletado: data.categoriasCompletado,
    noticiasSalteadas: data.noticiasSalteadas,
    preguntasFrecuentes: data.preguntasFrecuentes,
  };
}
