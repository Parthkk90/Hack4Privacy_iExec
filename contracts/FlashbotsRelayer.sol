// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FlashbotsRelayer
 * @dev Interface for MEV-protected transaction submission
 * @notice This contract provides MEV protection for private transactions
 * Note: Flashbots doesn't directly support Arbitrum yet, so this uses an alternative approach
 */
contract FlashbotsRelayer is Ownable, ReentrancyGuard {
    
    struct PrivateTransaction {
        bytes encryptedTx;       // Encrypted transaction data
        uint256 maxBlockNumber;  // Latest block for execution
        address submitter;       // Who submitted the transaction
        uint256 timestamp;       // Submission timestamp
        bool executed;           // Execution status
        bytes32 txHash;         // Resulting transaction hash
    }
    
    // State variables
    mapping(bytes32 => PrivateTransaction) public pendingTransactions;
    mapping(address => bool) public authorizedRelayers;
    mapping(address => uint256) public userNonces;
    
    uint256 public relayFee = 0.001 ether; // Fee for MEV protection
    uint256 public maxBlockDelay = 20; // Max blocks to wait
    uint256 public totalRelayed;
    
    // Events
    event TransactionSubmitted(
        bytes32 indexed txId,
        address indexed submitter,
        uint256 maxBlockNumber,
        uint256 timestamp
    );
    
    event TransactionExecuted(
        bytes32 indexed txId,
        bytes32 txHash,
        uint256 blockNumber
    );
    
    event TransactionCancelled(
        bytes32 indexed txId,
        string reason
    );
    
    event RelayerAuthorized(
        address indexed relayer,
        bool authorized
    );
    
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    
    // Modifiers
    modifier onlyAuthorizedRelayer() {
        require(
            authorizedRelayers[msg.sender] || msg.sender == owner(),
            "Not authorized relayer"
        );
        _;
    }
    
    constructor() Ownable(msg.sender) {
        // Owner is automatically authorized
        authorizedRelayers[msg.sender] = true;
    }
    
    /**
     * @dev Submit a private transaction for MEV-protected execution
     * @param encryptedTx Encrypted transaction data
     * @param maxBlockNumber Maximum block number for execution
     * @return txId Unique transaction identifier
     */
    function submitPrivateTransaction(
        bytes calldata encryptedTx,
        uint256 maxBlockNumber
    ) external payable nonReentrant returns (bytes32 txId) {
        require(encryptedTx.length > 0, "Empty transaction");
        require(msg.value >= relayFee, "Insufficient relay fee");
        require(
            maxBlockNumber > block.number &&
            maxBlockNumber <= block.number + maxBlockDelay,
            "Invalid max block number"
        );
        
        // Generate unique transaction ID
        txId = keccak256(
            abi.encodePacked(
                msg.sender,
                encryptedTx,
                maxBlockNumber,
                userNonces[msg.sender]++,
                block.timestamp
            )
        );
        
        // Store transaction
        pendingTransactions[txId] = PrivateTransaction({
            encryptedTx: encryptedTx,
            maxBlockNumber: maxBlockNumber,
            submitter: msg.sender,
            timestamp: block.timestamp,
            executed: false,
            txHash: bytes32(0)
        });
        
        emit TransactionSubmitted(
            txId,
            msg.sender,
            maxBlockNumber,
            block.timestamp
        );
        
        return txId;
    }
    
    /**
     * @dev Execute a pending private transaction (relayer only)
     * @param txId Transaction identifier
     * @param txHash Resulting transaction hash after execution
     */
    function executePrivateTransaction(
        bytes32 txId,
        bytes32 txHash
    ) external onlyAuthorizedRelayer nonReentrant {
        PrivateTransaction storage privateTx = pendingTransactions[txId];
        
        require(privateTx.submitter != address(0), "Transaction not found");
        require(!privateTx.executed, "Already executed");
        require(
            block.number <= privateTx.maxBlockNumber,
            "Transaction expired"
        );
        require(txHash != bytes32(0), "Invalid tx hash");
        
        // Mark as executed
        privateTx.executed = true;
        privateTx.txHash = txHash;
        totalRelayed++;
        
        emit TransactionExecuted(txId, txHash, block.number);
    }
    
    /**
     * @dev Cancel a pending transaction (submitter only)
     * @param txId Transaction identifier
     */
    function cancelTransaction(bytes32 txId) external nonReentrant {
        PrivateTransaction storage privateTx = pendingTransactions[txId];
        
        require(
            privateTx.submitter == msg.sender,
            "Not transaction submitter"
        );
        require(!privateTx.executed, "Already executed");
        
        // Refund fee (minus gas)
        uint256 refundAmount = (relayFee * 90) / 100; // 90% refund
        payable(msg.sender).transfer(refundAmount);
        
        // Mark as cancelled by deleting
        delete pendingTransactions[txId];
        
        emit TransactionCancelled(txId, "Cancelled by user");
    }
    
    /**
     * @dev Clean up expired transactions
     * @param txId Transaction identifier
     */
    function cleanupExpiredTransaction(
        bytes32 txId
    ) external onlyAuthorizedRelayer {
        PrivateTransaction storage privateTx = pendingTransactions[txId];
        
        require(privateTx.submitter != address(0), "Transaction not found");
        require(!privateTx.executed, "Already executed");
        require(
            block.number > privateTx.maxBlockNumber,
            "Not yet expired"
        );
        
        // Refund partial fee
        uint256 refundAmount = (relayFee * 80) / 100; // 80% refund
        payable(privateTx.submitter).transfer(refundAmount);
        
        delete pendingTransactions[txId];
        
        emit TransactionCancelled(txId, "Expired");
    }
    
    /**
     * @dev Authorize or deauthorize a relayer
     * @param relayer Relayer address
     * @param authorized True to authorize, false to revoke
     */
    function setRelayerAuthorization(
        address relayer,
        bool authorized
    ) external onlyOwner {
        require(relayer != address(0), "Invalid relayer address");
        authorizedRelayers[relayer] = authorized;
        emit RelayerAuthorized(relayer, authorized);
    }
    
    /**
     * @dev Update relay fee
     * @param newFee New fee amount in wei
     */
    function updateRelayFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = relayFee;
        relayFee = newFee;
        emit FeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Update max block delay
     * @param newDelay New maximum block delay
     */
    function updateMaxBlockDelay(uint256 newDelay) external onlyOwner {
        require(newDelay > 0 && newDelay <= 100, "Invalid delay");
        maxBlockDelay = newDelay;
    }
    
    /**
     * @dev Get transaction details
     * @param txId Transaction identifier
     * @return PrivateTransaction struct
     */
    function getTransaction(
        bytes32 txId
    ) external view returns (PrivateTransaction memory) {
        return pendingTransactions[txId];
    }
    
    /**
     * @dev Check if transaction is pending
     * @param txId Transaction identifier
     * @return bool True if pending
     */
    function isPending(bytes32 txId) external view returns (bool) {
        PrivateTransaction memory privateTx = pendingTransactions[txId];
        return privateTx.submitter != address(0) && !privateTx.executed;
    }
    
    /**
     * @dev Get user's current nonce
     * @param user User address
     * @return uint256 Current nonce
     */
    function getUserNonce(address user) external view returns (uint256) {
        return userNonces[user];
    }
    
    /**
     * @dev Withdraw collected fees (owner only)
     * @param amount Amount to withdraw
     */
    function withdrawFees(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner()).transfer(amount);
    }
    
    // Receive ETH
    receive() external payable {}
}
