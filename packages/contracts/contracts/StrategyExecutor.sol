// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./CreditScoreRegistry.sol";

/**
 * @title StrategyExecutor
 * @notice Executes trading strategies with TEE-computed proofs
 * @dev Integrates with CreditScoreRegistry for leverage validation
 */
contract StrategyExecutor is Ownable, ReentrancyGuard {
    
    // ============ Structs ============
    
    struct TradeParams {
        address token;              // Token to trade
        uint256 amount;             // Trade amount
        uint256 expectedPrice;      // Expected execution price
        uint256 slippage;           // Max slippage (basis points)
        uint256 deadline;           // Execution deadline
        bool isLong;                // Long or short position
        bytes32 strategyHash;       // Hash of strategy parameters
    }
    
    struct ComputationProof {
        bytes32 proofHash;          // Hash of computation proof
        bytes attestation;          // TEE attestation
        uint256 timestamp;          // Proof generation time
        address teeWorker;          // TEE worker that generated proof
    }
    
    // ============ State Variables ============
    
    /// @notice Credit score registry contract
    CreditScoreRegistry public creditScoreRegistry;
    
    /// @notice Mapping of used proofs (prevent replay)
    mapping(bytes32 => bool) public usedProofs;
    
    /// @notice Mapping of authorized TEE workers
    mapping(address => bool) public authorizedTEEWorkers;
    
    /// @notice Mapping of supported tokens
    mapping(address => bool) public supportedTokens;
    
    /// @notice Maximum slippage allowed (500 = 5%)
    uint256 public constant MAX_SLIPPAGE = 500;
    
    /// @notice Minimum trade amount (in wei)
    uint256 public constant MIN_TRADE_AMOUNT = 0.001 ether;
    
    // ============ Events ============
    
    event TradeExecuted(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 leverage,
        bool isLong,
        uint256 timestamp
    );
    
    event ProofVerified(
        address indexed user,
        bytes32 indexed proofHash,
        address teeWorker
    );
    
    event TEEWorkerAuthorized(address indexed worker, bool authorized);
    
    event TokenSupported(address indexed token, bool supported);
    
    // ============ Constructor ============
    
    constructor(address _creditScoreRegistry) Ownable(msg.sender) {
        require(_creditScoreRegistry != address(0), "Invalid registry address");
        creditScoreRegistry = CreditScoreRegistry(_creditScoreRegistry);
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Execute a private trade with TEE-computed proof
     * @param params Trade parameters
     * @param proof Computation proof from TEE
     */
    function executePrivateTrade(
        TradeParams calldata params,
        ComputationProof calldata proof
    ) external nonReentrant {
        // Validate trade parameters
        require(params.token != address(0), "Invalid token");
        require(supportedTokens[params.token], "Token not supported");
        require(params.amount >= MIN_TRADE_AMOUNT, "Amount too small");
        require(params.slippage <= MAX_SLIPPAGE, "Slippage too high");
        require(params.deadline >= block.timestamp, "Trade expired");
        
        // Verify user has valid credit score
        (uint256 score, uint8 tier, bool isValid) = creditScoreRegistry.getScore(msg.sender);
        require(isValid, "Invalid or expired credit score");
        require(score > 0, "No credit score found");
        
        // Verify computation proof
        require(verifyComputationProof(msg.sender, proof), "Invalid proof");
        
        // Mark proof as used (prevent replay)
        usedProofs[proof.proofHash] = true;
        
        // Get maximum allowed leverage
        uint256 maxLeverage = creditScoreRegistry.getMaxLeverage(msg.sender);
        
        // Execute trade (simplified for testnet)
        _executeTrade(msg.sender, params, maxLeverage);
        
        emit TradeExecuted(
            msg.sender,
            params.token,
            params.amount,
            maxLeverage,
            params.isLong,
            block.timestamp
        );
        
        emit ProofVerified(msg.sender, proof.proofHash, proof.teeWorker);
    }
    
    /**
     * @notice Verify computation proof from TEE worker
     * @param user User address
     * @param proof Computation proof
     * @return valid True if proof is valid
     */
    function verifyComputationProof(
        address user,
        ComputationProof calldata proof
    ) public view returns (bool) {
        // Check if proof already used
        if (usedProofs[proof.proofHash]) {
            return false;
        }
        
        // Verify TEE worker is authorized
        if (!authorizedTEEWorkers[proof.teeWorker]) {
            return false;
        }
        
        // Verify proof is not too old (5 minutes)
        if (block.timestamp - proof.timestamp > 5 minutes) {
            return false;
        }
        
        // Verify attestation (simplified for testnet)
        // In production, verify SGX/SCONE attestation
        if (proof.attestation.length == 0) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @notice Get trade history for a user
     * @param user User address
     * @return tradeCount Number of trades executed
     */
    function getTradeHistory(address user)
        external
        view
        returns (uint256 tradeCount)
    {
        // Simplified - in production, store full trade history
        return 0;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Authorize or revoke TEE worker
     * @param worker Address of TEE worker
     * @param authorized Authorization status
     */
    function authorizeTEEWorker(address worker, bool authorized)
        external
        onlyOwner
    {
        require(worker != address(0), "Invalid worker address");
        authorizedTEEWorkers[worker] = authorized;
        emit TEEWorkerAuthorized(worker, authorized);
    }
    
    /**
     * @notice Add or remove supported token
     * @param token Token address
     * @param supported Support status
     */
    function setSupportedToken(address token, bool supported)
        external
        onlyOwner
    {
        require(token != address(0), "Invalid token address");
        supportedTokens[token] = supported;
        emit TokenSupported(token, supported);
    }
    
    /**
     * @notice Update credit score registry address
     * @param newRegistry New registry address
     */
    function updateCreditScoreRegistry(address newRegistry)
        external
        onlyOwner
    {
        require(newRegistry != address(0), "Invalid registry address");
        creditScoreRegistry = CreditScoreRegistry(newRegistry);
    }
    
    // ============ Internal Functions ============
    
    /**
     * @notice Execute trade (simplified for testnet)
     * @param user User address
     * @param params Trade parameters
     * @param leverage Maximum leverage
     */
    function _executeTrade(
        address user,
        TradeParams calldata params,
        uint256 leverage
    ) internal {
        // Simplified trade execution for testnet
        // In production, this would:
        // 1. Validate leverage limits
        // 2. Execute trade through DEX/aggregator
        // 3. Apply position management
        // 4. Handle collateral
        
        // For testnet, just emit event
        // Real implementation would interact with DEX protocols
    }
}
