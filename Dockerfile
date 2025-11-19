# Build stage
FROM denoland/deno:2.5.6 AS builder

WORKDIR /app

# Copy project files
COPY . .

RUN deno cache main.tsx

# Production stage
FROM denoland/deno:2.5.6
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--unstable-kv", "main.tsx"]
