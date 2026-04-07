import { GoogleGenAI } from '@google/genai';
import { supabase, supabaseConfigured } from '../lib/supabase';
import type { AnalyticsSessionRow, AiInsightRow } from '../types/analytics';

// ============================================================
// TYPES
// ============================================================

interface InsightOutput {
  insight_type: 'anomaly' | 'trend' | 'editorial';
  title: string;
  description: string;
  actionable_advice: string;
}

// ============================================================
// GEMINI CLIENT
// ============================================================

function getGeminiClient(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY no configurada');
  return new GoogleGenAI({ apiKey: key });
}

// ============================================================
// MAIN FUNCTION
// ============================================================

export async function generateDailyInsights(projectId: string): Promise<AiInsightRow[]> {
  if (!supabaseConfigured || !supabase) {
    throw new Error('Supabase no está configurado. Agregá SUPABASE_URL y SUPABASE_ANON_KEY al .env');
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // ── 1. Pull session summary ──
  const { data: sessions, error: sessErr } = await supabase
    .from('analytics_sessions')
    .select('*')
    .eq('project_id', projectId)
    .gte('start_time', since)
    .returns<AnalyticsSessionRow[]>();

  if (sessErr) throw new Error(`Supabase sessions error: ${sessErr.message}`);

  // ── 2. Pull top AI queries ──
  const { data: queryEvents, error: queryErr } = await supabase
    .from('analytics_events')
    .select('payload, server_timestamp')
    .eq('project_id', projectId)
    .eq('event_type', 'ai_query')
    .gte('server_timestamp', since)
    .order('server_timestamp', { ascending: false })
    .limit(50);

  if (queryErr) throw new Error(`Supabase queries error: ${queryErr.message}`);

  // ── 3. Aggregate ──
  const totalSessions = sessions?.length ?? 0;
  const totalListenMin = (sessions ?? []).reduce((a, s) => a + s.total_listen_sec, 0) / 60;
  const totalSkips = (sessions ?? []).reduce((a, s) => a + s.skips_count, 0);
  const totalQueries = (sessions ?? []).reduce((a, s) => a + s.queries_count, 0);
  const avgCompletion = totalSessions > 0
    ? (sessions ?? []).reduce((a, s) => a + (s.completion_rate ?? 0), 0) / totalSessions
    : 0;

  // Frequency map for queries
  const queryFreq: Record<string, number> = {};
  for (const ev of queryEvents ?? []) {
    const q = (ev.payload as { query?: string }).query ?? '';
    if (q) queryFreq[q] = (queryFreq[q] ?? 0) + 1;
  }
  const topQueries = Object.entries(queryFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([q, c]) => ({ query: q, count: c }));

  // ── 4. Build prompt ──
  const summaryJson = JSON.stringify({
    period: '24h',
    project_id: projectId,
    total_sessions: totalSessions,
    total_listen_min: parseFloat(totalListenMin.toFixed(2)),
    avg_completion_pct: parseFloat(avgCompletion.toFixed(1)),
    total_skips: totalSkips,
    total_ai_queries: totalQueries,
    friction_score: totalSessions > 0 ? parseFloat((totalSkips / totalSessions).toFixed(4)) : 0,
    conversation_lift: totalListenMin > 0 ? parseFloat((totalQueries / totalListenMin).toFixed(3)) : 0,
    top_queries: topQueries,
  }, null, 2);

  const systemPrompt = `Sos el motor de analítica de Vynta, una plataforma B2B de IA de audio para medios de comunicación.
Tu trabajo es analizar métricas de audiencia y generar insights accionables para el equipo editorial.

REGLAS ESTRICTAS:
- Respondé ÚNICAMENTE con un JSON Array válido, sin texto adicional, sin markdown, sin comentarios.
- El array debe contener exactamente 3 objetos con este esquema exacto:
  {
    "insight_type": "anomaly" | "trend" | "editorial",
    "title": "string corto (max 60 chars)",
    "description": "análisis de 1-2 oraciones con datos concretos del JSON provisto",
    "actionable_advice": "recomendación concreta de 1 oración para el equipo editorial"
  }
- Usá los números exactos del JSON. No inventes datos.
- insight_type:
  - "anomaly": algo inesperado (spike, caída, outlier)
  - "trend": patrón sostenido (crecimiento, declive, comportamiento recurrente)
  - "editorial": oportunidad de contenido basada en las preguntas de la audiencia`;

  const userPrompt = `Analizá estos datos de audiencia de las últimas 24 horas y generá 3 insights:\n\n${summaryJson}`;

  // ── 5. Call Gemini ──
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.4,
      responseMimeType: 'application/json',
    },
  });

  const rawText = response.text ?? '[]';

  // ── 6. Parse ──
  let parsed: InsightOutput[];
  try {
    // Strip potential markdown code blocks just in case
    const clean = rawText.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '').trim();
    parsed = JSON.parse(clean);
    if (!Array.isArray(parsed)) throw new Error('Not an array');
  } catch {
    throw new Error(`Gemini devolvió JSON inválido: ${rawText.slice(0, 200)}`);
  }

  // ── 7. Save to Supabase ──
  const rows = parsed.map(ins => ({
    project_id: projectId,
    insight_type: ins.insight_type,
    title: ins.title ?? '',
    content: ins.description,
    actionable_advice: ins.actionable_advice ?? null,
    is_actioned: false,
  }));

  const { data: inserted, error: insertErr } = await supabase
    .from('ai_insights')
    .insert(rows)
    .select('*')
    .returns<AiInsightRow[]>();

  if (insertErr) throw new Error(`Error guardando insights: ${insertErr.message}`);

  return inserted ?? [];
}

// ============================================================
// MARK INSIGHT AS ACTIONED
// ============================================================

export async function markInsightActioned(insightId: string): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('ai_insights')
    .update({ is_actioned: true })
    .eq('id', insightId);
}
