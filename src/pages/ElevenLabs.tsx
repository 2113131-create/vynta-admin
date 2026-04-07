/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mic, Bot, Settings, Play, Plus, Edit2, Activity, Volume2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useProject } from '../context/ProjectContext';

const voices = [
  { id: 1, name: 'Mario (Cadena 3)', language: 'es-AR', model: 'eleven_multilingual_v2', assignedTo: 'Cadena 3' },
  { id: 2, name: 'Locutora Noticias', language: 'es-AR', model: 'eleven_multilingual_v2', assignedTo: 'Clarín' },
  { id: 3, name: 'Carlos (Deportes)', language: 'es-AR', model: 'eleven_turbo_v2', assignedTo: 'La Nación' },
  { id: 4, name: 'Voz Neutra', language: 'es-ES', model: 'eleven_multilingual_v2', assignedTo: 'Sin asignar' },
];

const agents = [
  { id: 1, name: 'Agente Principal C3', voice: 'Mario (Cadena 3)', status: 'active', conversations: 15420, latency: '850ms' },
  { id: 2, name: 'Agente Deportes C3', voice: 'Carlos (Deportes)', status: 'active', conversations: 8230, latency: '820ms' },
  { id: 3, name: 'Agente Clarín', voice: 'Locutora Noticias', status: 'paused', conversations: 0, latency: '—' },
];

const tabs = [
  { id: 'voices', label: 'Voces', icon: Mic },
  { id: 'agents', label: 'Agentes', icon: Bot },
  { id: 'config', label: 'Configuración', icon: Settings },
] as const;

export function ElevenLabs() {
  const [activeTab, setActiveTab] = useState<'voices' | 'agents' | 'config'>('voices');
  const [stabilityVal, setStabilityVal] = useState(75);
  const [clarityVal, setClarityVal] = useState(85);
  const { activeProject } = useProject();

  const buttonLabel =
    activeTab === 'voices' ? 'Nueva Voz'
    : activeTab === 'agents' ? 'Nuevo Agente'
    : 'Guardar Cambios';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">ElevenLabs</h1>
          <p className="text-xs text-gray-500 mt-0.5">Voces y agentes conversacionales · {activeProject.name}</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          {buttonLabel}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-[#1A1A1A]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 -mb-px',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl overflow-hidden">
        {activeTab === 'voices' && (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111] border-b border-[#1A1A1A] text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Idioma</th>
                <th className="px-5 py-3 font-medium">Modelo</th>
                <th className="px-5 py-3 font-medium">Asignado a</th>
                <th className="px-5 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {voices.map(voice => (
                <tr key={voice.id} className="hover:bg-[#111] transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#1A1A1A] border border-[#252525] flex items-center justify-center shrink-0">
                        <Volume2 className="w-3 h-3 text-gray-500" />
                      </div>
                      {voice.name}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{voice.language}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 bg-[#1A1A1A] border border-[#252525] rounded text-[11px] text-gray-400 font-mono">
                      {voice.model}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400">{voice.assignedTo}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="p-1.5 text-gray-600 hover:text-gray-300 transition-colors">
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 text-gray-600 hover:text-gray-300 transition-colors ml-1">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'agents' && (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111] border-b border-[#1A1A1A] text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Agente</th>
                <th className="px-5 py-3 font-medium">Voz</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Conversaciones</th>
                <th className="px-5 py-3 font-medium">Latencia Prom.</th>
                <th className="px-5 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {agents.map(agent => (
                <tr key={agent.id} className="hover:bg-[#111] transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-200">{agent.name}</td>
                  <td className="px-5 py-3.5 text-gray-500">{agent.voice}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-[11px] font-medium',
                      agent.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                    )}>
                      {agent.status === 'active' ? 'Activo' : 'Pausado'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400">{agent.conversations.toLocaleString('es-AR')}</td>
                  <td className="px-5 py-3.5 text-gray-400">{agent.latency}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="p-1.5 text-gray-600 hover:text-gray-300 transition-colors">
                      <Activity className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 text-gray-600 hover:text-gray-300 transition-colors ml-1">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'config' && (
          <div className="p-6 max-w-xl">
            <h3 className="text-sm font-semibold text-gray-200 mb-5">Configuración Global</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Modelo TTS por Defecto</label>
                <select className="w-full bg-[#141414] border border-[#1F1F1F] text-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none">
                  <option>eleven_multilingual_v2</option>
                  <option>eleven_turbo_v2</option>
                  <option>eleven_monolingual_v1</option>
                </select>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-500">Estabilidad</label>
                    <span className="text-xs text-gray-400 font-medium">{stabilityVal}%</span>
                  </div>
                  <input
                    type="range"
                    className="w-full accent-blue-500"
                    value={stabilityVal}
                    onChange={e => setStabilityVal(Number(e.target.value))}
                  />
                  <p className="text-[11px] text-gray-600 mt-1">
                    Mayor estabilidad = voz más consistente. Menor = más expresiva.
                  </p>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-500">Claridad + Similitud</label>
                    <span className="text-xs text-gray-400 font-medium">{clarityVal}%</span>
                  </div>
                  <input
                    type="range"
                    className="w-full accent-blue-500"
                    value={clarityVal}
                    onChange={e => setClarityVal(Number(e.target.value))}
                  />
                  <p className="text-[11px] text-gray-600 mt-1">Similitud con la voz original clonada.</p>
                </div>
              </div>

              <div className="pt-5 border-t border-[#1A1A1A]">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Uso del Plan</h4>
                <div className="bg-[#141414] rounded-lg p-4 border border-[#1F1F1F]">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400">Caracteres consumidos</span>
                    <span className="text-white font-medium">8,450,200 / 10,000,000</span>
                  </div>
                  <div className="w-full bg-[#1F1F1F] rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '84.5%' }} />
                  </div>
                  <p className="text-[11px] text-orange-400/80 mt-2">
                    84.5% utilizado — renovación en 8 días
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
