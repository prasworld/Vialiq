#!/usr/bin/env bash
# ==============================================================================
# Vialiq EDC — Redis High-Availability Automated Chaos Failover Drill Script
# Architecture: ADR 007-A / ENG-007-B
# Standards: FDA 21 CFR Part 11 § 11.10(a); GAMP 5 Cat 4
# ==============================================================================

set -euo pipefail

REDIS_SECRET="${VIALIQ_REDIS_PASSWORD:-VialiqDevSecret123!}"

CLEANUP_NEEDED=0
CRASH_CONTAINER=""

cleanup() {
    if [ "$CLEANUP_NEEDED" -eq 1 ] && [ -n "$CRASH_CONTAINER" ]; then
        echo ""
        echo ">> CLEANUP TRAP: Restoring stopped master ($CRASH_CONTAINER) to maintain cluster availability..."
        docker start "$CRASH_CONTAINER" >/dev/null 2>&1 || true
    fi
}
trap cleanup EXIT INT TERM

# Ensure HA Sentinel topology is running before executing drill
if ! docker ps --format '{{.Names}}' | grep -q "^vialiq-sentinel-1$"; then
    echo ">> HA Sentinel topology is not running. Stopping standalone and booting tools/docker/docker-compose.redis-ha.yml..."
    docker compose -f tools/docker/docker-compose.redis-dev.yml stop 2>/dev/null || true
    docker compose -f tools/docker/docker-compose.redis-ha.yml up -d
    echo ">> Waiting 4 seconds for Sentinel quorum initialization..."
    sleep 4
fi

echo "=================================================================="
echo " [STEP 1/5] Verifying Initial Primary-Replica Topology via Sentinel..."
echo "=================================================================="
MASTER_PORT=""
for i in $(seq 1 10); do
    MASTER_PORT=$(docker exec vialiq-sentinel-1 redis-cli -p 26379 -a "$REDIS_SECRET" sentinel get-master-addr-by-name mymaster 2>/dev/null | sed -n '2p' | tr -d '\r' || true)
    if [ "$MASTER_PORT" == "6379" ] || [ "$MASTER_PORT" == "6380" ]; then
        break
    fi
    sleep 1
done

if [ "$MASTER_PORT" == "6379" ]; then
    CRASH_CONTAINER="vialiq-redis-primary"
    CRASH_PORT="6379"
    SURVIVING_CONTAINER="vialiq-redis-replica"
    SURVIVING_PORT="6380"
    echo "Current Master: vialiq-redis-primary (Port 6379)"
    echo "Current Replica: vialiq-redis-replica (Port 6380)"
elif [ "$MASTER_PORT" == "6380" ]; then
    CRASH_CONTAINER="vialiq-redis-replica"
    CRASH_PORT="6380"
    SURVIVING_CONTAINER="vialiq-redis-primary"
    SURVIVING_PORT="6379"
    echo "Current Master: vialiq-redis-replica (Port 6380)"
    echo "Current Replica: vialiq-redis-primary (Port 6379)"
else
    echo ">> FAILURE: Sentinel failed to resolve master address within 10s. Reported port: '$MASTER_PORT'"
    exit 1
fi

echo ""
echo "=================================================================="
echo " [STEP 2/5] Simulating Master Hardware Crash (Stopping $CRASH_CONTAINER)..."
echo "=================================================================="
CLEANUP_NEEDED=1
docker stop "$CRASH_CONTAINER"
echo "$CRASH_CONTAINER stopped. Waiting for Sentinel quorum failover & leader election..."

echo ""
echo "=================================================================="
echo " [STEP 3/5] Verifying Automatic Secondary Promotion to Master..."
echo "=================================================================="
PROMOTED=0
NEW_MASTER_ROLE=""
for i in $(seq 1 20); do
    NEW_MASTER_ROLE=$(docker exec "$SURVIVING_CONTAINER" redis-cli -p "$SURVIVING_PORT" -a "$REDIS_SECRET" INFO replication 2>/dev/null | grep "role:" | tr -d '\r' || true)
    if [ "$NEW_MASTER_ROLE" == "role:master" ]; then
        PROMOTED=1
        echo "Promoted node role: $NEW_MASTER_ROLE (verified on attempt $i)"
        break
    fi
    sleep 1
done

if [ "$PROMOTED" -eq 1 ]; then
    echo ">> SUCCESS: $SURVIVING_CONTAINER was automatically promoted to Master!"
else
    echo ">> FAILURE: Expected role:master within 20s window, but node remained: '$NEW_MASTER_ROLE'"
    echo ">> RESTORING: Restarting stopped master ($CRASH_CONTAINER) before exiting to prevent cluster outage..."
    docker start "$CRASH_CONTAINER" >/dev/null 2>&1 || true
    CLEANUP_NEEDED=0
    exit 1
fi

echo ""
echo "=================================================================="
echo " [STEP 4/5] Rebooting Old Master (Simulating Node Recovery)..."
echo "=================================================================="
docker start "$CRASH_CONTAINER"
CLEANUP_NEEDED=0
echo "$CRASH_CONTAINER restarted. Polling Sentinel reconfiguration & PSYNC replication stream..."

echo ""
echo "=================================================================="
echo " [STEP 5/5] Verifying Self-Healing Reconnection, Demotion & Sync State..."
echo "=================================================================="
DEMOTED=0
SYNCED=0
RECOVERED_ROLE=""
MASTER_LINK=""
for i in $(seq 1 20); do
    INFO_REP=$(docker exec "$CRASH_CONTAINER" redis-cli -p "$CRASH_PORT" -a "$REDIS_SECRET" INFO replication 2>/dev/null || true)
    RECOVERED_ROLE=$(echo "$INFO_REP" | grep "^role:" | tr -d '\r' || true)
    MASTER_LINK=$(echo "$INFO_REP" | grep "^master_link_status:" | tr -d '\r' || true)

    if [ "$RECOVERED_ROLE" == "role:slave" ] && [ "$MASTER_LINK" == "master_link_status:up" ]; then
        DEMOTED=1
        SYNCED=1
        echo "Recovered node state: $RECOVERED_ROLE, $MASTER_LINK (verified on attempt $i)"
        break
    elif [ "$RECOVERED_ROLE" == "role:slave" ]; then
        DEMOTED=1
    fi
    sleep 1
done

if [ "$SYNCED" -eq 1 ]; then
    echo ">> SUCCESS: $CRASH_CONTAINER auto-demoted to replica and synchronized via PSYNC (master_link_status:up)!"
else
    echo ">> FAILURE: Node failed to re-synchronize as replica within 20s window. Final state: '$RECOVERED_ROLE', '$MASTER_LINK'"
    exit 1
fi

echo ""
echo "=================================================================="
echo " Redis High-Availability Failover Drill Completed Successfully! "
echo "=================================================================="
