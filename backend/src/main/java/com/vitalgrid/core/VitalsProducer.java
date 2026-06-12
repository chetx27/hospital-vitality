package com.vitalgrid.core;

import com.vitalgrid.model.PatientVitals;
import java.time.LocalDateTime;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ThreadLocalRandom;

public class VitalsProducer implements Runnable {

    private final BlockingQueue<PatientVitals> queue;

    private static final String[][] PATIENTS = {
        {"P001", "Arun Kumar"},
        {"P002", "Priya Nair"},
        {"P003", "Mohammed Rafi"},
        {"P004", "Sunita Sharma"},
        {"P005", "Vikram Das"},
        {"P006", "Anita Bose"}
    };

    public VitalsProducer(BlockingQueue<PatientVitals> queue) {
        this.queue = queue;
    }

    @Override
    public void run() {
        while (!Thread.currentThread().isInterrupted()) {
            for (String[] p : PATIENTS) {
                PatientVitals vitals = generateVitals(p[0], p[1]);
                try {
                    queue.put(vitals);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }
    }

    private PatientVitals generateVitals(String patientId, String name) {
        ThreadLocalRandom r = ThreadLocalRandom.current();
        boolean anomaly = r.nextDouble() < 0.15;

        int hr;
        if (anomaly && r.nextBoolean()) hr = r.nextBoolean() ? r.nextInt(30, 55) : r.nextInt(116, 140);
        else hr = (int) (72 + r.nextGaussian() * 20);

        int sysBP;
        if (anomaly && r.nextBoolean()) sysBP = r.nextBoolean() ? r.nextInt(60, 85) : r.nextInt(146, 180);
        else sysBP = (int) (118 + r.nextGaussian() * 15);

        int diaBP = (int) (76 + r.nextGaussian() * 10);

        double spo2;
        if (anomaly && r.nextBoolean()) spo2 = 85.0 + r.nextDouble() * 7.9;
        else spo2 = 97.5 + r.nextGaussian() * 1.5;
        if (spo2 > 100) spo2 = 100;

        double temp;
        if (anomaly && r.nextBoolean()) temp = 38.3 + r.nextDouble() * 2.0;
        else temp = 36.8 + r.nextGaussian() * 0.4;

        return new PatientVitals(patientId, name, hr, sysBP, diaBP, Math.round(spo2 * 10.0) / 10.0, Math.round(temp * 10.0) / 10.0, LocalDateTime.now());
    }
}
