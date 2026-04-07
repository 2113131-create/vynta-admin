import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis,
} from 'recharts';
import {
  Brain, Zap, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle2, Activity, RefreshCw, Sparkles, ArrowRight,
  SkipForward, HelpCircle, Clock,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useProject } from '../context/ProjectContext';
import { generateDailyInsight } from '../lib/gemini';
import { useNavigate } from 'react-router-dom';
import type { AiInsightRow } from '../types/analytics';

// ============================================================
// PRIMITIVES
// ============================================================

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('bg-[#0A0A0A] rounded-xl border border-[#1A1A1A] overflow-hidden', className)}>
      {children}
    </div>
  );
}

function CardHeader({ title, icon: Icon, subtitle, action }: {
  title: string; icon?: React.ElementType; subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4 border-b border-[#1A1A1A] flex items-center justify-between">
      <div>
        <h3 className="font-mono text-xs font-semibold text-gray-300 uppercase tracking-widest flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-gray-500" />}
          {title}
        </h3>
        {subtitle && <p className="text-[11px] text-gray-600 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function Trend({ value, label }: { value: number; label: string }) {
  const up = value >= 0;
  return (
    <div className="flex items-center gap-1.5 mt-2">
      {up
        ? <TrendingUp className="w-3 h-3 text-emerald-500" />
        : <TrendingDown className="w-3 h-3 text-red-400" />}
      <span className={cn('font-mono text-[11px] font-semibold', up ? 'text-emerald-500' : 'text-red-400')}>
        {up ? '+' : ''}{value}%
      </span>
      <span className="text-[11px] text-gray-600">{label}</span>
    </div>
  );
}

// ============================================================
// KPI CARD
// ============================================================

interface KpiProps {
  label: string;
  value: string;
  unit?: string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  accent?: string;
  empty?: boolean;
}

function KpiCard({ label, value, unit, icon: Icon, trend, trendLabel, accent = '#3b82f6', empty }: KpiProps) {
  return (
    <Card className="p-5 relative overflow-hidden">
      {/* left accent bar */}
      <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r-full" style={{ backgroundColor: empty ? '#1f1f1f' : accent }} />
      <div className="flex items-start justify-between gap-3 pl-3">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] font-semibold text-gray-500 uppercase tracking-widest truncate">{label}</p>
          <div className="flex items-end gap-1 mt-2">
            <span className={cn('font-mono text-2xl font-bold leading-none tabular-nums', empty ? 'text-gray-700' : 'text-white')}>
              {empty ? '—' : value}
            </span>
            {!empty && unit && (
              <span className="font-mono text-xs text-gray-500 mb-0.5">{unit}</span>
            )}
          </div>
          {!empty && trend !== undefined && trendLabel && (
            <Trend value={trend} label={trendLabel} />
          )}
        </div>
        <div className="p-2.5 bg-[#111] border border-[#1f1f1f] rounded-lg flex-shrink-0">
          <Icon className="w-4 h-4 text-gray-500" />
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// AI INSIGHT CARD (single-call Gemini)
// ============================================================

function AiInsightCard() {
  const { analystCtx, activeProject } = useProject();
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isEmpty = activeProject.status !== 'active';

  async function load() {
    if (isEmpty) return;
    setLoading(true);
    setInsight('');
    try {
      const text = await generateDailyInsight(analystCtx);
      setInsight(text);
    } catch (err: any) {
      const is429 = err?.message?.includes('429') || err?.message?.includes('quota') || err?.message?.includes('RESOURCE_EXHAUSTED');
      setInsight(is429
        ? 'Quota de Gemini agotada. Activá billing en Google Cloud Console (aistudio.google.com → proyecto → Billing).'
        : 'No se pudo generar el insight. Verificá la API key de Gemini.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [activeProject.id]);

  return (
    <div className="relative rounded-xl border border-blue-500/20 bg-[#0A0A0A] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="px-5 py-3.5 border-b border-[#1A1A1A] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-mono text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Gemini Insight</span>
          <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">LIVE</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            disabled={loading || isEmpty}
            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <RefreshCw className={cn('w-3 h-3', loading && 'animate-spin')} />
            Regenerar
          </button>
          <button
            onClick={() => navigate('/ia')}
            className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
          >
            Abrir chat <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="px-5 py-4 min-h-[60px] flex items-center">
        {isEmpty ? (
          <p className="text-xs text-gray-600 italic">Sin datos para este proyecto.</p>
        ) : loading ? (
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1 h-1 rounded-full bg-blue-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <span className="text-xs text-gray-500 font-mono">Analizando datos de audiencia...</span>
          </div>
        ) : (
          <p className="text-sm text-gray-300 leading-relaxed">{insight}</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// INSIGHT FEED (from ai_insights table)
// ============================================================

const INSIGHT_STYLES: Record<string, { border: string; badge: string; icon: React.ElementType; dot: string }> = {
  anomaly: {
    border: 'border-amber-500/20',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: AlertTriangle,
    dot: 'bg-amber-400',
  },
  trend: {
    border: 'border-blue-500/20',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: Activity,
    dot: 'bg-blue-400',
  },
  editorial: {
    border: 'border-emerald-500/20',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: CheckCircle2,
    dot: 'bg-emerald-400',
  },
};

function InsightFeed({ insights }: { insights: AiInsightRow[] }) {
  const { activeProject, refreshInsights } = useProject();
  const isEmpty = activeProject.status !== 'active';

  return (
    <Card>
      <CardHeader
        title="Insight Feed"
        icon={Brain}
        subtitle="Alertas generadas por IA — últimas 24h"
        action={
          <button
            onClick={refreshInsights}
            className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Actualizar
          </button>
        }
      />
      <div className="divide-y divide-[#111]">
        {isEmpty || insights.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-xs text-gray-700 font-mono">
              {isEmpty ? 'Proyecto inactivo — sin insights disponibles.' : 'Sin insights generados aún. Ejecutá el pipeline de IA.'}
            </p>
          </div>
        ) : (
          insights.map(ins => {
            const style = INSIGHT_STYLES[ins.insight_type] ?? INSIGHT_STYLES.trend;
            const Icon = style.icon;
            return (
              <div key={ins.id} className={cn('px-5 py-4 border-l-2', style.border, ins.is_actioned && 'opacity-50')}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 p-1.5 rounded bg-[#111] border border-[#1f1f1f]">
                    <Icon className="w-3 h-3 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider', style.badge)}>
                        {ins.insight_type}
                      </span>
                      <span className="font-mono text-[10px] text-gray-600">
                        {new Date(ins.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {ins.title && (
                      <p className="text-xs font-semibold text-gray-200 mb-1">{ins.title}</p>
                    )}
                    <p className="text-xs text-gray-400 leading-relaxed">{ins.content}</p>
                    {ins.actionable_advice && (
                      <p className="mt-2 text-[11px] text-gray-500 italic border-l border-[#2a2a2a] pl-2">
                        → {ins.actionable_advice}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

// ============================================================
// INTENT CLUSTERS (Bubble ScatterChart)
// ============================================================

const SENTIMENT_COLOR: Record<string, string> = {
  positive: '#10b981',
  neutral:  '#6366f1',
  negative: '#f59e0b',
};

function IntentClusters() {
  const { metrics, activeProject } = useProject();
  const isEmpty = activeProject.status !== 'active' || metrics.intentClusters.length === 0;

  const chartData = metrics.intentClusters.map((c, i) => ({
    x: i + 1,
    y: c.frequency,
    z: c.volume,
    topic: c.topic,
    category: c.category,
    sentiment: c.sentiment,
  }));

  return (
    <Card>
      <CardHeader title="Intent Clusters" icon={HelpCircle} subtitle="Preguntas de la audiencia — volumen × frecuencia" />
      {isEmpty ? (
        <div className="px-5 py-10 text-center">
          <p className="text-xs text-gray-700 font-mono">Sin datos de intención disponibles.</p>
        </div>
      ) : (
        <>
          <div className="p-5 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#111" />
                <XAxis
                  type="number" dataKey="x" name="rank"
                  tick={false} axisLine={false} tickLine={false}
                />
                <YAxis
                  type="number" dataKey="y" name="frecuencia"
                  axisLine={false} tickLine={false}
                  tick={{ fontSize: 10, fill: '#4b5563' }}
                />
                <ZAxis type="number" dataKey="z" range={[60, 400]} />
                <Tooltip
                  cursor={{ strokeDasharray: '4 4', stroke: '#2a2a2a' }}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#111] border border-[#1f1f1f] rounded-lg px-3 py-2 text-xs shadow-xl">
                        <p className="text-gray-200 font-medium mb-1">"{d.topic}"</p>
                        <p className="text-gray-500">{d.category} · {d.y} consultas</p>
                      </div>
                    );
                  }}
                />
                <Scatter data={chartData} isAnimationActive={false}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={SENTIMENT_COLOR[entry.sentiment] ?? '#6366f1'} fillOpacity={0.75} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="px-5 pb-4 flex gap-4">
            {Object.entries(SENTIMENT_COLOR).map(([s, c]) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                <span className="font-mono text-[10px] text-gray-500 capitalize">{s}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

// ============================================================
// MAIN DASHBOARD
// ============================================================

export function Dashboard() {
  const { metrics, insights, activeProject, isLoadingMetrics, refreshMetrics } = useProject();
  const isEmpty = activeProject.status !== 'active';

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Audience Intelligence</h1>
          <p className="text-[11px] text-gray-600 mt-0.5 font-mono">
            {activeProject.name} · {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            {!supabaseConfigured && (
              <span className="ml-2 text-amber-600">⚠ Modo demo (Supabase no configurado)</span>
            )}
          </p>
        </div>
        <button
          onClick={refreshMetrics}
          disabled={isLoadingMetrics}
          className="flex items-center gap-1.5 text-[11px] text-gray-600 hover:text-gray-400 transition-colors disabled:opacity-30"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', isLoadingMetrics && 'animate-spin')} />
          <span className="font-mono">Refrescar</span>
        </button>
      </div>

      {/* ── 4 KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Atención Total"
          value={metrics.attentionScore.toFixed(1)}
          unit="min/sesión"
          icon={Clock}
          trend={metrics.trendTiempo}
          trendLabel="vs ayer"
          accent="#3b82f6"
          empty={isEmpty}
        />
        <KpiCard
          label="Completion Efectivo"
          value={metrics.effectiveCompletionRate.toFixed(0)}
          unit="%"
          icon={CheckCircle2}
          trend={metrics.trendCompletado}
          trendLabel="vs semana"
          accent="#10b981"
          empty={isEmpty}
        />
        <KpiCard
          label="Friction Score"
          value={metrics.frictionScore.toFixed(3)}
          unit="skips/s"
          icon={SkipForward}
          accent="#f59e0b"
          empty={isEmpty}
        />
        <KpiCard
          label="Conversation Lift"
          value={metrics.conversationLift.toFixed(2)}
          unit="q/min"
          icon={Activity}
          trend={metrics.trendUsuarios}
          trendLabel="vs ayer"
          accent="#8b5cf6"
          empty={isEmpty}
        />
      </div>

      {/* ── Gemini Insight ── */}
      <AiInsightCard />

      {/* ── Audience Heartbeat + Intent Clusters ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Audience Heartbeat — AreaChart */}
        <Card className="lg:col-span-3">
          <CardHeader title="Audience Heartbeat" icon={Zap} subtitle="Sesiones activas por hora" />
          <div className="p-5 h-[220px]">
            {isEmpty || metrics.horariosPico.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-gray-700 font-mono">Sin datos de actividad.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.horariosPico} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#111" />
                  <XAxis
                    dataKey="hour" axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fill: '#4b5563', fontFamily: 'monospace' }} dy={8}
                  />
                  <YAxis
                    axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fill: '#4b5563', fontFamily: 'monospace' }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#1f1f1f', borderRadius: 8, fontSize: 11, fontFamily: 'monospace' }}
                    itemStyle={{ color: '#e5e7eb' }}
                    cursor={{ stroke: '#2a2a2a', strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="sesiones" stroke="#3b82f6" strokeWidth={2} fill="url(#grad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          {!isEmpty && metrics.horariosPico.length > 0 && (
            <div className="px-5 pb-4 flex gap-2">
              <span className="font-mono text-[10px] bg-[#111] border border-[#1f1f1f] text-blue-400 px-2 py-1 rounded">
                PEAK · 7AM–9AM
              </span>
              <span className="font-mono text-[10px] bg-[#111] border border-[#1f1f1f] text-blue-400 px-2 py-1 rounded">
                PEAK · 6PM–8PM
              </span>
            </div>
          )}
        </Card>

        {/* Intent Clusters */}
        <div className="lg:col-span-2">
          <IntentClusters />
        </div>
      </div>

      {/* ── Bottom row: Skipped news + Insight Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top Skipped */}
        <Card>
          <CardHeader title="Top Salteadas" icon={SkipForward} subtitle="Señal editorial — últimas 24h" />
          {isEmpty || metrics.noticiasSalteadas.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-xs text-gray-700 font-mono">Sin datos de skips.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#0f0f0f]">
              {metrics.noticiasSalteadas.map((n, i) => (
                <li key={n.id} className="px-5 py-3 hover:bg-[#0f0f0f] transition-colors flex items-center gap-3">
                  <span className="font-mono text-[10px] font-bold text-gray-700 w-4 text-right flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-300 truncate">{n.title}</p>
                    <p className="font-mono text-[10px] text-gray-600 mt-0.5">{n.category}</p>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-amber-400 flex-shrink-0">
                    {n.skips}×
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Insight Feed */}
        <InsightFeed insights={insights} />
      </div>

    </div>
  );
}

// Re-export for use in other files
import { supabaseConfigured } from '../lib/supabase';
