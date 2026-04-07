/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2, Plus, Users, Activity, Settings, Database,
  Bot, ExternalLink, MoreVertical, Search, ChevronRight, ArrowLeft,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useProject } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../lib/mockData';

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  configuring: 'En Configuración',
  paused: 'Pausado',
};

const STATUS_DOT: Record<string, string> = {
  active: 'bg-emerald-500',
  configuring: 'bg-blue-500',
  paused: 'bg-gray-500',
};

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400',
  configuring: 'bg-blue-500/10 text-blue-400',
  paused: 'bg-gray-500/10 text-gray-400',
};

function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  const { setActiveProjectId } = useProject();
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver a proyectos
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ background: `linear-gradient(135deg, ${project.gradientFrom}, ${project.gradientTo})` }}
          >
            {project.logo}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{project.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn('text-xs px-2 py-0.5 rounded font-medium', STATUS_BADGE[project.status])}>
                {STATUS_LABELS[project.status]}
              </span>
              <span className="text-xs text-gray-600">ID: prj_{project.id}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveProjectId(project.id); navigate('/'); }}
            className="flex items-center gap-1.5 text-xs bg-[#141414] border border-[#1F1F1F] hover:border-[#2A2A2A] text-gray-300 px-3 py-1.5 rounded-md transition-colors"
          >
            <Activity className="w-3.5 h-3.5" />
            Ver métricas
          </button>
          <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors">
            Guardar cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* General config */}
          <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#1A1A1A] flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-200">Configuración General</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Nombre del Medio</label>
                  <input
                    type="text"
                    defaultValue={project.name}
                    className="w-full bg-[#141414] border border-[#1F1F1F] rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#2A2A2A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">URL de Scraping</label>
                  <input
                    type="text"
                    defaultValue={project.scrapeUrl}
                    className="w-full bg-[#141414] border border-[#1F1F1F] rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#2A2A2A]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Categorías Habilitadas</label>
                <div className="flex flex-wrap gap-2">
                  {['Política', 'Economía', 'Deportes', 'Espectáculos', 'Policiales', 'Internacional', 'Tecnología'].map(cat => (
                    <label key={cat} className="flex items-center gap-2 bg-[#141414] border border-[#1F1F1F] px-3 py-1.5 rounded-md cursor-pointer hover:bg-[#1A1A1A] transition-colors">
                      <input
                        type="checkbox"
                        defaultChecked={['Política', 'Economía', 'Deportes', 'Espectáculos', 'Policiales'].includes(cat)}
                        className="rounded border-gray-700 bg-[#0D0D0D] text-blue-500 focus:ring-blue-500 focus:ring-offset-[#0D0D0D]"
                      />
                      <span className="text-xs text-gray-300">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI config */}
          <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#1A1A1A] flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-200">Inteligencia Artificial</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Modelo de Groq</label>
                  <select
                    defaultValue={project.model}
                    className="w-full bg-[#141414] border border-[#1F1F1F] rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none"
                  >
                    <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                    <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Voz ElevenLabs</label>
                  <select
                    defaultValue={project.voice}
                    className="w-full bg-[#141414] border border-[#1F1F1F] rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none"
                  >
                    <option>Mario (Cadena 3)</option>
                    <option>Locutora Noticias</option>
                    <option>Carlos (Deportes)</option>
                    <option>Voz Neutra</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">System Prompt</label>
                <textarea
                  rows={3}
                  defaultValue={project.systemPrompt}
                  className="w-full bg-[#141414] border border-[#1F1F1F] rounded-md px-3 py-2 text-xs text-gray-300 focus:outline-none font-mono leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar panel */}
        <div className="space-y-4">
          <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-[#1A1A1A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-200">Supabase</h3>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Conectado
              </span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Project URL</label>
                <input
                  type="text"
                  readOnly
                  value={project.supabaseUrl}
                  className="w-full bg-[#141414] border border-[#1F1F1F] rounded-md px-2.5 py-1.5 text-xs text-gray-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Tablas</label>
                <ul className="space-y-1.5">
                  {['profiles', 'events', 'sessions'].map(t => (
                    <li key={t} className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="text-emerald-500 text-xs">✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-[#1A1A1A]">
              <h3 className="text-sm font-semibold text-gray-200">Acciones</h3>
            </div>
            <div className="p-2">
              {[
                { label: 'Ver métricas del proyecto', action: () => { setActiveProjectId(project.id); navigate('/'); } },
                { label: 'Chat con Vynta IA', action: () => { setActiveProjectId(project.id); navigate('/ia'); } },
                { label: 'Explorar base de datos', action: () => { setActiveProjectId(project.id); navigate('/database'); } },
                { label: 'Config. de ElevenLabs', action: () => navigate('/elevenlabs') },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-[#141414] rounded-md transition-colors text-left"
                >
                  {item.label}
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Projects() {
  const { projects, setActiveProjectId, activeProject } = useProject();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const selected = selectedId ? projects.find(p => p.id === selectedId) ?? null : null;

  if (selected) {
    return <ProjectDetail project={selected} onBack={() => setSelectedId(null)} />;
  }

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Proyectos de Medios</h1>
          <p className="text-xs text-gray-500 mt-0.5">Gestión multi-tenant de clientes</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Nuevo Proyecto
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar proyectos..."
          className="w-full bg-[#0D0D0D] border border-[#1A1A1A] rounded-md pl-8 pr-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#2A2A2A]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(project => (
          <div
            key={project.id}
            className={cn(
              'bg-[#0D0D0D] border rounded-xl p-5 cursor-pointer transition-all group',
              activeProject.id === project.id
                ? 'border-blue-500/30'
                : 'border-[#1A1A1A] hover:border-[#2A2A2A]'
            )}
            onClick={() => setSelectedId(project.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ background: `linear-gradient(135deg, ${project.gradientFrom}, ${project.gradientTo})` }}
              >
                {project.logo}
              </div>
              <button
                className="text-gray-700 hover:text-gray-400 transition-colors"
                onClick={e => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-bold text-white mb-1">{project.name}</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', STATUS_DOT[project.status])} />
              <span className="text-xs text-gray-500">{STATUS_LABELS[project.status]}</span>
              {activeProject.id === project.id && (
                <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Activo
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#1A1A1A]">
              <div>
                <p className="text-[11px] text-gray-600 flex items-center gap-1 mb-0.5">
                  <Users className="w-3 h-3" /> Usuarios
                </p>
                <p className="text-sm font-semibold text-gray-200">
                  {project.users > 0 ? project.users.toLocaleString('es-AR') : '—'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-600 flex items-center gap-1 mb-0.5">
                  <Activity className="w-3 h-3" /> Sesiones hoy
                </p>
                <p className="text-sm font-semibold text-gray-200">
                  {project.sessionsToday > 0 ? project.sessionsToday.toLocaleString('es-AR') : '—'}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-gray-600">Uptime: {project.uptime}</span>
              <span className="text-[11px] text-gray-600 flex items-center gap-1 group-hover:text-gray-400 transition-colors">
                Ver detalles <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
