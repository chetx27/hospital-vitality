package com.vitalgrid.core;

import com.vitalgrid.model.AlertEvent;
import com.vitalgrid.model.PatientVitals;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

public class VitalsConsumer implements Runnable {

    private final String name;
    private final BlockingQueue<PatientVitals> queue;
    private final AnalyticsDashboard dashboard;
    private final Consumer<PatientVitals> onProcessed;
    private final Consumer<AlertEvent> onAlert;

    public VitalsConsumer(String name,
                          BlockingQueue<PatientVitals> queue,
                          AnalyticsDashboard dashboard,
                          Consumer<PatientVitals> onProcessed,
                          Consumer<AlertEvent> onAlert) {
        this.name = name;
        this.queue = queue;
        this.dashboard = dashboard;
        this.onProcessed = onProcessed;
        this.onAlert = onAlert;
    }

    @Override
    public void run() {
        while (!Thread.currentThread().isInterrupted()) {
            try {
                PatientVitals v = queue.poll(3, TimeUnit.SECONDS);
                if (v == null) continue;
                
                dashboard.record(v);
                List<AlertEvent> alerts = checkThresholds(v);
                dashboard.recordAlerts(alerts);
                
                onProcessed.accept(v);
                alerts.forEach(a -> onAlert.accept(a));
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    private List<AlertEvent> checkThresholds(PatientVitals v) {
        List<AlertEvent> alerts = new ArrayList<>();
        
        // HR logic: < 60 or > 100 -> warning. critical if delta > 20%
        if (v.hr() < 60 || v.hr() > 100) {
            String sev = (v.hr() < 48 || v.hr() > 120) ? "critical" : "warning";
            double threshold = v.hr() < 60 ? 60 : 100;
            alerts.add(new AlertEvent(v.patientId(), v.name(), "hr", v.hr(), threshold, sev, v.timestamp()));
        }
        
        // SysBP logic: > 130 -> warning, > 150 -> critical
        if (v.sysBP() > 130) {
            String sev = v.sysBP() > 150 ? "critical" : "warning";
            double threshold = v.sysBP() > 150 ? 150 : 130;
            alerts.add(new AlertEvent(v.patientId(), v.name(), "sysBP", v.sysBP(), threshold, sev, v.timestamp()));
        }
        
        // SpO2 logic: < 95 -> warning, < 90 -> critical
        if (v.spo2() < 95) {
            String sev = v.spo2() < 90 ? "critical" : "warning";
            double threshold = v.spo2() < 90 ? 90 : 95;
            alerts.add(new AlertEvent(v.patientId(), v.name(), "spo2", v.spo2(), threshold, sev, v.timestamp()));
        }
        
        // Temp logic: > 37.5 -> warning, > 38.5 -> critical
        if (v.temp() > 37.5) {
            String sev = v.temp() > 38.5 ? "critical" : "warning";
            double threshold = v.temp() > 38.5 ? 38.5 : 37.5;
            alerts.add(new AlertEvent(v.patientId(), v.name(), "temp", v.temp(), threshold, sev, v.timestamp()));
        }
        
        return alerts;
    }
}
