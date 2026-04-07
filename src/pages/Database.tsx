/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Clock, MessageSquare, Play, Search, Filter, Flag, MoreVertical } from 'lucide-react';
import { cn } from '../lib/utils';
import { useProject } from '../context/ProjectContext';

// Local mock — will be replaced by Supabase queries per project
const MOCK_USERS = [
  { id: 'usr_1', name: 'Juan Pérez',     email: 'juan@example.com',   role: 'listener', sessions: 45, lastActive: 'Hace 2 horas' },
  { id: 'usr_2', name: 'María Gómez',    email: 'maria@example.com',  role: 'listener', sessions: 12, lastActive: 'Hace 5 horas' },
  { id: 'usr_3', name: 'Carlos Ruiz',    email: 'carlos@example.com', role: 'listener', sessions: 89, lastActive: 'Ayer' },
  { id: 'usr_4', name: 'Ana Fernández',  email: 'ana@example.com',    role: 'listener', sessions: 34, lastActive: 'Hace 1 hora' },
  { id: 'usr_5', name: 'Luis Martínez',  email: 'luis@example.com',   role: 'listener', sessions: 67, lastActive: 'Hace 3 horas' },
];

const MOCK_SESSIONS = [
  { id: 'ses_1', user: 'Juan Pérez',    date: '2026-04-06 08:30', duration: '4m 12s', categories: ['Deportes', 'Política'],              completed: true  },
  { id: 'ses_2', user: 'María Gómez',   date: '2026-04-06 09:15', duration: '1m 45s', categories: ['Economía'],                          completed: false },
  { id: 'ses_3', user: 'Carlos Ruiz',   date: '2026-04-06 07:20', duration: '6m 30s', categories: ['Espectáculos', 'Política', 'Policiales'], completed: true },
  { id: 'ses_4', user: 'Ana Fernández', date: '2026-04-06 12:05', duration: '3m 10s', categories: ['Deportes'],                          completed: true  },
  { id: 'ses_5', user: 'Luis Martínez', date: '2026-04-06 13:40', duration: '5m 22s', categories: ['Economía', 'Política'],              completed: false },
];

const MOCK_CONVERSATIONS = [
  { id: 'conv_1', user: 'Juan Pérez',  question: '¿Qué pasó con el dólar blue?',      answer: 'El dólar blue cerró a $1.285, subió $15.',                  category: 'Economía', flagged: false },
  { id: 'conv_2', user: 'María Gómez', question: '¿A qué hora juega Talleres?',         answer: 'Talleres juega a las 21:30 contra Boca por Copa Argentina.', category: 'Deportes', flagged: true  },
  { id: 'conv_3', user: 'Carlos Ruiz', question: 'Resumime las noticias de política',   answer: 'El Congreso debate la ley de alquileres y hubo reunión de gobernadores.', category: 'Política', flagged: false },
];

