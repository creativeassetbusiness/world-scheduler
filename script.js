import * as THREE from './node_modules/three/build/three.module.js';
import { db } from './db/client.js';

// ── Database Bridge ────────────────────────────────────────────
// Queries SQLite API when available; falls back to hardcoded data.
// All transforms (shortfall, labor, cost, rank, trend, compare, etc.)
// are computed server-side via SQL views.

const WorldData = {
  _ready: false,

  async init() {
    await db._available;
    this._ready = true;
    if (db._online) {
      console.log('[WorldData] Connected to SQLite database.');
      await this.refreshMetrics();
    } else {
      console.log('[WorldData] Offline mode — using hardcoded data.');
    }
  },

  async refreshMetrics() {
    if (!db._online) return;
    const metrics = await db.metrics();
    this._metricList = metrics;
    console.log(`[WorldData] ${metrics.length} metrics available.`);
  },

  /** Get measurements for an entity, optionally filtered by metric pattern */
  async getMeasurements(entityId, metricPattern) {
    if (!db._online) return null;
    const all = await db.measurements({ entity_id: entityId });
    if (!metricPattern) return all;
    return all.filter(m => m.metric.includes(metricPattern));
  },

  /** Run a named transform and return results */
  async transform(name) {
    if (!db._online) return null;
    return await db.transform(name);
  },

  /** Get shortfall for a specific entity */
  async shortfalls(entityId) {
    if (!db._online) return null;
    return await db.shortfalls(entityId);
  },

  /** Get world summary (population + shortfalls + labor + cost) */
  async worldSummary() {
    if (!db._online) return null;
    return await db.worldSummary();
  },

  /** Compare two entities */
  async compare(a, b) {
    if (!db._online) return null;
    return await db.compare(a, b);
  },

  /** Rank entities by metric */
  async rank(metric) {
    if (!db._online) return null;
    return await db.rank(metric);
  },

  /** Trend over time */
  async trend(entityId, metric) {
    if (!db._online) return null;
    return await db.trend(entityId, metric);
  },
};

// Initialize database connection (non-blocking)
WorldData.init();

const form = document.getElementById('scheduler-form');
const safetyValue = document.getElementById('safety-value');
const robotValue = document.getElementById('robot-value');
const resultsSummary = document.getElementById('results-summary');
const resultsTable = document.getElementById('results-table');
const resultsAction = document.getElementById('results-action');
const resultsLifePlan = document.getElementById('results-life-plan');

const safetySlider = document.getElementById('safety-margin');
const robotSlider = document.getElementById('robotization');
const evidenceSlider = document.getElementById('plan-evidence');
const timeEraSelect = document.getElementById('time-era');
const baselineNote = document.getElementById('baseline-note');
const saveProfileButton = document.getElementById('save-profile');
const verifyProfileCheckbox = document.getElementById('profile-verify');
const marginAffectedCheckbox = document.getElementById('margin-affected');
const marginImpactSelect = document.getElementById('margin-impact');
const profileNameInput = document.getElementById('profile-name');
const profileEmailInput = document.getElementById('profile-email');
const profileTypeSelect = document.getElementById('profile-type');
const profileSummary = document.getElementById('profile-summary');
const profilePanel = document.getElementById('login-section');
const topLoginButton = document.getElementById('top-login-button');
const resultsMargin = document.getElementById('results-margin');
const llmProviderSelect = document.getElementById('llm-provider');
const llmEndpointInput = document.getElementById('llm-endpoint');
const llmTokenInput = document.getElementById('llm-token');
const llmConnectButton = document.getElementById('connect-llm');
const llmStatus = document.getElementById('llm-status');
const llmPrompt = document.getElementById('llm-prompt');
const llmSendButton = document.getElementById('send-llm');
const llmResponse = document.getElementById('llm-response');
const locationSelect = document.getElementById('location-select');
const landAcresInput = document.getElementById('land-acres');
const powerDemandInput = document.getElementById('power-demand');
const staffCountInput = document.getElementById('staff-count');
const deviceCountInput = document.getElementById('device-count');
const deviceUnitCostInput = document.getElementById('device-unit-cost');
const deviceMaintenanceInput = document.getElementById('device-maintenance');
const deviceServiceLifeInput = document.getElementById('device-service-life');
const globalUsersInput = document.getElementById('global-users');
const peakConcurrentUsersInput = document.getElementById('peak-concurrent-users');
const sessionsPerUserYearInput = document.getElementById('sessions-per-user-year');
const avgSessionMinutesInput = document.getElementById('avg-session-minutes');
const mbPerSessionInput = document.getElementById('mb-per-session');
const sessionPriceInput = document.getElementById('session-price');
const sessionsPerDayInput = document.getElementById('sessions-per-day');
const annualDonationsInput = document.getElementById('annual-donations');
const reserveReturnInput = document.getElementById('reserve-return');
const reserveGrowthInput = document.getElementById('reserve-growth');
const calculateCostButton = document.getElementById('calculate-costs');
const costResults = document.getElementById('cost-results');
const countryMonitorList = document.getElementById('country-monitor-list');
const countryMonitorNote = document.getElementById('country-monitor-note');
const pricePerLoadInput = document.getElementById('price-per-load');
const pageLoadsPerSessionInput = document.getElementById('page-loads-per-session');
const assetRewardShareInput = document.getElementById('asset-reward-share');
const scenarioNameInput = document.getElementById('scenario-name');
const saveScenarioButton = document.getElementById('save-scenario');
const loadLatestScenarioButton = document.getElementById('load-latest-scenario');
const scenarioList = document.getElementById('scenario-list');
const memberToolsGate = document.getElementById('member-tools-gate');
const memberToolsBody = document.getElementById('member-tools-body');
const evidenceValue = document.getElementById('evidence-value');
const assetNameInput = document.getElementById('asset-name');
const assetTypeSelect = document.getElementById('asset-type');
const assetDetailScoreInput = document.getElementById('asset-detail-score');
const assetTopologyScoreInput = document.getElementById('asset-topology-score');
const assetRightsScoreInput = document.getElementById('asset-rights-score');
const assetDetailValue = document.getElementById('asset-detail-value');
const assetTopologyValue = document.getElementById('asset-topology-value');
const assetRightsValue = document.getElementById('asset-rights-value');
const submitAssetButton = document.getElementById('submit-asset');
const assetRewardSummary = document.getElementById('asset-reward-summary');
const assetRewardList = document.getElementById('asset-reward-list');
const nanoToolbar = document.getElementById('nano-toolbar');
const worldUndoButton = document.getElementById('world-undo');
const worldRedoButton = document.getElementById('world-redo');
const worldIsolateButton = document.getElementById('world-isolate');
const worldIsolateExitButton = document.getElementById('world-isolate-exit');
const vertexEditorPanel = document.getElementById('vertex-editor');
const vertexEditorContent = document.getElementById('vertex-editor-content');
const scenarioComparePanel = document.getElementById('scenario-compare-panel');

const eraPresets = {
  past: {
    label: 'Past standard times',
    note: 'Lower consumption, more limited housing, and less automation. This era is about surviving with older infrastructure.',
    calories: 50000,
    water: 2000,
    housing: 12,
    energy: 200,
    medicine: 0.5,
    materials: 0.1,
  },
  modern: {
    label: 'Modern baseline',
    note: 'Current average values with a balanced quality of life and standard safety margins.',
    calories: 75000,
    water: 3000,
    housing: 20,
    energy: 300,
    medicine: 1,
    materials: 0.15,
  },
  future: {
    label: 'Future abundance standard',
    note: 'Higher quality of life backed by automation, richer housing, more energy, and stronger reserves.',
    calories: 90000,
    water: 4000,
    housing: 28,
    energy: 450,
    medicine: 1.5,
    materials: 0.22,
  },
};

const publicCountryBaseline = [
  {
    country: 'Estonia',
    coverage: 0.91,
    recency: 0.94,
    sourceDiversity: 0.88,
    consistency: 0.9,
    machineReadability: 0.95,
  },
  {
    country: 'Denmark',
    coverage: 0.9,
    recency: 0.89,
    sourceDiversity: 0.87,
    consistency: 0.91,
    machineReadability: 0.88,
  },
  {
    country: 'New Zealand',
    coverage: 0.86,
    recency: 0.9,
    sourceDiversity: 0.84,
    consistency: 0.89,
    machineReadability: 0.86,
  },
  {
    country: 'Canada',
    coverage: 0.82,
    recency: 0.84,
    sourceDiversity: 0.85,
    consistency: 0.83,
    machineReadability: 0.81,
  },
  {
    country: 'Japan',
    coverage: 0.8,
    recency: 0.86,
    sourceDiversity: 0.76,
    consistency: 0.88,
    machineReadability: 0.78,
  },
];

safetySlider.addEventListener('input', () => {
  safetyValue.textContent = `${safetySlider.value}%`;
});
robotSlider.addEventListener('input', () => {
  robotValue.textContent = `${robotSlider.value}%`;
});
evidenceSlider.addEventListener('input', () => {
  evidenceValue.textContent = `${evidenceSlider.value}%`;
});
assetDetailScoreInput?.addEventListener('input', () => {
  assetDetailValue.textContent = `${assetDetailScoreInput.value}%`;
});
assetTopologyScoreInput?.addEventListener('input', () => {
  assetTopologyValue.textContent = `${assetTopologyScoreInput.value}%`;
});
assetRightsScoreInput?.addEventListener('input', () => {
  assetRightsValue.textContent = `${assetRightsScoreInput.value}%`;
});

timeEraSelect.addEventListener('change', () => applyEraBaseline(timeEraSelect.value));

