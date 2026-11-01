package com.agrishield.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

@Service
public class AgricultureDataService {

    @Value("${agrishield.data.directory}")
    private String dataDirectory;

    public long countDataRows(String fileName) throws IOException {
        Path filePath = Paths.get(dataDirectory, fileName);

        if (!Files.exists(filePath)) {
            throw new IOException(
                "Dataset not found: " + filePath
            );
        }

        try (Stream<String> lines = Files.lines(filePath)) {
            return Math.max(0, lines.count() - 1);
        }
    }

    public boolean datasetExists(String fileName) {
        Path filePath = Paths.get(dataDirectory, fileName);
        return Files.isRegularFile(filePath);
    }
}