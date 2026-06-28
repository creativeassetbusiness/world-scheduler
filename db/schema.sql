-- World Scheduler — Simplest Universal Data Model
-- Everything is a measurement: (entity, metric, value, unit, time, confidence, source)
-- From this one table, ALL calculations are derived via views.

-- ── CORE TABLES ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS entity (
    id          TEXT PRIMARY KEY,          -- e.g. 'region:northAmerica', 'country:EE', 'planet:earth'
    type        TEXT NOT NULL,             -- 'planet', 'region', 'country', 'scenario', 'profile'
    label       TEXT NOT NULL,             -- 'North America', 'Estonia'
    parent_id   TEXT REFERENCES entity(id),
    attrs       TEXT DEFAULT '{}'          -- JSON blob for flexible metadata
);

CREATE TABLE IF NOT EXISTS measurement (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id     TEXT NOT NULL REFERENCES entity(id),
    metric        TEXT NOT NULL,            -- e.g. 'population', 'calories_per_capita', 'water_supply'
    value         REAL NOT NULL,
    unit          TEXT NOT NULL,            -- 'people', 'calories', 'liters', 'sqm', 'kWh', 'hours', 'usd', 'ratio'
    time_period   TEXT NOT NULL DEFAULT 'modern',  -- 'past', 'modern', 'future', '2025', '2025-Q1'
    confidence    REAL NOT NULL DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
    source        TEXT,                     -- provenance: 'UN_FAO_2024', 'user_input', 'derived'
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for fast lookups by entity + metric + time
CREATE INDEX IF NOT EXISTS idx_measurement_lookup
    ON measurement(entity_id, metric, time_period);

-- ── INDUSTRIES & LABOUR TECHNIQUES ────────────────────────────

CREATE TABLE IF NOT EXISTS industry (
    id          TEXT PRIMARY KEY,          -- 'agriculture', 'construction', 'energy'
    label       TEXT NOT NULL,             -- 'Agriculture & Food'
    category    TEXT NOT NULL,             -- 'primary', 'secondary', 'tertiary', 'infrastructure'
    icon        TEXT DEFAULT '🏭',
    output_unit TEXT NOT NULL,             -- 'calories', 'sqm', 'kWh', 'tons', 'units', 'km', 'gb'
    base_demand_per_capita REAL,          -- annual per-person demand in output units
    sort_order  INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS labour_technique (
    id              TEXT PRIMARY KEY,       -- 'manual', 'assisted', 'mechanized', 'automated', 'autonomous'
    label           TEXT NOT NULL,          -- 'Manual (human only)'
    efficiency_factor REAL NOT NULL,       -- multiplier: 1.0 = baseline manual, lower = more efficient
    automation_level  REAL NOT NULL,       -- 0.0 to 1.0 fraction of work done by machines
    capital_cost_mult  REAL DEFAULT 1.0,   -- relative upfront investment
    description     TEXT
);

CREATE TABLE IF NOT EXISTS industry_technique (
    industry_id     TEXT NOT NULL REFERENCES industry(id),
    technique_id    TEXT NOT NULL REFERENCES labour_technique(id),
    hours_per_unit  REAL NOT NULL,         -- labour hours needed per output unit
    workers_per_unit REAL,                 -- human workers needed per output unit
    energy_per_unit REAL,                  -- kWh per output unit
    co2_per_unit    REAL,                  -- tons CO2 per output unit
    quality_index   REAL DEFAULT 1.0,     -- output quality multiplier
    PRIMARY KEY (industry_id, technique_id)
);

-- View: compare labour techniques across industries
CREATE VIEW IF NOT EXISTS v_labour_technique_compare AS
SELECT
    i.id AS industry_id,
    i.label AS industry,
    i.output_unit,
    i.base_demand_per_capita,
    t.id AS technique_id,
    t.label AS technique,
    t.efficiency_factor,
    t.automation_level,
    it.hours_per_unit,
    it.workers_per_unit,
    it.energy_per_unit,
    it.quality_index,
    -- Efficiency relative to manual baseline
    ROUND(it.hours_per_unit / NULLIF(
        (SELECT hours_per_unit FROM industry_technique WHERE industry_id = i.id AND technique_id = 'manual'), 0
    ), 2) AS relative_efficiency,
    -- Total labor for world population
    ROUND(it.hours_per_unit * i.base_demand_per_capita * 8e9, 0) AS world_labor_hours
FROM industry i
JOIN industry_technique it ON it.industry_id = i.id
JOIN labour_technique t ON t.id = it.technique_id
ORDER BY i.sort_order, t.automation_level;

-- ── UNIT CONVERSIONS ─────────────────────────────────────────
-- All values stored in base units. This table defines conversion factors.

CREATE TABLE IF NOT EXISTS unit_conversion (
    unit        TEXT PRIMARY KEY,           -- 'calories', 'liters', 'sqm', 'kWh', 'units', 'tons', 'hours', 'usd', 'people'
    base_unit   TEXT,                       -- SI base if applicable
    to_base     REAL DEFAULT 1.0,           -- multiply to get base
    category    TEXT NOT NULL,              -- 'resource', 'labor', 'currency', 'count'
    description TEXT
);

INSERT OR IGNORE INTO unit_conversion (unit, category, description) VALUES
    ('people',   'count',    'Human population count'),
    ('calories', 'resource', 'Food energy — kilocalories'),
    ('liters',   'resource', 'Fresh water volume'),
    ('sqm',      'resource', 'Housing floor area — square meters'),
    ('kWh',      'resource', 'Electrical energy — kilowatt-hours'),
    ('units',    'resource', 'Medicine — standard dosage units'),
    ('tons',     'resource', 'Raw materials — metric tons'),
    ('hours',    'labor',    'Human or machine labor hours'),
    ('usd',      'currency', 'United States dollars'),
    ('ratio',    'count',    'Dimensionless ratio 0-1');

-- ── TRANSFORMATION VIEWS ─────────────────────────────────────
-- Every possible data transformation as a named, queryable view.

-- 1. PER CAPITA: divide any metric by population of the same entity+time
CREATE VIEW IF NOT EXISTS v_per_capita AS
SELECT
    m.entity_id,
    m.metric,
    m.time_period,
    m.value / NULLIF(p.value, 0) AS per_capita_value,
    m.unit || '_per_capita' AS unit,
    MIN(m.confidence, p.confidence) AS confidence
FROM measurement m
JOIN measurement p
    ON  p.entity_id = m.entity_id
    AND p.metric    = 'population'
    AND p.time_period = m.time_period
WHERE m.metric != 'population';

-- 2. TOTAL DEMAND: population × per_capita_need × safety_margin
CREATE VIEW IF NOT EXISTS v_total_demand AS
SELECT
    n.entity_id,
    REPLACE(n.metric, '_per_capita', '') AS resource,
    n.time_period,
    (p.value * n.value * COALESCE(s.value, 1.0)) AS total_demand,
    REPLACE(n.unit, '_per_capita', '') AS unit,
    MIN(n.confidence, p.confidence, COALESCE(s.confidence, 1.0)) AS confidence
FROM measurement n   -- per_capita need
JOIN measurement p   -- population
    ON  p.entity_id = n.entity_id
    AND p.metric    = 'population'
    AND p.time_period = n.time_period
LEFT JOIN measurement s  -- safety_margin (optional, defaults to 1.0)
    ON  s.entity_id = n.entity_id
    AND s.metric    = 'safety_margin'
    AND s.time_period = n.time_period
WHERE n.metric LIKE '%_per_capita';

-- 3. SHORTFALL: supply - demand
CREATE VIEW IF NOT EXISTS v_shortfall AS
SELECT
    d.entity_id,
    d.resource,
    d.time_period,
    d.total_demand,
    COALESCE(s.value, 0) AS supply,
    COALESCE(s.value, 0) - d.total_demand AS shortfall,
    d.unit,
    CASE WHEN COALESCE(s.value, 0) >= d.total_demand THEN 'surplus' ELSE 'deficit' END AS status,
    MIN(d.confidence, COALESCE(s.confidence, 0.5)) AS confidence
FROM v_total_demand d
LEFT JOIN measurement s
    ON  s.entity_id = d.entity_id
    AND s.metric    = d.resource || '_supply'
    AND s.time_period = d.time_period;

-- 4. LABOR REQUIRED: demand × labor_factor
CREATE VIEW IF NOT EXISTS v_labor_required AS
SELECT
    d.entity_id,
    d.resource,
    d.time_period,
    d.total_demand,
    d.total_demand * COALESCE(l.value, 0) AS total_labor_hours,
    COALESCE(r.value, 0) AS robot_rate,
    d.total_demand * COALESCE(l.value, 0) * (1.0 - COALESCE(r.value, 0)) AS human_labor_hours,
    d.total_demand * COALESCE(l.value, 0) * COALESCE(r.value, 0) AS robot_labor_hours,
    MIN(d.confidence, COALESCE(l.confidence, 0.8), COALESCE(r.confidence, 0.8)) AS confidence
FROM v_total_demand d
LEFT JOIN measurement l
    ON  l.entity_id = 'planet:earth'
    AND l.metric    = d.resource || '_labor_factor'
    AND l.time_period = d.time_period
LEFT JOIN measurement r
    ON  r.entity_id = d.entity_id
    AND r.metric    = 'robotization_rate'
    AND r.time_period = d.time_period;

-- 5. COST: demand × cost_factor
CREATE VIEW IF NOT EXISTS v_cost AS
SELECT
    d.entity_id,
    d.resource,
    d.time_period,
    d.total_demand,
    d.total_demand * COALESCE(c.value, 0) AS total_cost_usd,
    MIN(d.confidence, COALESCE(c.confidence, 0.8)) AS confidence
FROM v_total_demand d
LEFT JOIN measurement c
    ON  c.entity_id = 'planet:earth'
    AND c.metric    = d.resource || '_cost_factor'
    AND c.time_period = d.time_period;

-- 6. RANK: order entities by any metric
CREATE VIEW IF NOT EXISTS v_rank AS
SELECT
    entity_id,
    metric,
    time_period,
    value,
    RANK() OVER (PARTITION BY metric, time_period ORDER BY value DESC) AS rank_desc,
    RANK() OVER (PARTITION BY metric, time_period ORDER BY value ASC)  AS rank_asc,
    confidence
FROM measurement;

-- 7. TREND: time-series change for any entity+metric
CREATE VIEW IF NOT EXISTS v_trend AS
SELECT
    m1.entity_id,
    m1.metric,
    m1.time_period AS from_period,
    m2.time_period AS to_period,
    m1.value AS from_value,
    m2.value AS to_value,
    m2.value - m1.value AS absolute_change,
    CASE WHEN m1.value != 0
        THEN (m2.value - m1.value) / ABS(m1.value)
        ELSE NULL
    END AS relative_change,
    MIN(m1.confidence, m2.confidence) AS confidence
FROM measurement m1
JOIN measurement m2
    ON  m2.entity_id = m1.entity_id
    AND m2.metric    = m1.metric
    AND m2.time_period > m1.time_period;

-- 8. COMPARE: diff between two entities for the same metric+time
CREATE VIEW IF NOT EXISTS v_compare AS
SELECT
    m1.entity_id AS entity_a,
    m2.entity_id AS entity_b,
    m1.metric,
    m1.time_period,
    m1.value AS value_a,
    m2.value AS value_b,
    m2.value - m1.value AS diff,
    CASE WHEN m1.value != 0
        THEN (m2.value - m1.value) / ABS(m1.value)
        ELSE NULL
    END AS diff_ratio,
    MIN(m1.confidence, m2.confidence) AS confidence
FROM measurement m1
JOIN measurement m2
    ON  m2.metric      = m1.metric
    AND m2.time_period  = m1.time_period
    AND m2.entity_id   != m1.entity_id
    AND m2.entity_id    > m1.entity_id;  -- avoid duplicate pairs

-- 9. AGGREGATE: roll up by entity hierarchy
CREATE VIEW IF NOT EXISTS v_aggregate AS
SELECT
    COALESCE(e.parent_id, m.entity_id) AS parent_entity,
    m.metric,
    m.time_period,
    SUM(m.value) AS total_value,
    m.unit,
    AVG(m.confidence) AS avg_confidence,
    COUNT(*) AS source_count
FROM measurement m
JOIN entity e ON e.id = m.entity_id
GROUP BY parent_entity, m.metric, m.time_period, m.unit;

-- 10. CONFIDENCE-WEIGHTED: value adjusted by confidence
CREATE VIEW IF NOT EXISTS v_confidence_weighted AS
SELECT
    entity_id,
    metric,
    time_period,
    value,
    confidence,
    value * confidence AS weighted_value,
    value * (1.0 - confidence) AS uncertainty_band,
    unit
FROM measurement;

-- 11. NORMALIZE: z-score within a metric+time group
CREATE VIEW IF NOT EXISTS v_normalize AS
SELECT
    entity_id,
    metric,
    time_period,
    value,
    (value - AVG(value) OVER w) / NULLIF(
        (SUM(value * value) OVER w / COUNT(*) OVER w -
         (AVG(value) OVER w * AVG(value) OVER w)),
        0
    ) AS z_score,
    (value - MIN(value) OVER w) / NULLIF(
        MAX(value) OVER w - MIN(value) OVER w, 0
    ) AS minmax_norm,
    unit,
    confidence
FROM measurement
WINDOW w AS (PARTITION BY metric, time_period);

-- 12. SCENARIO SNAPSHOT: all measurements frozen at scenario creation time
CREATE TABLE IF NOT EXISTS scenario_snapshot (
    scenario_id   TEXT NOT NULL,
    entity_id     TEXT NOT NULL,
    metric        TEXT NOT NULL,
    value         REAL NOT NULL,
    unit          TEXT NOT NULL,
    time_period   TEXT NOT NULL,
    confidence    REAL NOT NULL DEFAULT 1.0,
    frozen_at     TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (scenario_id, entity_id, metric, time_period)
);

-- ── HELPER: list all available metrics ────────────────────────
CREATE VIEW IF NOT EXISTS v_metrics AS
SELECT DISTINCT metric, unit, COUNT(*) AS data_points
FROM measurement
GROUP BY metric, unit
ORDER BY metric;

-- ── HELPER: list all available transformations ────────────────
CREATE VIEW IF NOT EXISTS v_transforms AS
SELECT
    'per_capita'          AS transform, 'Divide any metric by population' AS description
UNION ALL SELECT 'total_demand',    'Population × per_capita × safety_margin'
UNION ALL SELECT 'shortfall',       'Supply minus demand — surplus or deficit'
UNION ALL SELECT 'labor_required',  'Demand × labor_factor, split human/robot'
UNION ALL SELECT 'cost',            'Demand × cost_factor in USD'
UNION ALL SELECT 'rank',            'Order entities by any metric'
UNION ALL SELECT 'trend',           'Time-series change (absolute + relative)'
UNION ALL SELECT 'compare',         'Diff between two entities'
UNION ALL SELECT 'aggregate',       'Roll up by entity hierarchy'
UNION ALL SELECT 'confidence_weighted', 'Value adjusted by confidence score'
UNION ALL SELECT 'normalize',       'Z-score and min-max within group';

-- ═══════════════════════════════════════════════════════════════
-- DERIVATION RULES ENGINE — derive any metric through reasoning
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS derivation_rule (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    target_metric   TEXT NOT NULL UNIQUE,
    target_unit     TEXT NOT NULL,
    depends_on      TEXT NOT NULL,
    depth           INTEGER DEFAULT 1,
    category        TEXT DEFAULT 'derived',
    description     TEXT
);

CREATE VIEW IF NOT EXISTS v_derivable_metrics AS
SELECT target_metric, target_unit, depends_on, depth, category, description
FROM derivation_rule ORDER BY depth, category, target_metric;