// Login / profile section toggle
if (topLoginButton && profilePanel) {
  topLoginButton.addEventListener('click', (e) => {
    e.preventDefault();
    const isOpen = !profilePanel.hidden;
    if (isOpen) {
      profilePanel.hidden = true;
      topLoginButton.textContent = 'Login';
    } else {
      profilePanel.hidden = false;
      topLoginButton.textContent = 'Close';
      profilePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

// LLM integration — inactive until section is un-commented
if (llmConnectButton) llmConnectButton.addEventListener('click', () => { connectLLM(); });
if (llmSendButton) llmSendButton.addEventListener('click', () => { sendLLMRequest(); });

saveProfileButton.addEventListener('click', () => {
  saveProfile();
});

saveScenarioButton.addEventListener('click', () => {
  saveScenario();
});

loadLatestScenarioButton.addEventListener('click', () => {
  loadLatestScenario();
});
submitAssetButton?.addEventListener('click', () => {
  saveAssetContribution();
});

function applyEraBaseline(eraKey) {
  const preset = eraPresets[eraKey];
  document.getElementById('calories').value = preset.calories;
  document.getElementById('water').value = preset.water;
  document.getElementById('housing').value = preset.housing;
  document.getElementById('energy').value = preset.energy;
  document.getElementById('medicine').value = preset.medicine;
  document.getElementById('materials').value = preset.materials;
  baselineNote.textContent = preset.note;
}

document.getElementById('calculate-button').addEventListener('click', () => {
  const population = Number(document.getElementById('population').value);
  const safetyMargin = Number(document.getElementById('safety-margin').value) / 100;
  const robotRate = Number(document.getElementById('robotization').value) / 100;

  const perPerson = {
    calories: Number(document.getElementById('calories').value),
    water: Number(document.getElementById('water').value),
    housing: Number(document.getElementById('housing').value),
    energy: Number(document.getElementById('energy').value),
    medicine: Number(document.getElementById('medicine').value),
    materials: Number(document.getElementById('materials').value),
  };

  const supply = {
    calories: Number(document.getElementById('supply-calories').value) * 1e9,
    water: Number(document.getElementById('supply-water').value) * 1e9,
    housing: Number(document.getElementById('supply-housing').value) * 1e6,
    energy: Number(document.getElementById('supply-energy').value) * 1e9,
    medicine: Number(document.getElementById('supply-medicine').value) * 1e6,
    materials: Number(document.getElementById('supply-materials').value) * 1e6,
  };

  const averageCost = {
    calories: 0.000000002,
    water: 0.00000012,
    housing: 0.00000045,
    energy: 0.00000018,
    medicine: 0.00000075,
    materials: 0.00000022,
  };

  const laborFactors = {
    calories: 0.000002,
    water: 0.0000009,
    housing: 0.0000045,
    energy: 0.0000021,
    medicine: 0.0000018,
    materials: 0.0000015,
  };

  const target = {
    calories: population * perPerson.calories * safetyMargin,
    water: population * perPerson.water * safetyMargin,
    housing: population * perPerson.housing * safetyMargin,
    energy: population * perPerson.energy * safetyMargin,
    medicine: population * perPerson.medicine * safetyMargin,
    materials: population * perPerson.materials * safetyMargin,
  };

  const categories = Object.keys(target);

  const results = categories.map((key) => {
    const shortfall = supply[key] - target[key];
    const status = shortfall >= 0 ? 'good' : 'danger';
    const displayShortfall = shortfall >= 0 ? shortfall : shortfall;
    const effectiveLabor = target[key] * laborFactors[key];
    const humanLabor = effectiveLabor * (1 - robotRate);
    const robotLabor = effectiveLabor * robotRate;

    return {
      name: key,
      target: target[key],
      supply: supply[key],
      shortage: shortfall,
      status,
      humanLabor,
      robotLabor,
      totalLabor: effectiveLabor,
      action: getActionSuggestion(key, shortfall),
      unit: getUnit(key),
    };
  });

  const summaryLines = [];
  const shortageCategories = results.filter((item) => item.shortage < 0);
  const healthyCategories = results.filter((item) => item.shortage >= 0);
  const marginState = getMarginState(getStoredProfile(), results);

  summaryLines.push(`<h3>Summary</h3>`);
  const eraKey = timeEraSelect.value;
  summaryLines.push(`<p>Population: <strong>${population.toLocaleString()}</strong></p>`);
  summaryLines.push(`<p>Baseline era: <strong>${eraPresets[eraKey].label}</strong></p>`);
  summaryLines.push(`<p>Safety margin: <strong>${Math.round(safetyMargin * 100)}%</strong></p>`);
  summaryLines.push(`<p>Robot automation: <strong>${Math.round(robotRate * 100)}%</strong></p>`);
  summaryLines.push(`<p>Status: <strong>${shortageCategories.length === 0 ? 'All essential systems are covered.' : 'Shortages detected in ' + shortageCategories.map((item) => item.name).join(', ') + '.'}</strong></p>`);

  const tableRows = results.map((item) => {
    return `
      <div class="result-row">
        <div>
          <strong>${capitalize(item.name)}</strong>
          <div class="muted-text">Target: ${formatValue(item.target, item.unit)} • Supply: ${formatValue(item.supply, item.unit)}</div>
        </div>
        <div>
          <span class="status-chip status-${item.status}">${item.status === 'good' ? 'Healthy' : 'Short'}</span>
        </div>
      </div>
    `;
  }).join('');

  const actionLines = shortageCategories.length > 0 ? shortageCategories.map((item) => {
    return `<p><strong>${capitalize(item.name)} shortage:</strong> ${item.action}</p>`;
  }).join('') : '<p>All systems are within target. Keep improving production capacity and automation.</p>';

  const laborTotal = results.reduce((sum, item) => sum + item.totalLabor, 0);
  const humanTotal = results.reduce((sum, item) => sum + item.humanLabor, 0);
  const robotTotal = results.reduce((sum, item) => sum + item.robotLabor, 0);
  const lifePlanAssessment = getLifePlanAssessment({
    monthlyIncome: Number(document.getElementById('monthly-income').value),
    essentialCost: Number(document.getElementById('essential-cost').value),
    wantsCost: Number(document.getElementById('wants-cost').value),
    savingsMonths: Number(document.getElementById('savings-months').value),
    planHorizon: Number(document.getElementById('plan-horizon').value),
    planEvidence: Number(document.getElementById('plan-evidence').value),
    lifeGoal: document.getElementById('life-goal').value,
    shortageCount: shortageCategories.length,
    healthyCount: healthyCategories.length,
    robotRate,
    safetyMargin,
  });

  const laborSummary = `
    <h3>Labor estimate</h3>
    <p>Total monthly labor required: <strong>${formatValue(laborTotal, 'hours')}</strong></p>
    <p>Human labor: <strong>${formatValue(humanTotal, 'hours')}</strong></p>
    <p>Robot labor: <strong>${formatValue(robotTotal, 'hours')}</strong></p>
    <p>Automation reduces human labor by <strong>${Math.round(robotRate * 100)}%</strong>, shifting effort into supervision, repair, and growth.</p>
  `;

  resultsSummary.innerHTML = summaryLines.join('');
  resultsMargin.innerHTML = marginState.isAffected ? `
    <h3>Margin of Error recognition</h3>
    <div class="margin-badge badge-high">${marginState.badgeText}</div>
    <p><strong>Impact score:</strong> ${marginState.score}/100</p>
    <p><strong>Recognition tier:</strong> ${marginState.tier}</p>
    <p><strong>Allotment points:</strong> ${marginState.points}</p>
    <p><strong>Impact level:</strong> ${marginState.impactLabel}</p>
    <p>This badge marks human sacrifice in the face of the system's real constraints and turns pressure into visible stewardship.</p>
  ` : '<h3>Margin of Error recognition</h3><p>No badge is active yet. Claim your impact in the profile panel to receive recognition.</p>';
  resultsLifePlan.innerHTML = `
    <h3>Life plan credibility</h3>
    <div class="margin-badge ${lifePlanAssessment.probability >= 80 ? 'badge-high' : lifePlanAssessment.probability >= 60 ? 'badge-moderate' : 'badge-low'}">${lifePlanAssessment.tier}</div>
    <p><strong>Probability your plan holds:</strong> ${lifePlanAssessment.probability}%</p>
    <p><strong>Primary goal:</strong> ${getLifeGoalLabel(document.getElementById('life-goal').value)}</p>
    <p><strong>Needs coverage:</strong> ${(lifePlanAssessment.needsCoverageRatio * 100).toFixed(0)}% of essential costs</p>
    <p><strong>Discretionary balance:</strong> ${formatCurrency(lifePlanAssessment.discretionaryIncome)}</p>
    <p><strong>Wants load:</strong> ${(lifePlanAssessment.wantsLoadRatio * 100).toFixed(0)}% of monthly income</p>
    <p><strong>System resilience:</strong> ${(lifePlanAssessment.systemResilience * 100).toFixed(0)}%</p>
    <p>${lifePlanAssessment.coverageText}</p>
    <p><strong>Assessment:</strong> ${lifePlanAssessment.nextMove}</p>
  `;
  resultsTable.innerHTML = `<h3>Resource status</h3>${tableRows}${laborSummary}`;
  resultsAction.innerHTML = `<h3>Direction suggestions</h3>${actionLines}`;
  updateProfileSummary();

  // ── Database-verified cross-check (async, non-blocking) ──
  WorldData.shortfalls('planet:earth').then(dbShortfalls => {
    if (!dbShortfalls || !dbShortfalls.length) return;
    const dbSection = document.getElementById('results-db-crosscheck');
    if (!dbSection) return;
    const rows = dbShortfalls.map(s => {
      const shortfallFmt = Math.abs(s.shortfall) > 1e9
        ? `${(Math.abs(s.shortfall) / 1e9).toFixed(1)}B`
        : `${(Math.abs(s.shortfall) / 1e6).toFixed(1)}M`;
      const statusIcon = s.status === 'surplus' ? '✓' : '⚠';
      const statusClass = s.status === 'surplus' ? 'good' : 'danger';
      return `<div class="compare-diff-row">
        <span class="compare-label">${capitalize(s.resource)}</span>
        <span class="status-chip status-${statusClass}">${statusIcon} ${s.status}</span>
        <span class="diff-neutral">Δ ${shortfallFmt} ${s.unit} (${(s.confidence * 100).toFixed(0)}% confidence)</span>
      </div>`;
    }).join('');
    dbSection.innerHTML = `<h3>Database cross-check <span class="badge badge-db" title="SQLite via API">🗄️ DB</span></h3>${rows}`;
  }).catch(() => {});
});

function getUnit(key) {
  switch (key) {
    case 'calories': return 'calories';
    case 'water': return 'liters';
    case 'housing': return 'sqm';
    case 'energy': return 'kWh';
    case 'medicine': return 'units';
    case 'materials': return 'tons';
    default: return '';
  }
}

function formatValue(value, unit) {
  if (unit === 'hours') {
    return `${Math.round(value).toLocaleString()} ${unit}`;
  }
  if (unit === 'calories') {
    return `${Math.round(value / 1e9)}B ${unit}`;
  }
  if (unit === 'liters') {
    return `${Math.round(value / 1e9)}B ${unit}`;
  }
  if (unit === 'kWh') {
    return `${Math.round(value / 1e9)}B ${unit}`;
  }
  if (unit === 'sqm') {
    return `${Math.round(value / 1e6)}M ${unit}`;
  }
  if (unit === 'units' || unit === 'tons') {
    return `${(value / 1e6).toFixed(2)}M ${unit}`;
  }
  return `${Math.round(value).toLocaleString()} ${unit}`;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getLifeGoalLabel(goal) {
  return {
    stability: 'Stability and lower stress',
    home: 'Home ownership or family housing',
    education: 'Education and skill upgrade',
    business: 'Business launch or expansion',
  }[goal] || 'Stability and lower stress';
}

function getLifePlanAssessment({
  monthlyIncome,
  essentialCost,
  wantsCost,
  savingsMonths,
  planHorizon,
  planEvidence,
  lifeGoal,
  shortageCount,
  healthyCount,
  robotRate,
  safetyMargin,
}) {
  const needsCoverageRatio = essentialCost > 0 ? monthlyIncome / essentialCost : 1;
  const discretionaryIncome = monthlyIncome - essentialCost - wantsCost;
  const wantsLoadRatio = monthlyIncome > 0 ? wantsCost / monthlyIncome : 1;
  const systemResilience = healthyCount / Math.max(1, healthyCount + shortageCount);

  const needsScore = clamp((needsCoverageRatio - 0.85) * 45, 0, 30);
  const wantsScore = clamp((0.28 - wantsLoadRatio) * 60, -10, 12);
  const savingsScore = clamp(savingsMonths * 1.8, 0, 16);
  const evidenceScore = clamp(planEvidence * 0.18, 0, 18);
  const systemScore = clamp(systemResilience * 14, 0, 14);
  const automationScore = clamp(robotRate * 10, 0, 10);
  const safetyScore = clamp((safetyMargin - 1.0) * 12, 0, 12);
  const horizonPenalty = clamp((planHorizon - 3) * 2.2, 0, 14);
  const shortagePenalty = shortageCount * 4;
  const ambitionPenalty = {
    stability: 0,
    home: 4,
    education: 3,
    business: 8,
  }[lifeGoal] || 0;

  const probability = clamp(
    28 + needsScore + wantsScore + savingsScore + evidenceScore + systemScore + automationScore + safetyScore - horizonPenalty - shortagePenalty - ambitionPenalty,
    5,
    97
  );

  const tier = probability >= 80 ? 'Highly probable' : probability >= 62 ? 'Viable with discipline' : probability >= 45 ? 'Fragile' : 'Low confidence';
  const coverageText = needsCoverageRatio >= 1.2
    ? 'Needs are strongly covered.'
    : needsCoverageRatio >= 1
      ? 'Needs are covered, but with limited surplus.'
      : 'Needs are not fully covered yet.';

  const nextMove = shortageCount > 0
    ? 'Reduce exposure to short resource categories before expanding wants or long-horizon commitments.'
    : discretionaryIncome < 0
      ? 'Cut wants or raise income until monthly needs and goals stop eating into stability.'
      : savingsMonths < 6
        ? 'Build more runway before committing to the full plan horizon.'
        : planEvidence < 60
          ? 'Add stronger evidence: budget data, timeline checkpoints, and regional assumptions.'
          : 'The plan is structurally believable. Keep validating inputs and stage it over time.';

  return {
    probability: Math.round(probability),
    tier,
    coverageText,
    nextMove,
    discretionaryIncome,
    needsCoverageRatio,
    wantsLoadRatio,
    systemResilience,
  };
}

function getCountryAccuracyAssessment(country) {
  const score = clamp(
    (
      country.coverage * 0.30 +
      country.recency * 0.18 +
      country.sourceDiversity * 0.16 +
      country.consistency * 0.22 +
      country.machineReadability * 0.14
    ) * 100,
    0,
    100
  );

  const crownState = score >= 90
    ? 'Country of Earth contender'
    : score >= 80
      ? 'High transparency'
      : score >= 70
        ? 'Advancing'
        : 'Needs stronger publication discipline';

  return {
    score: Math.round(score),
    crownState,
  };
}

function renderCountryMonitor() {
  if (!countryMonitorList || !countryMonitorNote) return;

  const rankedCountries = publicCountryBaseline
    .map((country) => ({
      ...country,
      assessment: getCountryAccuracyAssessment(country),
    }))
    .sort((left, right) => right.assessment.score - left.assessment.score);

  countryMonitorList.innerHTML = rankedCountries.map((country, index) => `
    <div class="country-monitor-row">
      <div class="country-rank">${index + 1}</div>
      <div class="country-meta">
        <strong>${country.country}</strong>
        <span class="muted-text">Coverage ${(country.coverage * 100).toFixed(0)}% • Recency ${(country.recency * 100).toFixed(0)}% • Machine-ready ${(country.machineReadability * 100).toFixed(0)}%</span>
      </div>
      <div class="country-score">
        <strong>${country.assessment.score}%</strong>
        <span>${country.assessment.crownState}</span>
      </div>
    </div>
  `).join('');

  const leader = rankedCountries[0];
  countryMonitorNote.textContent = `${leader.country} currently leads the public-data baseline at ${leader.assessment.score}% measurable national self-description.`;
}

// ── Data Explorer — Google Trends-style ──────────────────────

const explorerState = {
  query: '',
  compareSet: [],      // up to 3 entity/metric IDs
  suggestions: [],
  activeSuggestion: -1,
};

let _explorerIndex = null;
function getExplorerIndex() {
  if (!_explorerIndex) _explorerIndex = buildExplorerIndex();
  return _explorerIndex;
}

// Build searchable index from all measurements
function buildExplorerIndex() {
  const index = [];
  // Countries — use ISO codes to match chip data attributes
  const countryCodes = { Estonia: 'EE', Denmark: 'DK', 'New Zealand': 'NZ', Canada: 'CA', Japan: 'JP' };
  publicCountryBaseline.forEach(c => {
    const code = countryCodes[c.country] || c.country.substring(0,2).toUpperCase();
    index.push({ id: `country:${code}`, label: c.country, type: 'country', keywords: [c.country.toLowerCase(), code.toLowerCase()], metrics: c });
  });
  // Regions
  Object.entries(regionData).forEach(([key, r]) => {
    index.push({ id: `region:${key}`, label: r.label, type: 'region', keywords: [key.toLowerCase(), r.label.toLowerCase()], metrics: r.stats });
  });
  // Metrics from measurement table — base + derived
  const metricSet = new Set([
    'calories_per_capita','water_per_capita','housing_per_capita','energy_per_capita','medicine_per_capita','materials_per_capita',
    'calories_supply','water_supply','housing_supply','energy_supply','medicine_supply','materials_supply',
    'population','robotization_rate','safety_margin',
    'data_coverage','data_recency','data_source_diversity','data_consistency','data_machine_readability',
    // Derived — ratios
    'calories_per_capita_supply','water_per_capita_supply','housing_per_capita_supply','energy_per_capita_supply','medicine_per_capita_supply','materials_per_capita_supply',
    'calories_surplus_ratio','water_surplus_ratio','housing_surplus_ratio','energy_surplus_ratio','medicine_surplus_ratio','materials_surplus_ratio',
    'robot_human_ratio','resource_intensity_gap','labor_per_capita',
    'calories_cost_per_capita','water_cost_per_capita','housing_cost_per_capita','energy_cost_per_capita','medicine_cost_per_capita','materials_cost_per_capita',
    'calories_labor_productivity','water_labor_productivity','housing_labor_productivity','energy_labor_productivity',
    // Derived — compound
    'calories_per_labor_hour','water_per_labor_hour','energy_per_labor_hour','labor_cost_share',
    // Derived — indices
    'food_security_index','water_security_index','energy_security_index','housing_security_index','overall_resource_security',
    'resource_diversity_index','automation_potential_index','sustainability_proxy',
    'human_development_proxy','growth_capacity_index','work_burden_index',
    'civilization_efficiency_index','resilience_margin',
    'world_stewardship_score','sacrifice_visibility_index','abundance_ceiling',
  ]);
  metricSet.forEach(m => {
    const label = m.replace(/_/g, ' ').replace(/data /g, '');
    index.push({ id: `metric:${m}`, label, type: 'metric', keywords: [m.toLowerCase(), label.toLowerCase()] });
  });
  return index;
}

function searchExplorer(query) {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  return getExplorerIndex()
    .filter(item => item.keywords.some(k => k.includes(q)))
    .slice(0, 8);
}


function renderSuggestions(suggestions) {
  const el = document.getElementById('data-search-suggestions');
  if (!el) return;
  if (!suggestions.length) { el.hidden = true; return; }
  el.hidden = false;
  el.innerHTML = suggestions.map((s, i) => `
    <div class="suggestion-item${i === explorerState.activeSuggestion ? ' active' : ''}" data-index="${i}">
      <span class="suggestion-type">${s.type}</span>
      <span>${s.label}</span>
    </div>
  `).join('');
}

function selectExplorerItem(item) {
  if (!item) return;
  if (explorerState.compareSet.length >= 3) explorerState.compareSet.shift();
  explorerState.compareSet.push(item.id);
  const input = document.getElementById('data-search');
  if (input) input.value = '';
  const sugg = document.getElementById('data-search-suggestions');
  if (sugg) sugg.hidden = true;
  updateCompareSlots();
  renderExplorerView();
}

function removeCompareItem(index) {
  explorerState.compareSet.splice(index, 1);
  updateCompareSlots();
  renderExplorerView();
}

function updateCompareSlots() {
  const sl = document.getElementById('compare-slots');
  const clr = document.getElementById('compare-clear');
  if (!sl) return;
  sl.querySelectorAll('.compare-slot').forEach((slot, i) => {
    const itemId = explorerState.compareSet[i];
    if (itemId) {
      const item = getExplorerIndex().find(x => x.id === itemId);
      slot.className = 'compare-slot filled';
      slot.innerHTML = `${item?.label || itemId} <span class="slot-remove" data-idx="${i}">&times;</span>`;
    } else {
      slot.className = 'compare-slot empty';
      slot.textContent = '+ Add';
    }
  });
  if (clr) clr.hidden = explorerState.compareSet.length === 0;
  sl.querySelectorAll('.slot-remove').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); removeCompareItem(Number(btn.dataset.idx)); });
  });
}

function renderExplorerView() {
  const lb = document.getElementById('explorer-leaderboard');
  const cards = document.getElementById('explorer-cards');
  const cv = document.getElementById('explorer-compare-view');
  if (explorerState.compareSet.length === 0) {
    if (lb) lb.hidden = false;
    if (cards) cards.hidden = true;
    if (cv) cv.hidden = true;
    return;
  }
  if (lb) lb.hidden = true;
  if (explorerState.compareSet.length === 1) {
    const item = getExplorerIndex().find(x => x.id === explorerState.compareSet[0]);
    if (item && cards) { cards.hidden = false; cards.innerHTML = renderExplorerCard(item); }
    if (cv) cv.hidden = true;
  } else {
    if (cards) cards.hidden = true;
    if (cv) { cv.hidden = false; renderExplorerCompareTable(); }
  }
}

