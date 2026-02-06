/**
 * PrivateAlpha - Confidential DeFi Analytics iApp
 * 
 * A privacy-first financial intelligence platform running in iExec TEE
 * 
 * Features:
 * - Private Credit Scoring (based on on-chain history)
 * - AI-Powered Momentum Trading Signals
 * - Cross-DEX Arbitrage Detection
 * - Monte Carlo Risk Analysis (VaR/CVaR)  
 * - Bulk Processing (multiple users in single execution)
 * 
 * All computations happen inside the Trusted Execution Environment
 * User data is never exposed - only results are returned
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { IExecDataProtectorDeserializer } from '@iexec/dataprotector-deserializer';

// Import our financial engines
import { computeCreditScore } from './utils/creditScorer.js';
import { generateMomentumSignal, SIGNALS } from './utils/momentumEngine.js';
import { scanArbitrageOpportunities, scanTriangularArbitrage } from './utils/arbitrageScanner.js';
import { calculatePortfolioRisk } from './utils/riskCalculator.js';
import { processBulk, aggregateBulkResults } from './utils/bulkProcessor.js';

const VERSION = '1.0.0';
const APP_NAME = 'PrivateAlpha';

/**
 * Main entry point for the iApp
 */
const main = async () => {
  const { IEXEC_OUT, IEXEC_IN } = process.env;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${APP_NAME} v${VERSION} - Confidential DeFi Analytics`);
  console.log(`  Running in iExec Trusted Execution Environment`);
  console.log(`${'='.repeat(60)}\n`);

  let result = {};
  let computedJsonObj = {};

  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const operation = args[0] || 'help';
    const additionalArgs = args.slice(1);

    console.log(`Operation: ${operation}`);
    console.log(`Additional args: ${additionalArgs.join(', ') || 'none'}`);

    // Check for bulk processing mode
    const bulkSize = parseInt(process.env.IEXEC_BULK_SLICE_SIZE) || 0;
    console.log(`Bulk processing mode: ${bulkSize > 0 ? `Yes (${bulkSize} items)` : 'No'}`);

    // Process based on operation type
    if (bulkSize > 0) {
      // Bulk processing mode - process multiple protected data items
      result = await handleBulkProcessing(bulkSize, operation);
    } else {
      // Single item processing
      result = await handleSingleProcessing(operation, additionalArgs);
    }

    // Handle input files if provided
    await processInputFiles();

    // Check for app developer secret
    if (process.env.IEXEC_APP_DEVELOPER_SECRET) {
      console.log('App developer secret detected (value redacted)');
      result.hasAppSecret = true;
    }

    // Check for requester secrets
    await processRequesterSecrets(result);

    // Write result to output
    const outputPath = path.join(IEXEC_OUT, 'result.json');
    await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
    console.log(`\nResult written to: ${outputPath}`);

    // Create computed.json for iExec
    computedJsonObj = {
      'deterministic-output-path': outputPath
    };

  } catch (error) {
    console.error('Error during execution:', error);
    result = {
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };

    const outputPath = path.join(IEXEC_OUT, 'error.json');
    await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
    computedJsonObj = {
      'deterministic-output-path': outputPath
    };
  }

  // Write computed.json
  await fs.writeFile(
    path.join(IEXEC_OUT, 'computed.json'),
    JSON.stringify(computedJsonObj)
  );

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${APP_NAME} execution complete`);
  console.log(`${'='.repeat(60)}\n`);
};

/**
 * Handle bulk processing of multiple protected data items
 */
