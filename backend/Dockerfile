FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

COPY mvnw pom.xml ./
COPY .mvn ./.mvn
RUN chmod +x ./mvnw && ./mvnw -q -DskipTests dependency:go-offline

COPY src ./src
RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY render-entrypoint.sh ./render-entrypoint.sh
COPY --from=build /app/target/*.jar ./app.jar

RUN chmod +x ./render-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["./render-entrypoint.sh"]
