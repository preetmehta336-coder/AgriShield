package com.agrishield.model;

public class PredictRequest {
    private String state;
    private String crop;
    private String season;
    private String elNinoIntensity;
    private int insuredFarmers;
    private double sumInsured;

    // Default Constructor
    public PredictRequest() {}

    // Getters and Setters
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCrop() { return crop; }
    public void setCrop(String crop) { this.crop = crop; }

    public String getSeason() { return season; }
    public void setSeason(String season) { this.season = season; }

    public String getElNinoIntensity() { return elNinoIntensity; }
    public void setElNinoIntensity(String elNinoIntensity) { this.elNinoIntensity = elNinoIntensity; }

    public int getInsuredFarmers() { return insuredFarmers; }
    public void setInsuredFarmers(int insuredFarmers) { this.insuredFarmers = insuredFarmers; }

    public double getSumInsured() { return sumInsured; }
    public void setSumInsured(double sumInsured) { this.sumInsured = sumInsured; }
}