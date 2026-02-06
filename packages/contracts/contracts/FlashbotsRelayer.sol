// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FlashbotsRelayer
 * @notice Provides MEV-protected private transaction submission
 * @dev Transactions are encrypted until execution time
 */
contract FlashbotsRelayer is Ownable, ReentrancyGuard {
    
    // ============ Structs ============
    
    struct PrivateTransaction {
        address sender;              // Transaction sender
        bytes encryptedData;         // Encrypted transaction data
        uint256 maxBlockNumber;      // Maximum block for execution
        uint256 fee;                 // Relayer fee
        uint256 timestamp;           // Submission timestamp
        bool executed;               // Execution status
        bool cancelled;              // Cancellation status
    }
    
    // ============ State Variables ============
    
    /// @notice Mapping of transaction hash to transaction details
    mapping(bytes32 => PrivateTransaction) public privateTransactions;
    
    /// @notice Mapping of authorized relayers
    mapping(address => bool) public authorizedRelayers;
    
    /// @notice Minimum relayer fee
    uint256 public minRelayerFee = 0.001 ether;
    
    /// @notice Maximum blocks in the future
    uint256 public constant MAX_BLOCK_DELAY = 100;
    
    /// @notice Cancellation refund percentage (90%)
    uint256 public constant CANCELLATION_REFUND_PCT = 90;
    
    // ============ Events ============
    
    event PrivateTransactionSubmitted(
        bytes32 indexed txHash,
        address indexed sender,
        uint256 maxBlockNumber,
        uint256 fee
    );
    
    event PrivateTransactionExecuted(
        bytes32 indexed txHash,
        address indexed relayer,
        uint256 blockNumber
    );
    
    event PrivateTransactionCancelled(
        bytes32 indexed txHash,
        address indexed sender,
        uint256 refund
    );
    
    event RelayerAuthorized(address indexed relayer, bool authorized);
    
    event MinRelayerFeeUpdated(uint256 oldFee, uint256 newFee);
    
    // ============ Modifiers ============
    
    modifier onlyAuthorizedRelayer() {
        require(authorizedRelayers[msg.sender], "Not authorized relayer");
        _;
    }
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {}
    
    // ============ External Functions ============
    
    /**
     * @notice Submit a private transaction for MEV-protected execution
     * @param encryptedData Encrypted transaction data
     * @param maxBlockNumber Maximum block number for execution
     * @return txHash Hash of the private transaction
     */
    function submitPrivateTransaction(
        bytes calldata encryptedData,
        uint256 maxBlockNumber
    ) external payable nonReentrant returns (bytes32 txHash) {
        require(encryptedData.length > 0, "Empty transaction data");
        require(msg.value >= minRelayerFee, "Insufficient relayer fee");
        require(
            maxBlockNumber > block.number && 
            maxBlockNumber <= block.number + MAX_BLOCK_DELAY,
            "Invalid max block number"
        );
        
        // Generate transaction hash
        txHash = keccak256(
            abi.encodePacked(
                msg.sender,
                encryptedData,
                maxBlockNumber,
                block.timestamp
            )
        );
        
        // Store transaction
        privateTransactions[txHash] = PrivateTransaction({
            sender: msg.sender,
            encryptedData: encryptedData,
            maxBlockNumber: maxBlockNumber,
            fee: msg.value,
            timestamp: block.timestamp,
            executed: false,
            cancelled: false
        });
        
        emit PrivateTransactionSubmitted(
            txHash,
            msg.sender,
            maxBlockNumber,
            msg.value
        );
        
        return txHash;
    }
    
    /**
     * @notice Execute a private transaction (relayer only)
     * @param txHash Transaction hash
     * @param decryptedData Decrypted transaction data
     */
    function executePrivateTransaction(
        bytes32 txHash,
        bytes calldata decryptedData
    ) external onlyAuthorizedRelayer nonReentrant {
        PrivateTransaction storage txn = privateTransactions[txHash];
        
        require(txn.sender != address(0), "Transaction not found");
        require(!txn.executed, "Already executed");
        require(!txn.cancelled, "Transaction cancelled");
        require(block.number <= txn.maxBlockNumber, "Transaction expired");
        
        // Mark as executed
        txn.executed = true;
        
        // Execute transaction (simplified for testnet)
        // In production, this would:
        // 1. Verify decryption
        // 2. Execute actual transaction
        // 3. Handle failures
        
        // Transfer fee to relayer
        (bool success, ) = msg.sender.call{value: txn.fee}("");
        require(success, "Fee transfer failed");
        
        emit PrivateTransactionExecuted(txHash, msg.sender, block.number);
    }
    
    /**
     * @notice Cancel a private transaction and receive refund
     * @param txHash Transaction hash
     */
    function cancelPrivateTransaction(bytes32 txHash) external nonReentrant {
        PrivateTransaction storage txn = privateTransactions[txHash];
        
        require(txn.sender == msg.sender, "Not transaction sender");
        require(!txn.executed, "Already executed");
        require(!txn.cancelled, "Already cancelled");
        
        // Mark as cancelled
        txn.cancelled = true;
        
        // Calculate refund (90% of fee)
        uint256 refund = (txn.fee * CANCELLATION_REFUND_PCT) / 100;
        
        // Transfer refund
        (bool success, ) = msg.sender.call{value: refund}("");
        require(success, "Refund transfer failed");
        
        emit PrivateTransactionCancelled(txHash, msg.sender, refund);
    }
    
    /**
     * @notice Get private transaction details
     * @param txHash Transaction hash
     * @return transaction PrivateTransaction struct
     */
    function getPrivateTransaction(bytes32 txHash)
        external
        view
        returns (PrivateTransaction memory)
    {
        return privateTransactions[txHash];
    }
    
    /**
     * @notice Check if transaction is still valid
     * @param txHash Transaction hash
     * @return valid True if transaction can still be executed
     */
    function isTransactionValid(bytes32 txHash)
        external
        view
        returns (bool)
    {
        PrivateTransaction memory txn = privateTransactions[txHash];
        
        return (
            txn.sender != address(0) &&
            !txn.executed &&
            !txn.cancelled &&
            block.number <= txn.maxBlockNumber
        );
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Authorize or revoke relayer
     * @param relayer Address of relayer
     * @param authorized Authorization status
     */
    function authorizeRelayer(address relayer, bool authorized)
        external
        onlyOwner
    {
        require(relayer != address(0), "Invalid relayer address");
        authorizedRelayers[relayer] = authorized;
        emit RelayerAuthorized(relayer, authorized);
    }
    
    /**
     * @notice Update minimum relayer fee
     * @param newFee New minimum fee
     */
    function updateMinRelayerFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = minRelayerFee;
        minRelayerFee = newFee;
        emit MinRelayerFeeUpdated(oldFee, newFee);
    }
    
    /**
     * @notice Emergency withdraw function
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }
    
    // ============ Receive Function ============
    
    receive() external payable {}
}
