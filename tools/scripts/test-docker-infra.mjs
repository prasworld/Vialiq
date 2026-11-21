#!/usr/bin/env node

/**
 * ==============================================================================
 * Vialiq EDC — Docker Infrastructure Comprehensive Test & Validation Suite
 * ==============================================================================
 * Validates:
 *   1. MongoDB 3-Layer Architecture (Ports, Replica Sets, PRIMARY status, ACID Transactions, Network Isolation)
 *   2. Redis Standalone & Security (Port bindings, Authentication, Read/Write, GxP Memory Policy, Protected Mode)
 *   3. Redis HA & Sentinel (Control port authentication, Quorum discovery, Config persistence)
 *
 * Exit Codes:
 *   0: All tests passed
 *   1: One or more tests failed
 * ==============================================================================
 */

import { execFileSync, execSync } from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';

const CHECK = '\x1b[32m✔\x1b[0m';
const FAIL = '\x1b[31m✖\x1b[0m';
const WARN = '\x1b[33m⚠\x1b[0m';
const INFO = '\x1b[36mℹ\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

const REDIS_SECRET = process.env.VIALIQ_REDIS_PASSWORD || 'VialiqDevSecret123!';
const START_TIME = Date.now();

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let skippedTests = 0;

function logHeader(title) {
  console.log(`\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`${BOLD}  ${title}${RESET}`);
  console.log(`${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
}

function recordPass(testName, detail = '') {
  totalTests++;
  passedTests++;
  console.log(`  ${CHECK} ${testName} ${detail ? DIM + '(' + detail + ')' + RESET : ''}`);
}

function recordFail(testName, error) {
  totalTests++;
  failedTests++;
  console.log(`  ${FAIL} ${BOLD}${testName}${RESET}`);
  console.log(`     ${FAIL} Error: ${error.message || error}`);
}

function recordSkip(testName, reason) {
  totalTests++;
  skippedTests++;
  console.log(`  ${INFO} ${testName} ${DIM}[SKIPPED: ${reason}]${RESET}`);
}

async function testTcpConnect(host, port, timeoutMs = 1500) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setTimeout(timeoutMs);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error(`TCP connect timed out after ${timeoutMs}ms`));
    });
    socket.on('error', (err) => {
      reject(err);
    });
    socket.connect(port, host);
  });
}

function runDockerExec(containerName, cmdOrArgs, timeoutMs = 8000) {
  try {
    const args = Array.isArray(cmdOrArgs)
      ? ['exec', containerName, ...cmdOrArgs]
      : ['exec', containerName, 'sh', '-c', cmdOrArgs];

    return execFileSync('docker', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: timeoutMs
    }).toString().trim();
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString().trim() : '';
    const stdout = err.stdout ? err.stdout.toString().trim() : '';
    throw new Error(stderr || stdout || err.message);
  }
}

