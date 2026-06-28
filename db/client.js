// db/client.js — World Scheduler Database Client
// Queries the SQLite API server (default: http://127.0.0.1:8001)
// Falls back to localStorage when API is unavailable.
// Usage: import { db } from './db/client.js';

const API_BASE = 'http://127.0.0.1:8001';

async function apiGet(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(`API ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[db] API unavailable (${path}):`, err.message);
    return null;
  }
}

export const db = {

  // ── ENTITIES ──────────────────────────────────────────────

  async entities(type) {
    const q = type ? `?type=${type}` : '';
    return await apiGet(`/api/entities${q}`) || [];
  },

  // ── MEASUREMENTS ──────────────────────────────────────────

  async measurements({ entity_id, metric, time_period } = {}) {
    const params = new URLSearchParams();
    if (entity_id) params.set('entity_id', entity_id);
    if (metric) params.set('metric', metric);
    if (time_period) params.set('time_period', time_period);
    return await apiGet(`/api/measurements?${params}`) || [];
  },

  // ── TRANSFORMATIONS ───────────────────────────────────────

  /** List all 11 available transformations */
  async transforms() {
    return await apiGet('/api/transforms') || [];
  },

  /** Run a named transformation: shortfall, labor_required, cost, rank, etc. */
  async transform(name) {
    return await apiGet(`/api/transform/${name}`) || [];
  },

  // ── HIGH-LEVEL QUERIES ────────────────────────────────────

  /** World-level summary: population, shortfalls, labor, cost */
  async worldSummary() {
    return await apiGet('/api/world-summary');
  },

  /** Full region data: supply, per-capita, shortfalls, labor */
  async regionSummary(regionKey) {
    return await apiGet(`/api/region/${regionKey}`);
  },

  /** Compare two entities side by side */
  async compare(entityA, entityB) {
    return await apiGet(`/api/compare?a=${encodeURIComponent(entityA)}&b=${encodeURIComponent(entityB)}`);
  },

  /** Rank entities by a metric */
  async rank(metric) {
    return await apiGet(`/api/rank?metric=${encodeURIComponent(metric)}`);
  },

  /** Time-series trend for a specific entity+metric */
  async trend(entityId, metric) {
    return await apiGet(`/api/trend?entity_id=${encodeURIComponent(entityId)}&metric=${encodeURIComponent(metric)}`);
  },

  /** List all 30 available metrics */
  async metrics() {
    return await apiGet('/api/metrics') || [];
  },

  // ── CONVENIENCE: Shortfall by entity ──────────────────────

  /** Get shortfall for a specific entity */
  async shortfalls(entityId = 'planet:earth') {
    const all = await apiGet('/api/transform/shortfall') || [];
    return all.filter(s => s.entity_id === entityId);
  },

  /** Get all region shortfalls sorted worst-first */
  async regionShortfalls() {
    const all = await apiGet('/api/transform/shortfall') || [];
    return all
      .filter(s => s.entity_id.startsWith('region:'))
      .sort((a, b) => a.shortfall - b.shortfall);  // worst deficit first
  },
};

// Auto-detect if API is reachable on load
db._available = apiGet('/api/transforms').then(r => {
  db._online = Array.isArray(r) && r.length > 0;
  if (db._online) console.log('[db] SQLite API connected — 11 transforms available');
  else console.log('[db] API unreachable, using localStorage fallback');
  return db._online;
}).catch(() => {
  db._online = false;
  console.log('[db] API unreachable, using localStorage fallback');
  return false;
});