function renderExplorerCard(item) {
  const entries = Object.entries(item.metrics || {});
  const rows = entries.length ? entries.map(([k, v]) => {
    const val = typeof v === 'number' ? (v < 1 ? (v*100).toFixed(0)+'%' : v.toLocaleString()) : v;
    return `<div class="metric-row"><span class="metric-label">${k.replace(/_/g,' ')}</span><span class="metric-value">${val}</span></div>`;
  }).join('') : '<p class="metric-label">No metrics available.</p>';
  return `<div class="explorer-card"><h3>${item.label}</h3><p class="card-type">${item.type}</p>${rows}</div>`;
}

function renderExplorerCompareTable() {
  const cv = document.getElementById('explorer-compare-view');
  if (!cv) return;
  const items = explorerState.compareSet.map(id => getExplorerIndex().find(x => x.id === id)).filter(Boolean);
  if (items.length < 2) return;
  const metricKeys = [...new Set(items.flatMap(item => Object.keys(item.metrics || {})))];
  cv.innerHTML = `
    <div class="compare-view-header"><span>Metric</span>${items.map(i => `<span>${i.label}</span>`).join('')}</div>
    ${metricKeys.map(key => {
      const vals = items.map(item => item.metrics?.[key]);
      const nums = vals.filter(v => typeof v === 'number');
      const best = nums.length>1 ? Math.max(...nums) : null;
      const worst = nums.length>1 ? Math.min(...nums) : null;
      return `<div class="compare-view-row"><span class="metric-label">${key.replace(/_/g,' ')}</span>
        ${vals.map(v => {
          let cls = ''; if (typeof v === 'number' && nums.length>1) { if (v===best) cls='better'; else if (v===worst) cls='worse'; }
          const d = typeof v === 'number' ? (v<1 ? (v*100).toFixed(0)+'%' : v.toLocaleString()) : (v||'—');
          return `<span class="metric-cell ${cls}">${d}</span>`;
        }).join('')}</div>`;
    }).join('')}
  `;
}

function initDataExplorer() {
  const input = document.getElementById('data-search');
  const sugg = document.getElementById('data-search-suggestions');
  if (!input) return;

  // ── Global event delegation (robust, no element timing issues) ──
  document.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-chip]');
    if (chip) {
      const item = getExplorerIndex().find(x => x.id === chip.dataset.chip);
      if (item) selectExplorerItem(item);
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      return;
    }
    const slotRemove = e.target.closest('.slot-remove');
    if (slotRemove) {
      removeCompareItem(Number(slotRemove.dataset.idx));
      return;
    }
    const suggItem = e.target.closest('.suggestion-item');
    if (suggItem && explorerState.suggestions[Number(suggItem.dataset.index)]) {
      selectExplorerItem(explorerState.suggestions[Number(suggItem.dataset.index)]);
      return;
    }
    if (e.target.closest('#compare-clear')) {
      explorerState.compareSet = []; updateCompareSlots(); renderExplorerView();
      return;
    }
  });

  input.addEventListener('input', () => {
    explorerState.query = input.value.trim();
    explorerState.activeSuggestion = -1;
    explorerState.suggestions = searchExplorer(explorerState.query);
    renderSuggestions(explorerState.suggestions);
  });

  input.addEventListener('keydown', (e) => {
    const s = explorerState.suggestions;
    if (!s.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); explorerState.activeSuggestion = Math.min(explorerState.activeSuggestion+1, s.length-1); renderSuggestions(s); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); explorerState.activeSuggestion = Math.max(explorerState.activeSuggestion-1, 0); renderSuggestions(s); }
    else if (e.key === 'Enter') { e.preventDefault(); const idx = explorerState.activeSuggestion >= 0 ? explorerState.activeSuggestion : 0; if (s[idx]) selectExplorerItem(s[idx]); }
    else if (e.key === 'Escape') { if (sugg) sugg.hidden = true; }
  });

  input.addEventListener('blur', () => { setTimeout(() => { if (sugg) sugg.hidden = true; }, 150); });

  renderExplorerView();
  updateCompareSlots();
}

// Call after DOM ready
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDataExplorer);
  } else {
    initDataExplorer();
  }
})();

function getAssetContributionStorage() {
  return JSON.parse(localStorage.getItem('worldSchedulerAssets') || '[]');
}

function getAssetRewardAssessment(asset) {
  const baseReward = {
    building: 340,
    room: 220,
    window: 180,
    panel: 150,
    surface: 130,
    topology: 260,
  }[asset.type] || 140;

  const composite = asset.detailScore * 0.35 + asset.topologyScore * 0.4 + asset.rightsScore * 0.25;
  const qualityTier = composite >= 85 ? 'High-value asset' : composite >= 70 ? 'Usable asset' : 'Needs refinement';
  const rewardCredits = Math.round(baseReward * (composite / 100));

  return {
    rewardCredits,
    qualityTier,
    probability: Math.round(composite),
  };
}

function saveAssetContribution() {
  const assetName = assetNameInput.value.trim();
  if (!assetName) {
    assetRewardSummary.innerHTML = '<h3>Asset reward summary</h3><p>Please name the asset before registering it.</p>';
    return;
  }

  const asset = {
    id: Date.now(),
    name: assetName,
    type: assetTypeSelect.value,
    detailScore: Number(assetDetailScoreInput.value),
    topologyScore: Number(assetTopologyScoreInput.value),
    rightsScore: Number(assetRightsScoreInput.value),
    createdAt: new Date().toLocaleString(),
  };

  const assessment = getAssetRewardAssessment(asset);
  const storedAssets = getAssetContributionStorage();
  storedAssets.unshift({ ...asset, assessment });
  localStorage.setItem('worldSchedulerAssets', JSON.stringify(storedAssets.slice(0, 8)));

  assetNameInput.value = '';
  renderAssetRewards();
}

function renderAssetRewards() {
  if (!assetRewardSummary || !assetRewardList) return;

  const assets = getAssetContributionStorage();
  const totalCredits = assets.reduce((sum, asset) => sum + (asset.assessment?.rewardCredits || 0), 0);
  const topProbability = assets.length ? Math.max(...assets.map((asset) => asset.assessment?.probability || 0)) : 0;

  assetRewardSummary.innerHTML = `
    <h3>Asset reward summary</h3>
    <p><strong>Total registered assets:</strong> ${assets.length}</p>
    <p><strong>Reward credits earned:</strong> ${totalCredits.toLocaleString()}</p>
    <p><strong>Best readiness score:</strong> ${topProbability}%</p>
    <p class="muted-text">Assets with stronger topology, clearer public rights, and better detail readiness receive larger reward credits for the world engine preview.</p>
  `;

  assetRewardList.innerHTML = assets.length
    ? `<h3>Recent asset rewards</h3>${assets.map((asset) => `
        <div class="scenario-item">
          <div>
            <strong>${asset.name}</strong>
            <div class="muted-text">${capitalize(asset.type)} • ${asset.createdAt} • ${asset.assessment.qualityTier}</div>
          </div>
          <div class="country-score">
            <strong>${asset.assessment.rewardCredits} credits</strong>
            <span>${asset.assessment.probability}% readiness</span>
          </div>
        </div>
      `).join('')}`
    : '<h3>Recent asset rewards</h3><p class="muted-text">No assets registered yet. Upload or register geometry for buildings, windows, panels, or topology sets to start earning contribution rewards.</p>';
}

function getActionSuggestion(key, shortage) {
  if (shortage >= 0) {
    return 'Supply is at or above target. Continue improving efficiency and automation.';
  }

  switch (key) {
    case 'calories':
      return 'Direct resources to farms, greenhouses, irrigation, fertilizer, storage, and food logistics.';
    case 'water':
      return 'Invest in pipes, purification, reservoirs, desalination, recycling, and leak repair.';
    case 'housing':
      return 'Prioritize modular housing, construction robots, land prep, and material stockpiles.';
    case 'energy':
      return 'Build solar, battery storage, transmission, geothermal, and grid repair systems.';
    case 'medicine':
      return 'Expand medical manufacturing, supply chains, clinics, and logistics capacity.';
    case 'materials':
      return 'Boost factories, recycling, raw material processing, and transportation networks.';
    default:
      return 'Increase production capacity and automation for this category.';
  }
}

