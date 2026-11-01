// Initialize Icons
lucide.createIcons();

// Chart Instances
let rainfallChartInstance = null;
let claimsPieChartInstance = null;
let pmfChartInstance = null;
let heroMiniChartInstance = null;

// Initialize Dashboard Visualizations on Load
document.addEventListener("DOMContentLoaded", () => {
    initHeroChart();
    initRainfallChart();
    initClaimsPieChart();
    initPMFChart(1000, 0.385); // Initial Demo PMF
});

// 1. Hero Mini Sparkline Chart
function initHeroChart() {
    const ctx = document.getElementById('heroMiniChart').getContext('2d');
    heroMiniChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
            datasets: [{
                label: 'ONI SST Anomaly (°C)',
                data: [0.5, -0.9, -1.0, -0.8, 0.8, 1.5, 1.8],
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
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } }
        }
    });
}

// 2. Dashboard Rainfall vs ONI Chart
function initRainfallChart() {
    const ctx = document.getElementById('rainfallChart').getContext('2d');
    rainfallChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025 (E)'],
            datasets: [
                {
                    label: 'Monsoon Rainfall Deficit (%)',
                    data: [-12, +5, +2, -8, -18, -24, -20],
                    backgroundColor: '#10B981',
                    borderRadius: 6
                },
                {
                    label: 'El Niño ONI Anomaly (°C)',
                    data: [0.5, -0.4, -0.8, -0.6, 1.2, 1.6, 1.8],
                    type: 'line',
                    borderColor: '#F59E0B',
                    borderWidth: 3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { color: '#94A3B8' }, grid: { display: false } },
                y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y1: {
                    position: 'right',
                    ticks: { color: '#F59E0B' },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { labels: { color: '#F1F5F9' } }
            }
        }
    });
}

// 3. Historical Claim Distribution Pie Chart
function initClaimsPieChart() {
    const ctx = document.getElementById('claimsPieChart').getContext('2d');
    claimsPieChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Drought Loss', 'Excess Rain', 'Pest Attack', 'Other Risks'],
            datasets: [{
                data: [58, 22, 14, 6],
                backgroundColor: ['#EF4444', '#10B981', '#F59E0B', '#64748B'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#F1F5F9' } }
            }
        }
    });
}

// 4. Binomial Distribution PMF Chart
function initPMFChart(n, p) {
    const ctx = document.getElementById('pmfChart').getContext('2d');
    
    // Generate binomial distribution probability approximation points
    const expected = Math.round(n * p);
    const labels = [];
    const pmfData = [];

    // Range around expected mean for chart clarity
    const range = 15;
    for (let k = Math.max(0, expected - range); k <= expected + range; k++) {
        labels.push(k.toString());
        // Normal approximation formula for Binomial PMF rendering visualization
        const stdDev = Math.sqrt(n * p * (1 - p));
        const prob = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((k - expected) / stdDev, 2));
        pmfData.push(prob);
    }

    if (pmfChartInstance) {
        pmfChartInstance.destroy();
    }

    pmfChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'PMF Probability P(X=k)',
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
                x: { title: { display: true, text: 'Number of Claims (k)', color: '#94A3B8' }, ticks: { color: '#94A3B8' } },
                y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// 5. Predict Button Action & Backend Integration
async function handlePrediction(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Calculating...`;
    lucide.createIcons();

    // Payload data structure matching Spring Boot PredictRequest DTO
    const payload = {
        state: document.getElementById('stateSelect').value,
        crop: document.getElementById('cropSelect').value,
        season: document.getElementById('seasonSelect').value,
        elNinoIntensity: document.getElementById('elNinoSelect').value,
        insuredFarmers: parseInt(document.getElementById('insuredFarmers').value),
        sumInsured: parseFloat(document.getElementById('sumInsured').value)
    };

    try {
        // Attempt Spring Boot REST API Endpoint
        const response = await fetch('http://localhost:8080/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('API server unreachable');

        const result = await response.json();
        renderResults(result);

    } catch (err) {
        console.warn('Backend offline. Utilizing local client fallback engine.', err);
        // Fallback local probability computation model if Spring Boot backend is not running yet
        const result = computeLocalFallback(payload);
        renderResults(result);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i data-lucide="calculator"></i> Predict Claims`;
        lucide.createIcons();
    }
}

// Render Results to UI
function renderResults(data) {
    document.getElementById('resProb').textContent = (data.claimProbability * 100).toFixed(1) + '%';
    document.getElementById('resExpected').textContent = data.expectedClaims.toLocaleString();
    document.getElementById('resTotalN').textContent = data.insuredFarmers.toLocaleString();
    
    document.getElementById('resPayout').textContent = '₹' + data.estimatedPayout.toLocaleString('en-IN');
    document.getElementById('resPerFarmer').textContent = data.sumInsured.toLocaleString('en-IN');

    const badge = document.getElementById('riskBadge');
    badge.textContent = `${data.riskLevel} RISK`;
    badge.className = `risk-badge badge-${data.riskLevel.toLowerCase()}`;

    // Re-render PMF Chart
    initPMFChart(data.insuredFarmers, data.claimProbability);

    // Scroll to results smooth
    document.getElementById('resultsCard').scrollIntoView({ behavior: 'smooth' });
}

// Client Fallback Computation Logic
function computeLocalFallback(req) {
    let baseP = 0.15;

    // Intensity Scaling
    if (req.elNinoIntensity === 'Weak') baseP += 0.08;
    else if (req.elNinoIntensity === 'Moderate') baseP += 0.18;
    else if (req.elNinoIntensity === 'Strong') baseP += 0.28;
    else if (req.elNinoIntensity === 'Very Strong') baseP += 0.38;

    // Crop sensitivity
    if (req.crop === 'Soybean' || req.crop === 'Cotton') baseP += 0.05;

    const prob = Math.min(Math.max(baseP, 0.05), 0.95);
    const expected = Math.round(req.insuredFarmers * prob);
    const payout = expected * req.sumInsured;

    let risk = 'LOW';
    if (prob > 0.4) risk = 'HIGH';
    else if (prob > 0.25) risk = 'MEDIUM';

    return {
        claimProbability: prob,
        expectedClaims: expected,
        estimatedPayout: payout,
        insuredFarmers: req.insuredFarmers,
        sumInsured: req.sumInsured,
        riskLevel: risk
    };
}