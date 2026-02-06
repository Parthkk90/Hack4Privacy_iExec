// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title StrategyExecutor
 * @dev Execute TEE-computed trading strategies with proof verification
 * @notice This contract enables private strategy execution with TEE attestations
 */
contract StrategyExecutor is Ownable, ReentrancyGuard {
    
    struct Trade {
        address token;           // Token address to trade
        uint256 amount;          // Amount to trade
        bool isBuy;             // True = buy, False = sell
        bytes32 strategyHash;   // Hash of the strategy
        bytes proof;            // Computation proof
        uint256 maxSlippage;    // Max slippage in basis points (e.g., 50 = 0.5%)
        uint256 deadline;       // Trade deadline timestamp
    }
    
    struct ExecutedTrade {
        address user;
        address token;
        uint256 amount;
        uint256 executedPrice;
        uint256 timestamp;
        bytes32 strategyHash;
        bool success;
    }
    
    // State variables
    mapping(address => bool) public authorizedTEE;
    mapping(address => ExecutedTrade[]) public userTrades;
    mapping(bytes32 => bool) public usedProofs; // Prevent replay attacks
    
    address public creditScoreRegistry;
    uint256 public minExecutionDelay = 1; // Minimum blocks before execution
    uint256 public totalTradesExecuted;
    
    // Events
    event TradeExecuted(
        address indexed user,
        address indexed token,
        uint256 amount,
        bool isBuy,
        uint256 executedPrice,
        bytes32 strategyHash
    );
    
    event TEEAuthorized(address indexed teeWorker, bool authorized);
    
    event ProofVerified(
        bytes32 indexed proofHash,
        bytes32 strategyHash,
        bool isValid
    );
    
    // Modifiers
    modifier onlyAuthorizedTEE() {
        require(authorizedTEE[msg.sender], "Not authorized TEE worker");
        _;
    }
    
    constructor(address _creditScoreRegistry) Ownable(msg.sender) {
        require(_creditScoreRegistry != address(0), "Invalid registry");
        creditScoreRegistry = _creditScoreRegistry;
    }
    
    /**
     * @dev Authorize or deauthorize a TEE worker
     * @param teeWorker Address of the TEE worker
     * @param authorized True to authorize, false to revoke
     */
    function setTEEAuthorization(
        address teeWorker,
        bool authorized
    ) external onlyOwner {
        require(teeWorker != address(0), "Invalid TEE address");
        authorizedTEE[teeWorker] = authorized;
        emit TEEAuthorized(teeWorker, authorized);
    }
    
    /**
     * @dev Execute a private trade with TEE attestation
     * @param trade Trade parameters
     * @param teeAttestation TEE attestation proof
     */
    function executePrivateTrade(
        Trade calldata trade,
        bytes calldata teeAttestation
    ) external payable nonReentrant {
        require(trade.token != address(0), "Invalid token");
        require(trade.amount > 0, "Invalid amount");
        require(trade.deadline >= block.timestamp, "Trade expired");
        require(!usedProofs[keccak256(trade.proof)], "Proof already used");
        
        // Verify computation proof
        require(
            verifyComputationProof(trade.strategyHash, trade.proof),
            "Invalid computation proof"
        );
        
        // Verify TEE attestation
        require(
            verifyTEEAttestation(teeAttestation),
            "Invalid TEE attestation"
        );
        
        // Mark proof as used
        bytes32 proofHash = keccak256(trade.proof);
        usedProofs[proofHash] = true;
        
        // Execute trade (simplified for testnet)
        uint256 executedPrice = _executeTrade(trade);
        
        // Record trade
        ExecutedTrade memory executedTrade = ExecutedTrade({
            user: msg.sender,
            token: trade.token,
            amount: trade.amount,
            executedPrice: executedPrice,
            timestamp: block.timestamp,
            strategyHash: trade.strategyHash,
            success: true
        });
        
        userTrades[msg.sender].push(executedTrade);
        totalTradesExecuted++;
        
        emit TradeExecuted(
            msg.sender,
            trade.token,
            trade.amount,
            trade.isBuy,
            executedPrice,
            trade.strategyHash
        );
        
        emit ProofVerified(proofHash, trade.strategyHash, true);
    }
    
    /**
     * @dev Verify computation proof from TEE
     * @param strategyHash Hash of the strategy
     * @param proof Computation proof bytes
     * @return bool True if proof is valid
     */
    function verifyComputationProof(
        bytes32 strategyHash,
        bytes calldata proof
    ) public pure returns (bool) {
        // Basic validation
        if (proof.length < 32 || strategyHash == bytes32(0)) {
            return false;
        }
        
        // In production, verify:
        // 1. Cryptographic signature from TEE
        // 2. Strategy hash matches computation
        // 3. Timestamp is recent
        // 4. Nonce is unique
        
        // For testnet: simple validation
        return true;
    }
    
    /**
     * @dev Verify TEE attestation
     * @param attestation TEE attestation bytes
     * @return bool True if attestation is valid
     */
    function verifyTEEAttestation(
        bytes calldata attestation
    ) public pure returns (bool) {
        // Basic validation
        if (attestation.length < 32) {
            return false;
        }
        
        // In production:
        // 1. Verify SGX/SCONE signature
        // 2. Check MRENCLAVE
        // 3. Validate timestamp
        
        return true;
    }
    
    /**
     * @dev Internal function to execute trade (simplified)
     * @param trade Trade parameters
     * @return uint256 Executed price
     */
    function _executeTrade(
        Trade calldata trade
    ) internal returns (uint256) {
        // In production, this would:
        // 1. Interact with DEX (Uniswap, etc.)
        // 2. Check slippage
        // 3. Handle token transfers
        // 4. Return actual executed price
        
        // For testnet: return mock price
        uint256 mockPrice = 1000 * 1e18; // Mock price
        
        // If selling, transfer tokens from user
        if (!trade.isBuy) {
            IERC20 token = IERC20(trade.token);
            require(
                token.transferFrom(msg.sender, address(this), trade.amount),
                "Transfer failed"
            );
        }
        
        return mockPrice;
    }
    
    /**
     * @dev Get user's trade history
     * @param user User's wallet address
     * @return ExecutedTrade[] Array of executed trades
     */
    function getUserTrades(
        address user
    ) external view returns (ExecutedTrade[] memory) {
        return userTrades[user];
    }
    
    /**
     * @dev Get total trades for user
     * @param user User's wallet address
     * @return uint256 Total trades
     */
    function getUserTradeCount(address user) external view returns (uint256) {
        return userTrades[user].length;
    }
    
    /**
     * @dev Check if proof has been used
     * @param proof Proof bytes
     * @return bool True if used
     */
    function isProofUsed(bytes calldata proof) external view returns (bool) {
        return usedProofs[keccak256(proof)];
    }
    
    /**
     * @dev Update credit score registry address
     * @param _registry New registry address
     */
    function updateCreditScoreRegistry(
        address _registry
    ) external onlyOwner {
        require(_registry != address(0), "Invalid registry");
        creditScoreRegistry = _registry;
    }
    
    /**
     * @dev Set minimum execution delay
     * @param _delay Delay in blocks
     */
    function setMinExecutionDelay(uint256 _delay) external onlyOwner {
        minExecutionDelay = _delay;
    }
    
    /**
     * @dev Emergency withdraw (owner only)
     * @param token Token address (address(0) for ETH)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }
    
    // Receive ETH
    receive() external payable {}
}