const sitePricing = {
  southDakota: {
    label: 'South Dakota',
    landPerAcre: 8500,
    electricityRate: 0.11,
    laborRate: 95000,
    overheadMultiplier: 1.35,
  },
  colorado: {
    label: 'Colorado',
    landPerAcre: 12000,
    electricityRate: 0.13,
    laborRate: 105000,
    overheadMultiplier: 1.38,
  },
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value > -10 && value < 10 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function getAnnualContributionForTarget(target, growthRate, years) {
  if (target <= 0) return 0;
  if (growthRate <= 0) return target / years;

  const factor = (Math.pow(1 + growthRate, years) - 1) / growthRate;
  return target / factor;
}

function estimateYearsToTarget(target, annualContribution, growthRate) {
  if (target <= 0) return 0;
  if (annualContribution <= 0) return Infinity;

  let balance = 0;
  for (let year = 1; year <= 500; year += 1) {
    balance = balance * (1 + growthRate) + annualContribution;
    if (balance >= target) return year;
  }

  return Infinity;
}

function renderCostEstimate() {
  const config = sitePricing[locationSelect.value];
  const acres = Number(landAcresInput.value) || 0;
  const powerMw = Number(powerDemandInput.value) || 0;
  const staffCount = Number(staffCountInput.value) || 0;
  const deviceCount = Number(deviceCountInput.value) || 0;
  const deviceUnitCost = Number(deviceUnitCostInput.value) || 0;
  const deviceMaintenance = Number(deviceMaintenanceInput.value) || 0;
  const deviceServiceLife = Number(deviceServiceLifeInput.value) || 1;
  const pricePerLoad = Number(pricePerLoadInput.value) || 0;
  const pageLoadsPerSession = Number(pageLoadsPerSessionInput.value) || 1;
  const assetRewardShare = (Number(assetRewardShareInput.value) || 0) / 100;
  const globalUsers = Number(globalUsersInput.value) || 0;
  const peakConcurrentUsers = Number(peakConcurrentUsersInput.value) || 0;
  const sessionsPerUserYear = Number(sessionsPerUserYearInput.value) || 0;
  const avgSessionMinutes = Number(avgSessionMinutesInput.value) || 1;
  const mbPerSession = Number(mbPerSessionInput.value) || 0;
  const sessionPrice = Number(sessionPriceInput.value) || 0;
  const sessionsPerDay = Number(sessionsPerDayInput.value) || 0;
  const annualDonations = Number(annualDonationsInput.value) || 0;
  const reserveReturnRate = (Number(reserveReturnInput.value) || 0) / 100;
  const reserveGrowthRate = (Number(reserveGrowthInput.value) || 0) / 100;
  const reserveHorizonYears = 100;

  const appNodeConcurrentCapacity = 50000;
  const dataNodeConcurrentCapacity = 250000;
  const aiAssistShare = 0.08;
  const aiNodeConcurrentCapacity = 2500;
  const appNodeAnnualCost = 180000;
  const dataNodeAnnualCost = 240000;
  const aiNodeAnnualCost = 450000;
  const bandwidthCostPerPB = 35000;
  const appNodePowerMw = 0.012;
  const dataNodePowerMw = 0.018;
  const aiNodePowerMw = 0.04;

  const landPurchase = acres * config.landPerAcre;
  const appNodesNeeded = Math.ceil(peakConcurrentUsers / appNodeConcurrentCapacity);
  const dataNodesNeeded = Math.ceil(peakConcurrentUsers / dataNodeConcurrentCapacity);
  const aiConcurrentUsers = peakConcurrentUsers * aiAssistShare;
  const aiNodesNeeded = Math.ceil(aiConcurrentUsers / aiNodeConcurrentCapacity);
  const annualSessions = globalUsers * sessionsPerUserYear;
  const annualPageLoads = annualSessions * pageLoadsPerSession;
  const annualDataEgressPB = annualSessions * mbPerSession / 1e9;
  const peakBandwidthTbps = peakConcurrentUsers * ((mbPerSession / avgSessionMinutes) * 8) / 60 / 1e6;
  const annualDigitalInfraCost =
    appNodesNeeded * appNodeAnnualCost +
    dataNodesNeeded * dataNodeAnnualCost +
    aiNodesNeeded * aiNodeAnnualCost +
    annualDataEgressPB * bandwidthCostPerPB;
  const digitalInfraPowerMw =
    appNodesNeeded * appNodePowerMw +
    dataNodesNeeded * dataNodePowerMw +
    aiNodesNeeded * aiNodePowerMw;

  const annualElectricity = (powerMw + digitalInfraPowerMw) * 8760 * 1000 * config.electricityRate;
  const annualLabor = staffCount * config.laborRate;
  const annualOperations = annualLabor * config.overheadMultiplier;
  const deviceDeploymentCapital = deviceCount * deviceUnitCost;
  const annualDeviceUpkeep = deviceCount * deviceMaintenance;
  const annualDeviceReplacementReserve = deviceServiceLife > 0
    ? deviceDeploymentCapital / deviceServiceLife
    : deviceDeploymentCapital;
  const annualCoreOperations = annualElectricity + annualLabor + annualOperations + annualDigitalInfraCost;
  const annualTotal = annualCoreOperations + annualDeviceUpkeep + annualDeviceReplacementReserve;
  const perpetualReserveTarget = reserveReturnRate > 0
    ? annualTotal / reserveReturnRate
    : annualTotal * reserveHorizonYears;
  const annualReserveContribution = getAnnualContributionForTarget(
    perpetualReserveTarget,
    reserveGrowthRate,
    reserveHorizonYears
  );
  const requiredAnnualRevenue = annualTotal + annualReserveContribution;
  const requiredProfitMargin = annualTotal > 0
    ? ((requiredAnnualRevenue - annualTotal) / annualTotal) * 100
    : 0;
  const annualLoadRevenue = annualPageLoads * pricePerLoad;
  const annualSessionRevenue = sessionPrice * sessionsPerDay * 365;
  const projectedAnnualRevenue = annualSessionRevenue + annualLoadRevenue + annualDonations;
  const annualSurplus = projectedAnnualRevenue - annualTotal;
  const investableSurplus = Math.max(0, annualSurplus);
  const assetRewardPool = annualLoadRevenue * assetRewardShare;
  const requiredRevenueFromSessions = Math.max(0, requiredAnnualRevenue - annualDonations);
  const requiredSessionPrice = sessionsPerDay > 0
    ? requiredRevenueFromSessions / (sessionsPerDay * 365)
    : 0;
  const requiredSessionsPerDay = sessionPrice > 0
    ? requiredRevenueFromSessions / (sessionPrice * 365)
    : 0;
  const yearsToPerpetuity = estimateYearsToTarget(
    perpetualReserveTarget,
    investableSurplus,
    reserveGrowthRate
  );
  const launchCapital = landPurchase + deviceDeploymentCapital + annualTotal;
  const marginGap = projectedAnnualRevenue - requiredAnnualRevenue;

  costResults.innerHTML = `
    <div class="cost-stat">
      <span>Launch capital target</span>
      <strong>${formatCurrency(launchCapital)}</strong>
    </div>
    <div class="cost-stat">
      <span>Ground device fleet</span>
      <strong>${deviceCount.toLocaleString()} deployed units</strong>
    </div>
    <div class="cost-stat">
      <span>Global user target</span>
      <strong>${formatCompactNumber(globalUsers)} people</strong>
    </div>
    <div class="cost-stat">
      <span>Peak concurrent load</span>
      <strong>${formatCompactNumber(peakConcurrentUsers)} live users</strong>
    </div>
    <div class="cost-stat">
      <span>Estimated app-serving nodes</span>
      <strong>${appNodesNeeded.toLocaleString()}</strong>
    </div>
    <div class="cost-stat">
      <span>Estimated data state nodes</span>
      <strong>${dataNodesNeeded.toLocaleString()}</strong>
    </div>
    <div class="cost-stat">
      <span>Estimated AI assist nodes</span>
      <strong>${aiNodesNeeded.toLocaleString()}</strong>
    </div>
    <div class="cost-stat">
      <span>Peak network throughput</span>
      <strong>${peakBandwidthTbps.toFixed(1)} Tbps</strong>
    </div>
    <div class="cost-stat">
      <span>Annual page loads</span>
      <strong>${formatCompactNumber(annualPageLoads)}</strong>
    </div>
    <div class="cost-stat">
      <span>Annual traffic volume</span>
      <strong>${annualDataEgressPB.toFixed(0)} PB</strong>
    </div>
    <div class="cost-stat">
      <span>Annual digital infrastructure cost</span>
      <strong>${formatCurrency(annualDigitalInfraCost)}</strong>
    </div>
    <div class="cost-stat">
      <span>Device deployment capital</span>
      <strong>${formatCurrency(deviceDeploymentCapital)}</strong>
    </div>
    <div class="cost-stat">
      <span>Annual device upkeep</span>
      <strong>${formatCurrency(annualDeviceUpkeep)}</strong>
    </div>
    <div class="cost-stat">
      <span>Annual device replacement reserve</span>
      <strong>${formatCurrency(annualDeviceReplacementReserve)}</strong>
    </div>
    <div class="cost-stat">
      <span>Annual campus operations</span>
      <strong>${formatCurrency(annualCoreOperations)}</strong>
    </div>
    <div class="cost-stat">
      <span>Extra digital power draw</span>
      <strong>${digitalInfraPowerMw.toFixed(0)} MW</strong>
    </div>
    <div class="cost-stat">
      <span>Annual operating cost</span>
      <strong>${formatCurrency(annualTotal)}</strong>
    </div>
    <div class="cost-stat">
      <span>Revenue needed each year</span>
      <strong>${formatCurrency(requiredAnnualRevenue)}</strong>
    </div>
    <div class="cost-stat">
      <span>Required surplus margin on ops</span>
      <strong>${formatPercent(requiredProfitMargin)}</strong>
    </div>
    <div class="cost-stat">
      <span>Projected annual session revenue</span>
      <strong>${formatCurrency(annualSessionRevenue)}</strong>
    </div>
    <div class="cost-stat">
      <span>Projected annual load revenue</span>
      <strong>${formatCurrency(annualLoadRevenue)}</strong>
    </div>
    <div class="cost-stat">
      <span>Annual asset reward pool</span>
      <strong>${formatCurrency(assetRewardPool)}</strong>
    </div>
    <div class="cost-stat">
      <span>Projected annual donations</span>
      <strong>${formatCurrency(annualDonations)}</strong>
    </div>
    <div class="cost-stat">
      <span>Required session price at current demand</span>
      <strong>${formatCurrency(requiredSessionPrice)}</strong>
    </div>
    <div class="cost-stat">
      <span>Required sessions per day at current price</span>
      <strong>${Math.ceil(requiredSessionsPerDay).toLocaleString()}</strong>
    </div>
    <div class="cost-stat">
      <span>100-year perpetual reserve target</span>
      <strong>${formatCurrency(perpetualReserveTarget)}</strong>
    </div>
    <div class="cost-stat">
      <span>Annual reserve contribution needed</span>
      <strong>${formatCurrency(annualReserveContribution)}</strong>
    </div>
    <div class="cost-stat">
      <span>Projected annual surplus</span>
      <strong>${formatCurrency(annualSurplus)}</strong>
    </div>
    <div class="cost-stat">
      <span>Path to forever</span>
      <strong>${yearsToPerpetuity === Infinity ? 'Not funded yet' : `${yearsToPerpetuity} years to endowment`}</strong>
    </div>
    <p class="muted-text">This assumes a central ${config.label} site, a ${deviceCount.toLocaleString()}-device embedded ground fleet, ${formatCompactNumber(globalUsers)} total users, ${formatCompactNumber(peakConcurrentUsers)} concurrent humans at peak, ${sessionsPerUserYear} sessions per user per year, ${pageLoadsPerSession} paid page loads per session at ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(pricePerLoad)} each, ${mbPerSession} MB per session, an asset contributor reward share of ${formatPercent(assetRewardShare * 100)}, paid timed sessions as the core revenue engine, donations as launch acceleration, a ${formatPercent((reserveReturnRate || 0) * 100)} reserve payout rate after year 100, and ${formatPercent((reserveGrowthRate || 0) * 100)} reserve growth during the first century.</p>
    <p class="muted-text">${marginGap >= 0
      ? `Current pricing clears the century reserve requirement by ${formatCurrency(marginGap)} per year and can keep compounding toward permanent autonomy for both the campus and the field-device network.`
      : `Current pricing is short by ${formatCurrency(Math.abs(marginGap))} per year. Increase timed-session revenue or donations until the reserve contribution clears the 100-year perpetuity threshold for the campus and the field-device network.`}
    </p>
    <p class="muted-text">If all ${formatCompactNumber(globalUsers)} targeted users ever became concurrent at once, the serving, state, AI, power, and bandwidth layers would all need to scale by roughly ${(globalUsers / Math.max(1, peakConcurrentUsers)).toFixed(1)}x from the current peak-concurrency assumption.</p>
  `;
}

[locationSelect, landAcresInput, powerDemandInput, staffCountInput, deviceCountInput, deviceUnitCostInput, deviceMaintenanceInput, deviceServiceLifeInput, pricePerLoadInput, pageLoadsPerSessionInput, assetRewardShareInput, globalUsersInput, peakConcurrentUsersInput, sessionsPerUserYearInput, avgSessionMinutesInput, mbPerSessionInput, sessionPriceInput, sessionsPerDayInput, annualDonationsInput, reserveReturnInput, reserveGrowthInput].forEach((element) => {
  if (element) {
    element.addEventListener('input', renderCostEstimate);
    element.addEventListener('change', renderCostEstimate);
  }
});

if (calculateCostButton) calculateCostButton.addEventListener('click', renderCostEstimate);

const regionData = {
  northAmerica: {
    label: 'North America',
    description: 'High production capacity and advanced automation. Focus on food, energy, and transport efficiency.',
    stats: {
      calories: '142B',
      water: '2.3B',
      housing: '24M',
      energy: '410B',
    },
    homes: [
      {id: 'NA-001', name: 'Home 1', usage: {calories: '2.5M', water: '82k', energy: '14k', materials: '1.0', robotization: '73%'}},
      {id: 'NA-002', name: 'Home 2', usage: {calories: '2.1M', water: '70k', energy: '11k', materials: '0.8', robotization: '65%'}},
      {id: 'NA-003', name: 'Home 3', usage: {calories: '2.9M', water: '94k', energy: '17k', materials: '1.2', robotization: '80%'}},
    ],
  },
  southAmerica: {
    label: 'South America',
    description: 'Growing production, strong food resources, and expanding water infrastructure.',
    stats: {
      calories: '68B',
      water: '1.1B',
      housing: '13M',
      energy: '190B',
    },
    homes: [
      {id: 'SA-101', name: 'Home 101', usage: {calories: '2.0M', water: '72k', energy: '9k', materials: '0.7', robotization: '55%'}},
      {id: 'SA-102', name: 'Home 102', usage: {calories: '2.2M', water: '77k', energy: '10k', materials: '0.8', robotization: '60%'}},
    ],
  },
  europe: {
    label: 'Europe',
    description: 'Efficient industries with strong housing and energy management. Home usage is tightly monitored.',
    stats: {
      calories: '95B',
      water: '1.8B',
      housing: '18M',
      energy: '285B',
    },
    homes: [
      {id: 'EU-201', name: 'Home 201', usage: {calories: '2.3M', water: '74k', energy: '12k', materials: '0.9', robotization: '68%'}},
      {id: 'EU-202', name: 'Home 202', usage: {calories: '2.6M', water: '81k', energy: '14k', materials: '1.0', robotization: '72%'}},
    ],
  },
  africa: {
    label: 'Africa',
    description: 'Rapid infrastructure growth. The scheduler tracks water and food access to keep supply stable.',
    stats: {
      calories: '54B',
      water: '1.4B',
      housing: '12M',
      energy: '135B',
    },
    homes: [
      {id: 'AF-301', name: 'Home 301', usage: {calories: '1.9M', water: '68k', energy: '8k', materials: '0.6', robotization: '48%'}},
      {id: 'AF-302', name: 'Home 302', usage: {calories: '2.1M', water: '71k', energy: '9k', materials: '0.7', robotization: '52%'}},
    ],
  },
  asia: {
    label: 'Asia',
    description: 'The largest region with huge manufacturing capacity. Focus on supply chains, energy, and automation scaling.',
    stats: {
      calories: '188B',
      water: '3.6B',
      housing: '38M',
      energy: '620B',
    },
    homes: [
      {id: 'AS-401', name: 'Home 401', usage: {calories: '2.8M', water: '88k', energy: '16k', materials: '1.2', robotization: '79%'}},
      {id: 'AS-402', name: 'Home 402', usage: {calories: '2.4M', water: '80k', energy: '13k', materials: '1.0', robotization: '74%'}},
    ],
  },
  oceania: {
    label: 'Oceania',
    description: 'High quality-of-life region with strong energy and housing infrastructure.',
    stats: {
      calories: '24B',
      water: '580M',
      housing: '5M',
      energy: '92B',
    },
    homes: [
      {id: 'OC-501', name: 'Home 501', usage: {calories: '2.2M', water: '75k', energy: '11k', materials: '0.9', robotization: '70%'}},
    ],
  },
};

let selectedRegionKey = null;
let selectedHomeId = null;

const regionButtons = document.querySelectorAll('.region-dot');
const regionDetails = document.getElementById('selected-region');
const homeListContainer = document.getElementById('home-list');
const homeDetailsContainer = document.getElementById('home-details');
const zoomHomeButton = document.getElementById('zoom-home-button');

const worldSceneContainer = document.getElementById('world-scene');
const worldStatus = document.getElementById('world-status');
const detailModeButtons = document.querySelectorAll('.detail-mode');

const worldModeConfig = {
  macro: { label: 'Macro', ratio: '0.00-0.33', cameraZ: 7 },
  micro: { label: 'Micro', ratio: '0.34-0.66', cameraZ: 5 },
  nano: { label: 'Nano', ratio: '0.67-1.00', cameraZ: 3.2 },
};

const worldAnchorConfig = {
  // Positions computed for 1.8-radius sphere: x=R·cos(lat)·cos(lng), y=R·sin(lat), z=R·cos(lat)·sin(lng)
  northAmerica: { color: 0x38bdf8, lat: 40,  lng: -100 },
  southAmerica: { color: 0x22c55e, lat: -15, lng: -60 },
  europe:       { color: 0xf59e0b, lat: 50,  lng: 10 },
  africa:       { color: 0xf43f5e, lat: 0,   lng: 25 },
  asia:         { color: 0xa78bfa, lat: 35,  lng: 100 },
  oceania:      { color: 0x2dd4bf, lat: -25, lng: 135 },
};

function latLngToVec3(lat, lng, radius = 1.88) {
  const phi = (90 - lat) * (Math.PI / 180);  // polar angle from top
  const theta = lng * (Math.PI / 180);
  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

const worldSceneState = {
  nodes: new Map(),
  objectsByNodeId: new Map(),
  selectableByMode: {
    macro: [],
    micro: [],
    nano: [],
  },
  regionGroups: {
    micro: new Map(),
    nano: new Map(),
  },
  macroGroup: null,
  selectedNodeId: null,
  hoveredNodeId: null,
  pointerDown: false,
  pointerTravel: 0,
  lastPointerX: 0,
  lastPointerY: 0,
  undoStack: [],
  redoStack: [],
  isolatedNodeId: null,
  originalPositions: new Map(),
  cameraTarget: null,
};

let worldScene;
let worldCamera;
let worldRenderer;
let worldEarth;
let worldAtmosphere;
let selectedWorldRegion = null;
let activeDetailMode = 'macro';
let activePrimMode = 'all';
let scenarioCompareSet = [];

function createWorldNode(node) {
  return {
    children: [],
    metrics: {},
    ...node,
  };
}

function addWorldNode(node) {
  worldSceneState.nodes.set(node.id, createWorldNode(node));
}

function linkWorldNodes(parentId, childId) {
  const parent = worldSceneState.nodes.get(parentId);
  if (!parent) return;
  parent.children.push(childId);
}

function getModeForNodeType(type) {
  if (['planet', 'region', 'zone'].includes(type)) return 'macro';
  if (['building', 'room', 'window', 'panel'].includes(type)) return 'micro';
  return 'nano';
}

function getWorldNode(nodeId) {
  return worldSceneState.nodes.get(nodeId) || null;
}

function getWorldNodePath(nodeId) {
  const path = [];
  let currentNode = getWorldNode(nodeId);

  while (currentNode) {
    path.unshift(currentNode);
    currentNode = currentNode.parentId ? getWorldNode(currentNode.parentId) : null;
  }

  return path;
}

function getWorldNodePathLabel(nodeId) {
  return getWorldNodePath(nodeId).map((node) => node.label).join(' / ');
}

function getFirstDescendantForMode(nodeId, mode) {
  const node = getWorldNode(nodeId);
  if (!node) return null;

  for (const childId of node.children) {
    const child = getWorldNode(childId);
    if (!child) continue;
    if (getModeForNodeType(child.type) === mode) return child;
    const descendant = getFirstDescendantForMode(childId, mode);
    if (descendant) return descendant;
  }

  return null;
}

function getBestNodeForMode(nodeId, mode) {
  const path = getWorldNodePath(nodeId).reverse();
  const ancestorMatch = path.find((node) => getModeForNodeType(node.type) === mode);
  if (ancestorMatch) return ancestorMatch;

  return getFirstDescendantForMode(nodeId, mode);
}

function findAncestorNodeByType(nodeId, type) {
  return getWorldNodePath(nodeId).find((node) => node.type === type) || null;
}

function buildWorldHierarchy() {
  worldSceneState.nodes.clear();

  addWorldNode({
    id: 'planet:earth',
    type: 'planet',
    label: 'Planet Earth',
    description: 'Top-level world graph root for the World Scheduler preview.',
    metrics: {
      'Selection depth': 'Planet root',
      'Planning scope': 'Global',
      'Data role': 'Parent of all regions and components',
    },
  });

  Object.entries(regionData).forEach(([regionKey, region]) => {
    const color = `#${worldAnchorConfig[regionKey].color.toString(16).padStart(6, '0')}`;
    const regionId = `region:${regionKey}`;
    const zoneId = `zone:${regionKey}:core`;
    const buildingId = `building:${regionKey}:campus`;
    const roomId = `room:${regionKey}:planning-room`;
    const windowId = `window:${regionKey}:analysis-window`;
    const panelId = `panel:${regionKey}:outer-panel`;
    const surfaceId = `surface:${regionKey}:planning-surface`;

    addWorldNode({
      id: regionId,
      type: 'region',
      label: region.label,
      parentId: 'planet:earth',
      regionKey,
      description: region.description,
      metrics: {
        'Calories supply': `${region.stats.calories} calories`,
        'Water supply': `${region.stats.water} liters`,
        'Housing supply': `${region.stats.housing} sqm`,
        'Energy supply': `${region.stats.energy} kWh`,
        Color: color,
      },
    });
    linkWorldNodes('planet:earth', regionId);

    addWorldNode({
      id: zoneId,
      type: 'zone',
      label: `${region.label} Core Zone`,
      parentId: regionId,
      regionKey,
      description: 'Regional operating zone that groups district-scale infrastructure and policy decisions.',
      metrics: {
        'Structural type': 'District planning zone',
        'Resource bias': 'Energy, housing, automation',
        'Impact data': 'Aggregated from region and building layers',
      },
    });
    linkWorldNodes(regionId, zoneId);

    addWorldNode({
      id: buildingId,
      type: 'building',
      label: `${region.label} Planning Campus`,
      parentId: zoneId,
      regionKey,
      description: 'Representative planning building used to bridge region-scale systems into editable architecture.',
      metrics: {
        'Material class': 'Steel, concrete, energy glass',
        'Capex model': '$48M - $62M',
        'Impact score': 'High leverage, low waste',
      },
    });
    linkWorldNodes(zoneId, buildingId);

    addWorldNode({
      id: roomId,
      type: 'room',
      label: 'Operations Room',
      parentId: buildingId,
      regionKey,
      description: 'Micro planning room where regional models translate into actual occupancy and usage patterns.',
      metrics: {
        'Function': 'Operations, review, scheduling',
        'Size': '18m x 12m x 4m',
        'Planning class': 'Human coordination',
      },
    });
    linkWorldNodes(buildingId, roomId);

    addWorldNode({
      id: windowId,
      type: 'window',
      label: 'Observation Window',
      parentId: roomId,
      regionKey,
      description: 'Window assembly used to bridge rooms to exterior surfaces and panel-level accounting.',
      metrics: {
        'Frame type': 'Thermal composite frame',
        'Span': '3.2m x 2.1m',
        'Maintenance load': 'Quarterly review',
      },
    });
    linkWorldNodes(roomId, windowId);

    addWorldNode({
      id: panelId,
      type: 'panel',
      label: 'Panel Array',
      parentId: windowId,
      regionKey,
      description: 'Micro component layer where individual surfaces start carrying editable material and cost data.',
      metrics: {
        'Panel type': 'Multi-layer impact glass',
        'Material': 'Glass / alloy / sealant',
        'Lifecycle cost': '$1,840 per panel',
      },
    });
    linkWorldNodes(windowId, panelId);

    addWorldNode({
      id: surfaceId,
      type: 'surface',
      label: 'Surface Sheet',
      parentId: panelId,
      regionKey,
      description: 'Nano entry point for topology-aware editing.',
      metrics: {
        'Editable topology': 'Faces, edges, vertices',
        Thickness: '18mm',
        'Planning role': 'Thermal envelope component',
      },
    });
    linkWorldNodes(panelId, surfaceId);

    [
      { id: `face:${regionKey}:a`, label: 'Face A', area: '0.42 sqm' },
      { id: `face:${regionKey}:b`, label: 'Face B', area: '0.42 sqm' },
    ].forEach((face) => {
      addWorldNode({
        id: face.id,
        type: 'face',
        label: face.label,
        parentId: surfaceId,
        regionKey,
        description: 'Triangulated face used for nano-level surface planning and topology inspection.',
        metrics: {
          Area: face.area,
          Material: 'Tempered glass laminate',
          'Heat impact': 'Moderate',
        },
      });
      linkWorldNodes(surfaceId, face.id);
    });

    ['Top Edge', 'Right Edge', 'Bottom Edge', 'Left Edge'].forEach((label, index) => {
      const edgeId = `edge:${regionKey}:${index + 1}`;
      addWorldNode({
        id: edgeId,
        type: 'edge',
        label,
        parentId: surfaceId,
        regionKey,
        description: 'Edge segment carrying seam, joint, and stress metadata.',
        metrics: {
          Length: index % 2 === 0 ? '1.4m' : '0.6m',
          'Joint class': 'Sealed structural seam',
          'Repair priority': 'Medium',
        },
      });
      linkWorldNodes(surfaceId, edgeId);
    });

    ['Vertex NW', 'Vertex NE', 'Vertex SE', 'Vertex SW'].forEach((label, index) => {
      const vertexId = `vertex:${regionKey}:${index + 1}`;
      addWorldNode({
        id: vertexId,
        type: 'vertex',
        label,
        parentId: surfaceId,
        regionKey,
        description: 'Vertex primitive used for the smallest editable planning anchor in the preview.',
        metrics: {
          Coordinate: ['(-0.7, 0.3)', '(0.7, 0.3)', '(0.7, -0.3)', '(-0.7, -0.3)'][index],
          'Tolerance band': '1.5mm',
          'Selection class': 'Nano primitive',
        },
      });
      linkWorldNodes(surfaceId, vertexId);
    });
  });
}

function registerSelectable(object, nodeId, modes) {
  object.userData.nodeId = nodeId;
  object.userData.baseScale = object.scale.clone();
  object.userData.baseColor = object.material?.color?.clone?.() || null;
  object.userData.baseEmissive = object.material?.emissive?.clone?.() || null;
  object.userData.baseEmissiveIntensity = object.material?.emissiveIntensity ?? null;
  object.userData.baseOpacity = object.material?.opacity ?? null;

  const existingObjects = worldSceneState.objectsByNodeId.get(nodeId) || [];
  existingObjects.push(object);
  worldSceneState.objectsByNodeId.set(nodeId, existingObjects);

  if (nodeId.startsWith('vertex:') && !worldSceneState.originalPositions.has(nodeId)) {
    worldSceneState.originalPositions.set(nodeId, object.position.clone());
  }

  modes.forEach((mode) => {
    worldSceneState.selectableByMode[mode].push(object);
  });
}

function createTriangleMesh(points, color) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3));
  geometry.computeVertexNormals();

  return new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.12,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
    })
  );
}

