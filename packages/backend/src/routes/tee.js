const express = require('express');
const { IExec } = require('iexec');
const router = express.Router();

// Your deployed iApp address on Bellecour
const IAPP_ADDRESS = '0x77978b4d66E473c804a891B9CfA2352f235af59C';

// iExec Bellecour network configuration
const BELLECOUR_CONFIG = {
  ethProvider: 'bellecour', // iExec sidechain
  chainId: 134
};

// Initialize iExec SDK
const getIExec = (privateKey) => {
  if (privateKey) {
    return new IExec({ ethProvider: BELLECOUR_CONFIG.ethProvider }, { smsURL: 'https://sms.scone-prod.v8-bellecour.iex.ec' });
  }
  return new IExec({ ethProvider: BELLECOUR_CONFIG.ethProvider });
};

// Submit credit score computation task
router.post('/compute-credit-score', async (req, res) => {
  try {
    const { userAddress, transactionHistory, loanHistory, portfolio } = req.body;

    if (!userAddress) {
      return res.status(400).json({ error: 'userAddress is required' });
    }

    // Mock response for development (when no wallet configured)
    if (process.env.NODE_ENV === 'development' && !process.env.WALLET_PRIVATE_KEY) {
      return res.json({
        taskId: 'mock-task-' + Date.now(),
        status: 'SUBMITTED',
        message: 'Task submitted successfully (MOCK MODE)',
        iappAddress: IAPP_ADDRESS,
        estimatedCompletionTime: Date.now() + 60000
      });
    }

    // Real iExec execution
    const iexec = getIExec();
    
    // Submit task to your deployed iApp
    const { dealid } = await iexec.order.matchOrders({
      apporder: await iexec.order.fetchAppOrderbook(IAPP_ADDRESS).then(ob => ob.orders[0]?.order),
      workerpoolorder: await iexec.order.fetchWorkerpoolOrderbook({ category: 0 }).then(ob => ob.orders[0]?.order),
      requestorder: await iexec.order.createRequestorder({
        app: IAPP_ADDRESS,
        category: 0,
        params: {
          iexec_args: 'credit-score',
          iexec_input_files: []
        }
      }).then(order => iexec.order.signRequestorder(order))
    });

    const taskId = await iexec.deal.computeTaskId(dealid, 0);

    res.json({
      taskId,
      dealId: dealid,
      status: 'SUBMITTED',
      message: 'Credit score computation submitted to iExec TEE',
      iappAddress: IAPP_ADDRESS,
      explorerUrl: `https://explorer.iex.ec/bellecour/task/${taskId}`,
      estimatedCompletionTime: Date.now() + 120000
    });
  } catch (error) {
    console.error('Error submitting TEE task:', error);
    res.status(500).json({ error: 'Failed to submit TEE computation', details: error.message });
  }
});

// Submit momentum signal generation
router.post('/generate-signal', async (req, res) => {
  try {
    const { symbol = 'ETH' } = req.body;

    if (process.env.NODE_ENV === 'development' && !process.env.WALLET_PRIVATE_KEY) {
      return res.json({
        taskId: 'mock-task-' + Date.now(),
        status: 'SUBMITTED',
        message: 'Momentum signal task submitted (MOCK MODE)',
        args: `momentum ${symbol}`
      });
    }

    // Real execution would go here
    res.json({
      taskId: 'pending-implementation',
      status: 'SUBMITTED',
      message: `Momentum signal generation for ${symbol} submitted`,
      iappAddress: IAPP_ADDRESS
    });
  } catch (error) {
    console.error('Error submitting signal task:', error);
    res.status(500).json({ error: 'Failed to submit signal computation' });
  }
});

// Submit arbitrage scan
router.post('/scan-arbitrage', async (req, res) => {
  try {
    const { minProfitUSD = 10 } = req.body;

    if (process.env.NODE_ENV === 'development') {
      return res.json({
        taskId: 'mock-task-' + Date.now(),
        status: 'SUBMITTED',
        message: 'Arbitrage scan submitted (MOCK MODE)',
        args: `arbitrage ${minProfitUSD}`
      });
    }

    res.json({
      taskId: 'pending-implementation',
      status: 'SUBMITTED',
      message: 'Arbitrage scan submitted',
      iappAddress: IAPP_ADDRESS
    });
  } catch (error) {
    console.error('Error submitting arbitrage task:', error);
    res.status(500).json({ error: 'Failed to submit arbitrage scan' });
  }
});

// Submit risk analysis
router.post('/analyze-risk', async (req, res) => {
  try {
    const { confidenceLevel = 0.95, timeHorizon = 1 } = req.body;

    if (process.env.NODE_ENV === 'development') {
      return res.json({
        taskId: 'mock-task-' + Date.now(),
        status: 'SUBMITTED',
        message: 'Risk analysis submitted (MOCK MODE)',
        args: `risk ${confidenceLevel} ${timeHorizon}`
      });
    }

    res.json({
      taskId: 'pending-implementation',
      status: 'SUBMITTED',
      message: 'Risk analysis submitted',
      iappAddress: IAPP_ADDRESS
    });
  } catch (error) {
    console.error('Error submitting risk task:', error);
    res.status(500).json({ error: 'Failed to submit risk analysis' });
  }
});

// Get task result
router.get('/task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    // Mock response for development
    if (taskId.startsWith('mock-task-')) {
      return res.json({
        taskId,
        status: 'COMPLETED',
        result: {
          success: true,
          operation: 'credit-score',
          score: 720,
          tier: 3,
          tierName: 'Gold',
          maxLeverage: 10,
          factors: {
            paymentHistory: 85.5,
            utilization: 75.0,
            tradingSkill: 70.5,
            diversification: 60.0,
            accountAge: 80.0
          },
          attestationHash: '0x' + '0'.repeat(64)
        }
      });
    }

    const iexec = getIExec();
    const task = await iexec.task.show(taskId);

    let result = null;
    if (task.status === 3) { // COMPLETED
      try {
        const resultUrl = task.results;
        // Fetch and parse result
        result = { status: 'COMPLETED', resultUrl };
      } catch (e) {
        result = { status: 'COMPLETED', parseError: e.message };
      }
    }

    res.json({
      taskId,
      status: ['UNSET', 'ACTIVE', 'REVEALING', 'COMPLETED', 'FAILED'][task.status] || 'UNKNOWN',
      statusCode: task.status,
      result,
      explorerUrl: `https://explorer.iex.ec/bellecour/task/${taskId}`
    });
  } catch (error) {
    console.error('Error fetching task result:', error);
    res.status(500).json({ error: 'Failed to fetch task result', details: error.message });
  }
});

// Get iApp info
router.get('/iapp-info', (req, res) => {
  res.json({
    iappAddress: IAPP_ADDRESS,
    network: 'bellecour',
    explorerUrl: `https://explorer.iex.ec/bellecour/app/${IAPP_ADDRESS}`,
    supportedOperations: [
      { name: 'credit-score', description: 'Compute private credit score' },
      { name: 'momentum', description: 'Generate trading signals' },
      { name: 'arbitrage', description: 'Scan for arbitrage opportunities' },
      { name: 'risk', description: 'Calculate portfolio risk (VaR/CVaR)' },
      { name: 'full', description: 'Run all analyses' }
    ]
  });
});

module.exports = router;
