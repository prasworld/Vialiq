# ==============================================================================
# Vialiq EDC — Custom MongoDB 7.0 Dockerfile (ARM64 Native)
# ==============================================================================
# Target Platforms: Apple Silicon (M1 Pro, M2, M3, M4, M5 Pro) & Linux ARM64/AMD64
# Base: Official MongoDB Community 7.0 Linux Image
# ==============================================================================

FROM mongo:7.0

LABEL maintainer="Vialiq EDC Platform Engineering <devops@vialiq.health>"
LABEL description="Optimized MongoDB 7.0 container for Vialiq EDC 3-Layer Cluster"
LABEL architecture="arm64"

# Set default environment variables
ENV MONGO_INITDB_ROOT_USERNAME="" \
    MONGO_INITDB_ROOT_PASSWORD="" \
    MONGO_REPLICA_SET_NAME="rs-admin" \
    MONGO_PORT=27017 \
    WIREDTIGER_CACHE_SIZE_GB=0.5

# Install diagnostic utilities useful for clinical database administration & networking
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    procps \
    net-tools \
    dnsutils \
    && rm -rf /var/lib/apt/lists/*

# Create directory for custom configs and scripts
RUN mkdir -p /etc/mongo /docker-entrypoint-initdb.d

# Copy default mongod configuration template
COPY mongod.conf /etc/mongo/mongod.conf

# Add custom healthcheck script
COPY healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

# Expose MongoDB standard port
EXPOSE 27017

# Healthcheck configuration
HEALTHCHECK --interval=5s --timeout=5s --retries=5 --start-period=10s \
    CMD /usr/local/bin/healthcheck.sh

# Default command: launch mongod with custom config
CMD ["mongod", "--config", "/etc/mongo/mongod.conf"]