function buildWorldSceneLayers() {
  worldSceneState.macroGroup = new THREE.Group();

  Object.entries(worldAnchorConfig).forEach(([regionKey, anchor]) => {
    const pos = latLngToVec3(anchor.lat, anchor.lng, 1.88);
    const regionMarker = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.12, 0),
      new THREE.MeshStandardMaterial({
        color: anchor.color,
        emissive: anchor.color,
        emissiveIntensity: 0.5,
      })
    );
    regionMarker.position.set(...pos);
    registerSelectable(regionMarker, `region:${regionKey}`, ['macro']);
    worldSceneState.macroGroup.add(regionMarker);

    // Glowing ring around marker
    const ringGeom = new THREE.TorusGeometry(0.16, 0.02, 8, 24);
    const ring = new THREE.Mesh(ringGeom, new THREE.MeshBasicMaterial({ color: anchor.color, transparent: true, opacity: 0.6 }));
    ring.position.set(...pos);
    ring.lookAt(new THREE.Vector3(0, 0, 0));
    worldSceneState.macroGroup.add(ring);

    // Column rising from surface
    const columnPos = latLngToVec3(anchor.lat, anchor.lng, 1.88);
    const columnDir = new THREE.Vector3(...columnPos).normalize();
    const zoneColumn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.05, 0.25, 12),
      new THREE.MeshStandardMaterial({
        color: anchor.color,
        emissive: anchor.color,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.7,
      })
    );
    const colOuter = new THREE.Vector3(...columnPos).addScaledVector(columnDir, 0.15);
    zoneColumn.position.copy(colOuter);
    zoneColumn.lookAt(new THREE.Vector3(0, 0, 0));
    zoneColumn.rotateX(Math.PI / 2);
    registerSelectable(zoneColumn, `zone:${regionKey}:core`, ['macro']);
    worldSceneState.macroGroup.add(zoneColumn);

    const microGroup = new THREE.Group();
    microGroup.visible = false;

    const building = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.1, 1),
      new THREE.MeshStandardMaterial({ color: anchor.color, emissive: anchor.color, emissiveIntensity: 0.12 })
    );
    building.position.set(0, -0.05, 0);
    registerSelectable(building, `building:${regionKey}:campus`, ['micro']);
    microGroup.add(building);

    const room = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.7, 0.72),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: anchor.color,
        emissiveIntensity: 0.08,
        transparent: true,
        opacity: 0.7,
      })
    );
    room.position.set(0, 0.05, 0.18);
    registerSelectable(room, `room:${regionKey}:planning-room`, ['micro']);
    microGroup.add(room);

    const windowFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.58, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, emissive: anchor.color, emissiveIntensity: 0.06 })
    );
    windowFrame.position.set(0, 0.05, 0.58);
    registerSelectable(windowFrame, `window:${regionKey}:analysis-window`, ['micro']);
    microGroup.add(windowFrame);

    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 0.4, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x93c5fd, emissive: anchor.color, emissiveIntensity: 0.06 })
    );
    panel.position.set(0, 0.05, 0.66);
    registerSelectable(panel, `panel:${regionKey}:outer-panel`, ['micro']);
    microGroup.add(panel);

    worldSceneState.regionGroups.micro.set(regionKey, microGroup);
    worldScene.add(microGroup);

    const nanoGroup = new THREE.Group();
    nanoGroup.visible = false;

    const surface = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 0.6),
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        emissive: anchor.color,
        emissiveIntensity: 0.08,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
      })
    );
    registerSelectable(surface, `surface:${regionKey}:planning-surface`, ['nano']);
    nanoGroup.add(surface);

    const faceA = createTriangleMesh([
      [-0.7, 0.3, 0.02],
      [0.7, 0.3, 0.02],
      [-0.7, -0.3, 0.02],
    ], anchor.color);
    registerSelectable(faceA, `face:${regionKey}:a`, ['nano']);
    nanoGroup.add(faceA);

    const faceB = createTriangleMesh([
      [0.7, 0.3, 0.02],
      [0.7, -0.3, 0.02],
      [-0.7, -0.3, 0.02],
    ], 0xffffff);
    registerSelectable(faceB, `face:${regionKey}:b`, ['nano']);
    nanoGroup.add(faceB);

    [
      { id: 1, x: 0, y: 0.3, width: 1.4, height: 0.04 },
      { id: 2, x: 0.7, y: 0, width: 0.04, height: 0.6 },
      { id: 3, x: 0, y: -0.3, width: 1.4, height: 0.04 },
      { id: 4, x: -0.7, y: 0, width: 0.04, height: 0.6 },
    ].forEach((edge) => {
      const edgeMesh = new THREE.Mesh(
        new THREE.BoxGeometry(edge.width, edge.height, 0.03),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, emissive: anchor.color, emissiveIntensity: 0.08 })
      );
      edgeMesh.position.set(edge.x, edge.y, 0.04);
      registerSelectable(edgeMesh, `edge:${regionKey}:${edge.id}`, ['nano']);
      nanoGroup.add(edgeMesh);
    });

    [
      { id: 1, x: -0.7, y: 0.3 },
      { id: 2, x: 0.7, y: 0.3 },
      { id: 3, x: 0.7, y: -0.3 },
      { id: 4, x: -0.7, y: -0.3 },
    ].forEach((vertex) => {
      const vertexMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 18, 18),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, emissive: anchor.color, emissiveIntensity: 0.12 })
      );
      vertexMesh.position.set(vertex.x, vertex.y, 0.06);
      registerSelectable(vertexMesh, `vertex:${regionKey}:${vertex.id}`, ['nano']);
      nanoGroup.add(vertexMesh);
    });

    worldSceneState.regionGroups.nano.set(regionKey, nanoGroup);
    worldScene.add(nanoGroup);
  });

  worldScene.add(worldSceneState.macroGroup);
}

function setNodeHighlight(nodeId, isSelected) {
  const objects = worldSceneState.objectsByNodeId.get(nodeId) || [];
  const primType = (nodeId || '').split(':')[0];
  const selectColor = primType === 'face' ? new THREE.Color(0x38bdf8)
    : primType === 'edge' ? new THREE.Color(0xfbbf24)
    : primType === 'vertex' ? new THREE.Color(0x4ade80)
    : new THREE.Color(0xffffff);

  objects.forEach((object) => {
    if (object.userData.baseScale) {
      object.scale.copy(object.userData.baseScale).multiplyScalar(isSelected ? 1.12 : 1);
    }

    if (object.material?.color && object.userData.baseColor) {
      object.material.color.copy(isSelected ? selectColor : object.userData.baseColor);
    }

    if (object.material?.emissive && object.userData.baseEmissive) {
      object.material.emissive.copy(object.userData.baseEmissive);
    }

    if (object.material && object.userData.baseEmissiveIntensity !== null) {
      object.material.emissiveIntensity = isSelected ? 0.55 : object.userData.baseEmissiveIntensity;
    }

    if (object.material && object.userData.baseOpacity !== null && object.material.transparent) {
      object.material.opacity = isSelected ? Math.min(1, object.userData.baseOpacity + 0.12) : object.userData.baseOpacity;
    }
  });
}

function highlightSelectedWorldNode(nodeId) {
  worldSceneState.objectsByNodeId.forEach((_, id) => setNodeHighlight(id, id === nodeId));
}

function getActiveSelectableObjects() {
  return worldSceneState.selectableByMode[activeDetailMode].filter((object) => {
    let currentObject = object;
    while (currentObject) {
      if (!currentObject.visible) return false;
      currentObject = currentObject.parent;
    }
    if (activeDetailMode === 'nano' && activePrimMode !== 'all') {
      const primType = (object.userData.nodeId || '').split(':')[0];
      if (primType !== activePrimMode) return false;
    }
    return true;
  });
}

function updateWorldStatus(hoverNodeId = null) {
  const statusNodeId = hoverNodeId || worldSceneState.selectedNodeId;
  const mode = worldModeConfig[activeDetailMode];

  if (!statusNodeId) {
    worldStatus.textContent = `Select a region to inspect the world layer.`;
    return;
  }

  const node = getWorldNode(statusNodeId);
  const prefix = hoverNodeId ? 'Hover' : 'Selected';
  worldStatus.textContent = `${prefix}: ${getWorldNodePathLabel(statusNodeId)} • ${mode.label} ratio ${mode.ratio}`;
}

function syncFocusedRegionGroups() {
  const regionKey = selectedWorldRegion || 'northAmerica';

  worldEarth.visible = activeDetailMode === 'macro';
  worldAtmosphere.visible = activeDetailMode === 'macro';
  worldSceneState.macroGroup.visible = activeDetailMode === 'macro';

  worldSceneState.regionGroups.micro.forEach((group, key) => {
    group.visible = activeDetailMode === 'micro' && key === regionKey;
  });

  worldSceneState.regionGroups.nano.forEach((group, key) => {
    group.visible = activeDetailMode === 'nano' && key === regionKey;
  });

  const targetZ = worldModeConfig[activeDetailMode].cameraZ;
  worldSceneState.cameraTarget = new THREE.Vector3(0, 0, targetZ);
  worldCamera.lookAt(0, 0, 0);
}

function setActiveDetailMode(mode) {
  const bestNode = worldSceneState.selectedNodeId ? getBestNodeForMode(worldSceneState.selectedNodeId, mode) : null;
  activeDetailMode = mode;
  detailModeButtons.forEach((button) => button.classList.toggle('active', button.dataset.mode === mode));
  if (bestNode && bestNode.id !== worldSceneState.selectedNodeId) {
    worldSceneState.selectedNodeId = bestNode.id;
    const regionNode = findAncestorNodeByType(bestNode.id, 'region') || bestNode;
    selectedWorldRegion = regionNode.regionKey || selectedWorldRegion;
    highlightSelectedWorldNode(bestNode.id);
    updateRegionSelection(selectedWorldRegion, bestNode.id);
    renderSelectionBranch(bestNode.id);
  }
  syncFocusedRegionGroups();
  updateWorldStatus();
  updateWorldActionButton();
  if (nanoToolbar) nanoToolbar.hidden = mode !== 'nano';
  if (mode !== 'nano' && vertexEditorPanel) vertexEditorPanel.hidden = true;
  if (mode !== 'nano') exitIsolate();
}

