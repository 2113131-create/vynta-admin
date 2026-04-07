/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ElevenLabs } from './pages/ElevenLabs';
import { Database } from './pages/Database';
import { Projects } from './pages/Projects';
import { VyntaIA } from './pages/VyntaIA';

export default function App() {
  return (
    <ProjectProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="elevenlabs" element={<ElevenLabs />} />
            <Route path="database" element={<Database />} />
            <Route path="projects" element={<Projects />} />
            <Route path="ia" element={<VyntaIA />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProjectProvider>
  );
}
