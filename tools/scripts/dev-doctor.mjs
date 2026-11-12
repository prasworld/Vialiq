#!/usr/bin/env node

/**
 * Vialiq EDC - Local Development Environment Doctor
 * Verifies system prerequisites, container health, and port bindings.
 */

import { execSync } from 'node:child_process';
import net from 'node:net';

const CHECK = ' \x1b[32m✔\x1b[0m';
const WARN = ' \x1b[33m⚠\x1b[0m';
const FAIL = ' \x1b[31m✖\x1b[0m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

console.log(`\n${BOLD}================================================================${RESET}`);
console.log(`${BOLD}  VIALIQ EDC — LOCAL DEVELOPMENT ENVIRONMENT DOCTOR             ${RESET}`);
console.log(`${BOLD}================================================================${RESET}\n`);

let hasErrors = false;

// 1. Check Node.js
try {
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.replace('v', '').split('.')[0], 10);
  if (major >= 20) {
    console.log(`${CHECK} Node.js: ${nodeVersion} (Supported >= v20)`);
  } else {
    console.log(`${WARN} Node.js: ${nodeVersion} (Recommended v20 or higher)`);
  }
} catch {
  console.log(`${FAIL} Node.js: Not detected`);
  hasErrors = true;
}

// 2. Check .NET SDK
try {
  const dotnetVersion = execSync('dotnet --version', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
  if (dotnetVersion.startsWith('9.')) {
    console.log(`${CHECK} .NET SDK: ${dotnetVersion} (.NET 9 LTS verified)`);
  } else {
    console.log(`${WARN} .NET SDK: ${dotnetVersion} (Recommended .NET 9.0+)`);
  }
} catch {
  console.log(`${FAIL} .NET SDK: Not found. Install .NET 9 SDK from https://dotnet.microsoft.com/download`);
  hasErrors = true;
}

// 3. Check Docker Daemon
let dockerRunning = false;
try {
  execSync('docker info', { stdio: ['pipe', 'pipe', 'ignore'] });
  console.log(`${CHECK} Docker Daemon: Running and responsive`);
  dockerRunning = true;
} catch {
  console.log(`${FAIL} Docker Daemon: Not running. Please start Docker Desktop.`);
  hasErrors = true;
}

// 4. Check Port Reachability
async function checkPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

console.log(`\n${BOLD}Infrastructure Services & Ports:${RESET}`);

const services = [
  { name: 'Layer 1 Admin Mongo (rs-admin)', host: 'localhost', port: 27017, required: true },
  { name: 'Layer 2 Dev Mongo   (rs-dev)',   host: 'localhost', port: 27027, required: true },
  { name: 'Layer 3 Prod Mongo  (rs-prod)',  host: 'localhost', port: 27037, required: true },
  { name: 'Redis Primary Cache',            host: 'localhost', port: 6379,  required: true },
  { name: 'Redis Replica Cache',            host: 'localhost', port: 6380,  required: false },
  { name: 'Redis Sentinel Quorum 1',        host: 'localhost', port: 26379, required: false },
  { name: 'Redis Sentinel Quorum 2',        host: 'localhost', port: 26380, required: false },
  { name: 'Redis Sentinel Quorum 3',        host: 'localhost', port: 26381, required: false },
  { name: 'ASP.NET Core Web API',           host: 'localhost', port: 5000,  required: false, isApp: true },
  { name: 'Angular Web Shell',              host: 'localhost', port: 4200,  required: false, isApp: true }
];

for (const svc of services) {
  const isUp = await checkPort(svc.host, svc.port);
  if (isUp) {
    console.log(`${CHECK} ${svc.name.padEnd(32)} Port ${svc.port}: ONLINE`);
  } else if (svc.isApp) {
    console.log(` - ${svc.name.padEnd(32)} Port ${svc.port}: OFFLINE (Start via npm start / npm run api:watch)`);
  } else if (svc.required) {
    console.log(`${WARN} ${svc.name.padEnd(32)} Port ${svc.port}: NOT REACHABLE`);
  } else {
    console.log(` - ${svc.name.padEnd(32)} Port ${svc.port}: NOT REACHABLE`);
  }
}

console.log(`\n${BOLD}----------------------------------------------------------------${RESET}`);
if (!hasErrors) {
  console.log(`\x1b[32mEnvironment check completed successfully! Ready for development.\x1b[0m`);
} else {
  console.log(`\x1b[33mEnvironment needs attention. Run 'npm run dev:infra' to start background services.\x1b[0m`);
}
console.log(`${BOLD}================================================================${RESET}\n`);