function renderSelectionBranch(nodeId) {
  const node = getWorldNode(nodeId);
  if (!node) return;

  const childrenMarkup = node.children.length
    ? node.children.map((childId) => {
        const child = getWorldNode(childId);
        return `
          <div class="home-card" data-world-node="${child.id}">
            <strong>${child.label}</strong>
            <div class="muted-text">${child.type.toUpperCase()} • ${child.description}</div>
          </div>
        `;
      }).join('')
    : '<p class="muted-text">No deeper children at this node yet. This is the current leaf in the preview.</p>';

  homeDetailsContainer.innerHTML = `
    <h3>Selection branch</h3>
    <p><strong>Path:</strong> ${getWorldNodePathLabel(nodeId)}</p>
    <p class="muted-text">Each selected node retains its full ancestry, so panels, surfaces, faces, edges, and vertices always know their parent window, room, building, and region.</p>
    ${childrenMarkup}
  `;

  homeDetailsContainer.querySelectorAll('[data-world-node]').forEach((card) => {
    card.addEventListener('click', () => {
      const childNode = getWorldNode(card.dataset.worldNode);
      if (!childNode) return;
      setActiveDetailMode(getModeForNodeType(childNode.type));
      selectWorldNode(childNode.id);
    });
  });
}

function updateWorldActionButton() {
  const selectedNode = getWorldNode(worldSceneState.selectedNodeId);
  if (!selectedNode) {
    zoomHomeButton.textContent = 'Show regional usage samples';
    return;
  }

  if (!selectedNode.children.length) {
    zoomHomeButton.textContent = 'Show regional usage samples';
    return;
  }

  const nextNode = getWorldNode(selectedNode.children[0]);
  zoomHomeButton.textContent = `Focus next layer: ${nextNode.label}`;
}

function renderVertexEditor(nodeId) {
  if (!vertexEditorPanel || !vertexEditorContent) return;
  if (!nodeId || !nodeId.startsWith('vertex:') || activeDetailMode !== 'nano') {
    vertexEditorPanel.hidden = true;
    return;
  }
  const objects = worldSceneState.objectsByNodeId.get(nodeId) || [];
  const mesh = objects[0];
  if (!mesh) { vertexEditorPanel.hidden = true; return; }
  const pos = mesh.position;
  const node = getWorldNode(nodeId);
  const metaLine = node?.metrics ? Object.entries(node.metrics).map(([k, v]) => `${k}: ${v}`).join(' · ') : '';
  vertexEditorContent.innerHTML = `
    <p class="muted-text" style="margin:0 0 0.65rem;font-size:0.86rem">${getWorldNodePathLabel(nodeId)}</p>
    <div class="field-row">
      <label>X</label>
      <input type="number" id="vertex-x" step="0.05" value="${pos.x.toFixed(3)}" />
    </div>
    <div class="field-row">
      <label>Y</label>
      <input type="number" id="vertex-y" step="0.05" value="${pos.y.toFixed(3)}" />
    </div>
    <div class="field-row">
      <label>Z</label>
      <input type="number" id="vertex-z" step="0.05" value="${pos.z.toFixed(3)}" />
    </div>
    <div style="display:flex;gap:0.5rem">
      <button type="button" id="apply-vertex" class="button secondary" style="flex:1;padding:0.6rem 0.9rem">Apply</button>
      <button type="button" id="reset-vertex" class="button ghost" style="flex:1;padding:0.6rem 0.9rem">Reset</button>
    </div>
    ${metaLine ? `<p class="muted-text" style="margin:0.55rem 0 0;font-size:0.82rem">${metaLine}</p>` : ''}
  `;
  vertexEditorPanel.hidden = false;
  document.getElementById('apply-vertex').addEventListener('click', () => {
    applyVertexMove(nodeId, mesh,
      Number(document.getElementById('vertex-x').value),
      Number(document.getElementById('vertex-y').value),
      Number(document.getElementById('vertex-z').value)
    );
  });
  document.getElementById('reset-vertex').addEventListener('click', () => {
    const orig = worldSceneState.originalPositions.get(nodeId);
    if (orig) applyVertexMove(nodeId, mesh, orig.x, orig.y, orig.z);
  });
}

function applyVertexMove(nodeId, mesh, x, y, z) {
  worldSceneState.undoStack.push({ nodeId, position: mesh.position.clone() });
  worldSceneState.redoStack = [];
  mesh.position.set(x, y, z);
  updateUndoRedoButtons();
  renderVertexEditor(nodeId);
}

function updateUndoRedoButtons() {
  if (worldUndoButton) worldUndoButton.disabled = worldSceneState.undoStack.length === 0;
  if (worldRedoButton) worldRedoButton.disabled = worldSceneState.redoStack.length === 0;
}

function performUndo() {
  const entry = worldSceneState.undoStack.pop();
  if (!entry) return;
  const objects = worldSceneState.objectsByNodeId.get(entry.nodeId) || [];
  const mesh = objects[0];
  if (!mesh) return;
  worldSceneState.redoStack.push({ nodeId: entry.nodeId, position: mesh.position.clone() });
  mesh.position.copy(entry.position);
  updateUndoRedoButtons();
  if (worldSceneState.selectedNodeId === entry.nodeId) renderVertexEditor(entry.nodeId);
}

function performRedo() {
  const entry = worldSceneState.redoStack.pop();
  if (!entry) return;
  const objects = worldSceneState.objectsByNodeId.get(entry.nodeId) || [];
  const mesh = objects[0];
  if (!mesh) return;
  worldSceneState.undoStack.push({ nodeId: entry.nodeId, position: mesh.position.clone() });
  mesh.position.copy(entry.position);
  updateUndoRedoButtons();
  if (worldSceneState.selectedNodeId === entry.nodeId) renderVertexEditor(entry.nodeId);
}

function isolateWorldNode(nodeId) {
  worldSceneState.isolatedNodeId = nodeId;
  worldSceneState.objectsByNodeId.forEach((objects, id) => {
    objects.forEach((obj) => { obj.visible = id === nodeId; });
  });
  if (worldIsolateButton) worldIsolateButton.hidden = true;
  if (worldIsolateExitButton) worldIsolateExitButton.hidden = false;
}

function exitIsolate() {
  if (!worldSceneState.isolatedNodeId) return;
  worldSceneState.isolatedNodeId = null;
  worldSceneState.objectsByNodeId.forEach((objects) => {
    objects.forEach((obj) => { obj.visible = true; });
  });
  if (worldIsolateButton) worldIsolateButton.hidden = false;
  if (worldIsolateExitButton) worldIsolateExitButton.hidden = true;
}

function selectWorldNode(nodeId) {
  const node = getWorldNode(nodeId);
  if (!node) return;

  const regionNode = findAncestorNodeByType(nodeId, 'region') || node;
  selectedWorldRegion = regionNode.regionKey || selectedWorldRegion;
  worldSceneState.selectedNodeId = nodeId;

  highlightSelectedWorldNode(nodeId);
  updateRegionSelection(selectedWorldRegion, nodeId);
  renderSelectionBranch(nodeId);
  syncFocusedRegionGroups();
  updateWorldStatus();
  updateWorldActionButton();
  renderVertexEditor(nodeId);
}

// ── Procedural Earth texture generator ─────────────────────────
function generateProceduralEarthTexture(size = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = size * 2;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Ocean base — deep blue
  const oceanGrad = ctx.createRadialGradient(size, size * 0.5, size * 0.1, size, size * 0.5, size * 1.3);
  oceanGrad.addColorStop(0, '#1a3a5c');
  oceanGrad.addColorStop(0.5, '#0d2847');
  oceanGrad.addColorStop(1, '#061627');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, size * 2, size);

  // Simple noise-based landmasses
  const imageData = ctx.getImageData(0, 0, size * 2, size);
  const data = imageData.data;

  // Pseudo-random landmass generator (deterministic-ish)
  const hash = (x, y) => {
    let h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return h - Math.floor(h);
  };

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size * 2; px++) {
      const i = (py * size * 2 + px) * 4;
      const nx = px / (size * 2);
      const ny = py / size;
      const lon = nx * Math.PI * 2;
      const lat = ny * Math.PI;

      // Simplified continent shapes
      let land = 0;
      // North America
      land += Math.max(0, 1 - Math.hypot((nx - 0.22) * 4.5, (ny - 0.30) * 4.0)) * 0.8;
      land += Math.max(0, 1 - Math.hypot((nx - 0.18) * 3.8, (ny - 0.38) * 3.5)) * 0.5;
      // South America
      land += Math.max(0, 1 - Math.hypot((nx - 0.25) * 5.5, (ny - 0.65) * 4.5)) * 0.7;
      // Europe
      land += Math.max(0, 1 - Math.hypot((nx - 0.48) * 5.0, (ny - 0.28) * 3.5)) * 0.6;
      // Africa
      land += Math.max(0, 1 - Math.hypot((nx - 0.50) * 4.0, (ny - 0.58) * 3.0)) * 0.75;
      // Asia
      land += Math.max(0, 1 - Math.hypot((nx - 0.62) * 3.0, (ny - 0.35) * 2.8)) * 0.7;
      land += Math.max(0, 1 - Math.hypot((nx - 0.70) * 4.5, (ny - 0.45) * 3.2)) * 0.5;
      // Australia
      land += Math.max(0, 1 - Math.hypot((nx - 0.78) * 8.0, (ny - 0.72) * 7.0)) * 0.65;
      // Noise
      land += (hash(px * 0.7, py * 0.7) - 0.5) * 0.25;

      const isLand = land > 0.35;

      if (isLand) {
        const shade = 0.6 + land * 0.5 + hash(px, py) * 0.15;
        // Green-brown land
        const r = Math.floor(60 * shade);
        const g = Math.floor(110 * shade);
        const b = Math.floor(40 * shade);
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      } else {
        // Already ocean blue from base fill
        // Add subtle ocean variation
        const variation = (hash(px * 0.5, py * 0.5) - 0.5) * 15;
        data[i] = Math.max(0, data[i] + variation);
        data[i + 1] = Math.max(0, data[i + 1] + variation);
        data[i + 2] = Math.max(0, data[i + 2] + variation);
      }
    }
  }

  // Cloud wisps
  ctx.putImageData(imageData, 0, 0);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let i = 0; i < 300; i++) {
    const cx = Math.random() * size * 2;
    const cy = Math.random() * size;
    const r = Math.random() * 80 + 20;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.3, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

// ── Modular View System ──────────────────────────────────────

const viewRegistry = {
  world: { label: '🌍 World', panel: 'view-world', active: true },
  product: { label: '📦 Product', panel: 'view-product', active: false },
  labour: { label: '👷 Labour', panel: 'view-labour', active: false },
};

let activeView = 'world';

function switchView(viewId) {
  if (activeView === viewId) return;
  activeView = viewId;

  // Update tabs
  document.querySelectorAll('.view-tab[data-view]').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === viewId);
  });

  // Update panels
  Object.values(viewRegistry).forEach(v => {
    const panel = document.getElementById(v.panel);
    if (panel) panel.hidden = true;
  });
  const activePanel = document.getElementById(viewRegistry[viewId]?.panel);
  if (activePanel) activePanel.hidden = false;

  // Populate view with data if needed
  if (viewId === 'product') populateProductView();
  if (viewId === 'labour') populateLabourView();

  // Resize Earth renderer when switching back to World
  if (viewId === 'world' && worldRenderer) {
    window.dispatchEvent(new Event('resize'));
  }
}

function populateProductView() {
  const stats = document.getElementById('product-stats');
  if (!stats) return;
  if (stats.hasChildNodes() && !stats.querySelector('.loading')) return;

  stats.innerHTML = '<div class="loading">Loading product data…</div>';

  fetch('http://127.0.0.1:8001/api/transform/shortfall')
    .then(r => r.json())
    .then(shortfalls => {
      if (!shortfalls || !shortfalls.length) { renderProductFallback(stats); return; }
      const worldData = shortfalls.filter(s => s.entity_id === 'planet:earth' && s.time_period === 'modern');
      if (!worldData.length) { renderProductFallback(stats); return; }

      stats.innerHTML = worldData.map(s => {
        const supplyFmt = s.supply > 1e9 ? `${(s.supply/1e9).toFixed(1)}B` : s.supply > 1e6 ? `${(s.supply/1e6).toFixed(1)}M` : s.supply.toLocaleString();
        const statusIcon = s.status === 'surplus' ? '✓' : '⚠';
        return `<div class="view-stat"><strong>${supplyFmt}</strong><span>${statusIcon} ${s.resource} ${s.unit}</span></div>`;
      }).join('');
    }).catch(() => renderProductFallback(stats));
}

function renderProductFallback(stats) {
  const resources = ['calories', 'water', 'housing', 'energy', 'medicine', 'materials'];
  stats.innerHTML = resources.map(r => {
    const supply = regionData.northAmerica?.stats?.[r] || '—';
    return `<div class="view-stat"><strong>${supply}</strong><span>${r}</span></div>`;
  }).join('');
}

function populateLabourView() {
  const stats = document.getElementById('labour-stats');
  if (!stats) return;
  if (stats.hasChildNodes() && !stats.querySelector('.loading')) return;

  stats.innerHTML = '<div class="loading">Loading labour data…</div>';

  fetch('http://127.0.0.1:8001/api/labour-techniques')
    .then(r => r.json())
    .then(data => {
      if (!data || !data.length) { renderLabourFallback(stats); return; }
      renderLabourTechniqueTable(stats, data);
    })
    .catch(() => {
      WorldData.transform('labor_required').then(laborData => {
        if (!laborData || !laborData.length) { renderLabourFallback(stats); return; }
        renderLabourBasic(stats, laborData);
      }).catch(() => renderLabourFallback(stats));
    });
}