async function handleBulkProcessing(bulkSize, operation) {
  console.log(`\nProcessing ${bulkSize} protected data items in bulk...`);
  
  const protectedDataItems = [];

  for (let i = 1; i <= bulkSize; i++) {
    try {
      const datasetFilename = process.env[`IEXEC_DATASET_${i}_FILENAME`];
      if (!datasetFilename) {
        console.log(`No dataset filename for item ${i}`);
        continue;
      }

      const deserializer = new IExecDataProtectorDeserializer({
        protectedDataPath: path.join(process.env.IEXEC_IN, datasetFilename)
      });

      // Deserialize the protected data
      const userData = await deserializeProtectedData(deserializer);
      userData.itemIndex = i;
      protectedDataItems.push(userData);
      
      console.log(`  Loaded protected data ${i}/${bulkSize}`);
    } catch (error) {
      console.error(`  Error loading protected data ${i}:`, error.message);
    }
  }

  if (protectedDataItems.length === 0) {
    return {
      success: false,
      error: 'No valid protected data items found'
    };
  }

  // Process all items
  const bulkResults = await processBulk(protectedDataItems, operation);
  
  // Add aggregated statistics
  const aggregation = aggregateBulkResults(bulkResults);
  if (aggregation) {
    bulkResults.aggregation = aggregation;
  }

  return {
    success: true,
    mode: 'bulk',
    ...bulkResults
  };
}

/**
 * Handle single item processing
 */
async function handleSingleProcessing(operation, additionalArgs) {
  // Check if we have a single protected data item
  const datasetFilename = process.env.IEXEC_DATASET_FILENAME;
  let protectedData = null;

  if (datasetFilename) {
    try {
      const deserializer = new IExecDataProtectorDeserializer({
        protectedDataPath: path.join(process.env.IEXEC_IN, datasetFilename)
      });
      protectedData = await deserializeProtectedData(deserializer);
      console.log('Protected data loaded successfully');
    } catch (error) {
      console.log('No protected data or error loading:', error.message);
    }
  }

  // Route to appropriate handler
  switch (operation.toLowerCase()) {
    case 'credit-score':
    case 'creditscore':
    case 'score':
      return handleCreditScore(protectedData, additionalArgs);

    case 'momentum':
    case 'signal':
    case 'trading':
      return handleMomentum(protectedData, additionalArgs);

    case 'arbitrage':
    case 'arb':
      return handleArbitrage(protectedData, additionalArgs);

    case 'risk':
    case 'var':
    case 'portfolio':
      return handleRisk(protectedData, additionalArgs);

    case 'full':
    case 'all':
    case 'analysis':
      return handleFullAnalysis(protectedData, additionalArgs);

    case 'help':
    default:
      return showHelp();
  }
}

/**
 * Deserialize protected data from iExec
 */
async function deserializeProtectedData(deserializer) {
  const data = {};

  // Try to get common fields
  const fields = [
    ['walletAddress', 'string'],
    ['address', 'string'],
    ['transactions', 'string'],
    ['loans', 'string'],
    ['portfolio', 'string'],
    ['priceHistory', 'string'],
    ['quotes', 'string'],
    ['holdings', 'string'],
    ['secretData', 'string']
  ];

  for (const [field, type] of fields) {
    try {
      const value = await deserializer.getValue(field, type);
      if (value) {
        try {
          data[field] = JSON.parse(value);
        } catch {
          data[field] = value;
        }
      }
    } catch {
      // Field doesn't exist, skip
    }
  }

  return data;
}

/**
 * Handle credit score computation
 */
function handleCreditScore(protectedData, args) {
  console.log('\n--- Credit Score Computation ---');

  if (!protectedData || (!protectedData.walletAddress && !protectedData.address)) {
    console.log('Using demo data (no protected data provided)');
    protectedData = getDemoUserData();
  }

  const result = computeCreditScore({
    walletAddress: protectedData.walletAddress || protectedData.address,
    transactions: protectedData.transactions || [],
    loans: protectedData.loans || [],
    portfolio: protectedData.portfolio || {},
    accountCreatedAt: protectedData.accountCreatedAt
  });

  return {
    success: true,
    operation: 'credit-score',
    ...result
  };
}

/**
 * Handle momentum signal generation
 */
