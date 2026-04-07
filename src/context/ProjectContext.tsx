import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import type { MetricsData, AnalyticsSessionRow, AiInsightRow } from '../types/analytics';
import type { AnalystContext } from '../lib/gemini';

// ============================================================
// PROJECT TYPES
// ============================================================

export type ProjectStatus = 'active' | 'configuring' | 'paused';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  logo: string;
  gradientFrom: string;
  gradientTo: string;
  voice: string;
  model: string;
  systemPrompt: string;
  scrapeUrl: string;
  supabaseUrl: string;
  // live stats (populated from DB or mock)
  users: number;
  sessionsToday: number;
  uptime: string;
}

// ============================================================
// STATIC PROJECT REGISTRY
// (config-level data — not analytics, won't be removed)
// ============================================================

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Cadena 3',
    status: 'active',
    logo: 'C3',
    gradientFrom: '#2563eb',
    gradientTo: '#1d4ed8',
    voice: 'Mario (Cadena 3)',
    model: 'llama-3.3-70b-versatile',
    systemPrompt:
      'Sos el presentador de noticias de Cadena 3. Tu tono es profesional, cercano y cordobés. Resumí las noticias de forma clara y concisa.',
    scrapeUrl: 'https://cadena3.com',
    supabaseUrl: 'https://abcxyz.supabase.co',
    users: 1247,
    sessionsToday: 8450,
    uptime: '99.9%',
  },
  {
    id: 'p2',
    name: 'Clarín',
    status: 'configuring',
    logo: 'CL',
    gradientFrom: '#dc2626',
    gradientTo: '#991b1b',
    voice: 'Locutora Noticias',
    model: 'llama-3.3-70b-versatile',
    systemPrompt:
      'Sos el presentador de Clarín. Tu tono es neutral, informativo y porteño. Presentá las noticias con precisión y brevedad.',
    scrapeUrl: 'https://clarin.com',
    supabaseUrl: 'https://defpqr.supabase.co',
    users: 0,
    sessionsToday: 0,
    uptime: '-',
  },
  {
    id: 'p3',
    name: 'La Nación',
    status: 'paused',
    logo: 'LN',
    gradientFrom: '#4b5563',
    gradientTo: '#1f2937',
    voice: 'Voz Neutra',
    model: 'llama-3.3-70b-versatile',
    systemPrompt:
      'Sos el presentador de La Nación. Tu tono es formal, objetivo y sofisticado. Priorizá la claridad y la profundidad informativa.',
    scrapeUrl: 'https://lanacion.com.ar',
    supabaseUrl: 'https://ghijkl.supabase.co',
    users: 450,
    sessionsToday: 0,
    uptime: '98.5%',
  },
];

// ============================================================
// FALLBACK MOCK METRICS
// Used when Supabase is not configured or project is inactive
// ============================================================

