#!/usr/bin/env python3
"""
Seed the World Scheduler database with all data currently hardcoded in script.js.
Run: python3 db/seed.py
"""

import sqlite3
import os
import json

DB_PATH = os.path.join(os.path.dirname(__file__), 'world_scheduler.db')
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), 'schema.sql')


def init_db():
    """Create database from schema."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    with open(SCHEMA_PATH) as f:
        conn.executescript(f.read())
    return conn


def seed_entities(conn):
    """Insert the entity hierarchy: planet → region → country."""
    entities = [
        ('planet:earth', 'planet', 'Planet Earth', None, '{}'),

        # Regions
        ('region:northAmerica', 'region', 'North America', 'planet:earth',
         '{"color":"#38bdf8","position":[1.3,1.0,0.35]}'),
        ('region:southAmerica', 'region', 'South America', 'planet:earth',
         '{"color":"#22c55e","position":[0.7,-1.1,0.2]}'),
        ('region:europe',      'region', 'Europe',        'planet:earth',
         '{"color":"#f59e0b","position":[1.6,0.95,0.3]}'),
        ('region:africa',      'region', 'Africa',        'planet:earth',
         '{"color":"#f43f5e","position":[1.3,-0.15,-0.2]}'),
        ('region:asia',        'region', 'Asia',          'planet:earth',
         '{"color":"#a78bfa","position":[2.0,0.55,0.1]}'),
        ('region:oceania',     'region', 'Oceania',       'planet:earth',
         '{"color":"#2dd4bf","position":[1.95,-1.25,-0.25]}'),

        # Countries (for country monitor)
        ('country:EE', 'country', 'Estonia',    None, '{"iso":"EE"}'),
        ('country:DK', 'country', 'Denmark',    None, '{"iso":"DK"}'),
        ('country:NZ', 'country', 'New Zealand', None, '{"iso":"NZ"}'),
        ('country:CA', 'country', 'Canada',     None, '{"iso":"CA"}'),
        ('country:JP', 'country', 'Japan',      None, '{"iso":"JP"}'),
    ]
    conn.executemany(
        'INSERT OR REPLACE INTO entity (id, type, label, parent_id, attrs) VALUES (?,?,?,?,?)',
        entities
    )


def seed_measurements(conn):
    """Insert all hardcoded data points as measurements."""
    m = []  # (entity_id, metric, value, unit, time_period, confidence, source)

    # ── ERA PRESETS: per-capita needs ──────────────────────────
    era_presets = {
        'past':    {'calories': 50000, 'water': 2000, 'housing': 12, 'energy': 200, 'medicine': 0.5, 'materials': 0.1},
        'modern':  {'calories': 75000, 'water': 3000, 'housing': 20, 'energy': 300, 'medicine': 1.0, 'materials': 0.15},
        'future':  {'calories': 90000, 'water': 4000, 'housing': 28, 'energy': 450, 'medicine': 1.5, 'materials': 0.22},
    }
    resource_units = {
        'calories': 'calories', 'water': 'liters', 'housing': 'sqm',
        'energy': 'kWh', 'medicine': 'units', 'materials': 'tons'
    }
    for era, needs in era_presets.items():
        for resource, value in needs.items():
            m.append(('planet:earth', f'{resource}_per_capita', value,
                      resource_units[resource], era, 0.85, 'era_preset'))

    # ── DEFAULT POPULATION ─────────────────────────────────────
    for era in ['past', 'modern', 'future']:
        m.append(('planet:earth', 'population', 8_000_000_000, 'people', era, 0.9, 'UN_estimate'))

    # ── DEFAULT SAFETY MARGIN ──────────────────────────────────
    for era in ['past', 'modern', 'future']:
        m.append(('planet:earth', 'safety_margin', 1.15, 'ratio', era, 0.85, 'default'))

    # ── DEFAULT ROBOTIZATION ───────────────────────────────────
    for era in ['past', 'modern', 'future']:
        rate = {'past': 0.15, 'modern': 0.45, 'future': 0.75}[era]
        m.append(('planet:earth', 'robotization_rate', rate, 'ratio', era, 0.8, 'default'))

    # ── LABOR FACTORS (hours per unit of demand) ───────────────
    labor_factors = {
        'calories': 0.000002, 'water': 0.0000009, 'housing': 0.0000045,
        'energy': 0.0000021, 'medicine': 0.0000018, 'materials': 0.0000015,
    }
    for resource, factor in labor_factors.items():
        for era in ['past', 'modern', 'future']:
            m.append(('planet:earth', f'{resource}_labor_factor', factor,
                      'hours', era, 0.75, 'labor_model_v1'))

    # ── COST FACTORS (USD per unit of demand) ──────────────────
    cost_factors = {
        'calories': 0.000000002, 'water': 0.00000012, 'housing': 0.00000045,
        'energy': 0.00000018, 'medicine': 0.00000075, 'materials': 0.00000022,
    }
    for resource, factor in cost_factors.items():
        for era in ['past', 'modern', 'future']:
            m.append(('planet:earth', f'{resource}_cost_factor', factor,
                      'usd', era, 0.7, 'cost_model_v1'))

    # ── REGION SUPPLY DATA ─────────────────────────────────────
    region_supply = {
        'northAmerica': {'calories': 142e9, 'water': 2.3e9, 'housing': 24e6, 'energy': 410e9},
        'southAmerica': {'calories': 68e9,  'water': 1.1e9, 'housing': 13e6, 'energy': 190e9},
        'europe':       {'calories': 95e9,  'water': 1.8e9, 'housing': 18e6, 'energy': 285e9},
        'africa':       {'calories': 54e9,  'water': 1.4e9, 'housing': 12e6, 'energy': 135e9},
        'asia':         {'calories': 188e9, 'water': 3.6e9, 'housing': 38e6, 'energy': 620e9},
        'oceania':      {'calories': 24e9,  'water': 0.58e9,'housing': 5e6,  'energy': 92e9},
    }
    for region_key, supply in region_supply.items():
        entity = f'region:{region_key}'
        for resource, value in supply.items():
            m.append((entity, f'{resource}_supply', value,
                      resource_units[resource], 'modern', 0.8, 'regional_estimate'))

    # ── REGION POPULATIONS ─────────────────────────────────────
    region_pop = {
        'northAmerica': 600_000_000, 'southAmerica': 440_000_000,
        'europe': 750_000_000, 'africa': 1_400_000_000,
        'asia': 4_700_000_000, 'oceania': 45_000_000,
    }
    for region_key, pop in region_pop.items():
        m.append((f'region:{region_key}', 'population', pop, 'people', 'modern', 0.85, 'UN_regional'))

    # ── COUNTRY DATA QUALITY ───────────────────────────────────
    country_baseline = [
        ('EE', 0.91, 0.94, 0.88, 0.90, 0.95),
        ('DK', 0.90, 0.89, 0.87, 0.91, 0.88),
        ('NZ', 0.86, 0.90, 0.84, 0.89, 0.86),
        ('CA', 0.82, 0.84, 0.85, 0.83, 0.81),
        ('JP', 0.80, 0.86, 0.76, 0.88, 0.78),
    ]
    for iso, cov, rec, div, con, mach in country_baseline:
        entity = f'country:{iso}'
        for metric_name, val in [('coverage', cov), ('recency', rec),
                                  ('source_diversity', div), ('consistency', con),
                                  ('machine_readability', mach)]:
            m.append((entity, f'data_{metric_name}', val, 'ratio', 'modern', val, 'public_baseline'))

    # ── REGION PER-CAPITA NEEDS (inherit from planet, with regional variance) ──
    region_variance = {
        'northAmerica': 1.08, 'southAmerica': 0.92, 'europe': 1.02,
        'africa': 0.78, 'asia': 0.95, 'oceania': 1.05,
    }
    for era, needs in era_presets.items():
        for resource, base_value in needs.items():
            for region_key, variance in region_variance.items():
                adjusted = base_value * variance
                m.append((f'region:{region_key}', f'{resource}_per_capita', round(adjusted, 1),
                          resource_units[resource], era, 0.8, 'regional_adjusted'))

    # ── REGION-SPECIFIC ROBOTIZATION ───────────────────────────
    region_robot = {
        'northAmerica': 0.55, 'southAmerica': 0.42, 'europe': 0.50,
        'africa': 0.30, 'asia': 0.48, 'oceania': 0.45,
    }
    for region_key, rate in region_robot.items():
        m.append((f'region:{region_key}', 'robotization_rate', rate, 'ratio', 'modern', 0.8, 'regional_estimate'))

    # ── INSERT ALL ─────────────────────────────────────────────
    conn.executemany(
        '''INSERT OR REPLACE INTO measurement
           (entity_id, metric, value, unit, time_period, confidence, source)
           VALUES (?,?,?,?,?,?,?)''',
        m
    )
    print(f"Seeded {len(m)} measurements.")


def seed_scenarios(conn):
    """Insert a default baseline scenario snapshot."""
    # Pull all 'modern' era measurements and freeze them as a scenario
    conn.execute('''
        INSERT OR IGNORE INTO scenario_snapshot
            (scenario_id, entity_id, metric, value, unit, time_period, confidence)
        SELECT 'scenario:baseline', entity_id, metric, value, unit, time_period, confidence
        FROM measurement
        WHERE time_period = 'modern'
    ''')
    rows = conn.total_changes
    if rows:
        print(f"Seeded baseline scenario with {rows} frozen measurements.")


def main():
    conn = init_db()
    seed_entities(conn)
    seed_measurements(conn)
    seed_scenarios(conn)
    conn.commit()

    # Print summary
    counts = conn.execute('''
        SELECT 'entities' AS tbl, COUNT(*) FROM entity
        UNION ALL SELECT 'measurements', COUNT(*) FROM measurement
        UNION ALL SELECT 'scenario_snapshots', COUNT(*) FROM scenario_snapshot
        UNION ALL SELECT 'metrics', COUNT(*) FROM v_metrics
        UNION ALL SELECT 'transforms', COUNT(*) FROM v_transforms
    ''').fetchall()
    print("\n── Database Summary ──")
    for name, count in counts:
        print(f"  {name}: {count}")
    print(f"\nDatabase: {DB_PATH}")
    conn.close()


if __name__ == '__main__':
    main()
