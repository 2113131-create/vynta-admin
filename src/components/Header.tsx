/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { useProject } from '../context/ProjectContext';

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  configuring: 'Configurando',
  paused: 'Pausado',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500',
  configuring: 'bg-blue-500',
  paused: 'bg-gray-500',
};

export function Header() {
  const { activeProject, setActiveProjectId, projects } = useProject();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <header className="h-14 border-b border-[#1A1A1A] bg-[#080808] flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Project switcher */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2.5 px-3 py-1.5 bg-[#111111] border border-[#1F1F1F] hover:border-[#2A2A2A] rounded-md text-sm transition-colors group"
        >
          <span
            className={cn('w-2 h-2 rounded-full shrink-0', STATUS_COLORS[activeProject.status])}
          />
          <span className="font-medium text-gray-200">{activeProject.name}</span>
          <ChevronDown
            className={cn('w-3.5 h-3.5 text-gray-500 transition-transform', open && 'rotate-180')}
          />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1.5 w-52 bg-[#111111] border border-[#1F1F1F] rounded-lg shadow-xl shadow-black/50 overflow-hidden z-30">
            <div className="px-3 py-2 border-b border-[#1F1F1F]">
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Proyectos</p>
            </div>
            {projects.map(p => (
              <button
                key={p.id}
                onClick={() => { setActiveProjectId(p.id); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1A1A1A] transition-colors text-left"
              >
                <span className={cn('w-2 h-2 rounded-full shrink-0', STATUS_COLORS[p.status])} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200">{p.name}</p>
                  <p className="text-xs text-gray-500">{STATUS_LABELS[p.status]}</p>
                </div>
                {p.id === activeProject.id && (
                  <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button className="relative text-gray-500 hover:text-gray-300 transition-colors">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2.5 pl-4 border-l border-[#1A1A1A]">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 shrink-0" />
          <div className="text-right">
            <p className="text-sm font-medium text-white leading-none">Admin</p>
            <p className="text-[11px] text-gray-500 mt-0.5">super_admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