export function Database() {
  const { activeProject } = useProject();
  const data = { users: MOCK_USERS, sessions: MOCK_SESSIONS, conversations: MOCK_CONVERSATIONS };
  const [activeTab, setActiveTab] = useState<'users' | 'sessions' | 'conversations'>('users');
  const [search, setSearch] = useState('');
  const isEmpty = activeProject.status !== 'active';

  const tabs = [
    { id: 'users', label: 'Usuarios', icon: Users, count: data.users.length },
    { id: 'sessions', label: 'Sesiones', icon: Clock, count: data.sessions.length },
    { id: 'conversations', label: 'Conversaciones', icon: MessageSquare, count: data.conversations.length },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Explorador de Interacciones</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Auditoría de sesiones y conversaciones — {activeProject.name}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-md pl-8 pr-4 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-[#2A2A2A] w-52"
            />
          </div>
          <button className="bg-[#141414] border border-[#1A1A1A] hover:border-[#252525] text-gray-400 px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors">
            <Filter className="w-3.5 h-3.5" />
            Filtros
          </button>
        </div>
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
            {tab.count > 0 && (
              <span className="text-[10px] bg-[#1A1A1A] text-gray-500 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl overflow-hidden">
        {isEmpty ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-600">Sin datos disponibles para este proyecto</p>
          </div>
        ) : (
          <>
            {activeTab === 'users' && (
              data.users.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-600">Sin usuarios registrados</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111] border-b border-[#1A1A1A] text-gray-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Usuario</th>
                      <th className="px-5 py-3 font-medium">Email</th>
                      <th className="px-5 py-3 font-medium">Rol</th>
                      <th className="px-5 py-3 font-medium">Sesiones</th>
                      <th className="px-5 py-3 font-medium">Última Actividad</th>
                      <th className="px-5 py-3 font-medium text-right" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A]">
                    {data.users
                      .filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
                      .map(user => (
                        <tr key={user.id} className="hover:bg-[#111] transition-colors cursor-pointer">
                          <td className="px-5 py-3.5 font-medium text-gray-200 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {user.name.charAt(0)}
                            </div>
                            {user.name}
                          </td>
                          <td className="px-5 py-3.5 text-gray-500">{user.email}</td>
                          <td className="px-5 py-3.5 text-gray-500 capitalize">{user.role}</td>
                          <td className="px-5 py-3.5 text-gray-400 font-medium">{user.sessions}</td>
                          <td className="px-5 py-3.5 text-gray-500">{user.lastActive}</td>
                          <td className="px-5 py-3.5 text-right">
                            <button className="p-1.5 text-gray-600 hover:text-gray-400 transition-colors">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )
            )}

            {activeTab === 'sessions' && (
              data.sessions.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-600">Sin sesiones registradas</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111] border-b border-[#1A1A1A] text-gray-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Fecha</th>
                      <th className="px-5 py-3 font-medium">Usuario</th>
                      <th className="px-5 py-3 font-medium">Duración</th>
                      <th className="px-5 py-3 font-medium">Categorías</th>
                      <th className="px-5 py-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A]">
                    {data.sessions
                      .filter(s => s.user.toLowerCase().includes(search.toLowerCase()))
                      .map(session => (
                        <tr key={session.id} className="hover:bg-[#111] transition-colors cursor-pointer">
                          <td className="px-5 py-3.5 text-gray-500 font-mono">{session.date}</td>
                          <td className="px-5 py-3.5 font-medium text-gray-300">{session.user}</td>
                          <td className="px-5 py-3.5 text-gray-400">{session.duration}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex gap-1 flex-wrap">
                              {session.categories.map(cat => (
                                <span key={cat} className="px-1.5 py-0.5 bg-[#1A1A1A] text-gray-400 rounded text-[11px]">
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={cn(
                              'px-2 py-0.5 rounded-full text-[11px] font-medium',
                              session.completed
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            )}>
                              {session.completed ? 'Completado' : 'Incompleto'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )
            )}

            {activeTab === 'conversations' && (
              data.conversations.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-600">Sin conversaciones registradas</div>
              ) : (
                <div className="divide-y divide-[#1A1A1A]">
                  {data.conversations
                    .filter(c =>
                      c.user.toLowerCase().includes(search.toLowerCase()) ||
                      c.question.toLowerCase().includes(search.toLowerCase())
                    )
                    .map(conv => (
                      <div key={conv.id} className="p-5 hover:bg-[#111] transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {conv.user.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-200">{conv.user}</p>
                              <p className="text-[11px] text-gray-600">{conv.category}</p>
                            </div>
                          </div>
                          <button className={cn(
                            'p-1.5 rounded-md transition-colors',
                            conv.flagged ? 'text-red-400 bg-red-400/10' : 'text-gray-600 hover:text-gray-400 hover:bg-[#1F1F1F]'
                          )}>
                            <Flag className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-3 pl-9">
                          <div>
                            <p className="text-[11px] text-gray-600 mb-1.5">Pregunta del usuario:</p>
                            <div className="flex items-center gap-2.5 bg-[#141414] p-2.5 rounded-lg border border-[#1F1F1F]">
                              <button className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                                <Play className="w-3 h-3 ml-0.5" />
                              </button>
                              <div className="flex-1 h-5 bg-[#1F1F1F] rounded flex items-center px-2 overflow-hidden">
                                <div className="flex items-end gap-[2px] h-full w-full opacity-40">
                                  {Array.from({ length: 40 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className="flex-1 bg-blue-400 rounded-sm"
                                      style={{ height: `${20 + ((i * 37 + 13) % 80)}%` }}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-[11px] text-gray-600 font-mono shrink-0">0:04</span>
                            </div>
                            <p className="text-xs text-gray-300 mt-1.5 font-medium">"{conv.question}"</p>
                          </div>

                          <div>
                            <p className="text-[11px] text-gray-600 mb-1.5">Respuesta de Vynta:</p>
                            <div className="flex items-center gap-2.5 bg-[#141414] p-2.5 rounded-lg border border-[#1F1F1F]">
                              <button className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0">
                                <Play className="w-3 h-3 ml-0.5" />
                              </button>
                              <div className="flex-1 h-5 bg-[#1F1F1F] rounded flex items-center px-2 overflow-hidden">
                                <div className="flex items-end gap-[2px] h-full w-full opacity-40">
                                  {Array.from({ length: 40 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className="flex-1 bg-emerald-400 rounded-sm"
                                      style={{ height: `${20 + ((i * 53 + 7) % 80)}%` }}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-[11px] text-gray-600 font-mono shrink-0">0:12</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5">"{conv.answer}"</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