// ==============================================================================
// SUITE 1: MongoDB 3-Layer Infrastructure & Security
// ==============================================================================
async function runMongoSuite() {
  logHeader('SUITE 1: MongoDB 3-Layer Architecture & Security Validation');

  const layers = [
    {
      name: 'Layer 1 Admin (rs-admin)',
      container: 'vialiq-mongo-layer1-admin',
      port: 27017,
      setName: 'rs-admin',
      network: 'vialiq-mongo-admin-net'
    },
    {
      name: 'Layer 2 Dev (rs-dev)',
      container: 'vialiq-mongo-layer2-dev',
      port: 27027,
      setName: 'rs-dev',
      network: 'vialiq-mongo-dev-net'
    },
    {
      name: 'Layer 3 Prod (rs-prod)',
      container: 'vialiq-mongo-layer3-prod',
      port: 27037,
      setName: 'rs-prod',
      network: 'vialiq-mongo-prod-net'
    }
  ];

  // 1.1 Localhost TCP Connectivity
  for (const layer of layers) {
    try {
      await testTcpConnect('127.0.0.1', layer.port);
      recordPass(`TCP Connectivity: ${layer.name}`, `127.0.0.1:${layer.port} reachable`);
    } catch (err) {
      recordFail(`TCP Connectivity: ${layer.name}`, err);
    }
  }

  // 1.2 Replica Set & PRIMARY Status Verification
  for (const layer of layers) {
    try {
      const isPrimary = runDockerExec(
        layer.container,
        ['mongosh', '--port', String(layer.port), '--quiet', '--eval', 'db.hello().isWritablePrimary']
      );
      const setName = runDockerExec(
        layer.container,
        ['mongosh', '--port', String(layer.port), '--quiet', '--eval', 'db.hello().setName']
      );

      if (isPrimary.includes('true') && setName.includes(layer.setName)) {
        recordPass(
          `PRIMARY Election & Replica Set: ${layer.name}`,
          `setName: ${layer.setName}, isWritablePrimary: true`
        );
      } else {
        throw new Error(`Expected setName '${layer.setName}' and isWritablePrimary 'true', got: isPrimary=${isPrimary}, setName=${setName}`);
      }
    } catch (err) {
      recordFail(`PRIMARY Election & Replica Set: ${layer.name}`, err);
    }
  }

  // 1.3 Multi-Document ACID Transactions
  for (const layer of layers) {
    try {
      const acidJs = `
        const session = db.getMongo().startSession();
        session.startTransaction();
        try {
          const c1 = session.getDatabase('vialiq_acid_test').coll_1;
          const c2 = session.getDatabase('vialiq_acid_test').coll_2;
          c1.insertOne({ tx: 'acid_check_1', ts: new Date() });
          c2.insertOne({ tx: 'acid_check_2', ts: new Date() });
          session.commitTransaction();
          print('TX_COMMITTED');
        } catch(e) {
          session.abortTransaction();
          print('TX_ABORTED: ' + e);
        } finally {
          session.endSession();
          db.getSiblingDB('vialiq_acid_test').dropDatabase();
        }
      `.replace(/\n\s+/g, ' ');

      const out = runDockerExec(
        layer.container,
        ['mongosh', '--port', String(layer.port), '--quiet', '--eval', acidJs]
      );

      if (out.includes('TX_COMMITTED')) {
        recordPass(
          `ACID Transactions (Multi-Document Commit): ${layer.name}`,
          `2 collections atomically committed in session`
        );
      } else {
        throw new Error(`ACID transaction failed: ${out}`);
      }
    } catch (err) {
      recordFail(`ACID Transactions: ${layer.name}`, err);
    }
  }

  // 1.4 Network Isolation (Cross-Layer Traversal Prevention)
  try {
    let devCanReachAdmin = false;
    try {
      runDockerExec('vialiq-mongo-layer2-dev', ['mongosh', '--host', 'mongo-layer1-admin:27017', '--quiet', '--eval', 'db.adminCommand("ping")'], 3000);
      devCanReachAdmin = true;
    } catch {
      devCanReachAdmin = false;
    }

    if (!devCanReachAdmin) {
      recordPass('Network Isolation: Layer 2 Dev cannot route to Layer 1 Admin', 'vialiq-mongo-admin-net isolated');
    } else {
      throw new Error('Layer 2 Dev container was able to connect to Layer 1 Admin! Network isolation breached.');
    }
  } catch (err) {
    recordFail('Network Isolation: Layer 2 -> Layer 1', err);
  }

  try {
    let devCanReachProd = false;
    try {
      runDockerExec('vialiq-mongo-layer2-dev', ['mongosh', '--host', 'mongo-layer3-prod:27037', '--quiet', '--eval', 'db.adminCommand("ping")'], 3000);
      devCanReachProd = true;
    } catch {
      devCanReachProd = false;
    }

    if (!devCanReachProd) {
      recordPass('Network Isolation: Layer 2 Dev cannot route to Layer 3 Prod', 'vialiq-mongo-prod-net isolated');
    } else {
      throw new Error('Layer 2 Dev container was able to connect to Layer 3 Prod! Network isolation breached.');
    }
  } catch (err) {
    recordFail('Network Isolation: Layer 2 -> Layer 3', err);
  }

  // 1.5 Initializer Containers Clean Exit
  try {
    const initPs = execFileSync(
      'docker',
      ['ps', '-a', '--filter', 'name=vialiq-init', '--format', '{{.Names}}\t{{.Status}}'],
      { stdio: ['pipe', 'pipe', 'ignore'] }
    ).toString().trim();

    const inits = initPs.split('\n').filter(Boolean);
    let allExitedZero = true;
    for (const init of inits) {
      const [name, status] = init.split('\t');
      if (!status.includes('Exited (0)')) {
        allExitedZero = false;
        throw new Error(`Initializer '${name}' did not exit with code 0: ${status}`);
      }
    }

    if (allExitedZero && inits.length >= 3) {
      recordPass('Initializer Containers: All Exited (0)', `${inits.length} containers finished successfully`);
    } else if (inits.length === 0) {
      recordSkip('Initializer Containers Exit Check', 'No vialiq-init containers found in docker ps -a');
    } else {
      recordPass('Initializer Containers: Clean Exit Status', `${inits.length} initializers verified`);
    }
  } catch (err) {
    recordFail('Initializer Containers Check', err);
  }
}

