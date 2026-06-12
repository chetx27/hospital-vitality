# VitalGrid

VitalGrid is a production-grade, dark-themed ICU patient vitals monitoring system. It demonstrates real-time telemetry processing using a robust Spring Boot backend paired with a highly responsive React frontend.

## Producer-Consumer Pattern

The core architecture relies on the Producer-Consumer concurrency pattern to handle high-throughput vitals data without blocking.

- **LinkedBlockingQueue**: Chosen over `ArrayBlockingQueue` for its lightly contended separate locks for put and take operations, and over raw synchronized collections because it natively provides thread-safe, blocking operations (`put` and `poll` with timeout) necessary for producer-consumer synchronization.
- **Multiple Consumers**: Two consumers pull from the same queue to demonstrate parallel processing and horizontal scalability. They share the workload of threshold evaluation and alert generation.
- **Queue Full Behavior**: The `put()` method blocks if the queue hits its capacity (100). This naturally applies backpressure, slowing down the producer instead of dropping critical vitals data or causing OOM errors.
- **Queue Empty Behavior**: Consumers use `poll(3, TimeUnit.SECONDS)`. This timeout prevents a CPU-wasting busy-wait loop when the queue is empty, allowing the consumer thread to gracefully idle and check for interruption.
- **Thread Safety**: 
  - `ConcurrentHashMap` is used in the `AnalyticsDashboard` to safely handle multiple consumers recording history for the same patient concurrently.
  - `AtomicLong` is used for global counters (`totalProcessed`, `totalAlerts`) to avoid lock contention on simple metric increments.
  - `CopyOnWriteArrayList` is used to manage SSE emitters, allowing safe iteration while emitters are added or removed concurrently.

## Architecture

```text
  [ VitalsProducer ] (Generates Vitals)
          |
          v (put)
 [ LinkedBlockingQueue ] <--(capacity: 100)
       /     \
(poll)/       \(poll)
     v         v
[ Consumer1 ][ Consumer2 ]
     \         /
      v       v
 [ AnalyticsDashboard ] --> Stores history, calculates metrics
          |
          v
 [ MonitoringService ] --> Broadcasts via SSE
          |
          v
 [ React Frontend ] --> Renders real-time UI
```

## Running Locally

### Backend
Navigate to the `backend/` directory:
```bash
./mvnw spring-boot:run
```
*(If you do not have the maven wrapper, simply use `mvn spring-boot:run`)*

### Frontend
Navigate to the `frontend/` directory, install dependencies, and start the Vite dev server:
```bash
npm install
npm run dev
```

## Deployment

### Backend (Render)
A `Dockerfile` is provided in the `backend/` directory. 
- Build command: `mvn clean package -DskipTests`
- Start command: `java -jar target/*.jar`
Deploy as a Web Service on Render using the Docker environment.

### Frontend (Vercel)
Deploy the `frontend/` directory to Vercel.
- Build command: `npm run build`
- Output directory: `dist/`
Set the environment variable `.env.production`: `VITE_API_URL=https://your-render-app.onrender.com`

## Concurrency Decisions
1. **Daemon Threads**: Producer and Consumer threads are set as daemon threads (`setDaemon(true)`). This ensures they do not block the JVM from shutting down when the Spring Boot application exits.
2. **CopyOnWriteArrayList for Emitters**: Since SSE emitters can drop connection at any time (triggering removal), concurrent modification during iteration is highly likely. `CopyOnWriteArrayList` provides safe iteration.
3. **Atomic Operations**: Thread-safe operations like `AtomicLong.incrementAndGet()` keep metric tracking lightweight and lock-free.
