package com.agrishield.model;

public class PredictResponse {
    private double claimProbability;
    private int expectedClaims;
    private double estimatedPayout;
    private int insuredFarmers;
    private double sumInsured;
    private String riskLevel;
    private double poissonRate; // Lambda

    public PredictResponse(double claimProbability, int expectedClaims, double estimatedPayout, 
                           int insuredFarmers, double sumInsured, String riskLevel, double poissonRate) {
        this.claimProbability = claimProbability;
        this.expectedClaims = expectedClaims;
        this.estimatedPayout = estimatedPayout;
        this.insuredFarmers = insuredFarmers;
        this.sumInsured = sumInsured;
        this.riskLevel = riskLevel;
        this.poissonRate = poissonRate;
    }

    public double getClaimProbability() { return claimProbability; }
    public int getExpectedClaims() { return expectedClaims; }
    public double getEstimatedPayout() { return estimatedPayout; }
    public int getInsuredFarmers() { return insuredFarmers; }
    public double getSumInsured() { return sumInsured; }
    public String getRiskLevel() { return riskLevel; }
    public double getPoissonRate() { return poissonRate; }
}