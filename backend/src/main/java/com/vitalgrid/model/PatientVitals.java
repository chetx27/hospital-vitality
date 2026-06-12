package com.vitalgrid.model;

import java.time.LocalDateTime;

public record PatientVitals(
    String patientId,
    String name,
    int hr,
    int sysBP,
    int diaBP,
    double spo2,
    double temp,
    LocalDateTime timestamp
) {}
