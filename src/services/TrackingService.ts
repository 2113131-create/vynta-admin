import { supabase, supabaseConfigured } from '../lib/supabase';
import type { BaseEvent, EventType, EventPayload } from '../types/analytics';

const BUFFER_MAX = 10;
const FLUSH_INTERVAL_MS = 5000;

class TrackingService {
  private static instance: TrackingService;

  private buffer: BaseEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  private projectId = '';
  private sessionId = '';
  private userId: string | undefined;

  private constructor() {}

  static getInstance(): TrackingService {
    if (!TrackingService.instance) {
      TrackingService.instance = new TrackingService();
    }
    return TrackingService.instance;
  }

  // Call once on session start (e.g. when user opens the app)
  init(projectId: string, sessionId: string, userId?: string): void {
    this.projectId = projectId;
    this.sessionId = sessionId;
    this.userId = userId;

    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);
  }

  // Push a single event into the in-memory buffer
  track(eventType: EventType, payload: EventPayload): void {
    if (!this.projectId || !this.sessionId) {
      console.warn('[TrackingService] Not initialised — call init() first');
      return;
    }

    const event: BaseEvent = {
      project_id: this.projectId,
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: eventType,
      payload,
      client_timestamp: new Date().toISOString(),
    };

    this.buffer.push(event);

    if (this.buffer.length >= BUFFER_MAX) {
      this.flush();
    }
  }

  // Flush buffer to Supabase (no-op if Supabase not configured)
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    if (!supabaseConfigured || !supabase) {
      // Dev mode: just drain the buffer silently
      this.buffer = [];
      return;
    }

    const batch = this.buffer.splice(0, this.buffer.length);

    const { error } = await supabase
      .from('analytics_events')
      .insert(batch);

    if (error) {
      console.error('[TrackingService] flush error:', error.message);
      // Re-queue on failure (avoid infinite growth: cap at 50)
      if (this.buffer.length < 50) {
        this.buffer.unshift(...batch);
      }
    }
  }

  // Convenience helpers
  heartbeat(articleId: string, category: string, positionSec: number, durationSec: number): void {
    this.track('audio_heartbeat', {
      article_id: articleId,
      category,
      position_sec: positionSec,
      duration_sec: durationSec,
    });
  }

  skip(articleId: string, category: string, positionSec: number, durationSec: number): void {
    const pct = durationSec > 0 ? Math.round((positionSec / durationSec) * 100) : 0;
    this.track('audio_skip', {
      article_id: articleId,
      category,
      position_sec: positionSec,
      skipped_at_pct: pct,
    });
  }

  query(queryText: string, category: string, latencyMs?: number): void {
    this.track('ai_query', {
      query: queryText,
      category,
      response_latency_ms: latencyMs,
    });
  }

  milestone(articleId: string, category: string, pct: '50pct' | '80pct' | 'complete'): void {
    this.track('milestone', {
      article_id: articleId,
      category,
      milestone: pct,
    });
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }
}

export const tracker = TrackingService.getInstance();
