package com.vitalgrid.model;

import java.time.LocalDateTime;

public record AlertEvent(
    String patientId,
    String patientName,
    String vitalType,
    double value,
    double threshold,
    String severity,
    LocalDateTime timestamp
) {}
