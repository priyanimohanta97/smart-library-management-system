# ==============================================================================
# Multi-stage Dockerfile for Athenaeum Smart Library Management System (Backend)
# Compatible with Render Docker Web Service deployment (Java 21 / Spring Boot 4)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Application Executable JAR
# ------------------------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace/app

# Layer cache: Resolve Maven dependencies prior to copying source code
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy application source code and datasets
COPY src ./src

# Compile and package executable fat JAR (skipping unit tests during container assembly)
RUN mvn clean package -DskipTests

# ------------------------------------------------------------------------------
# Stage 2: Production JRE 21 Lightweight Container
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-privileged system user for container runtime security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser:appgroup

# Copy executable Spring Boot JAR from build stage
COPY --from=builder /workspace/app/target/*.jar app.jar

# Render dynamically assigns external ports via the PORT environment variable
ENV PORT=8080
EXPOSE ${PORT}

# JVM Container Configuration:
# - UseContainerSupport: respects cgroup memory limits (512MB on Render free tier)
# - MaxRAMPercentage=75.0: caps heap at 75% container memory, leaving room for metaspace & OS
# - server.port: binds Spring Boot HTTP listener to Render's injected PORT variable
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Dserver.port=${PORT} -jar app.jar"]
