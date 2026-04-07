/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RefreshCw, FileText, User, Bot, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useProject } from '../context/ProjectContext';
import { askAnalyst, generateMonthlyReport } from '../lib/gemini';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  loading?: boolean;
};

const SUGGESTED_QUESTIONS = [
  '¿Cuál es el insight más importante de hoy?',
  '¿Qué categorías debería priorizar el equipo editorial?',
  '¿Por qué los usuarios están salteando esas noticias?',
  '¿En qué horario debería publicarse el brief?',
  'Dame 3 recomendaciones editoriales concretas',
];

function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-sm font-bold text-gray-100 mt-3 first:mt-0">{line.slice(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-base font-bold text-white mt-3 first:mt-0">{line.slice(2)}</h1>;
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <div key={i} className="flex gap-2 text-sm text-gray-300">
              <span className="text-blue-400 mt-0.5 shrink-0">•</span>
              <span>{line.slice(2)}</span>
            </div>
          );
        }
        if (line.match(/^\d+\./)) {
          return (
            <div key={i} className="flex gap-2 text-sm text-gray-300">
              <span className="text-blue-400 shrink-0 font-medium">{line.match(/^\d+/)![0]}.</span>
              <span>{line.replace(/^\d+\.\s*/, '')}</span>
            </div>
          );
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="text-sm font-semibold text-gray-200">{line.slice(2, -2)}</p>;
        }
        if (line === '') return <div key={i} className="h-1" />;
        return <p key={i} className="text-sm text-gray-300 leading-relaxed">{line}</p>;
      })}
    </div>
  );
}

