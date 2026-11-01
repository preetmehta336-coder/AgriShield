// ============================================================
// AGRISHIELD - INTEGRATED DASHBOARD
// Original functionality preserved with dataset integration
// ============================================================

// Initialize Icons
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}

// Integrated dataset references
const rainfallRows = window.AGRISHIELD_RAINFALL_DATA || [];
const pmfbyRows = window.AGRISHIELD_PMFY_DATA || [];
const oniRows = window.AGRISHIELD_ONI_DATA || [];

// Chart Instances
let rainfallChartInstance = null;
let claimsPieChartInstance = null;
let pmfChartInstance = null;
let heroMiniChartInstance = null;


// ============================================================
// INITIALIZE DASHBOARD
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    initHeroChart();
    initRainfallChart();
    initClaimsPieChart();

    // Load actual dashboard metrics from the Spring Boot engine
    loadDashboardMetrics();
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// Safely convert values to numbers.
// Missing and invalid values return null.
function toValidNumber(value) {
    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ''
    ) {
        return null;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : null;
}


// Sort ONI observations chronologically.
// Uses monthIndex when available, otherwise year and month.
function sortONIRows(rows) {
    return [...rows].sort((a, b) => {
        const aIndex = toValidNumber(a.monthIndex);
        const bIndex = toValidNumber(b.monthIndex);

        if (aIndex !== null && bIndex !== null) {
            return aIndex - bIndex;
        }

        const aYear = toValidNumber(a.year) ?? 0;
        const bYear = toValidNumber(b.year) ?? 0;

        if (aYear !== bYear) {
            return aYear - bYear;
        }

        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        const aMonth = months.indexOf(
            String(a.month || '').substring(0, 3)
        );

        const bMonth = months.indexOf(
            String(b.month || '').substring(0, 3)
        );

        return aMonth - bMonth;
    });
}


// ============================================================
// 1. HERO MINI SPARKLINE CHART - REAL ONI DATA
// ============================================================

function initHeroChart() {
    const canvas = document.getElementById('heroMiniChart');

    if (!canvas) return;

    // Remove invalid records, including missing-data placeholders.
    const validONI = sortONIRows(oniRows).filter(row => {
        const value = toValidNumber(row.value);

        return value !== null && value > -10;
    });

    if (validONI.length === 0) {
        console.warn(
            'AgriShield: No valid ONI observations are available.'
        );
        return;
    }

    if (heroMiniChartInstance) {
        heroMiniChartInstance.destroy();
    }

    heroMiniChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'line',

        data: {
            labels: validONI.map(row =>
                `${row.month || ''} ${row.year}`.trim()
            ),

            datasets: [{
                label: 'ONI SST Anomaly (°C)',

                data: validONI.map(row =>
                    toValidNumber(row.value)
                ),

                borderColor: '#10B981',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 0
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    callbacks: {
                        label: context =>
                            `ONI: ${context.parsed.y.toFixed(2)} °C`
                    }
                }
            },

            scales: {
                x: {
                    display: false
                },

                y: {
                    display: false
                }
            }
        }
    });
}


// ============================================================
// 2. RAINFALL CHART - REAL RAINFALL DATA
// ============================================================

