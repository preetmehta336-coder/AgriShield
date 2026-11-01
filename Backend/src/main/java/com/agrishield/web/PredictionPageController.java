package com.agrishield.web;

import com.agrishield.model.PredictRequest;
import com.agrishield.model.PredictResponse;
import com.agrishield.service.ChartSvgService;
import com.agrishield.service.ProbabilityDistributionService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class PredictionPageController {
    private final ProbabilityDistributionService probabilityService;
    private final ChartSvgService chartService;

    public PredictionPageController(ProbabilityDistributionService probabilityService, ChartSvgService chartService) {
        this.probabilityService = probabilityService;
        this.chartService = chartService;
    }

    @GetMapping({"/", "/index"})
    public String home(Model model) {
        PredictRequest request = new PredictRequest();
        request.setState("Maharashtra");
        request.setCrop("Soybean");
        request.setSeason("Kharif");
        request.setElNinoIntensity("Moderate");
        request.setInsuredFarmers(1000);
        request.setSumInsured(45000);
        model.addAttribute("request", request);
        addPageAssets(model, 1000, 0.385);
        model.addAttribute("hasPrediction", false);
        model.addAttribute("claimProbability", 0.385);
        model.addAttribute("expectedClaims", 385);
        model.addAttribute("estimatedPayout", 17325000.0);
        model.addAttribute("riskLevel", "HIGH");
        model.addAttribute("poissonRate", 385.0);
        model.addAttribute("insuredFarmers", 1000);
        model.addAttribute("sumInsured", 45000.0);
        return "index";
    }

    @PostMapping("/predict")
    public String predict(@ModelAttribute("request") PredictRequest request, Model model) {
        if (request.getInsuredFarmers() < 10 || request.getInsuredFarmers() > 100000 || request.getSumInsured() < 1000) {
            model.addAttribute("validationError", "Enter 10–100,000 insured farmers and a sum insured of at least ₹1,000.");
            addPageAssets(model, Math.max(10, Math.min(request.getInsuredFarmers(), 100000)), 0.385);
            model.addAttribute("hasPrediction", false);
            model.addAttribute("claimProbability", 0.385);
            model.addAttribute("expectedClaims", 385);
            model.addAttribute("estimatedPayout", 17325000.0);
            model.addAttribute("riskLevel", "HIGH");
            model.addAttribute("poissonRate", 385.0);
            model.addAttribute("insuredFarmers", request.getInsuredFarmers());
            model.addAttribute("sumInsured", request.getSumInsured());
            return "index";
        }

        double p = probabilityService.calculateBernoulliProbability(request.getElNinoIntensity(), request.getCrop());
        int expected = probabilityService.calculateBinomialExpectedClaims(request.getInsuredFarmers(), p);
        double lambda = probabilityService.calculatePoissonRate(request.getInsuredFarmers(), p);
        double payout = expected * request.getSumInsured();
        String risk = probabilityService.classifyRisk(p);

        addPageAssets(model, request.getInsuredFarmers(), p);
        model.addAttribute("hasPrediction", true);
        model.addAttribute("claimProbability", p);
        model.addAttribute("expectedClaims", expected);
        model.addAttribute("estimatedPayout", payout);
        model.addAttribute("riskLevel", risk);
        model.addAttribute("poissonRate", lambda);
        model.addAttribute("insuredFarmers", request.getInsuredFarmers());
        model.addAttribute("sumInsured", request.getSumInsured());
        return "index";
    }

    private void addPageAssets(Model model, int n, double p) {
        model.addAttribute("heroChartSvg", chartService.heroChart());
        model.addAttribute("rainfallChartSvg", chartService.rainfallChart());
        model.addAttribute("claimsDonutSvg", chartService.claimsDonutChart());
        model.addAttribute("pmfChartSvg", chartService.pmfChart(n, p));
    }
}
