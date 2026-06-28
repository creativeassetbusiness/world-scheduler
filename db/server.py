#!/usr/bin/env python3
"""
World Scheduler Database API Server
Serves SQLite data to the frontend via HTTP JSON endpoints.
Run: python3 db/server.py [--port 8001]
"""

import sqlite3
import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

DB_PATH = os.path.join(os.path.dirname(__file__), 'world_scheduler.db')

# ── SQLite helpers ─────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def query_all(sql, params=()):
    conn = get_db()
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def query_one(sql, params=()):
    conn = get_db()
    row = conn.execute(sql, params).fetchone()
    conn.close()
    return dict(row) if row else None

# ── Route handlers ─────────────────────────────────────────────

def handle_measurements(params):
    """GET /api/measurements?entity_id=X&metric=Y&time=Z"""
    sql = 'SELECT * FROM measurement WHERE 1=1'
    args = []
    for field in ['entity_id', 'metric', 'time_period']:
        if field in params:
            sql += f' AND {field} = ?'
            args.append(params[field][0])
    sql += ' ORDER BY entity_id, metric, time_period LIMIT 500'
    return query_all(sql, args)

def handle_entities(params):
    """GET /api/entities?type=region"""
    if 'type' in params:
        return query_all('SELECT * FROM entity WHERE type = ?', (params['type'][0],))
    return query_all('SELECT * FROM entity ORDER BY type, label')

def handle_transform(params):
    """GET /api/transform/:name — run a named transformation view."""
    views = {
        'per_capita':           'v_per_capita',
        'total_demand':         'v_total_demand',
        'shortfall':            'v_shortfall',
        'labor_required':       'v_labor_required',
        'cost':                 'v_cost',
        'rank':                 'v_rank',
        'trend':                'v_trend',
        'compare':              'v_compare',
        'aggregate':            'v_aggregate',
        'confidence_weighted':  'v_confidence_weighted',
        'normalize':            'v_normalize',
    }
    return query_all(f'SELECT * FROM {views[params["name"]]} LIMIT 500')

def handle_transforms_list():
    """GET /api/transforms — list all available transformations."""
    return query_all('SELECT * FROM v_transforms')

def handle_metrics():
    """GET /api/metrics — list all available metrics."""
    return query_all('SELECT * FROM v_metrics')

def handle_world_summary():
    """GET /api/world-summary — key world-level metrics."""
    return {
        'population': query_one(
            "SELECT value, time_period, confidence FROM measurement "
            "WHERE entity_id='planet:earth' AND metric='population' AND time_period='modern'"
        ),
        'shortfalls': query_all('SELECT * FROM v_shortfall WHERE entity_id = \'planet:earth\''),
        'labor': query_all('SELECT * FROM v_labor_required WHERE entity_id = \'planet:earth\''),
        'cost': query_all('SELECT * FROM v_cost WHERE entity_id = \'planet:earth\''),
    }

def handle_region_summary(region_key):
    """GET /api/region/:key — full region data."""
    entity_id = f'region:{region_key}'
    return {
        'entity': query_one('SELECT * FROM entity WHERE id = ?', (entity_id,)),
        'supply': query_all(
            "SELECT * FROM measurement WHERE entity_id = ? AND metric LIKE '%_supply'", (entity_id,)
        ),
        'per_capita': query_all(
            "SELECT * FROM measurement WHERE entity_id = ? AND metric LIKE '%_per_capita'", (entity_id,)
        ),
        'shortfalls': query_all('SELECT * FROM v_shortfall WHERE entity_id = ?', (entity_id,)),
        'labor': query_all('SELECT * FROM v_labor_required WHERE entity_id = ?', (entity_id,)),
    }

def handle_compare(params):
    """GET /api/compare?a=X&b=Y — compare two entities."""
    a, b = params.get('a', [None])[0], params.get('b', [None])[0]
    if not a or not b:
        return {'error': 'Need ?a=entity_id&b=entity_id'}
    return query_all(
        'SELECT * FROM v_compare WHERE entity_a = ? AND entity_b = ?', (a, b)
    )

