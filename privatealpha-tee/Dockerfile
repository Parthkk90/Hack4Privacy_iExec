FROM rust:1.75-slim as builder

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy manifests
COPY Cargo.toml ./

# Copy source
COPY src ./src

# Build for release
RUN cargo build --release

# Runtime image
FROM ubuntu:22.04

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy binaries
COPY --from=builder /app/target/release/credit-scorer /app/
COPY --from=builder /app/target/release/strategy-executor /app/

# Create iExec directories
RUN mkdir -p /iexec_in /iexec_out

# Set environment
ENV IEXEC_IN=/iexec_in
ENV IEXEC_OUT=/iexec_out

# Default entrypoint
ENTRYPOINT ["/app/credit-scorer"]
