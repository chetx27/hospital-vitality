package com.vitalgrid.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.vitalgrid.core.AnalyticsDashboard;
import com.vitalgrid.core.VitalsConsumer;
import com.vitalgrid.core.VitalsProducer;
import com.vitalgrid.model.AlertEvent;
import com.vitalgrid.model.AnalyticsSummary;
import com.vitalgrid.model.PatientVitals;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.function.Consumer;

@Service
public class MonitoringService {

    private final LinkedBlockingQueue<PatientVitals> queue = new LinkedBlockingQueue<>(100);
    private final AnalyticsDashboard dashboard = new AnalyticsDashboard();
    private final List<SseEmitter> activeEmitters = new CopyOnWriteArrayList<>();
    private final ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @PostConstruct
    public void init() {
        Consumer<PatientVitals> onProcessed = v -> {
            try {
                // Re-evaluate alerts for the payload as requested
                List<AlertEvent> alerts = checkThresholds(v);
                
                SsePayload payload = new SsePayload("vitals", v.patientId(), v.name(), v.hr(), v.sysBP(), v.diaBP(), v.spo2(), v.temp(), v.timestamp().toString(), alerts);
                String json = mapper.writeValueAsString(payload);
                
                for (SseEmitter emitter : activeEmitters) {
                    try {
                        emitter.send(SseEmitter.event().data(json).name("message"));
                    } catch (Exception e) {
                        activeEmitters.remove(emitter);
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        };

        Consumer<AlertEvent> onAlert = a -> {
            // Can log or process specific alerts here. SSE handles them in onProcessed.
        };

        Thread producer = new Thread(new VitalsProducer(queue), "vitals-producer");
        Thread consumer1 = new Thread(new VitalsConsumer("consumer-1", queue, dashboard, onProcessed, onAlert), "consumer-1");
        Thread consumer2 = new Thread(new VitalsConsumer("consumer-2", queue, dashboard, onProcessed, onAlert), "consumer-2");
        
        producer.setDaemon(true);
        consumer1.setDaemon(true);
        consumer2.setDaemon(true);
        
        producer.start();
        consumer1.start();
        consumer2.start();
    }

    public void registerEmitter(SseEmitter emitter) {
        activeEmitters.add(emitter);
        emitter.onCompletion(() -> activeEmitters.remove(emitter));
        emitter.onTimeout(() -> activeEmitters.remove(emitter));
        emitter.onError(e -> activeEmitters.remove(emitter));
    }

    public AnalyticsSummary getAnalytics() {
        return dashboard.getSnapshot();
    }

    public Collection<PatientVitals> getPatients() {
        return dashboard.getLatestAll();
    }

    public List<PatientVitals> getHistory(String patientId) {
        return dashboard.getHistory(patientId);
    }

    public static List<AlertEvent> checkThresholds(PatientVitals v) {
        List<AlertEvent> alerts = new ArrayList<>();
        if (v.hr() < 60 || v.hr() > 100) {
            String sev = (v.hr() < 48 || v.hr() > 120) ? "critical" : "warning";
            double threshold = v.hr() < 60 ? 60 : 100;
            alerts.add(new AlertEvent(v.patientId(), v.name(), "hr", v.hr(), threshold, sev, v.timestamp()));
        }
        if (v.sysBP() > 130) {
            String sev = v.sysBP() > 150 ? "critical" : "warning";
            double threshold = v.sysBP() > 150 ? 150 : 130;
            alerts.add(new AlertEvent(v.patientId(), v.name(), "sysBP", v.sysBP(), threshold, sev, v.timestamp()));
        }
        if (v.spo2() < 95) {
            String sev = v.spo2() < 90 ? "critical" : "warning";
            double threshold = v.spo2() < 90 ? 90 : 95;
            alerts.add(new AlertEvent(v.patientId(), v.name(), "spo2", v.spo2(), threshold, sev, v.timestamp()));
        }
        if (v.temp() > 37.5) {
            String sev = v.temp() > 38.5 ? "critical" : "warning";
            double threshold = v.temp() > 38.5 ? 38.5 : 37.5;
            alerts.add(new AlertEvent(v.patientId(), v.name(), "temp", v.temp(), threshold, sev, v.timestamp()));
        }
        return alerts;
    }

    public record SsePayload(
        String type, String patientId, String name, int hr, int sysBP, int diaBP,
        double spo2, double temp, String timestamp, List<AlertEvent> alerts
    ) {}
}