def handle_rank(params):
    """GET /api/rank?metric=X — rank entities by metric."""
    metric = params.get('metric', ['population'])[0]
    return query_all(
        "SELECT * FROM v_rank WHERE metric = ? ORDER BY rank_asc LIMIT 20", (metric,)
    )

def handle_trend(params):
    """GET /api/trend?entity_id=X&metric=Y — time trend for a metric."""
    entity = params.get('entity_id', ['planet:earth'])[0]
    metric = params.get('metric', ['population'])[0]
    return query_all(
        'SELECT * FROM v_trend WHERE entity_id = ? AND metric = ?', (entity, metric)
    )

# ── HTTP Server ────────────────────────────────────────────────

class APIHandler(BaseHTTPRequestHandler):

    def log_message(self, format, *args):
        print(f"[api] {args[0]}")  # quieter logging

    def _send(self, data, status=200):
        body = json.dumps(data, indent=2, default=str).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', len(body))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')
        params = parse_qs(parsed.query)

        try:
            # Route: /api/measurements
            if path == '/api/measurements':
                return self._send(handle_measurements(params))

            # Route: /api/entities
            if path == '/api/entities':
                return self._send(handle_entities(params))

            # Route: /api/transforms
            if path == '/api/transforms':
                return self._send(handle_transforms_list())

            # Route: /api/metrics
            if path == '/api/metrics':
                return self._send(handle_metrics())

            # Route: /api/world-summary
            if path == '/api/world-summary':
                return self._send(handle_world_summary())

            # Route: /api/transform/{name}
            if path.startswith('/api/transform/'):
                name = path.split('/')[-1]
                return self._send(handle_transform({'name': name}))

            # Route: /api/region/{key}
            if path.startswith('/api/region/'):
                region_key = path.split('/')[-1]
                return self._send(handle_region_summary(region_key))

            # Route: /api/compare?a=X&b=Y
            if path == '/api/compare':
                return self._send(handle_compare(params))

            # Route: /api/rank?metric=X
            if path == '/api/rank':
                return self._send(handle_rank(params))

            # Route: /api/trend?entity_id=X&metric=Y
            if path == '/api/trend':
                return self._send(handle_trend(params))

            # Route: /api/labour-techniques — full industry×technique comparison
            if path == '/api/labour-techniques':
                return self._send(query_all('SELECT * FROM v_labour_technique_compare'))

            # Route: /api/derivable — list all derivable metrics
            if path == '/api/derivable':
                return self._send(query_all('SELECT * FROM v_derivable_metrics'))

            # Route: /api/derived — get derived measurements
            if path == '/api/derived':
                entity = params.get('entity_id', [None])[0]
                if entity:
                    return self._send(query_all(
                        "SELECT * FROM measurement WHERE source='derived_by_reasoner' AND entity_id=? ORDER BY metric, time_period", (entity,)))
                return self._send(query_all(
                    "SELECT * FROM measurement WHERE source='derived_by_reasoner' ORDER BY entity_id, metric, time_period"))

            # 404
            return self._send({'error': f'Unknown endpoint: {path}', 'try': [
                'GET /api/measurements?entity_id=X&metric=Y',
                'GET /api/entities?type=region',
                'GET /api/transforms',
                'GET /api/transform/{name}',
                'GET /api/metrics',
                'GET /api/world-summary',
                'GET /api/region/{key}',
                'GET /api/compare?a=X&b=Y',
                'GET /api/rank?metric=X',
                'GET /api/trend?entity_id=X&metric=Y',
                'GET /api/labour-techniques',
                'GET /api/derivable',
                'GET /api/derived?entity_id=X',
            ]}, 404)

        except Exception as e:
            self._send({'error': str(e)}, 500)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()


def main():
    port = 8001
    if len(sys.argv) > 2 and sys.argv[1] == '--port':
        port = int(sys.argv[2])

    server = HTTPServer(('127.0.0.1', port), APIHandler)
    print(f"World Scheduler API → http://127.0.0.1:{port}")
    print(f"Try: http://127.0.0.1:{port}/api/world-summary")
    print(f"Try: http://127.0.0.1:{port}/api/transforms")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        server.server_close()


if __name__ == '__main__':
    main()