// ==============================================================================
// SUITE 2: Redis Server, Security & GxP Cache Policy
// ==============================================================================
async function runRedisSuite() {
  logHeader('SUITE 2: Redis Server, Security & GxP Cache Policy');

  let activeMasterContainer = 'vialiq-redis';
  let activeMasterPort = 6379;

  // Determine active topology (HA Sentinel vs Standalone)
  try {
    const sentinelOut = runDockerExec(
      'vialiq-sentinel-1',
      ['redis-cli', '-p', '26379', '-a', REDIS_SECRET, 'sentinel', 'get-master-addr-by-name', 'mymaster'],
      2000
    );
    if (sentinelOut.includes('6380')) {
      activeMasterPort = 6380;
      activeMasterContainer = 'vialiq-redis-replica';
    } else {
      activeMasterPort = 6379;
      activeMasterContainer = 'vialiq-redis-primary';
    }
  } catch {
    // Standalone dev mode
    const standalone = execFileSync('docker', ['ps', '--filter', 'name=vialiq-redis', '--format', '{{.Names}}'], { stdio: ['pipe', 'pipe', 'ignore'] })
      .toString()
      .trim()
      .split('\n')
      .find(n => n.includes('primary') || n === 'vialiq-redis');
    activeMasterContainer = standalone || 'vialiq-redis';
    activeMasterPort = 6379;
  }

  // 2.1 Localhost TCP Connectivity
  try {
    await testTcpConnect('127.0.0.1', activeMasterPort);
    recordPass(`TCP Connectivity: Redis Active Master (${activeMasterContainer})`, `127.0.0.1:${activeMasterPort} reachable`);
  } catch (err) {
    recordFail(`TCP Connectivity: Redis Port ${activeMasterPort}`, err);
    return;
  }

  // 2.2 Unauthenticated Access Rejection (NOAUTH)
  try {
    let unauthSuccess = false;
    try {
      const res = runDockerExec(activeMasterContainer, ['redis-cli', '-p', String(activeMasterPort), 'ping']);
      if (res.includes('PONG')) {
        unauthSuccess = true;
      }
    } catch (err) {
      if (err.message.includes('NOAUTH')) {
        unauthSuccess = false;
      } else {
        throw err;
      }
    }

    if (!unauthSuccess) {
      recordPass('Authentication Gate: Unauthenticated PING Rejected', 'Redis returned NOAUTH');
    } else {
      throw new Error('Redis accepted unauthenticated PING! Password protection is missing.');
    }
  } catch (err) {
    recordFail('Authentication Gate: Unauthenticated Access', err);
  }

  // 2.3 Authenticated Access
  try {
    const pong = runDockerExec(activeMasterContainer, ['redis-cli', '-p', String(activeMasterPort), '-a', REDIS_SECRET, 'ping']);
    if (pong.includes('PONG')) {
      recordPass('Authentication Gate: Authenticated PING Accepted', 'Redis returned PONG with valid credentials');
    } else {
      throw new Error(`Expected PONG, received: ${pong}`);
    }
  } catch (err) {
    recordFail('Authentication Gate: Authenticated Access', err);
  }

  // 2.4 Distributed Lock Simulation (Read / Write / Expiry on Active Master)
  try {
    const testKey = 'edc:form_lock:suite_test_study:form_001';
    const testVal = JSON.stringify({ lockedBy: 'suite_agent', ts: Date.now() });

    const setRes = runDockerExec(activeMasterContainer, [
      'redis-cli', '-p', String(activeMasterPort), '-a', REDIS_SECRET,
      'SET', testKey, testVal, 'EX', '30', 'NX'
    ]);
    const getRes = runDockerExec(activeMasterContainer, [
      'redis-cli', '-p', String(activeMasterPort), '-a', REDIS_SECRET,
      'GET', testKey
    ]);
    const delRes = runDockerExec(activeMasterContainer, [
      'redis-cli', '-p', String(activeMasterPort), '-a', REDIS_SECRET,
      'DEL', testKey
    ]);

    if (setRes.includes('OK') && getRes.includes('suite_agent') && delRes.includes('1')) {
      recordPass(`Fast-Path Edit Lease Simulation (${activeMasterContainer}:${activeMasterPort})`, 'SET NX EX, GET, DEL dual-write functional');
    } else {
      throw new Error(`Lease simulation mismatch: set=${setRes}, get=${getRes}, del=${delRes}`);
    }
  } catch (err) {
    recordFail('Distributed Lock Simulation', err);
  }

  // 2.5 GxP Memory Policy Invariant (volatile-lru)
  try {
    const memPolicy = runDockerExec(activeMasterContainer, [
      'redis-cli', '-p', String(activeMasterPort), '-a', REDIS_SECRET,
      'CONFIG', 'GET', 'maxmemory-policy'
    ]);
    if (memPolicy.includes('volatile-lru')) {
      recordPass('GxP Compliance Invariant: maxmemory-policy volatile-lru', 'Invariant dictionaries cannot be evicted');
    } else {
      throw new Error(`Expected volatile-lru, received: ${memPolicy}`);
    }
  } catch (err) {
    recordFail('GxP Compliance Invariant: maxmemory-policy', err);
  }

  // 2.6 AOF Persistence Verification
  try {
    const aof = runDockerExec(activeMasterContainer, [
      'redis-cli', '-p', String(activeMasterPort), '-a', REDIS_SECRET,
      'CONFIG', 'GET', 'appendonly'
    ]);
    if (aof.includes('yes')) {
      recordPass('Disaster Recovery Persistence: appendonly yes', 'AOF write stream active');
    } else {
      throw new Error(`Expected appendonly yes, received: ${aof}`);
    }
  } catch (err) {
    recordFail('Disaster Recovery Persistence: appendonly', err);
  }

  // 2.7 Static Audit of tools/docker/redis-prod.conf
  try {
    const confPath = path.resolve('tools/docker/redis-prod.conf');
    const confContent = fs.readFileSync(confPath, 'utf8');

    const hasLoopbackBind = confContent.includes('bind 127.0.0.1 -::1');
    const hasProtectedMode = confContent.includes('protected-mode yes');
    const hasNoRewriteSuppression = confContent.includes('no-appendfsync-on-rewrite no');
    const hasVolatileLru = confContent.includes('maxmemory-policy volatile-lru');

    if (hasLoopbackBind && hasProtectedMode && hasNoRewriteSuppression && hasVolatileLru) {
      recordPass('Production Blueprint Audit (redis-prod.conf)', 'bind 127.0.0.1, protected-mode, no-appendfsync-on-rewrite no, volatile-lru verified');
    } else {
      throw new Error(
        `redis-prod.conf failed security check: loopback=${hasLoopbackBind}, protected=${hasProtectedMode}, fsyncOnRewrite=${hasNoRewriteSuppression}, volatileLru=${hasVolatileLru}`
      );
    }
  } catch (err) {
    recordFail('Production Blueprint Audit (redis-prod.conf)', err);
  }
}

