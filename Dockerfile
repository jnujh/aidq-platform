# ── 1단계: 빌드 ──
# Gradle로 Spring Boot를 빌드해서 JAR 파일 생성
FROM eclipse-temurin:17-jdk AS builder

WORKDIR /app
COPY gradle/ gradle/
COPY gradlew build.gradle settings.gradle ./
COPY src/ src/

RUN chmod +x gradlew && ./gradlew bootJar --no-daemon

# ── 2단계: 실행 ──
# 빌드된 JAR만 가져와서 가벼운 이미지로 실행
FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-Xms256m", "-Xmx512m", "-jar", "app.jar"]