const MOCK_METRICS: Record<string, MetricsData> = {
  p1: {
    usuariosHoy: 1247,
    categoriaPopular: 'Deportes',
    attentionScore: 4.2,
    effectiveCompletionRate: 68,
    frictionScore: 0.037,
    conversationLift: 1.4,
    trendUsuarios: 12.5,
    trendCompletado: 3.2,
    trendTiempo: -1.5,
    categoriasCompletado: [
      { name: 'Deportes', value: 82, fill: '#3b82f6' },
      { name: 'Política', value: 71, fill: '#6366f1' },
      { name: 'Economía', value: 58, fill: '#8b5cf6' },
      { name: 'Espectáculos', value: 43, fill: '#a855f7' },
      { name: 'Policiales', value: 35, fill: '#d946ef' },
    ],
    noticiasSalteadas: [
      { id: 1, title: 'Reforma tributaria: los puntos clave', category: 'Economía', skips: 312 },
      { id: 2, title: 'Mercado de pases: altas y bajas', category: 'Deportes', skips: 201 },
      { id: 3, title: 'Aumento de combustibles mañana', category: 'Economía', skips: 150 },
      { id: 4, title: 'Declaraciones cruzadas en el Congreso', category: 'Política', skips: 120 },
      { id: 5, title: 'Nuevo escándalo mediático', category: 'Espectáculos', skips: 95 },
    ],
    preguntasFrecuentes: [
      { id: 1, question: '¿Qué pasó con el dólar?', count: 89 },
      { id: 2, question: '¿Cuándo juega River?', count: 67 },
      { id: 3, question: '¿Cómo está el clima en Córdoba?', count: 45 },
      { id: 4, question: '¿Hay paro de colectivos?', count: 32 },
      { id: 5, question: '¿Quién ganó las elecciones?', count: 28 },
    ],
    horariosPico: [
      { hour: '00h', sesiones: 120 }, { hour: '03h', sesiones: 50 },
      { hour: '06h', sesiones: 450 }, { hour: '07h', sesiones: 1200 },
      { hour: '08h', sesiones: 1500 }, { hour: '09h', sesiones: 900 },
      { hour: '12h', sesiones: 1100 }, { hour: '13h', sesiones: 1300 },
      { hour: '15h', sesiones: 600 }, { hour: '18h', sesiones: 1400 },
      { hour: '19h', sesiones: 1600 }, { hour: '21h', sesiones: 800 },
      { hour: '23h', sesiones: 300 },
    ],
    intentClusters: [
      { topic: '¿Qué pasó con el dólar?', category: 'Economía', volume: 89, frequency: 89, sentiment: 'negative' },
      { topic: '¿Cuándo juega River?', category: 'Deportes', volume: 67, frequency: 67, sentiment: 'positive' },
      { topic: '¿Cómo está el clima?', category: 'Servicios', volume: 45, frequency: 45, sentiment: 'neutral' },
      { topic: '¿Hay paro de colectivos?', category: 'Servicios', volume: 32, frequency: 32, sentiment: 'negative' },
      { topic: '¿Quién ganó las elecciones?', category: 'Política', volume: 28, frequency: 28, sentiment: 'neutral' },
      { topic: 'Resumen de política', category: 'Política', volume: 22, frequency: 22, sentiment: 'neutral' },
      { topic: '¿Sube el combustible?', category: 'Economía', volume: 18, frequency: 18, sentiment: 'negative' },
    ],
  },
  p2: {
    usuariosHoy: 0, categoriaPopular: '-',
    attentionScore: 0, effectiveCompletionRate: 0, frictionScore: 0, conversationLift: 0,
    trendUsuarios: 0, trendCompletado: 0, trendTiempo: 0,
    categoriasCompletado: [], noticiasSalteadas: [], preguntasFrecuentes: [],
    horariosPico: [], intentClusters: [],
  },
  p3: {
    usuariosHoy: 450, categoriaPopular: 'Política',
    attentionScore: 3.75, effectiveCompletionRate: 54, frictionScore: 0.048, conversationLift: 0.9,
    trendUsuarios: -8.2, trendCompletado: -2.1, trendTiempo: 0.8,
    categoriasCompletado: [
      { name: 'Política', value: 74, fill: '#3b82f6' },
      { name: 'Economía', value: 65, fill: '#6366f1' },
      { name: 'Internacional', value: 52, fill: '#8b5cf6' },
      { name: 'Cultura', value: 38, fill: '#a855f7' },
      { name: 'Tecnología', value: 30, fill: '#d946ef' },
    ],
    noticiasSalteadas: [
      { id: 1, title: 'Sesión del Congreso: puntos en debate', category: 'Política', skips: 88 },
      { id: 2, title: 'Variación del índice de inflación', category: 'Economía', skips: 74 },
      { id: 3, title: 'Cumbre del G7: acuerdos y diferencias', category: 'Internacional', skips: 61 },
    ],
    preguntasFrecuentes: [
      { id: 1, question: '¿Cómo impacta la inflación?', count: 42 },
      { id: 2, question: '¿Qué resolvió el Congreso?', count: 31 },
      { id: 3, question: '¿Qué pasa con las elecciones?', count: 27 },
    ],
    horariosPico: [
      { hour: '06h', sesiones: 80 }, { hour: '07h', sesiones: 310 },
      { hour: '08h', sesiones: 420 }, { hour: '09h', sesiones: 290 },
      { hour: '12h', sesiones: 350 }, { hour: '13h', sesiones: 380 },
      { hour: '18h', sesiones: 410 }, { hour: '19h', sesiones: 450 },
      { hour: '21h', sesiones: 200 },
    ],
    intentClusters: [
      { topic: 'Inflación y bolsillo', category: 'Economía', volume: 42, frequency: 42, sentiment: 'negative' },
      { topic: 'Congreso hoy', category: 'Política', volume: 31, frequency: 31, sentiment: 'neutral' },
      { topic: 'Elecciones', category: 'Política', volume: 27, frequency: 27, sentiment: 'neutral' },
    ],
  },
};

// ============================================================
// SUPABASE FETCH LOGIC
// ============================================================