function renderLabourTechniqueTable(stats, data) {
  // Group by industry
  const industries = [...new Set(data.map(d => d.industry))];
  const techniques = [...new Set(data.map(d => d.technique))];

  // Summary: best technique per industry
  const summary = industries.map(ind => {
    const rows = data.filter(d => d.industry === ind);
    const manual = rows.find(r => r.technique_id === 'manual');
    const best = rows.reduce((a, b) => (a.hours_per_unit < b.hours_per_unit) ? a : b);
    const savings = manual ? ((1 - best.hours_per_unit / manual.hours_per_unit) * 100).toFixed(0) : 0;
    return { industry: ind, best: best.technique, savings, manualHours: manual?.hours_per_unit, bestHours: best.hours_per_unit };
  });

  // Total world labor under each technique
  const totalByTechnique = techniques.map(tech => {
    const rows = data.filter(d => d.technique === tech);
    const total = rows.reduce((s, r) => s + (r.world_labor_hours || 0), 0);
    return { technique: tech, totalHours: total };
  });

  stats.innerHTML = `
    <div style="width:100%;text-align:left;">
      <h3 style="margin:0 0 0.75rem;font-size:0.9rem;letter-spacing:-0.02em;">Labour efficiency by technique</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:0.5rem;margin-bottom:1rem;">
        ${totalByTechnique.map(t => {
          const fmt = formatLabor(t.totalHours);
          const pct = totalByTechnique[0]?.totalHours > 0
            ? ((1 - t.totalHours / totalByTechnique[0].totalHours) * 100).toFixed(0)
            : 0;
          return `<div class="view-stat"><strong>${fmt}</strong><span>${t.technique}${pct > 0 ? ' · −'+pct+'%' : ''}</span></div>`;
        }).join('')}
      </div>
      <h3 style="margin:0.75rem 0 0.5rem;font-size:0.9rem;letter-spacing:-0.02em;">Best technique per industry</h3>
      <div style="display:grid;gap:0.35rem;">
        ${summary.map(s => `
          <div class="metric-row" style="justify-content:space-between;">
            <span class="metric-label">${s.industry}</span>
            <span style="font-size:0.8rem;color:var(--text-secondary);">${s.best}</span>
            <span style="font-size:0.8rem;color:#4ade80;font-weight:600;">−${s.savings}% vs manual</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderLabourBasic(stats, laborData) {
  const worldData = laborData.filter(l => l.entity_id === 'planet:earth' && l.time_period === 'modern');
  if (!worldData.length) { renderLabourFallback(stats); return; }
  const totalHuman = worldData.reduce((s, l) => s + (l.human_labor_hours || 0), 0);
  const totalRobot = worldData.reduce((s, l) => s + (l.robot_labor_hours || 0), 0);
  const totalLabor = totalHuman + totalRobot;
  const robotRate = totalLabor > 0 ? (totalRobot / totalLabor * 100).toFixed(0) : 0;
  stats.innerHTML = [
    { label: 'Human labor', value: formatLabor(totalHuman) },
    { label: 'Robot labor', value: formatLabor(totalRobot) },
    { label: 'Automation rate', value: robotRate + '%' },
    { label: 'Total labor', value: formatLabor(totalLabor) },
    ...worldData.slice(0, 3).map(l => ({ label: l.resource, value: formatLabor(l.human_labor_hours + l.robot_labor_hours) })),
  ].map(d => `<div class="view-stat"><strong>${d.value}</strong><span>${d.label}</span></div>`).join('');
}

function renderLabourFallback(stats) {
  const labourData = [
    { label: 'Human labor', value: '4.2B hrs/yr' },
    { label: 'Robot labor', value: '6.8B hrs/yr' },
    { label: 'Automation rate', value: '62%' },
    { label: 'Workforce', value: '3.4B' },
    { label: 'Productivity', value: '$18.4/hr' },
  ];
  stats.innerHTML = labourData.map(d =>
    `<div class="view-stat"><strong>${d.value}</strong><span>${d.label}</span></div>`
  ).join('');
}

function formatLabor(hours) {
  if (hours > 1e12) return `${(hours/1e12).toFixed(1)}T hrs`;
  if (hours > 1e9) return `${(hours/1e9).toFixed(1)}B hrs`;
  if (hours > 1e6) return `${(hours/1e6).toFixed(1)}M hrs`;
  return hours.toLocaleString() + ' hrs';
}

function addCustomView(viewId, label, icon = '📊') {
  if (viewRegistry[viewId]) return;
  viewRegistry[viewId] = { label: `${icon} ${label}`, panel: null, active: false, custom: true };

  // Create tab button
  const tabs = document.getElementById('view-tabs');
  const addBtn = document.getElementById('add-view-tab');
  const tab = document.createElement('button');
  tab.type = 'button';
  tab.className = 'view-tab';
  tab.dataset.view = viewId;
  tab.textContent = `${icon} ${label}`;
  tab.addEventListener('click', () => switchView(viewId));
  tabs.insertBefore(tab, addBtn);

  // Create panel
  const section = document.querySelector('.map-section');
  const panel = document.createElement('div');
  panel.className = 'view-panel';
  panel.id = `view-${viewId}`;
  panel.hidden = true;
  panel.innerHTML = `<div class="view-placeholder"><h2>${label}</h2><p>Custom view — populate with data modules.</p></div>`;
  section.appendChild(panel);

  viewRegistry[viewId].panel = `view-${viewId}`;
  switchView(viewId);
}

function initViewSystem() {
  // View tab clicks
  document.querySelectorAll('.view-tab[data-view]').forEach(tab => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });

  // +Add tab
  const addTab = document.getElementById('add-view-tab');
  const addBar = document.getElementById('view-add-bar');
  if (addTab && addBar) {
    addTab.addEventListener('click', () => {
      addBar.hidden = !addBar.hidden;
    });
  }

  // Add view chips
  document.querySelectorAll('[data-add-view]').forEach(chip => {
    chip.addEventListener('click', () => {
      const id = chip.dataset.addView;
      const label = chip.textContent.trim();
      addCustomView(id, label);
      if (addBar) addBar.hidden = true;
    });
  });

  // Show world by default
  switchView('world');
}

// ── Full Earth preview scene ──────────────────────────────────

function initWorldPreview() {
  if (!worldSceneContainer || typeof THREE === 'undefined') return;

  buildWorldHierarchy();

  const containerWidth = worldSceneContainer.clientWidth || window.innerWidth;
  const containerHeight = Math.max(worldSceneContainer.clientHeight || 520, 420);

  // ── Scene setup ──────────────────────────────────────────
  worldScene = new THREE.Scene();

  // Starfield background
  const starsGeom = new THREE.BufferGeometry();
  const starCount = 2000;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i += 3) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 80 + Math.random() * 40;
    starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPositions[i + 2] = r * Math.cos(phi);
  }
  starsGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.7 });
  worldScene.add(new THREE.Points(starsGeom, starsMat));

  // ── Camera ───────────────────────────────────────────────
  worldCamera = new THREE.PerspectiveCamera(40, containerWidth / containerHeight, 0.1, 200);
  worldCamera.position.set(0, 0.8, 5.5);
  worldCamera.lookAt(0, 0, 0);

  // ── Renderer ─────────────────────────────────────────────
  worldRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  worldRenderer.setSize(containerWidth, containerHeight);
  worldRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  worldRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  worldRenderer.toneMappingExposure = 1.2;
  worldSceneContainer.innerHTML = '';
  worldSceneContainer.appendChild(worldRenderer.domElement);

  // ── Lighting ─────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0x334466, 1.8);
  worldScene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 3.5);
  sunLight.position.set(5, 3, 5);
  worldScene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0x4466aa, 0.8);
  fillLight.position.set(-3, -1, -2);
  worldScene.add(fillLight);

  // ── Earth sphere ─────────────────────────────────────────
  const earthGeom = new THREE.SphereGeometry(1.8, 96, 72);
  const earthTex = generateProceduralEarthTexture(1024);
  earthTex.colorSpace = THREE.SRGBColorSpace;
  const earthMat = new THREE.MeshStandardMaterial({
    map: earthTex,
    roughness: 0.75,
    metalness: 0.05,
  });
  worldEarth = new THREE.Mesh(earthGeom, earthMat);
  worldScene.add(worldEarth);
  worldEarth.rotation.x = 0.2; // Slight tilt like real Earth

  // ── Atmosphere glow ──────────────────────────────────────
  const atmosGeom = new THREE.SphereGeometry(1.88, 64, 48);
  const atmosMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: new THREE.Color(0x88ccff) },
      uFalloff: { value: 3.5 },
      uIntensity: { value: 0.45 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPos;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        vNormal = normalize(mat3(modelMatrix) * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uFalloff;
      uniform float uIntensity;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldPos;
      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float rim = 1.0 - abs(dot(viewDir, vNormal));
        float glow = pow(rim, uFalloff) * uIntensity;
        gl_FragColor = vec4(uColor, glow);
      }
    `,
  });
  worldAtmosphere = new THREE.Mesh(atmosGeom, atmosMat);
  worldScene.add(worldAtmosphere);

  // ── Build scene layers ───────────────────────────────────
  buildWorldSceneLayers();

  // ── Orbit state ──────────────────────────────────────────
  const orbitState = {
    theta: 0.4,        // azimuthal angle
    phi: Math.PI * 0.42, // polar angle (from top)
    radius: 5.5,
    targetTheta: 0.4,
    targetPhi: Math.PI * 0.42,
    targetRadius: 5.5,
    autoRotate: true,
    damping: 0.08,
    minRadius: 2.8,
    maxRadius: 10,
  };

  // ── Raycaster ────────────────────────────────────────────
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerDownPos = { x: 0, y: 0 };
  let dragStartTheta = 0;
  let dragStartPhi = 0;
  let isDragging = false;

  const getIntersectedNodeId = (event) => {
    const rect = worldRenderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, worldCamera);
    const intersects = raycaster.intersectObjects(getActiveSelectableObjects(), false);
    return intersects[0]?.object?.userData?.nodeId || null;
  };

  // ── Pointer events ───────────────────────────────────────
  worldRenderer.domElement.style.cursor = 'grab';

  worldRenderer.domElement.addEventListener('pointerdown', (event) => {
    isDragging = true;
    pointerDownPos = { x: event.clientX, y: event.clientY };
    dragStartTheta = orbitState.targetTheta;
    dragStartPhi = orbitState.targetPhi;
    orbitState.autoRotate = false;
    worldRenderer.domElement.style.cursor = 'grabbing';
  });

  worldRenderer.domElement.addEventListener('pointermove', (event) => {
    if (isDragging) {
      const dx = event.clientX - pointerDownPos.x;
      const dy = event.clientY - pointerDownPos.y;
      orbitState.targetTheta = dragStartTheta - dx * 0.005;
      orbitState.targetPhi = Math.max(0.15, Math.min(Math.PI - 0.15, dragStartPhi + dy * 0.005));
    }
    worldSceneState.hoveredNodeId = getIntersectedNodeId(event);
    worldRenderer.domElement.style.cursor = isDragging ? 'grabbing' : worldSceneState.hoveredNodeId ? 'pointer' : 'grab';
    updateWorldStatus(worldSceneState.hoveredNodeId);
  });

  worldRenderer.domElement.addEventListener('pointerup', (event) => {
    const traveled = Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y);
    isDragging = false;
    worldRenderer.domElement.style.cursor = worldSceneState.hoveredNodeId ? 'pointer' : 'grab';

    if (traveled < 4 && worldSceneState.hoveredNodeId) {
      selectWorldNode(worldSceneState.hoveredNodeId);
    }
    // Resume auto-rotate after 3s of no interaction
    clearTimeout(orbitState._resumeTimer);
    orbitState._resumeTimer = setTimeout(() => { orbitState.autoRotate = true; }, 3000);
  });

  worldRenderer.domElement.addEventListener('pointerleave', () => {
    isDragging = false;
    worldRenderer.domElement.style.cursor = 'grab';
  });

  worldRenderer.domElement.addEventListener('wheel', (event) => {
    event.preventDefault();
    orbitState.targetRadius = Math.max(orbitState.minRadius, Math.min(orbitState.maxRadius,
      orbitState.targetRadius + event.deltaY * 0.005));
  }, { passive: false });

  // Touch pinch zoom
  let lastPinchDist = 0;
  worldRenderer.domElement.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      lastPinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: true });
  worldRenderer.domElement.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      orbitState.targetRadius = Math.max(orbitState.minRadius, Math.min(orbitState.maxRadius,
        orbitState.targetRadius - (dist - lastPinchDist) * 0.01));
      lastPinchDist = dist;
    }
  }, { passive: true });

  // ── Animate loop ─────────────────────────────────────────
  const animate = () => {
    requestAnimationFrame(animate);

    // Auto-rotate
    if (orbitState.autoRotate) {
      orbitState.targetTheta += 0.0015;
    }

    // Smooth damping
    orbitState.theta += (orbitState.targetTheta - orbitState.theta) * orbitState.damping;
    orbitState.phi += (orbitState.targetPhi - orbitState.phi) * orbitState.damping;
    orbitState.radius += (orbitState.targetRadius - orbitState.radius) * orbitState.damping;

    // Spherical → Cartesian
    const sp = Math.sin(orbitState.phi);
    const cp = Math.cos(orbitState.phi);
    const st = Math.sin(orbitState.theta);
    const ct = Math.cos(orbitState.theta);
    const x = orbitState.radius * sp * ct;
    const y = orbitState.radius * cp;
    const z = orbitState.radius * sp * st;

    worldCamera.position.lerp(new THREE.Vector3(x, y, z), 0.15);
    worldCamera.lookAt(0, 0, 0);

    // Atmosphere follows camera subtly
    if (worldAtmosphere) {
      worldAtmosphere.material.uniforms.uIntensity.value = 0.35 + (orbitState.radius - orbitState.minRadius) / (orbitState.maxRadius - orbitState.minRadius) * 0.15;
    }

    worldRenderer.render(worldScene, worldCamera);
  };

  // ── Initialize ───────────────────────────────────────────
  setActiveDetailMode('macro');
  selectWorldNode('region:northAmerica');
  animate();
}

detailModeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setActiveDetailMode(button.dataset.mode);
  });
});

document.querySelectorAll('.prim-mode').forEach((button) => {
  button.addEventListener('click', () => {
    activePrimMode = button.dataset.prim;
    document.querySelectorAll('.prim-mode').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.prim === activePrimMode);
    });
    if (vertexEditorPanel) vertexEditorPanel.hidden = true;
  });
});

worldUndoButton?.addEventListener('click', performUndo);
worldRedoButton?.addEventListener('click', performRedo);
worldIsolateButton?.addEventListener('click', () => {
  if (worldSceneState.selectedNodeId) isolateWorldNode(worldSceneState.selectedNodeId);
});
worldIsolateExitButton?.addEventListener('click', exitIsolate);

window.addEventListener('resize', () => {
  if (!worldSceneContainer || !worldCamera || !worldRenderer) return;
  const width = worldSceneContainer.clientWidth;
  const height = worldSceneContainer.clientHeight;
  worldCamera.aspect = width / height;
  worldCamera.updateProjectionMatrix();
  worldRenderer.setSize(width, height);
});

function updateRegionSelection(regionKey) {
  const focusedNodeId = arguments[1] || `region:${regionKey}`;
  selectedRegionKey = regionKey;
  selectedHomeId = null;

  regionButtons.forEach((button) => {
    button.classList.toggle('selected', button.dataset.region === regionKey);
  });

  const region = regionData[regionKey];
  const focusedNode = getWorldNode(focusedNodeId) || getWorldNode(`region:${regionKey}`);

  if (!focusedNode) {
    regionDetails.innerHTML = `
      <h3>${region.label}</h3>
      <p>${region.description}</p>
      <div class="home-detail-row"><span>Calories supply:</span><strong>${region.stats.calories} calories</strong></div>
      <div class="home-detail-row"><span>Water supply:</span><strong>${region.stats.water} liters</strong></div>
      <div class="home-detail-row"><span>Housing supply:</span><strong>${region.stats.housing} sqm</strong></div>
      <div class="home-detail-row"><span>Energy supply:</span><strong>${region.stats.energy} kWh</strong></div>
    `;
    zoomHomeButton.disabled = false;
    homeListContainer.innerHTML = '';
    return;
  }

  const focusedMetrics = Object.entries(focusedNode.metrics || {}).map(([label, value]) => {
    return `<div class="home-detail-row"><span>${label}:</span><strong>${value}</strong></div>`;
  }).join('');

  regionDetails.innerHTML = `
    <h3>${focusedNode.label}</h3>
    <p>${focusedNode.description}</p>
    <div class="home-detail-row"><span>Hierarchy path:</span><strong>${getWorldNodePathLabel(focusedNode.id)}</strong></div>
    <div class="home-detail-row"><span>Active view mode:</span><strong>${activeDetailMode.toUpperCase()}</strong></div>
    <div class="home-detail-row"><span>Node type:</span><strong>${focusedNode.type.toUpperCase()}</strong></div>
    ${focusedMetrics}
    <p class="muted-text">Regional context: ${region.description}</p>
  `;

  zoomHomeButton.disabled = false;
  homeListContainer.innerHTML = '';
}

function renderHomeList() {
  if (!selectedRegionKey) {
    homeListContainer.innerHTML = '<p>Select a region first to see homes.</p>';
    return;
  }

  const region = regionData[selectedRegionKey];
  homeListContainer.innerHTML = `<h3>Homes in ${region.label}</h3>` + region.homes.map((home) => {
    return `
      <div class="home-card ${home.id === selectedHomeId ? 'selected' : ''}" data-home="${home.id}">
        <strong>${home.name}</strong>
        <div class="muted-text">Usage snapshot: ${home.usage.calories} calories, ${home.usage.water} liters water</div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.home-card').forEach((card) => {
    card.addEventListener('click', () => {
      selectHome(card.dataset.home);
    });
  });
}

