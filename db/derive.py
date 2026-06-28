#!/usr/bin/env python3
"""
World Scheduler — Derivation Engine
Derives new metrics from existing ones through pure logic chains.
Each rule specifies: target metric, dependencies, and computation.
"""

import sqlite3
import os
import math

DB_PATH = os.path.join(os.path.dirname(__file__), 'world_scheduler.db')

# ── Derivation functions ───────────────────────────────────────

def compute_derived(conn, rule, measurements):
    """Compute a derived metric from existing measurements. Returns (value, confidence) or None."""
    metric = rule['target_metric']
    deps = [d.strip() for d in rule['depends_on'].split(',')]
    cat = rule['category']
    
    # Get dependency values for each entity+time combo
    dep_values = {}
    for dep in deps:
        rows = conn.execute(
            'SELECT entity_id, time_period, value, confidence FROM measurement WHERE metric = ?',
            (dep,)
        ).fetchall()
        dep_values[dep] = {(r[0], r[1]): (r[2], r[3]) for r in rows}
    
    results = []
    
    # Find common entity+time combos across all deps
    if not dep_values:
        return []
    
    common_keys = set.intersection(*[set(dv.keys()) for dv in dep_values.values()]) if dep_values else set()
    
    for (entity, time_period) in common_keys:
        vals = {}
        confs = []
        for dep in deps:
            v, c = dep_values[dep].get((entity, time_period), (None, None))
            if v is None:
                break
            vals[dep] = v
            confs.append(c)
        else:
            # All deps found — compute
            value = None
            confidence = min(confs) * 0.95  # derivation reduces confidence slightly
            
            # ── Ratio category ──
            if cat == 'ratio':
                if metric.endswith('_per_capita_supply'):
                    r = metric.replace('_per_capita_supply', '')
                    supply = vals.get(f'{r}_supply')
                    pop = vals.get('population')
                    if supply and pop and pop > 0:
                        value = supply / pop
                
                elif metric.endswith('_surplus_ratio'):
                    r = metric.replace('_surplus_ratio', '')
                    supply = vals.get(f'{r}_supply', 0)
                    per_cap = vals.get(f'{r}_per_capita', 0)
                    pop = vals.get('population', 0)
                    safety = vals.get('safety_margin', 1.0)
                    demand = pop * per_cap * safety
                    value = supply / demand if demand > 0 else 0
                
                elif metric == 'robot_human_ratio':
                    rr = vals.get('robotization_rate', 0)
                    value = rr / (1 - rr) if rr < 1 else float('inf')
                
                elif metric.endswith('_cost_per_capita'):
                    r = metric.replace('_cost_per_capita', '')
                    cost_f = vals.get(f'{r}_cost_factor', 0)
                    per_cap = vals.get(f'{r}_per_capita', 0)
                    pop = vals.get('population', 0)
                    safety = vals.get('safety_margin', 1.0)
                    demand = pop * per_cap * safety
                    value = demand * cost_f / pop if pop > 0 else 0
                
                elif metric.endswith('_labor_productivity'):
                    r = metric.replace('_labor_productivity', '')
                    labor_f = vals.get(f'{r}_labor_factor', 0)
                    per_cap = vals.get(f'{r}_per_capita', 0)
                    value = 1.0 / labor_f if labor_f > 0 else 0
                
                elif metric == 'labor_per_capita':
                    total_labor = 0
                    for r in ['calories','water','housing','energy','medicine','materials']:
                        lf = vals.get(f'{r}_labor_factor', 0)
                        pc = vals.get(f'{r}_per_capita', 0)
                        safety = vals.get('safety_margin', 1.0)
                        total_labor += pc * lf * safety
                    pop = vals.get('population', 0)
                    value = total_labor * pop / pop if pop > 0 else 0  # total labor / population = labor per capita... but we want per person
                    value = total_labor  # actual total hours per person
                
                elif metric == 'resource_intensity_gap':
                    mats = vals.get('materials_per_capita', 0)
                    cals = vals.get('calories_per_capita', 0)
                    wtr = vals.get('water_per_capita', 0)
                    nrg = vals.get('energy_per_capita', 0)
                    basics = (cals * 0.000001 + wtr * 0.0001 + nrg * 0.001) or 1
                    value = mats / basics if basics > 0 else 1
            
            # ── Index category (0-100 scale) ──
            elif cat == 'index':
                if metric == 'resource_diversity_index':
                    supplies = [vals.get(f'{r}_supply', 0) for r in ['calories','water','housing','energy','medicine','materials']]
                    total = sum(supplies) or 1
                    # Herfindahl inverted: higher = more diverse
                    hhi = sum((s/total)**2 for s in supplies)
                    value = (1 - hhi) * 100  # 0=monopoly, 100=perfectly diverse
                
                elif metric.endswith('_security_index'):
                    r = metric.replace('_security_index', '')
                    surplus_r = vals.get(f'{r}_surplus_ratio', 0)
                    supply = vals.get(f'{r}_supply', 0)
                    # Normalize to 0-100
                    value = min(100, max(0, (surplus_r - 0.5) * 200)) if surplus_r else 50
                
                elif metric == 'overall_resource_security':
                    secs = [vals.get(f'{r}_security_index', 50) for r in ['food','water','energy','housing']]
                    value = sum(secs) / len(secs)
                
                elif metric == 'automation_potential_index':
                    rr = vals.get('robotization_rate', 0)
                    rhr = vals.get('robot_human_ratio', 0)
                    value = min(100, (rr * 70 + min(rhr, 10) * 3))
                
                elif metric == 'sustainability_proxy':
                    rig = vals.get('resource_intensity_gap', 1)
                    esi = vals.get('energy_security_index', 50)
                    mpc = vals.get('materials_per_capita', 0.15)
                    value = max(0, 100 - (rig * 30) - ((1 - esi/100) * 40) - (mpc * 50))
                
                elif metric == 'human_development_proxy':
                    fs = vals.get('food_security_index', 50)
                    hs = vals.get('housing_security_index', 50)
                    mp = vals.get('medicine_per_capita', 0.5)
                    wp = vals.get('water_per_capita', 1500)
                    value = (fs * 0.35 + hs * 0.25 + min(100, mp * 60) * 0.2 + min(100, wp/3000*100) * 0.2)
                
                elif metric == 'growth_capacity_index':
                    surpluses = [vals.get(f'{r}_surplus_ratio', 0) for r in ['calories','water','energy','housing']]
                    # Growth is limited by the tightest resource
                    min_surplus = min(surpluses) if surpluses else 0
                    value = max(0, (min_surplus - 0.8) * 500)
                
                elif metric == 'work_burden_index':
                    lpc = vals.get('labor_per_capita', 100)
                    rr = vals.get('robotization_rate', 0)
                    api = vals.get('automation_potential_index', 50)
                    # Lower burden = higher score
                    raw = 100 - (lpc / 100) + (rr * 50) + (api * 0.3)
                    value = min(100, max(0, raw))
                
                elif metric == 'world_stewardship_score':
                    cei = vals.get('civilization_efficiency_index', 50)
                    sp = vals.get('sustainability_proxy', 50)
                    hdp = vals.get('human_development_proxy', 50)
                    rm = vals.get('resilience_margin', 50)
                    gci = vals.get('growth_capacity_index', 50)
                    wbi = vals.get('work_burden_index', 50)
                    value = (cei * 0.25 + sp * 0.2 + hdp * 0.2 + rm * 0.15 + gci * 0.1 + wbi * 0.1)
                
                elif metric == 'sacrifice_visibility_index':
                    wbi = vals.get('work_burden_index', 50)
                    rig = vals.get('resource_intensity_gap', 1)
                    mp = vals.get('medicine_per_capita', 0.5)
                    fs = vals.get('food_security_index', 50)
                    value = (100 - wbi) * 0.3 + (rig * 20) + (100 - min(100, mp * 60)) * 0.25 + (100 - fs) * 0.25
            
            # ── Compound category ──
            elif cat == 'compound':
                if metric == 'calories_per_labor_hour':
                    pc = vals.get('calories_per_capita', 0)
                    lf = vals.get('calories_labor_factor', 0)
                    value = 1.0 / lf if lf > 0 else 0
                
                elif metric == 'water_per_labor_hour':
                    pc = vals.get('water_per_capita', 0)
                    lf = vals.get('water_labor_factor', 0)
                    value = 1.0 / lf if lf > 0 else 0
                
                elif metric == 'energy_per_labor_hour':
                    pc = vals.get('energy_per_capita', 0)
                    lf = vals.get('energy_labor_factor', 0)
                    value = 1.0 / lf if lf > 0 else 0
                
                elif metric == 'labor_cost_share':
                    # Sum of cost per capita vs labor per capita
                    costs = sum(vals.get(f'{r}_cost_per_capita', 0) for r in ['calories','water','housing','energy','medicine','materials'])
                    labor_hours = vals.get('labor_per_capita', 0)
                    # Assume avg wage $15/hr
                    labor_cost = labor_hours * 15
                    value = labor_cost / (costs + labor_cost) if (costs + labor_cost) > 0 else 0.5
                
                elif metric == 'civilization_efficiency_index':
                    ors = vals.get('overall_resource_security', 50)
                    lpc = vals.get('labor_per_capita', 100)
                    api = vals.get('automation_potential_index', 50)
                    rig = vals.get('resource_intensity_gap', 1)
                    value = (ors * 0.4 + (100 - lpc) * 0.3 + api * 0.2 + (100 - rig * 10) * 0.1)
                
                elif metric == 'resilience_margin':
                    ors = vals.get('overall_resource_security', 50)
                    sm = vals.get('safety_margin', 1.15)
                    value = (ors / 100) * (sm - 0.8) * 100
                
                elif metric == 'abundance_ceiling':
                    gci = vals.get('growth_capacity_index', 50)
                    sp = vals.get('sustainability_proxy', 50)
                    wss = vals.get('world_stewardship_score', 50)
                    value = (gci * 0.4 + sp * 0.3 + wss * 0.3)
            
            if value is not None and not math.isnan(value) and not math.isinf(value):
                results.append((entity, time_period, metric, round(value, 6), rule['target_unit'], round(confidence, 4)))
    
    return results