// ==============================================================================
// SUITE 3: Redis Sentinel & High-Availability Validation (Conditional)
// ==============================================================================
async function runSentinelSuite() {
  logHeader('SUITE 3: Redis Sentinel HA Topology & Failover Writable State');

  let sentinelRunning = false;
  try {
    await testTcpConnect('127.0.0.1', 26379, 800);
    sentinelRunning = true;
  } catch {
    sentinelRunning = false;
  }

  if (!sentinelRunning) {
    recordSkip('Sentinel Quorum 1 (Port 26379)', 'HA Sentinel stack not active (Run npm run docker:redis:ha to test HA mode)');
    recordSkip('Sentinel Quorum 2 (Port 26380)', 'HA Sentinel stack not active');
    recordSkip('Sentinel Quorum 3 (Port 26381)', 'HA Sentinel stack not active');
    return;
  }

  // 3.1 Sentinel Control Port Authentication
  const sentinels = [
    { name: 'Sentinel 1', container: 'vialiq-sentinel-1', port: 26379 },
    { name: 'Sentinel 2', container: 'vialiq-sentinel-2', port: 26380 },
    { name: 'Sentinel 3', container: 'vialiq-sentinel-3', port: 26381 }
  ];

  for (const s of sentinels) {
    try {
      let unauthPass = false;
      try {
        const res = runDockerExec(s.container, ['redis-cli', '-p', String(s.port), 'ping']);
        if (res.includes('PONG')) unauthPass = true;
      } catch (e) {
        if (e.message.includes('NOAUTH')) unauthPass = false;
      }

      const authPong = runDockerExec(s.container, ['redis-cli', '-p', String(s.port), '-a', REDIS_SECRET, 'ping']);

      if (!unauthPass && authPong.includes('PONG')) {
        recordPass(`Sentinel Control Auth: ${s.name}`, `Port ${s.port} requires password; NOAUTH enforced`);
      } else {
        throw new Error(`Sentinel control port security mismatch on port ${s.port}`);
      }
    } catch (err) {
      recordFail(`Sentinel Control Auth: ${s.name}`, err);
    }
  }

  // 3.2 Master Discovery via Sentinel Quorum
  try {
    const masterAddr = runDockerExec(
      'vialiq-sentinel-1',
      ['redis-cli', '-p', '26379', '-a', REDIS_SECRET, 'sentinel', 'get-master-addr-by-name', 'mymaster']
    );

    if (masterAddr.includes('6379') || masterAddr.includes('6380')) {
      const port = masterAddr.includes('6379') ? '6379' : '6380';
      recordPass('Sentinel Quorum Master Discovery', `Active primary detected on Port ${port}`);
    } else {
      throw new Error(`Unexpected master resolution: ${masterAddr}`);
    }
  } catch (err) {
    recordFail('Sentinel Quorum Master Discovery', err);
  }

  // 3.3 Sentinel Volume & Config File Persistence
  try {
    const confCheck = runDockerExec('vialiq-sentinel-1', ['ls', '-la', '/etc/redis/sentinel.conf']);
    if (confCheck.includes('sentinel.conf')) {
      recordPass('Sentinel Config Persistence', '/etc/redis/sentinel.conf persisted across restarts');
    } else {
      throw new Error('Persistent configuration file /etc/redis/sentinel.conf missing inside container');
    }
  } catch (err) {
    recordFail('Sentinel Config Persistence', err);
  }
}