export function VyntaIA() {
  const { analystCtx, activeProject, metrics: data } = useProject();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isEmpty = activeProject.status !== 'active';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset chat when project changes
  useEffect(() => {
    setMessages([]);
  }, [activeProject.id]);

  const history = messages
    .filter(m => !m.loading)
    .map(m => ({ role: m.role === 'assistant' ? 'model' as const : 'user' as const, text: m.text }));

  async function send(text: string) {
    if (!text.trim() || loading || isEmpty) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim() };
    const placeholder: Message = { id: 'loading', role: 'assistant', text: '', loading: true };
    setMessages(prev => [...prev, userMsg, placeholder]);
    setInput('');
    setLoading(true);

    try {
      const reply = await askAnalyst(text.trim(), analystCtx, history);
      setMessages(prev =>
        prev.map(m => m.id === 'loading' ? { id: Date.now().toString(), role: 'assistant', text: reply } : m)
      );
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === 'loading'
            ? { id: Date.now().toString(), role: 'assistant', text: 'Error al conectar con Gemini. Verificá que la API key esté configurada correctamente.' }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleReport() {
    if (reportLoading || isEmpty) return;
    setReportLoading(true);
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: 'Generá el informe mensual completo para presentar a ' + activeProject.name };
    const placeholder: Message = { id: 'report-loading', role: 'assistant', text: '', loading: true };
    setMessages(prev => [...prev, userMsg, placeholder]);

    try {
      const report = await generateMonthlyReport(analystCtx);
      setMessages(prev =>
        prev.map(m => m.id === 'report-loading' ? { id: Date.now().toString(), role: 'assistant', text: report } : m)
      );
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === 'report-loading'
            ? { id: Date.now().toString(), role: 'assistant', text: 'No se pudo generar el informe.' }
            : m
        )
      );
    } finally {
      setReportLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="flex gap-5 h-[calc(100vh-56px-4rem)]">
      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1A1A1A] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Vynta IA</h2>
              <p className="text-[11px] text-gray-500">Analista de audiencias · {activeProject.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReport}
              disabled={reportLoading || isEmpty}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 bg-[#141414] border border-[#1F1F1F] hover:border-[#2A2A2A] px-3 py-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {reportLoading
                ? <RefreshCw className="w-3 h-3 animate-spin" />
                : <FileText className="w-3 h-3" />}
              Informe mensual
            </button>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="p-1.5 text-gray-600 hover:text-gray-400 transition-colors"
                title="Limpiar chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-700/20 border border-blue-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300">
                  {isEmpty ? `${activeProject.name} no tiene datos aún` : `Preguntale a Vynta IA sobre ${activeProject.name}`}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {isEmpty
                    ? 'Este proyecto está en configuración o pausado.'
                    : 'Analizo métricas, tendencias y comportamiento de la audiencia en tiempo real.'}
                </p>
              </div>
              {!isEmpty && (
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {SUGGESTED_QUESTIONS.slice(0, 3).map(q => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-xs text-blue-400 border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map(msg => (
            <div
              key={msg.id}
              className={cn('flex gap-3', msg.role === 'user' && 'justify-end')}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3 h-3 text-white" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-xl px-4 py-3',
                  msg.role === 'user'
                    ? 'bg-[#1A1A1A] border border-[#252525]'
                    : 'bg-[#141414] border border-[#1F1F1F]'
                )}
              >
                {msg.loading ? (
                  <div className="flex gap-1 items-center h-5">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                ) : msg.role === 'user' ? (
                  <p className="text-sm text-gray-200">{msg.text}</p>
                ) : (
                  <MarkdownText text={msg.text} />
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-[#1A1A1A] shrink-0">
          {messages.length > 0 && !loading && (
            <div className="flex gap-2 flex-wrap mb-3">
              {SUGGESTED_QUESTIONS.slice(3).map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  disabled={isEmpty}
                  className="text-[11px] text-gray-500 hover:text-gray-300 border border-[#1F1F1F] hover:border-[#2A2A2A] px-2.5 py-1 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading || isEmpty}
              placeholder={isEmpty ? 'Sin datos disponibles para este proyecto' : 'Preguntá sobre la audiencia, categorías, noticias...'}
              rows={1}
              className="flex-1 resize-none bg-[#141414] border border-[#1F1F1F] focus:border-[#2A2A2A] rounded-lg px-3.5 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ maxHeight: 120 }}
              onInput={e => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = 'auto';
                t.style.height = Math.min(t.scrollHeight, 120) + 'px';
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading || isEmpty}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Context panel */}
      <div className="w-64 shrink-0 space-y-4">
        <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1A1A1A]">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contexto activo</p>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div>
              <p className="text-[11px] text-gray-600 mb-1">Proyecto</p>
              <p className="text-sm font-semibold text-white">{activeProject.name}</p>
            </div>
            {!isEmpty && (
              <>
                <div>
                  <p className="text-[11px] text-gray-600 mb-1">Usuarios hoy</p>
                  <p className="text-sm font-medium text-gray-200">{data.usuariosHoy.toLocaleString('es-AR')}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-600 mb-1">Completado</p>
                  <p className="text-sm font-medium text-gray-200">{data.effectiveCompletionRate}%</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-600 mb-1">Categoría top</p>
                  <p className="text-sm font-medium text-gray-200">{data.categoriaPopular}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-600 mb-1">Datos disponibles</p>
                  <ul className="space-y-0.5">
                    {[
                      `${data.noticiasSalteadas.length} noticias salteadas`,
                      `${data.preguntasFrecuentes.length} preguntas frecuentes`,
                      `${data.categoriasCompletado.length} categorías`,
                    ].map(item => (
                      <li key={item} className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-blue-500/60 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            {isEmpty && (
              <p className="text-xs text-gray-600 italic">Proyecto sin datos activos</p>
            )}
          </div>
        </div>

        <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1A1A1A]">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Modelo</p>
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600">Motor</p>
              <span className="text-xs font-medium text-blue-400">Gemini 2.0 Flash</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600">Idioma</p>
              <span className="text-xs font-medium text-gray-300">es-AR</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600">Contexto</p>
              <span className="text-xs font-medium text-gray-300">Tiempo real</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
