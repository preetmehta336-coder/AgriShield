package com.agrishield.controller;

import com.agrishield.model.PredictRequest;
import com.agrishield.model.PredictResponse;
import com.agrishield.service.ProbabilityDistributionService;
import com.agrishield.service.AgricultureDataService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PredictionController {

    @Autowired
    private ProbabilityDistributionService distributionService;

    @Autowired
    private AgricultureDataService agricultureDataService;

    // ==========================================
    // 1. CLAIM PREDICTION ENDPOINT
    // ==========================================
    @PostMapping("/predict")
    public PredictResponse predictClaims(
            @RequestBody PredictRequest request) {

        double p = distributionService.calculateBernoulliProbability(
                request.getElNinoIntensity(),
                request.getCrop()
        );

        int expectedClaims =
                distributionService.calculateBinomialExpectedClaims(
                        request.getInsuredFarmers(),
                        p
                );

        double lambda = distributionService.calculatePoissonRate(
                request.getInsuredFarmers(),
                p
        );

        double payout = expectedClaims * request.getSumInsured();

        String risk = distributionService.classifyRisk(p);

        return new PredictResponse(
                p,
                expectedClaims,
                payout,
                request.getInsuredFarmers(),
                request.getSumInsured(),
                risk,
                lambda
        );
    }

    // ==========================================
    // 2. DASHBOARD METRICS ENDPOINT
    // ==========================================
    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardMetrics() {

        Map<String, Object> metrics = new LinkedHashMap<>();

        // These values remain placeholders until
        // actual dataset calculations are implemented.
        metrics.put("totalFarmers", 0);
        metrics.put("totalClaims", 0);
        metrics.put("currentONI", "Unavailable");
        metrics.put("overallRisk", "Unavailable");

        return metrics;
    }

    // ==========================================
    // 3. DATASET AVAILABILITY ENDPOINT
    // ==========================================
    @GetMapping("/datasets/status")
    public Map<String, Boolean> getDatasetStatus() {

        Map<String, Boolean> status = new LinkedHashMap<>();

        status.put(
                "pmfby",
                agricultureDataService.datasetExists(
                        "state-level-pmfby.csv"
                )
        );

        status.put(
                "rainfall",
                agricultureDataService.datasetExists(
                        "rainfall_statewise_daily_imd.csv"
                )
        );

        status.put(
                "oni",
                agricultureDataService.datasetExists(
                        "oni_data.txt"
                )
        );

        status.put(
                "claims",
                agricultureDataService.datasetExists(
                        "claims_by_state_year_with_oni.csv"
                )
        );

        return status;
    }
}