async function fetchMetricsFromSupabase(projectId: string): Promise<MetricsData | null> {
  if (!supabase) return null;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: sessions, error } = await supabase
    .from('analytics_sessions')
    .select('*')
    .eq('project_id', projectId)
    .gte('start_time', since)
    .returns<AnalyticsSessionRow[]>();

  if (error || !sessions || sessions.length === 0) return null;

  const totalSessions = sessions.length;
  const uniqueUsers = new Set(sessions.map(s => s.user_id).filter(Boolean)).size;
  const totalListenSec = sessions.reduce((a, s) => a + s.total_listen_sec, 0);
  const totalSkips = sessions.reduce((a, s) => a + s.skips_count, 0);
  const totalQueries = sessions.reduce((a, s) => a + s.queries_count, 0);
  const avgCompletion = sessions.reduce((a, s) => a + (s.completion_rate ?? 0), 0) / totalSessions;
  const totalListenMin = totalListenSec / 60;

  const attentionScore = totalListenMin / totalSessions;
  const frictionScore = totalSessions > 0 ? totalSkips / totalSessions : 0;
  const conversationLift = totalListenMin > 0 ? totalQueries / totalListenMin : 0;

  // Intent clusters from ai_query events
  const { data: queryEvents } = await supabase
    .from('analytics_events')
    .select('payload')
    .eq('project_id', projectId)
    .eq('event_type', 'ai_query')
    .gte('server_timestamp', since);

  type QueryFreq = { topic: string; category: string; count: number };
  const queryFreq: Record<string, QueryFreq> = {};
  for (const ev of queryEvents ?? []) {
    const q = (ev.payload as { query?: string; category?: string }).query ?? '';
    const cat = (ev.payload as { query?: string; category?: string }).category ?? 'General';
    if (!q) continue;
    if (!queryFreq[q]) queryFreq[q] = { topic: q, category: cat, count: 0 };
    queryFreq[q].count++;
  }

  const intentClusters = Object.values(queryFreq)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(qf => ({
      topic: qf.topic,
      category: qf.category,
      volume: qf.count,
      frequency: qf.count,
      sentiment: 'neutral' as const,
    }));

  // Fallback mock for visual data that isn't in sessions yet
  const mock = MOCK_METRICS[projectId] ?? MOCK_METRICS['p1'];

  return {
    usuariosHoy: uniqueUsers,
    categoriaPopular: mock.categoriaPopular,
    attentionScore: parseFloat(attentionScore.toFixed(2)),
    effectiveCompletionRate: parseFloat(avgCompletion.toFixed(1)),
    frictionScore: parseFloat(frictionScore.toFixed(4)),
    conversationLift: parseFloat(conversationLift.toFixed(2)),
    trendUsuarios: mock.trendUsuarios,
    trendCompletado: mock.trendCompletado,
    trendTiempo: mock.trendTiempo,
    categoriasCompletado: mock.categoriasCompletado,
    noticiasSalteadas: mock.noticiasSalteadas,
    preguntasFrecuentes: mock.preguntasFrecuentes,
    horariosPico: mock.horariosPico,
    intentClusters: intentClusters.length > 0 ? intentClusters : mock.intentClusters,
  };
}

// ============================================================
// CONTEXT
// ============================================================

type ProjectContextValue = {
  activeProject: Project;
  setActiveProjectId: (id: string) => void;
  projects: Project[];
  metrics: MetricsData;
  insights: AiInsightRow[];
  isLoadingMetrics: boolean;
  refreshMetrics: () => Promise<void>;
  refreshInsights: () => Promise<void>;
  analystCtx: AnalystContext;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [activeProjectId, setActiveProjectId] = useState('p1');
  const [metricsMap, setMetricsMap] = useState<Record<string, MetricsData>>(MOCK_METRICS);
  const [insights, setInsights] = useState<AiInsightRow[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const fetchedRef = useRef<Set<string>>(new Set());

  const activeProject = PROJECTS.find(p => p.id === activeProjectId) ?? PROJECTS[0];
  const metrics = metricsMap[activeProjectId] ?? MOCK_METRICS[activeProjectId] ?? MOCK_METRICS['p1'];

  const refreshMetrics = useCallback(async () => {
    if (!supabaseConfigured) return;
    setIsLoadingMetrics(true);
    try {
      const fresh = await fetchMetricsFromSupabase(activeProjectId);
      if (fresh) {
        setMetricsMap(prev => ({ ...prev, [activeProjectId]: fresh }));
      }
    } catch (err) {
      console.error('[ProjectContext] refreshMetrics error:', err);
    } finally {
      setIsLoadingMetrics(false);
    }
  }, [activeProjectId]);

  const refreshInsights = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('project_id', activeProjectId)
        .order('created_at', { ascending: false })
        .limit(10)
        .returns<AiInsightRow[]>();
      if (data) setInsights(data);
    } catch (err) {
      console.error('[ProjectContext] refreshInsights error:', err);
    }
  }, [activeProjectId]);

  // Auto-fetch once per project switch
  useEffect(() => {
    if (!fetchedRef.current.has(activeProjectId)) {
      fetchedRef.current.add(activeProjectId);
      refreshMetrics();
      refreshInsights();
    }
  }, [activeProjectId, refreshMetrics, refreshInsights]);

  const analystCtx: AnalystContext = {
    projectName: activeProject.name,
    kpis: {
      usuariosHoy: metrics.usuariosHoy,
      tasaCompletado: metrics.effectiveCompletionRate,
      categoriaPopular: metrics.categoriaPopular,
      tiempoPromedio: `${metrics.attentionScore.toFixed(1)}m`,
      trendUsuarios: metrics.trendUsuarios,
      trendCompletado: metrics.trendCompletado,
    },
    categoriasCompletado: metrics.categoriasCompletado,
    noticiasSalteadas: metrics.noticiasSalteadas,
    preguntasFrecuentes: metrics.preguntasFrecuentes,
  };

  return (
    <ProjectContext.Provider
      value={{
        activeProject,
        setActiveProjectId,
        projects: PROJECTS,
        metrics,
        insights,
        isLoadingMetrics,
        refreshMetrics,
        refreshInsights,
        analystCtx,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used inside ProjectProvider');
  return ctx;
}