function handleMomentum(protectedData, args) {
  console.log('\n--- Momentum Signal Generation ---');

  const symbol = args[0] || protectedData?.symbol || 'ETH';
  
  let priceHistory = protectedData?.priceHistory;
  if (!priceHistory || priceHistory.length < 30) {
    console.log('Using demo price data');
    priceHistory = generateDemoPriceHistory(symbol);
  }

  const currentPrice = priceHistory[priceHistory.length - 1]?.close || 
                       priceHistory[priceHistory.length - 1];

  const result = generateMomentumSignal({
    symbol,
    priceHistory,
    volumeHistory: protectedData?.volumeHistory || generateDemoVolumeHistory(),
    currentPrice
  });

  return {
    success: true,
    operation: 'momentum',
    ...result
  };
}

/**
 * Handle arbitrage scanning
 */
function handleArbitrage(protectedData, args) {
  console.log('\n--- Arbitrage Opportunity Scanner ---');

  let quotes = protectedData?.quotes;
  if (!quotes || quotes.length < 2) {
    console.log('Using demo DEX quotes');
    quotes = getDemoDexQuotes();
  }

  const result = scanArbitrageOpportunities({
    quotes,
    minProfitUSD: parseFloat(args[0]) || 10,
    maxSlippage: parseFloat(args[1]) || 0.005
  });

  return {
    success: true,
    operation: 'arbitrage',
    ...result
  };
}

/**
 * Handle risk calculation
 */
function handleRisk(protectedData, args) {
  console.log('\n--- Portfolio Risk Analysis ---');

  let holdings = protectedData?.holdings || protectedData?.portfolio;
  if (!holdings || (Array.isArray(holdings) && holdings.length === 0)) {
    console.log('Using demo portfolio');
    holdings = getDemoPortfolio();
  }

  const result = calculatePortfolioRisk({
    holdings: Array.isArray(holdings) ? holdings : [holdings],
    confidenceLevel: parseFloat(args[0]) || 0.95,
    timeHorizon: parseInt(args[1]) || 1,
    simulations: parseInt(args[2]) || 10000
  });

  return {
    success: true,
    operation: 'risk',
    ...result
  };
}

/**
 * Handle full analysis (all operations)
 */
function handleFullAnalysis(protectedData, args) {
  console.log('\n--- Full Portfolio Analysis ---');

  const results = {
    success: true,
    operation: 'full-analysis',
    analyses: {}
  };

  try {
    results.analyses.creditScore = handleCreditScore(protectedData, []);
  } catch (e) {
    results.analyses.creditScore = { error: e.message };
  }

  try {
    results.analyses.momentum = handleMomentum(protectedData, ['ETH']);
  } catch (e) {
    results.analyses.momentum = { error: e.message };
  }

  try {
    results.analyses.arbitrage = handleArbitrage(protectedData, []);
  } catch (e) {
    results.analyses.arbitrage = { error: e.message };
  }

  try {
    results.analyses.risk = handleRisk(protectedData, []);
  } catch (e) {
    results.analyses.risk = { error: e.message };
  }

  return results;
}

/**
 * Show help information
 */
function showHelp() {
  return {
    success: true,
    operation: 'help',
    app: APP_NAME,
    version: VERSION,
    description: 'Confidential DeFi Analytics Platform',
    usage: {
      'credit-score': 'Compute private credit score from transaction history',
      'momentum <symbol>': 'Generate trading signals for a token',
      'arbitrage [minProfit]': 'Scan for cross-DEX arbitrage opportunities',
      'risk [confidence] [horizon]': 'Calculate portfolio risk metrics (VaR/CVaR)',
      'full': 'Run all analyses on protected data'
    },
    examples: [
      'iapp run <address> --args credit-score',
      'iapp run <address> --args momentum ETH',
      'iapp run <address> --args arbitrage 50',
      'iapp run <address> --args risk 0.99 7',
      'iapp run <address> --args full'
    ],
    bulkProcessing: 'Use --protectedData data1 data2 data3 for bulk processing'
  };
}

/**
 * Process input files from IEXEC_INPUT_FILES
 */
