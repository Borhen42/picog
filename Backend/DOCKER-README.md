# Docker setup

Each service has its own `docker-compose.yml`. They all attach to one **external** Docker
network called `shared_network` so containers can reach each other by name.

## 0. Create the shared network (once)

```bash
docker network create shared_network
```

## 1. Build the jars (needed before building images)

The Dockerfiles copy the pre-built jar from each service's `target/` folder, so build first:

```bash
# from each service folder (eureka-server, apiGateway, medical-service, mmse-service)
./mvnw -DskipTests package
```

Jars are already present for all four services.

## 2a. Start everything with one command (root compose)

The root `docker-compose.yml` pulls in every service via `include:`:

```bash
docker compose up -d --build   # from the Backend/ root
docker compose down            # stop everything
```

## 2b. Or start each service separately (order matters)

```bash
# infrastructure
cd keycloak        && docker compose up -d --build && cd ..
cd eureka-server   && docker compose up -d --build && cd ..

# databases + microservices
cd medical-service && docker compose up -d --build && cd ..
cd mmse-service    && docker compose up -d --build && cd ..

# gateway (last, once services are registered)
cd apiGateway      && docker compose up -d --build && cd ..
```

## Endpoints

| Component        | Container name  | Host URL                          |
|------------------|-----------------|-----------------------------------|
| Keycloak         | keycloak        | http://localhost:8082 (admin/admin) |
| Eureka dashboard | eureka-server   | http://localhost:8761             |
| API Gateway      | api-gateway     | http://localhost:8093             |
| medical-service  | medical-service | http://localhost:8083             |
| mmse-service     | mmse-service    | http://localhost:8085             |
| medical MySQL    | medical-mysql   | localhost:3307 (db `medical_db`)  |
| mmse MySQL       | mmse-mysql      | localhost:3308 (db `mmse_db`)     |

## Routing through the gateway

- `http://localhost:8093/api/medical-records/**` → medical-service
- `http://localhost:8093/api/consultations/**`   → medical-service
- `http://localhost:8093/api/mmse/**`            → mmse-service

## Notes

- Inter-container Eureka URL is overridden via `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE`
  to `http://eureka-server:8080/eureka/` (Eureka runs on container port 8080, exposed on host 8761).
- Each microservice gets its **own** MySQL container and database; datasource is overridden
  via `SPRING_DATASOURCE_*` env vars pointing at that container.