function initRainfallChart() {
    const canvas = document.getElementById('rainfallChart');

    if (!canvas) return;

    // Keep records that contain valid daily and cumulative
    // rainfall departure percentages.
    const validRainfall = rainfallRows
        .filter(row => {
            const dailyDeparture =
                toValidNumber(row.dailyDeparturePct);

            const cumulativeDeparture =
                toValidNumber(row.cumulativeDeparturePct);

            return (
                row.date &&
                dailyDeparture !== null &&
                cumulativeDeparture !== null
            );
        })
        .sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

    if (validRainfall.length === 0) {
        console.warn(
            'AgriShield: No valid rainfall observations are available.'
        );
        return;
    }

    // Display the latest 30 available records.
    // These are not guaranteed to represent 30 consecutive days.
    const rows = validRainfall.slice(-30);

    if (rainfallChartInstance) {
        rainfallChartInstance.destroy();
    }

    rainfallChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'bar',

        data: {
            labels: rows.map(row =>
                `${row.state} - ${row.date}`
            ),

            datasets: [
                {
                    label: 'Daily Rainfall Departure (%)',

                    data: rows.map(row =>
                        toValidNumber(row.dailyDeparturePct)
                    ),

                    backgroundColor: '#10B981',
                    borderRadius: 6
                },

                {
                    label: 'Cumulative Rainfall Departure (%)',

                    data: rows.map(row =>
                        toValidNumber(row.cumulativeDeparturePct)
                    ),

                    type: 'line',
                    borderColor: '#F59E0B',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 2,
                    tension: 0.2
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                mode: 'index',
                intersect: false
            },

            scales: {
                x: {
                    ticks: {
                        color: '#94A3B8',
                        maxRotation: 45,
                        minRotation: 0
                    },

                    grid: {
                        display: false
                    }
                },

                y: {
                    title: {
                        display: true,
                        text: 'Rainfall Departure (%)',
                        color: '#94A3B8'
                    },

                    ticks: {
                        color: '#94A3B8'
                    },

                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                }
            },

            plugins: {
                legend: {
                    labels: {
                        color: '#F1F5F9'
                    }
                },

                tooltip: {
                    callbacks: {
                        label: context =>
                            `${context.dataset.label}: ${
                                context.parsed.y.toFixed(2)
                            }%`
                    }
                }
            }
        }
    });
}


// ============================================================
// 3. PMFBY FARMER COVERAGE BY SEASON
// Replaces unsupported historical claim-cause percentages.
// ============================================================

function initClaimsPieChart() {
    const canvas = document.getElementById('claimsPieChart');

    if (!canvas) return;

    // Find the latest year represented in the PMFBY dataset.
    const validRows = pmfbyRows.filter(row => {
        const farmers = toValidNumber(row.farmerCount);
        const year = toValidNumber(row.year);

        return (
            farmers !== null &&
            farmers >= 0 &&
            year !== null &&
            String(row.season || '').trim() !== ''
        );
    });

    if (validRows.length === 0) {
        console.warn(
            'AgriShield: No valid PMFBY farmer-count records are available.'
        );
        return;
    }

    const latestYear = Math.max(
        ...validRows.map(row => Number(row.year))
    );

    // Use the latest year only instead of adding multiple years
    // together and presenting the sum as a single-year total.
    const latestYearRows = validRows.filter(
        row => Number(row.year) === latestYear
    );

    const seasonTotals = {};

    latestYearRows.forEach(row => {
        const season = String(row.season).trim();
        const farmers = Number(row.farmerCount);

        seasonTotals[season] =
            (seasonTotals[season] || 0) + farmers;
    });

    const labels = Object.keys(seasonTotals);
    const values = labels.map(season => seasonTotals[season]);

    if (claimsPieChartInstance) {
        claimsPieChartInstance.destroy();
    }

    claimsPieChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',

        data: {
            labels: labels,

            datasets: [{
                data: values,

                backgroundColor: [
                    '#10B981',
                    '#F59E0B',
                    '#64748B',
                    '#3B82F6'
                ],

                borderWidth: 0
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                title: {
                    display: true,

                    text: `PMFBY Farmer Coverage by Season (${latestYear})`,

                    color: '#F1F5F9'
                },

                legend: {
                    position: 'bottom',

                    labels: {
                        color: '#F1F5F9'
                    }
                },

                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return (
                                `${context.label}: ` +
                                `${Number(context.raw).toLocaleString('en-IN')} ` +
                                'reported farmers'
                            );
                        }
                    }
                }
            }
        }
    });
}


// ============================================================
// 4. BINOMIAL DISTRIBUTION PMF CHART
// Original prediction visualization preserved.
// ============================================================

