// Simple balance check using fetch
const https = require('https');

const address = "0xBf8E022195f387dB0C28C741d1A7b1BeD1144B3C";
const rpcUrl = "https://sepolia-rollup.arbitrum.io/rpc";

const payload = JSON.stringify({
  jsonrpc: "2.0",
  method: "eth_getBalance",
  params: [address, "latest"],
  id: 1
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
};

console.log(`Checking balance for: ${address}`);

const req = https.request(rpcUrl, options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const response = JSON.parse(data);
    const balanceHex = response.result;
    const balanceWei = BigInt(balanceHex);
    const balanceEth = Number(balanceWei) / 1e18;
    
    console.log(`Balance: ${balanceEth} ETH`);
    console.log(`Balance (Wei): ${balanceWei.toString()}`);
    
    if (balanceEth < 0.01) {
      console.log("\n❌ Insufficient balance. Need at least 0.01 ETH for deployment.");
      process.exit(1);
    }
    
    console.log("\n✅ Wallet is funded and ready for deployment!");
  });
});

req.on('error', (e) => {
  console.error(`Error checking balance: ${e.message}`);
  process.exit(1);
});

req.write(payload);
req.end();