function selectHome(homeId) {
  selectedHomeId = homeId;
  renderHomeList();

  const home = regionData[selectedRegionKey].homes.find((item) => item.id === homeId);
  homeDetailsContainer.innerHTML = `
    <h3>${home.name}</h3>
    <div class="home-detail-row"><span>Monthly calories:</span><strong>${home.usage.calories}</strong></div>
    <div class="home-detail-row"><span>Monthly water:</span><strong>${home.usage.water}</strong></div>
    <div class="home-detail-row"><span>Monthly energy:</span><strong>${home.usage.energy}</strong></div>
    <div class="home-detail-row"><span>Material use:</span><strong>${home.usage.materials} tons</strong></div>
    <div class="home-detail-row"><span>Robot involvement:</span><strong>${home.usage.robotization}</strong></div>
    <p class="muted-text">This home view shows how region planning maps down to individual consumption and automation levels.</p>
  `;
}

regionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setActiveDetailMode('macro');
    selectWorldNode(`region:${button.dataset.region}`);
  });
});

zoomHomeButton.addEventListener('click', () => {
  const selectedNode = getWorldNode(worldSceneState.selectedNodeId);
  if (selectedNode?.children?.length) {
    const nextNode = getWorldNode(selectedNode.children[0]);
    setActiveDetailMode(getModeForNodeType(nextNode.type));
    selectWorldNode(nextNode.id);
    return;
  }

  renderHomeList();
  if (!selectedRegionKey) return;
  homeDetailsContainer.innerHTML = '<p>Select a home from the list to view its usage.</p>';
});

function getStoredProfile() {
  return JSON.parse(localStorage.getItem('worldSchedulerProfile') || 'null');
}

function getMarginState(profile, results = []) {
  const isAffected = Boolean(profile?.marginAffected);
  const impactLevel = profile?.marginImpact || 'moderate';
  const impactLabel = {
    low: 'Low',
    moderate: 'Moderate',
    high: 'High',
  }[impactLevel] || 'Moderate';
  const shortageCount = Array.isArray(results) ? results.filter((item) => item.shortage < 0).length : 0;
  const levelWeight = { low: 1, moderate: 2, high: 3 }[impactLevel] || 2;
  const verificationBonus = profile?.verified ? 25 : 0;
  const points = isAffected ? 180 + shortageCount * 55 + levelWeight * 40 + verificationBonus : 0;
  const score = isAffected
    ? Math.min(100, 60 + shortageCount * 4 + levelWeight * 8 + verificationBonus / 4)
    : Math.max(0, 100 - shortageCount * 12);
  const tier = score >= 90 ? 'Civic guardian' : score >= 75 ? 'Steward' : score >= 55 ? 'Observer' : 'At risk';

  return {
    isAffected,
    badgeText: isAffected ? 'Margin of Error Participant' : '',
    points,
    impactLabel,
    score: Math.round(score),
    tier,
  };
}

function saveProfile() {
  const profile = {
    name: profileNameInput.value.trim(),
    email: profileEmailInput.value.trim(),
    type: profileTypeSelect.value,
    verified: verifyProfileCheckbox.checked,
    marginAffected: marginAffectedCheckbox.checked,
    marginImpact: marginImpactSelect.value,
    baselineEra: timeEraSelect.value,
    numbers: {
      calories: Number(document.getElementById('calories').value),
      water: Number(document.getElementById('water').value),
      housing: Number(document.getElementById('housing').value),
      energy: Number(document.getElementById('energy').value),
      medicine: Number(document.getElementById('medicine').value),
      materials: Number(document.getElementById('materials').value),
    },
  };

  localStorage.setItem('worldSchedulerProfile', JSON.stringify(profile));
  updateProfileSummary();
  updateMemberToolsVisibility();
}

function getScenarioStorage() {
  return JSON.parse(localStorage.getItem('worldSchedulerScenarios') || '[]');
}

function saveScenario() {
  const scenario = {
    id: Date.now(),
    title: scenarioNameInput.value.trim() || 'Untitled scenario',
    createdAt: new Date().toLocaleString(),
    era: timeEraSelect.value,
    population: Number(document.getElementById('population').value),
    safetyMargin: Number(document.getElementById('safety-margin').value),
    robotization: Number(document.getElementById('robotization').value),
    monthlyIncome: Number(document.getElementById('monthly-income').value),
    essentialCost: Number(document.getElementById('essential-cost').value),
    wantsCost: Number(document.getElementById('wants-cost').value),
    savingsMonths: Number(document.getElementById('savings-months').value),
    planHorizon: Number(document.getElementById('plan-horizon').value),
    planEvidence: Number(document.getElementById('plan-evidence').value),
    lifeGoal: document.getElementById('life-goal').value,
    profile: getStoredProfile(),
  };

  const scenarios = getScenarioStorage();
  scenarios.unshift(scenario);
  localStorage.setItem('worldSchedulerScenarios', JSON.stringify(scenarios.slice(0, 5)));
  renderScenarios();
  scenarioNameInput.value = '';
}

function renderScenarios() {
  const scenarios = getScenarioStorage();
  if (!scenarios.length) {
    scenarioList.innerHTML = '<p class="muted-text">No saved scenarios yet.</p>';
    if (scenarioComparePanel) scenarioComparePanel.hidden = true;
    return;
  }

  scenarioList.innerHTML = scenarios.map((scenario) => {
    const isPinned = scenarioCompareSet.includes(String(scenario.id));
    return `
      <div class="scenario-item${isPinned ? ' comparing' : ''}">
        <div>
          <strong>${scenario.title}</strong>
          <div class="muted-text">${scenario.createdAt} • ${eraPresets[scenario.era]?.label || 'Custom'}</div>
        </div>
        <div class="scenario-item-actions">
          <button type="button" class="ghost" data-scenario-id="${scenario.id}">Load</button>
          <button type="button" class="ghost${isPinned ? ' btn-comparing' : ''}" data-compare-id="${scenario.id}">${isPinned ? 'Pinned' : 'Compare'}</button>
        </div>
      </div>
    `;
  }).join('');

  scenarioList.querySelectorAll('button[data-scenario-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const scenario = scenarios.find((item) => String(item.id) === button.dataset.scenarioId);
      if (!scenario) return;
      applyScenario(scenario);
    });
  });

  scenarioList.querySelectorAll('button[data-compare-id]').forEach((button) => {
    button.addEventListener('click', () => {
      toggleScenarioCompare(button.dataset.compareId);
    });
  });
}

function toggleScenarioCompare(scenarioId) {
  const idx = scenarioCompareSet.indexOf(scenarioId);
  if (idx >= 0) {
    scenarioCompareSet.splice(idx, 1);
  } else {
    if (scenarioCompareSet.length >= 2) scenarioCompareSet.shift();
    scenarioCompareSet.push(scenarioId);
  }
  renderScenarios();
  if (scenarioCompareSet.length === 2) {
    const all = getScenarioStorage();
    const a = all.find((s) => String(s.id) === scenarioCompareSet[0]);
    const b = all.find((s) => String(s.id) === scenarioCompareSet[1]);
    if (a && b) renderScenarioComparison(a, b);
  } else if (scenarioComparePanel) {
    scenarioComparePanel.hidden = true;
  }
}

function renderScenarioComparison(a, b) {
  if (!scenarioComparePanel) return;
  const runAssess = (s) => getLifePlanAssessment({
    monthlyIncome: s.monthlyIncome || 6500,
    essentialCost: s.essentialCost || 3800,
    wantsCost: s.wantsCost || 900,
    savingsMonths: s.savingsMonths || 8,
    planHorizon: s.planHorizon || 5,
    planEvidence: s.planEvidence || 70,
    lifeGoal: s.lifeGoal || 'stability',
    shortageCount: 0,
    healthyCount: 6,
    robotRate: (s.robotization || 70) / 100,
    safetyMargin: (s.safetyMargin || 150) / 100,
  });
  const assessA = runAssess(a);
  const assessB = runAssess(b);

  const diffRow = (label, valA, valB, fmt = (v) => String(Math.round(v)), invert = false) => {
    const diff = valB - valA;
    const better = invert ? diff < 0 : diff > 0;
    const cls = Math.abs(diff) < 0.01 ? 'diff-neutral' : better ? 'diff-positive' : 'diff-negative';
    const sign = diff > 0 ? '+' : '';
    return `<div class="compare-diff-row">
      <span class="compare-label">${label}</span>
      <span class="compare-col">${fmt(valA)}</span>
      <span class="compare-col">${fmt(valB)}</span>
      <span class="compare-col ${cls}">${sign}${fmt(diff)}</span>
    </div>`;
  };

  scenarioComparePanel.hidden = false;
  scenarioComparePanel.innerHTML = `
    <h3>Scenario comparison</h3>
    <div class="compare-diff-row compare-header">
      <span class="compare-label"></span>
      <span class="compare-col"><strong>${a.title}</strong></span>
      <span class="compare-col"><strong>${b.title}</strong></span>
      <span class="compare-col"><strong>Δ</strong></span>
    </div>
    ${diffRow('Population', a.population || 0, b.population || 0, (v) => Math.round(v).toLocaleString())}
    ${diffRow('Safety margin', a.safetyMargin || 150, b.safetyMargin || 150, (v) => `${Math.round(v)}%`)}
    ${diffRow('Automation', a.robotization || 70, b.robotization || 70, (v) => `${Math.round(v)}%`)}
    ${diffRow('Monthly income', a.monthlyIncome || 0, b.monthlyIncome || 0, formatCurrency)}
    ${diffRow('Essential costs', a.essentialCost || 0, b.essentialCost || 0, formatCurrency, true)}
    ${diffRow('Wants budget', a.wantsCost || 0, b.wantsCost || 0, formatCurrency, true)}
    ${diffRow('Savings runway', a.savingsMonths || 0, b.savingsMonths || 0, (v) => `${v} mo`)}
    ${diffRow('Plan probability', assessA.probability, assessB.probability, (v) => `${Math.round(v)}%`)}
    ${diffRow('Needs coverage', assessA.needsCoverageRatio * 100, assessB.needsCoverageRatio * 100, (v) => `${Math.round(v)}%`)}
    ${diffRow('Discretionary', assessA.discretionaryIncome, assessB.discretionaryIncome, formatCurrency)}
    <p class="muted-text" style="margin-top:0.75rem;font-size:0.88rem">Pin two scenarios using Compare to see a live side-by-side diff.</p>
  `;
}

function applyScenario(scenario) {
  scenarioNameInput.value = scenario.title;
  timeEraSelect.value = scenario.era || timeEraSelect.value;
  applyEraBaseline(scenario.era);
  document.getElementById('population').value = scenario.population || 1000000;
  document.getElementById('safety-margin').value = scenario.safetyMargin || 150;
  document.getElementById('robotization').value = scenario.robotization || 70;
  document.getElementById('monthly-income').value = scenario.monthlyIncome || 6500;
  document.getElementById('essential-cost').value = scenario.essentialCost || 3800;
  document.getElementById('wants-cost').value = scenario.wantsCost || 900;
  document.getElementById('savings-months').value = scenario.savingsMonths || 8;
  document.getElementById('plan-horizon').value = scenario.planHorizon || 5;
  document.getElementById('plan-evidence').value = scenario.planEvidence || 70;
  document.getElementById('life-goal').value = scenario.lifeGoal || 'stability';
  safetyValue.textContent = `${scenario.safetyMargin || 150}%`;
  robotValue.textContent = `${scenario.robotization || 70}%`;
  evidenceValue.textContent = `${scenario.planEvidence || 70}%`;
  document.getElementById('calculate-button').click();
}

function loadLatestScenario() {
  const scenarios = getScenarioStorage();
  if (!scenarios.length) return;
  applyScenario(scenarios[0]);
}

function updateMemberToolsVisibility() {
  const profile = getStoredProfile();
  const hasAccess = Boolean(profile?.name || profile?.email || profile?.type);
  const workspace = document.getElementById('member-workspace');
  const target = document.getElementById('member-tools-target');
  const source = document.getElementById('member-tools-body');

  if (hasAccess && workspace && target && source) {
    // Move calculator + results into the login section
    if (!target.hasChildNodes()) {
      while (source.firstChild) {
        target.appendChild(source.firstChild);
      }
    }
    workspace.hidden = false;
    memberToolsGate.classList.add('is-hidden');
    renderAssetRewards();
  } else {
    if (workspace) workspace.hidden = true;
    if (memberToolsGate) memberToolsGate.classList.remove('is-hidden');
  }
}

function updateProfileSummary() {
  const profile = getStoredProfile();
  if (!profile) {
    profileSummary.innerHTML = '<p>No profile created yet.</p>';
    return;
  }

  if (profile.name) profileNameInput.value = profile.name;
  if (profile.email) profileEmailInput.value = profile.email;
  profileTypeSelect.value = profile.type || 'personal';
  verifyProfileCheckbox.checked = Boolean(profile.verified);
  marginAffectedCheckbox.checked = Boolean(profile.marginAffected);
  marginImpactSelect.value = profile.marginImpact || 'moderate';

  const marginState = getMarginState(profile);
  profileSummary.innerHTML = `
    <p><strong>${profile.name || 'Unnamed'}</strong> (${profile.type})</p>
    <p>${profile.email || 'No email provided'}</p>
    <p>Baseline: <strong>${eraPresets[profile.baselineEra]?.label || 'Custom'}</strong></p>
    <p>Verification: <strong>${profile.verified ? 'Requested' : 'Not requested'}</strong></p>
    ${marginState.isAffected ? `
      <div class="margin-badge">${marginState.badgeText}</div>
      <p>Impact score: <strong>${marginState.score}/100</strong></p>
      <p>Recognition tier: <strong>${marginState.tier}</strong></p>
      <p>Allotment points: <strong>${marginState.points}</strong></p>
      <p>Impact level: <strong>${marginState.impactLabel}</strong></p>
    ` : ''}
  `;
}

function getCurrentLLMConfig() {
  return {
    provider: llmProviderSelect.value,
    endpoint: llmEndpointInput.value.trim(),
    token: llmTokenInput.value.trim(),
    connected: false,
  };
}

function connectLLM() {
  const config = getCurrentLLMConfig();
  if (!config.endpoint) {
    llmStatus.textContent = 'Provide an endpoint or local provider path to connect.';
    llmStatus.style.background = 'rgba(251, 113, 133, 0.12)';
    return;
  }

  llmStatus.textContent = `Connected to ${config.provider} provider.`;
  llmStatus.style.background = 'rgba(34, 197, 94, 0.18)';
  llmStatus.style.borderColor = 'rgba(34, 197, 94, 0.28)';
  llmResponse.innerHTML = `<p>Provider ${config.provider} is ready. Send your first prompt.</p>`;
}

function sendLLMRequest() {
  const prompt = llmPrompt.value.trim();
  if (!prompt) {
    llmResponse.innerHTML = '<p>Please enter a prompt to send to the LLM.</p>';
    return;
  }

  const region = selectedRegionKey ? regionData[selectedRegionKey].label : 'unknown region';
  const era = eraPresets[timeEraSelect.value].label;
  const content = `LLM App Integration Layer
Era: ${era}
Region: ${region}
Prompt: ${prompt}`;

  llmResponse.innerHTML = `
    <p><strong>Request sent:</strong></p>
    <pre>${content}</pre>
    <p><strong>Response:</strong></p>
    <p>The ${llmProviderSelect.value} provider would interpret current era, regional data, and baseline numbers to recommend resource direction. For example, it may say: "Increase food automation in ${region} and verify water supply flow rates relative to the ${era} baseline."</p>
  `;
}

// Initialize with default results
applyEraBaseline(timeEraSelect.value);
updateProfileSummary();
updateMemberToolsVisibility();
renderScenarios();
renderCostEstimate();
renderCountryMonitor();
initViewSystem();
initWorldPreview();
document.getElementById('calculate-button').click();