async function processInputFiles() {
  const inputFilesCount = parseInt(process.env.IEXEC_INPUT_FILES_NUMBER) || 0;
  
  if (inputFilesCount > 0) {
    console.log(`\nProcessing ${inputFilesCount} input file(s)...`);
    
    for (let i = 1; i <= inputFilesCount; i++) {
      const fileName = process.env[`IEXEC_INPUT_FILE_NAME_${i}`];
      if (fileName) {
        console.log(`  Input file ${i}: ${fileName}`);
      }
    }
  }
}

/**
 * Process requester secrets
 */
async function processRequesterSecrets(result) {
  const secrets = {};
  
  for (let i = 1; i <= 10; i++) {
    const secret = process.env[`IEXEC_REQUESTER_SECRET_${i}`];
    if (secret) {
      secrets[`secret_${i}`] = '***REDACTED***';
    }
  }

  if (Object.keys(secrets).length > 0) {
    console.log(`\nRequester secrets detected: ${Object.keys(secrets).length}`);
    result.requesterSecretsCount = Object.keys(secrets).length;
  }
}

// Demo data generators for testing

function getDemoUserData() {
  return {
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1b2c1',
    transactions: [
      { type: 'swap', amount: 1000, pnl: 50, success: true },
      { type: 'swap', amount: 2000, pnl: -30, success: true },
      { type: 'trade', amount: 500, pnl: 100, success: true },
      { type: 'trade', amount: 1500, pnl: 200, success: true },
      { type: 'swap', amount: 800, pnl: -50, success: true }
    ],
    loans: [
      { amount: 5000, paidOnTime: true, paid: true },
      { amount: 3000, paidOnTime: true, paid: true },
      { amount: 2000, paidOnTime: false, paid: true, daysLate: 5 }
    ],
    portfolio: {
      totalValue: 50000,
      holdings: {
        ETH: { value: 20000 },
        BTC: { value: 15000 },
        USDC: { value: 10000 },
        ARB: { value: 5000 }
      }
    },
    accountCreatedAt: '2024-01-15T00:00:00Z'
  };
}

function generateDemoPriceHistory(symbol) {
  const prices = [];
  let price = symbol === 'BTC' ? 45000 : symbol === 'ETH' ? 2500 : 100;
  
  for (let i = 0; i < 120; i++) {
    const change = (Math.random() - 0.48) * price * 0.03;
    price = Math.max(price * 0.5, price + change);
    prices.push({
      timestamp: Date.now() - (120 - i) * 86400000,
      open: price * 0.99,
      high: price * 1.02,
      low: price * 0.98,
      close: price,
      volume: Math.random() * 1000000
    });
  }
  
  return prices;
}

function generateDemoVolumeHistory() {
  return Array(120).fill(0).map(() => Math.random() * 10000000 + 1000000);
}

function getDemoDexQuotes() {
  return [
    { dex: 'uniswap_v3', token: 'ETH', price: 2500, liquidity: 5000000 },
    { dex: 'sushiswap', token: 'ETH', price: 2508, liquidity: 2000000 },
    { dex: 'curve', token: 'ETH', price: 2495, liquidity: 8000000 },
    { dex: 'balancer', token: 'ETH', price: 2512, liquidity: 1500000 },
    { dex: 'camelot', token: 'ETH', price: 2490, liquidity: 1000000 }
  ];
}

function getDemoPortfolio() {
  return [
    { symbol: 'ETH', value: 25000, returns: Array(30).fill(0).map(() => (Math.random() - 0.5) * 0.1) },
    { symbol: 'BTC', value: 20000, returns: Array(30).fill(0).map(() => (Math.random() - 0.5) * 0.08) },
    { symbol: 'USDC', value: 10000, volatility: 0.001 },
    { symbol: 'ARB', value: 8000, returns: Array(30).fill(0).map(() => (Math.random() - 0.5) * 0.15) },
    { symbol: 'SOL', value: 7000, returns: Array(30).fill(0).map(() => (Math.random() - 0.5) * 0.12) }
  ];
}

// Run main
main().catch(console.error);
