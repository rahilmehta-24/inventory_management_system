const http = require('http');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'health.log');
const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const logHealth = (component, status, details) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${component}] Status: ${status} | Details: ${details}\n`;
  fs.appendFileSync(LOG_FILE, logEntry);
  console.log(logEntry.trim());
};

const checkBackend = () => {
  http.get('http://localhost:5001/api/health', (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        if (res.statusCode === 200 && result.status === 'healthy') {
          logHealth('BACKEND', 'OK', `DB Status: ${result.db}`);
        } else {
          logHealth('BACKEND', 'ERROR', `Status Code: ${res.statusCode}, DB: ${result.db || 'unknown'}`);
        }
      } catch (err) {
        logHealth('BACKEND', 'ERROR', `Failed to parse response: ${err.message}`);
      }
    });
  }).on('error', (err) => {
    logHealth('BACKEND', 'ERROR', `Connection failed: ${err.message}`);
  });
};

const checkFrontend = () => {
  http.get('http://localhost:5173', (res) => {
    if (res.statusCode === 200) {
      logHealth('FRONTEND', 'OK', 'Vite server is responding');
    } else {
      logHealth('FRONTEND', 'WARN', `Status Code: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    logHealth('FRONTEND', 'ERROR', `Connection failed: ${err.message}`);
  });
};

const runChecks = () => {
  console.log(`\n--- Running Health Checks at ${new Date().toLocaleTimeString()} ---`);
  checkBackend();
  checkFrontend();
};

// Ensure log file exists
if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, '--- MNT IMS Health Log ---\n');
}

console.log('Initiator started. Monitoring every 5 minutes...');
runChecks(); // Run immediately on start
setInterval(runChecks, INTERVAL_MS);