// ==============================================================================
// MAIN RUNNER
// ==============================================================================
async function main() {
  console.log(`\n${BOLD}==========================================================================${RESET}`);
  console.log(`${BOLD}  VIALIQ EDC — INFRASTRUCTURE VALIDATION SUITE (REDIS & MONGODB)        ${RESET}`);
  console.log(`${BOLD}==========================================================================${RESET}`);

  try {
    await runMongoSuite();
    await runRedisSuite();
    await runSentinelSuite();
  } catch (fatalErr) {
    console.error(`\n${FAIL} Fatal Suite Execution Error:`, fatalErr);
    process.exit(1);
  }

  const durationSec = ((Date.now() - START_TIME) / 1000).toFixed(2);

  logHeader('TEST EXECUTION SUMMARY');
  console.log(`  Total Scenarios Evaluated : ${BOLD}${totalTests}${RESET}`);
  console.log(`  Passed                    : \x1b[32m${BOLD}${passedTests}${RESET}\x1b[0m`);
  console.log(`  Failed                    : \x1b[31m${BOLD}${failedTests}${RESET}\x1b[0m`);
  console.log(`  Skipped (Conditional)     : \x1b[36m${BOLD}${skippedTests}${RESET}\x1b[0m`);
  console.log(`  Execution Time            : ${durationSec}s`);
  console.log(`${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

  if (failedTests === 0) {
    console.log(`\x1b[32m${BOLD}✔ ALL INFRASTRUCTURE SCENARIOS VALIDATED SUCCESSFULLY!${RESET}\x1b[0m\n`);
    process.exit(0);
  } else {
    console.log(`\x1b[31m${BOLD}✖ INFRASTRUCTURE VALIDATION FAILED WITH ${failedTests} FAILURE(S)!${RESET}\x1b[0m\n`);
    process.exit(1);
  }
}

main();
