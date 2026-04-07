/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';

let _client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!_client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY no configurada');
    _client = new GoogleGenAI({ apiKey });
  }
  return _client;
}

export type AnalystContext = {
  projectName: string;
  kpis: {
    usuariosHoy: number;
    tasaCompletado: number;
    categoriaPopular: string;
    tiempoPromedio: string;
    trendUsuarios: number;
    trendCompletado: number;
  };
  categoriasCompletado: Array<{ name: string; value: number }>;
  noticiasSalteadas: Array<{ title: string; category: string; skips: number }>;
  preguntasFrecuentes: Array<{ question: string; count: number }>;
};

function buildSystemPrompt(ctx: AnalystContext): string {
  return `Sos Vynta IA, el analista de audiencias interno de Vynta para el proyecto "${ctx.projectName}".
Vynta es una plataforma de noticias por voz con IA. Los usuarios escuchan resúmenes de noticias narrados por IA y pueden hacer preguntas en cualquier momento.

DATOS EN TIEMPO REAL — ${ctx.projectName}:
• Usuarios activos hoy: ${ctx.kpis.usuariosHoy.toLocaleString('es-AR')} (${ctx.kpis.trendUsuarios > 0 ? '+' : ''}${ctx.kpis.trendUsuarios}% vs ayer)
• Tasa de completado: ${ctx.kpis.tasaCompletado}% (${ctx.kpis.trendCompletado > 0 ? '+' : ''}${ctx.kpis.trendCompletado}% vs semana pasada)
• Tiempo promedio de escucha: ${ctx.kpis.tiempoPromedio}
• Categoría más popular: ${ctx.kpis.categoriaPopular}

TASA DE COMPLETADO POR CATEGORÍA:
${ctx.categoriasCompletado.map(c => `  • ${c.name}: ${c.value}%`).join('\n')}

TOP NOTICIAS MÁS SALTEADAS HOY:
${ctx.noticiasSalteadas.slice(0, 5).map((n, i) => `  ${i + 1}. "${n.title}" [${n.category}] — ${n.skips} skips`).join('\n')}

PREGUNTAS MÁS FRECUENTES DE LA AUDIENCIA:
${ctx.preguntasFrecuentes.slice(0, 5).map((q, i) => `  ${i + 1}. "${q.question}" — ${q.count} veces`).join('\n')}

INSTRUCCIONES:
- Respondé en español argentino, tono profesional y directo.
- Sé específico y accionable. Usá los datos concretos cuando sea relevante.
- Máximo 3-4 oraciones por respuesta, salvo que te pidan un informe.
- Si te piden generar un informe, escribilo en formato Markdown con secciones claras.
- No inventes datos que no estén en el contexto.`;
}

export async function askAnalyst(
  question: string,
  ctx: AnalystContext,
  history: Array<{ role: 'user' | 'model'; text: string }> = []
): Promise<string> {
  const ai = getClient();

  const systemPrompt = buildSystemPrompt(ctx);

  const contents = [
    ...history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }],
    })),
    {
      role: 'user' as const,
      parts: [{ text: question }],
    },
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.7,
    },
  });

  return response.text ?? '';
}

export async function generateDailyInsight(ctx: AnalystContext): Promise<string> {
  return askAnalyst(
    'Basándote en los datos de hoy, dame el insight más importante que debería saber el equipo editorial. Una sola observación clave, accionable.',
    ctx
  );
}

export async function generateMonthlyReport(ctx: AnalystContext): Promise<string> {
  return askAnalyst(
    `Generá un informe mensual completo en Markdown para presentar a ${ctx.projectName}.
Incluí: resumen ejecutivo, análisis por categorías, noticias problemáticas (más salteadas),
demanda de la audiencia (preguntas frecuentes), y 3 recomendaciones editoriales concretas.`,
    ctx
  );
}
