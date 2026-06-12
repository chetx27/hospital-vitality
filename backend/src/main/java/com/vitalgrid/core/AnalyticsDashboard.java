package com.vitalgrid.core;

import com.vitalgrid.model.AnalyticsSummary;
import com.vitalgrid.model.PatientVitals;
import com.vitalgrid.model.AlertEvent;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

public class AnalyticsDashboard {

    private final ConcurrentHashMap<String, List<PatientVitals>> histories = new ConcurrentHashMap<>();
    private final AtomicLong totalProcessed = new AtomicLong(0);
    private final AtomicLong totalAlerts = new AtomicLong(0);
    private volatile String criticalPatientId = null;

    public void record(PatientVitals v) {
        histories.compute(v.patientId(), (k, list) -> {
            if (list == null) list = new ArrayList<>();
            list.add(v);
            if (list.size() > 30) {
                list.remove(0);
            }
            return list;
        });
        totalProcessed.incrementAndGet();
    }
    
    public void recordAlerts(List<AlertEvent> alerts) {
        if (!alerts.isEmpty()) {
            totalAlerts.addAndGet(alerts.size());
            for (AlertEvent a : alerts) {
                if ("critical".equals(a.severity())) {
                    criticalPatientId = a.patientId();
                }
            }
        }
    }

    public AnalyticsSummary getSnapshot() {
        double sumHr = 0, sumSpo2 = 0, sumTemp = 0;
        int count = 0;
        for (List<PatientVitals> list : histories.values()) {
            if (!list.isEmpty()) {
                PatientVitals latest = list.get(list.size() - 1);
                sumHr += latest.hr();
                sumSpo2 += latest.spo2();
                sumTemp += latest.temp();
                count++;
            }
        }
        double avgHr = count == 0 ? 0 : sumHr / count;
        double avgSpo2 = count == 0 ? 0 : sumSpo2 / count;
        double avgTemp = count == 0 ? 0 : sumTemp / count;
        
        return new AnalyticsSummary(
            Math.round(avgHr * 10.0) / 10.0,
            Math.round(avgSpo2 * 10.0) / 10.0,
            Math.round(avgTemp * 10.0) / 10.0,
            totalProcessed.get(),
            totalAlerts.get(),
            criticalPatientId
        );
    }

    public Collection<PatientVitals> getLatestAll() {
        return histories.values().stream()
                .filter(list -> !list.isEmpty())
                .map(list -> list.get(list.size() - 1))
                .collect(Collectors.toList());
    }

    public List<PatientVitals> getHistory(String patientId) {
        return histories.getOrDefault(patientId, Collections.emptyList());
    }
}
