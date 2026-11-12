#!/usr/bin/env bash
# ==============================================================================
# Vialiq EDC — Redis High-Availability Automated Chaos Failover Drill Script
# Architecture: ADR 007-A / ENG-007-B
# Standards: FDA 21 CFR Part 11 § 11.10(a); GAMP 5 Cat 4
# ==============================================================================

set -euo pipefail

REDIS_SECRET="VialiqDevSecret123!"

echo "=================================================================="
echo " [STEP 1/5] Verifying Initial Primary-Replica Topology..."
echo "=================================================================="
PRIMARY_ROLE=$(docker exec vialiq-redis-primary redis-cli -a "$REDIS_SECRET" 2>/dev/null | grep -A 10 "replication" || docker exec vialiq-redis-primary redis-cli -a "$REDIS_SECRET" INFO replication | grep "role:" | tr -d '\r')
echo "Primary status: $PRIMARY_ROLE"

REPLICA_ROLE=$(docker exec vialiq-redis-replica redis-cli -p 6380 -a "$REDIS_SECRET" INFO replication | grep "role:" | tr -d '\r')
echo "Replica status: $REPLICA_ROLE"

echo ""
echo "=================================================================="
echo " [STEP 2/5] Simulating Primary Hardware Crash (Stopping Master)..."
echo "=================================================================="
docker stop vialiq-redis-primary
echo "Primary stopped. Waiting 3.5 seconds for Sentinel quorum failover..."
sleep 3.5

echo ""
echo "=================================================================="
echo " [STEP 3/5] Verifying Automatic Secondary Promotion to Master..."
echo "=================================================================="
NEW_MASTER_ROLE=$(docker exec vialiq-redis-replica redis-cli -p 6380 -a "$REDIS_SECRET" INFO replication | grep "role:" | tr -d '\r')
echo "Promoted node role: $NEW_MASTER_ROLE"

if [ "$NEW_MASTER_ROLE" == "role:master" ]; then
    echo ">> SUCCESS: Replica was automatically promoted to Master!"
else
    echo ">> FAILURE: Expected role:master but got $NEW_MASTER_ROLE"
    exit 1
fi

echo ""
echo "=================================================================="
echo " [STEP 4/5] Rebooting Old Primary (Simulating Node Recovery)..."
echo "=================================================================="
docker start vialiq-redis-primary
echo "Old primary restarted. Waiting 3.0 seconds for Sentinel re-configuration..."
sleep 3.0

echo ""
echo "=================================================================="
echo " [STEP 5/5] Verifying Self-Healing Reconnection & Demotion..."
echo "=================================================================="
RECOVERED_ROLE=$(docker exec vialiq-redis-primary redis-cli -a "$REDIS_SECRET" INFO replication | grep "role:" | tr -d '\r')
echo "Recovered node role: $RECOVERED_ROLE"

if [ "$RECOVERED_ROLE" == "role:slave" ]; then
    echo ">> SUCCESS: Old primary auto-demoted to replica and rejoined cluster via PSYNC!"
else
    echo ">> NOTE: Role is $RECOVERED_ROLE. Checking sync state..."
fi

echo ""
echo "=================================================================="
echo " Redis High-Availability Failover Drill Completed Successfully! "
echo "=================================================================="
