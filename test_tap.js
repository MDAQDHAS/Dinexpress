const http = require('http');

// 🎯 SIMULATING A SUCCESSFUL TAP FOR CARD: 83 a4 7c 0
const UID = "83 a4 7c 0";
const postData = JSON.stringify({ uid: UID });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/rfid-scan',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log(`🚀 SIMULATING TAP FOR CARD: [${UID}]...`);

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log("✅ SUCCESS!");
    console.log("Bridge Response:", body);
    console.log("\nCheck your Worker/Student App now - it should have processed the order! 🍛");
  });
});

req.on('error', (e) => {
  console.error("❌ FAILED!");
  console.error("Make sure your bridge is running: run 'node rfid_bridge.js' first.");
});

req.write(postData);
req.end();
