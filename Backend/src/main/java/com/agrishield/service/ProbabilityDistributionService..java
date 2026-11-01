package com.agrishield.service;

import org.springframework.stereotype.Service;

@Service
public class ProbabilityDistributionService {

    /**
     * 1. Bernoulli Distribution:
     * Represents probability (p) of a single farmer submitting a claim under El Niño conditions.
     */
    public double calculateBernoulliProbability(String elNinoIntensity, String crop) {
        double baseP = 0.12;

        switch (elNinoIntensity) {
            case "Weak":
                baseP += 0.08;
                break;
            case "Moderate":
                baseP += 0.18;
                break;
            case "Strong":
                baseP += 0.28;
                break;
            case "Very Strong":
                baseP += 0.38;
                break;
            default: // Neutral
                baseP += 0.02;
                break;
        }

        if (crop.equalsIgnoreCase("Soybean") || crop.equalsIgnoreCase("Cotton")) {
            baseP += 0.05;
        }

        return Math.min(Math.max(baseP, 0.05), 0.95);
    }

    /**
     * 2. Binomial Distribution:
     * Expected number of claims E[X] = n * p across all N insured farmers.
     */
    public int calculateBinomialExpectedClaims(int n, double p) {
        return (int) Math.round(n * p);
    }

    /**
     * 3. Poisson Distribution:
     * Estimates claim arrival intensity over period (Lambda = n * p).
     */
    public double calculatePoissonRate(int n, double p) {
        return n * p;
    }

    public String classifyRisk(double claimProbability) {
        if (claimProbability > 0.40) {
            return "HIGH";
        } else if (claimProbability > 0.25) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }
}