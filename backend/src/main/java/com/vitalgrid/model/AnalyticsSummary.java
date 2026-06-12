package com.vitalgrid.model;

public record AnalyticsSummary(
    double avgHr,
    double avgSpo2,
    double avgTemp,
    long totalProcessed,
    long totalAlerts,
    String criticalPatientId
) {}
