package com.vitalgrid.controller;

import com.vitalgrid.model.AnalyticsSummary;
import com.vitalgrid.model.PatientVitals;
import com.vitalgrid.service.MonitoringService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Collection;
import java.util.List;

@RestController
@RequestMapping("/api/vitals")
@CrossOrigin(origins = "*")
public class VitalsController {

    private final MonitoringService monitoringService;

    public VitalsController(MonitoringService monitoringService) {
        this.monitoringService = monitoringService;
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamVitals() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        monitoringService.registerEmitter(emitter);
        return emitter;
    }

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsSummary> getAnalytics() {
        return ResponseEntity.ok(monitoringService.getAnalytics());
    }

    @GetMapping("/patients")
    public ResponseEntity<Collection<PatientVitals>> getPatients() {
        return ResponseEntity.ok(monitoringService.getPatients());
    }

    @GetMapping("/history/{patientId}")
    public ResponseEntity<List<PatientVitals>> getHistory(@PathVariable String patientId) {
        return ResponseEntity.ok(monitoringService.getHistory(patientId));
    }
}
