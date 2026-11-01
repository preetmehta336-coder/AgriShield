# AgriShield — Java/Spring Boot Web Application

## Migration summary

The application now serves its web page from the Java Spring Boot application. Prediction form handling and probability calculations run on the server in Java, and charts are rendered as SVG by Java instead of being constructed by the original Chart.js application code.

The page layout and stylesheet have been carried forward. HTML and CSS remain because they are the browser's page markup and presentation layers; Java does not replace those web standards. The original frontend source files are retained in `migration-backup/original-frontend/` for reference. They are not used by the running application.

### Main runtime files

- `Backend/src/main/java/com/agrishield/Application.java` — application entry point.
- `Backend/src/main/java/com/agrishield/web/PredictionPageController.java` — serves the page and processes prediction form submissions.
- `Backend/src/main/java/com/agrishield/controller/PredictionController.java` — existing JSON prediction endpoint (`POST /api/predict`).
- `Backend/src/main/java/com/agrishield/service/ProbabilityDistributionService.java` — Java probability and risk calculations.
- `Backend/src/main/java/com/agrishield/service/ChartSvgService.java` — server-side SVG chart generation.
- `Backend/src/main/resources/templates/index.html` — server-rendered page template.
- `Backend/src/main/resources/static/style.css` — existing stylesheet.
- `data/oni_data.txt` — existing ONI file.
- `data/rainfall_data.csv` and `data/insurance_data.csv` — retained, but empty in the supplied source archive.

## Run locally

Requirements: JDK 17 or later and Maven.

Windows PowerShell:

```powershell
cd Backend
mvn spring-boot:run
```

Then open `http://localhost:8080` in a browser.

To build a runnable JAR:

```powershell
cd Backend
mvn clean package
java -jar target/backend-1.0.0.jar
```

## Data status — important

This migration does **not** claim that real-data integration is complete. The rainfall and insurance CSV files in the supplied archive were empty, and the existing dashboard contains demonstration values. The ONI file is preserved, but it has not yet been integrated into the probability estimator. The Java server-side charts currently preserve the demonstration series from the original frontend. Replace these with validated observations as a separate data-ingestion/modeling step before treating the outputs as real-world forecasts.

## Scope and behavior

- The prediction form submits to Java at `/predict`; the client-side prediction fallback has been removed.
- The existing JSON API at `/api/predict` remains available.
- Dashboard chart SVGs and the prediction PMF are generated on the server.
- The Lucide icon library is still loaded for visual icons; no custom client-side prediction or chart logic is required.
- The original HTML, CSS, and JavaScript are preserved under `migration-backup/original-frontend/` to avoid losing source during the migration.
