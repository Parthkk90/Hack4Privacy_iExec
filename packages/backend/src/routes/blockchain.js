const express = require('express');
const { ethers } = require('ethers');
const router = express.Router();

// Contract ABIs (simplified)
const CREDIT_SCORE_REGISTRY_ABI = [
  "function getScore(address user) external view returns (uint256 score, uint8 tier, bool isValid)",
  "function getMaxLeverage(address user) external view returns (uint256)",
  "function getCreditScoreDetails(address user) external view returns (tuple(uint256 score, bytes32 encryptedScore, uint256 timestamp, uint256 expiresAt, uint8 tier, bytes attestation, bool isActive))"
];

// Get credit score for an address
router.get('/credit-score/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_SEPOLIA_RPC);
    const registry = new ethers.Contract(
      process.env.CREDIT_SCORE_REGISTRY_ADDRESS,
      CREDIT_SCORE_REGISTRY_ABI,
      provider
    );

    const [score, tier, isValid] = await registry.getScore(address);
    const leverage = await registry.getMaxLeverage(address);

    res.json({
      address,
      score: Number(score),
      tier: Number(tier),
      isValid,
      maxLeverage: Number(leverage) / 100,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching credit score:', error);
    res.status(500).json({ error: 'Failed to fetch credit score' });
  }
});

// Get credit score details
router.get('/credit-score-details/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_SEPOLIA_RPC);
    const registry = new ethers.Contract(
      process.env.CREDIT_SCORE_REGISTRY_ADDRESS,
      CREDIT_SCORE_REGISTRY_ABI,
      provider
    );

    const details = await registry.getCreditScoreDetails(address);

    res.json({
      address,
      score: Number(details.score),
      tier: Number(details.tier),
      timestamp: Number(details.timestamp),
      expiresAt: Number(details.expiresAt),
      isActive: details.isActive,
      attestation: details.attestation
    });
  } catch (error) {
    console.error('Error fetching credit score details:', error);
    res.status(500).json({ error: 'Failed to fetch credit score details' });
  }
});

module.exports = router;
