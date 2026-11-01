package com.agrishield.controller;

import com.agrishield.model.PredictRequest;
import com.agrishield.model.PredictResponse;
import com.agrishield.service.ProbabilityDistributionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allows local frontend communication
public class PredictionController {

    @Autowired
    private ProbabilityDistributionService distributionService;

    @PostMapping("/predict")
    public PredictResponse predictClaims(@RequestBody PredictRequest request) {
        // 1. Calculate Bernoulli probability (p)
        double p = distributionService.calculateBernoulliProbability(
            request.getElNinoIntensity(), 
            request.getCrop()
        );

        // 2. Calculate Binomial Expected Claims (E[X] = n * p)
        int expectedClaims = distributionService.calculateBinomialExpectedClaims(
            request.getInsuredFarmers(), 
            p
        );

        // 3. Calculate Poisson rate lambda (λ = n * p)
        double lambda = distributionService.calculatePoissonRate(
            request.getInsuredFarmers(), 
            p
        );

        // 4. Calculate total estimated payout
        double payout = expectedClaims * request.getSumInsured();

        // 5. Classify Risk Level
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
}