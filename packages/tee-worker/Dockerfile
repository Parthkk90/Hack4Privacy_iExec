# Multi-stage build for optimized Docker image

# Stage 1: Build
FROM rust:1.75 as builder

WORKDIR /app

# Copy manifests
COPY Cargo.toml ./

# Copy source code
COPY src ./src

# Build release binary
RUN cargo build --release

# Stage 2: Runtime
FROM debian:bookworm-slim

RUN apt-get update && \
    apt-get install -y ca-certificates libssl3 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy binaries from builder
COPY --from=builder /app/target/release/credit-scorer /app/
COPY --from=builder /app/target/release/strategy-executor /app/

# Set executable permissions
RUN chmod +x /app/credit-scorer /app/strategy-executor

# Default command (can be overridden)
CMD ["/app/credit-scorer"]