function initPMFChart(n, p) {
    const canvas = document.getElementById('pmfChart');

    if (!canvas) return;

    // Validate inputs.
    n = Number(n);
    p = Number(p);

    if (
        !Number.isFinite(n) ||
        !Number.isFinite(p) ||
        n <= 0 ||
        p < 0 ||
        p > 1
    ) {
        console.warn('Invalid PMF chart inputs.');
        return;
    }

    n = Math.floor(n);

    // Approximate the binomial distribution using a normal curve.
    const expected = Math.round(n * p);
    const variance = n * p * (1 - p);
    const stdDev = Math.sqrt(variance);

    const labels = [];
    const pmfData = [];

    // Preserve the original chart's range around the expected value.
    const range = 15;

    for (
        let k = Math.max(0, expected - range);
        k <= Math.min(n, expected + range);
        k++
    ) {
        labels.push(k.toString());

        let probability;

        if (stdDev === 0) {
            probability = (k === expected) ? 1 : 0;
        } else {
            probability =
                (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
                Math.exp(
                    -0.5 * Math.pow((k - expected) / stdDev, 2)
                );
        }

        pmfData.push(probability);
    }

    if (pmfChartInstance) {
        pmfChartInstance.destroy();
    }

    pmfChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'line',

        data: {
            labels: labels,

            datasets: [{
                label: 'Normal Approximation to Binomial PMF',

                data: pmfData,

                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Number of Claims (k)',
                        color: '#94A3B8'
                    },

                    ticks: {
                        color: '#94A3B8'
                    }
                },

                y: {
                    title: {
                        display: true,
                        text: 'Approximate Probability Density',
                        color: '#94A3B8'
                    },

                    ticks: {
                        color: '#94A3B8'
                    },

                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                }
            },

            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}


// ============================================================
// 5. DASHBOARD KPI UPDATES
// Only update metrics supported by available records.
// ============================================================

async function loadDashboardMetrics() {
    try {
        const response = await fetch("http://localhost:8080/api/dashboard");

        if (!response.ok) {
            throw new Error("Failed to load dashboard metrics.");
        }

        const data = await response.json();

        const farmersElement = document.getElementById("kpiFarmers");
        const claimsElement = document.getElementById("kpiClaims");
        const oniElement = document.getElementById("kpiElNino");
        const riskElement = document.getElementById("kpiRisk");

        if (farmersElement) {
            farmersElement.textContent =
                Number(data.totalFarmers).toLocaleString("en-IN");
        }

        if (claimsElement) {
            claimsElement.textContent =
                Number(data.totalClaims).toLocaleString("en-IN");
        }

        if (oniElement) {
            oniElement.textContent =
                data.currentONI ?? "Unavailable";
        }

        if (riskElement) {
            riskElement.textContent =
                data.overallRisk ?? "Unavailable";
        }

    } catch (error) {
        console.error("Dashboard metrics error:", error);

        ["kpiFarmers", "kpiClaims", "kpiElNino", "kpiRisk"]
            .forEach(id => {
                const element = document.getElementById(id);

                if (element) {
                    element.textContent = "Unavailable";
                }
            });
    }
}
    const oniElement = document.getElementById('kpiElNino');

    if (oniElement && validONI.length > 0) {
        const latestONI = validONI[validONI.length - 1];
        const value = Number(latestONI.value);

        oniElement.textContent = `${value.toFixed(2)} °C`;
    }

    // Farmer KPI: use the latest PMFBY reporting year.
    // This is the sum of the reported farmer_count records in
    // that year; it should not be interpreted as unique farmers
    // across schemes unless the source confirms that definition.
    const validPMFBY = pmfbyRows.filter(row => {
        const year = toValidNumber(row.year);
        const farmers = toValidNumber(row.farmerCount);

        return (
            year !== null &&
            farmers !== null &&
            farmers >= 0
        );
    });

    const farmersElement = document.getElementById('kpiFarmers');

    if (farmersElement && validPMFBY.length > 0) {
        const latestYear = Math.max(
            ...validPMFBY.map(row => Number(row.year))
        );

        const latestRows = validPMFBY.filter(
            row => Number(row.year) === latestYear
        );

        const totalReportedFarmers = latestRows.reduce(
            (sum, row) => sum + Number(row.farmerCount),
            0
        );

        farmersElement.textContent =
            totalReportedFarmers.toLocaleString('en-IN');
    }

    // Claims KPI:
    // Do not derive historical claim totals from farmer counts.
    // Leave the original value unchanged until a suitable
    // claims dataset with a clear reporting period is connected.

    // Risk KPI:
    // Do not calculate or imply a validated risk score from ONI
    // or rainfall alone. Leave the original value unchanged
    // until a documented risk model is integrated. 


// ============================================================
// 6. PREDICTION BUTTON & SPRING BOOT BACKEND INTEGRATION
// Original workflow preserved.
// ============================================================

async function handlePrediction(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submitBtn');

    if (!submitBtn) return;

    submitBtn.disabled = true;

    submitBtn.innerHTML =
        `<i data-lucide="loader-2" class="spin"></i> Calculating...`;

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Payload structure matching the existing Spring Boot DTO.
    const payload = {
        state: document.getElementById('stateSelect').value,

        crop: document.getElementById('cropSelect').value,

        season: document.getElementById('seasonSelect').value,

        elNinoIntensity:
            document.getElementById('elNinoSelect').value,

        insuredFarmers: parseInt(
            document.getElementById('insuredFarmers').value,
            10
        ),

        sumInsured: parseFloat(
            document.getElementById('sumInsured').value
        )
    };

    try {
        // Attempt the existing Spring Boot API endpoint.
        const response = await fetch(
            'http://localhost:8080/api/predict',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            throw new Error(
                `Prediction API returned HTTP ${response.status}`
            );
        }

        const result = await response.json();

        renderResults(result);

    } catch (err) {
        console.warn(
            'Backend unavailable. Using the existing local fallback.',
            err
        );

        const result = computeLocalFallback(payload);

        renderResults(result);

    } finally {
        submitBtn.disabled = false;

        submitBtn.innerHTML =
            `<i data-lucide="calculator"></i> Predict Claims`;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}


// ============================================================
// 7. RENDER PREDICTION RESULTS
// Original result display preserved.
// ============================================================

function renderResults(data) {
    document.getElementById('resProb').textContent =
        (data.claimProbability * 100).toFixed(1) + '%';

    document.getElementById('resExpected').textContent =
        Number(data.expectedClaims).toLocaleString('en-IN');

    document.getElementById('resTotalN').textContent =
        Number(data.insuredFarmers).toLocaleString('en-IN');

    document.getElementById('resPayout').textContent =
        '₹' + Number(data.estimatedPayout).toLocaleString('en-IN');

    document.getElementById('resPerFarmer').textContent =
        Number(data.sumInsured).toLocaleString('en-IN');

    const badge = document.getElementById('riskBadge');

    badge.textContent = `${data.riskLevel} RISK`;

    badge.className =
        `risk-badge badge-${String(data.riskLevel).toLowerCase()}`;

    // Update the PMF chart using the returned prediction.
    initPMFChart(
        data.insuredFarmers,
        data.claimProbability
    );

    // Scroll to prediction results.
    const resultsCard = document.getElementById('resultsCard');

    if (resultsCard) {
        resultsCard.scrollIntoView({
            behavior: 'smooth'
        });
    }
}


// ============================================================
// 8. LOCAL FALLBACK COMPUTATION
// Original calculation preserved.
// IMPORTANT: This is a rule-based fallback, not a validated
// statistical model trained on the integrated datasets.
// ============================================================

function computeLocalFallback(req) {
    let baseP = 0.15;

    // El Niño intensity adjustment.
    if (req.elNinoIntensity === 'Weak') {
        baseP += 0.08;
    } else if (req.elNinoIntensity === 'Moderate') {
        baseP += 0.18;
    } else if (req.elNinoIntensity === 'Strong') {
        baseP += 0.28;
    } else if (req.elNinoIntensity === 'Very Strong') {
        baseP += 0.38;
    }

    // Original crop adjustment.
    if (
        req.crop === 'Soybean' ||
        req.crop === 'Cotton'
    ) {
        baseP += 0.05;
    }

    const prob = Math.min(
        Math.max(baseP, 0.05),
        0.95
    );

    const expected = Math.round(
        req.insuredFarmers * prob
    );

    const payout = expected * req.sumInsured;

    let risk = 'LOW';

    if (prob > 0.4) {
        risk = 'HIGH';
    } else if (prob > 0.25) {
        risk = 'MEDIUM';
    }

    return {
        claimProbability: prob,
        expectedClaims: expected,
        estimatedPayout: payout,
        insuredFarmers: req.insuredFarmers,
        sumInsured: req.sumInsured,
        riskLevel: risk
    };
}