def run_derivation_engine(conn, max_depth=4):
    """Run all derivation rules, chaining through depth levels."""
    total_derived = 0
    
    for depth in range(1, max_depth + 1):
        rules = conn.execute(
            'SELECT * FROM derivation_rule WHERE depth = ?', (depth,)
        ).fetchall()
        
        for rule in rules:
            rule_dict = dict(rule)
            derived = compute_derived(conn, rule_dict, {})
            
            for entity, time, metric, value, unit, conf in derived:
                conn.execute('''INSERT OR REPLACE INTO measurement
                    (entity_id, metric, value, unit, time_period, confidence, source)
                    VALUES (?, ?, ?, ?, ?, ?, 'derived_by_reasoner')''',
                    (entity, metric, value, unit, time, conf))
                total_derived += 1
        
        conn.commit()
        if total_derived:
            print(f'  Depth {depth}: derived {total_derived} metrics so far')
    
    return total_derived


if __name__ == '__main__':
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    
    print('Running derivation engine...')
    total = run_derivation_engine(conn)
    
    # Show derived metrics
    derived = conn.execute(
        "SELECT metric, unit, COUNT(*) as cnt FROM measurement WHERE source = 'derived_by_reasoner' GROUP BY metric, unit ORDER BY metric"
    ).fetchall()
    print(f'\nTotal derived metrics: {len(derived)} unique metrics')
    for d in derived:
        print(f'  {d["metric"]} ({d["unit"]}) — {d["cnt"]} values')
    
    conn.close()
    print('\nDone — run python3 db/derive.py anytime to recompute.')
