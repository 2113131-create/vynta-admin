// ============================================================
// VYNTA ANALYTICS — TYPE DEFINITIONS
// ============================================================

export type EventType =
  | 'audio_heartbeat'
  | 'audio_skip'
  | 'ai_query'
  | 'milestone';

// --- Payloads ---

export interface AudioHeartbeatPayload {
  position_sec: number;
  article_id: string;
  category: string;
  duration_sec: number;
}

export interface AudioSkipPayload {
  article_id: string;
  category: string;
  position_sec: number;
  skipped_at_pct: number; // 0-100, where in the audio the skip happened
}

export interface AiQueryPayload {
  query: string;
  category: string;
  response_latency_ms?: number;
}

export interface MilestonePayload {
  milestone: '50pct' | '80pct' | 'complete';
  article_id: string;
  category: string;
}

export type EventPayload =
  | AudioHeartbeatPayload
  | AudioSkipPayload
  | AiQueryPayload
  | MilestonePayload;

// --- Base Event ---

export interface BaseEvent {
  project_id: string;
  session_id: string;
  user_id?: string;
  event_type: EventType;
  payload: EventPayload;
  client_timestamp: string; // ISO8601
}

// --- DB Row shapes (as returned by Supabase) ---

export interface AnalyticsEventRow extends BaseEvent {
  id: string;
  server_timestamp: string;
}

export interface AnalyticsSessionRow {
  id: string;
  project_id: string;
  user_id: string | null;
  start_time: string;
  end_time: string | null;
  total_listen_sec: number;
  queries_count: number;
  skips_count: number;
  completion_rate: number | null;
  friction_score: number | null;
}

export interface AiInsightRow {
  id: string;
  project_id: string;
  insight_type: 'anomaly' | 'trend' | 'editorial';
  title: string;
  content: string;
  actionable_advice: string | null;
  is_actioned: boolean;
  created_at: string;
}

// --- Derived / computed metrics used in the UI ---

export interface MetricsData {
  // Classic
  usuariosHoy: number;
  categoriaPopular: string;
  horariosPico: Array<{ hour: string; sesiones: number }>;
  categoriasCompletado: Array<{ name: string; value: number; fill: string }>;
  noticiasSalteadas: Array<{ id: number; title: string; category: string; skips: number }>;
  preguntasFrecuentes: Array<{ id: number; question: string; count: number }>;
  // NEW — Audience Intelligence KPIs
  attentionScore: number;       // avg total_listen_sec / 60 (minutes)
  effectiveCompletionRate: number; // avg completion_rate (%)
  frictionScore: number;        // total_skips / total_sessions
  conversationLift: number;     // queries per listening-minute
  // Trends vs previous period
  trendUsuarios: number;
  trendCompletado: number;
  trendTiempo: number;
  // Intent clusters for bubble chart
  intentClusters: Array<{
    topic: string;
    category: string;
    volume: number;    // x-axis
    frequency: number; // bubble size
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
}
