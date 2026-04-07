/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart2, Mic, Database, Building2, Sparkles, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useProject } from '../context/ProjectContext';

const navItems = [
  { name: 'Métricas', href: '/', icon: BarChart2 },
  { name: 'Vynta IA', href: '/ia', icon: Sparkles },
  { name: 'ElevenLabs', href: '/elevenlabs', icon: Mic },
  { name: 'Base de Datos', href: '/database', icon: Database },
  { name: 'Proyectos', href: '/projects', icon: Building2 },
];

export function Sidebar() {
  const { activeProject } = useProject();

  return (
    <div className="flex flex-col w-60 bg-[#080808] border-r border-[#1A1A1A] text-gray-300 h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3 border-b border-[#1A1A1A]">
        <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center shrink-0">
          <span className="text-black font-black text-base leading-none">V</span>
        </div>
        <div>
          <span className="font-semibold text-sm text-white tracking-tight leading-none block">Vynta Admin</span>
          <span className="text-[11px] text-gray-600 mt-0.5 block">Panel de Control</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-gray-500 hover:bg-[#141414] hover:text-gray-300',
                item.name === 'Vynta IA' && 'mt-1'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'w-4 h-4 shrink-0',
                    isActive
                      ? item.name === 'Vynta IA' ? 'text-blue-400' : 'text-gray-300'
                      : 'text-gray-600',
                    item.name === 'Vynta IA' && !isActive && 'text-blue-500/60'
                  )}
                />
                <span>{item.name}</span>
                {item.name === 'Vynta IA' && (
                  <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    IA
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Active project badge */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[#141414] border border-[#1F1F1F] rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 leading-none mb-0.5">Proyecto activo</p>
            <p className="text-xs font-semibold text-white truncate">{activeProject.name}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-[#1A1A1A] pt-3">
        <button className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-gray-600 hover:bg-[#141414] hover:text-gray-300 transition-colors">
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
