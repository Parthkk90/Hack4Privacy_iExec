// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CreditScoreRegistry
 * @notice Stores encrypted credit scores computed by iExec TEE workers
 * @dev Scores are stored with attestations and have expiration timestamps
 */
contract CreditScoreRegistry is Ownable, ReentrancyGuard {
    
    // ============ Structs ============
    
    struct CreditScore {
        uint256 score;              // Credit score (300-850 range)
        bytes32 encryptedScore;     // Encrypted score data
        uint256 timestamp;          // Last update timestamp
        uint256 expiresAt;          // Expiration timestamp
        uint8 tier;                 // Tier level (1-4)
        bytes attestation;          // TEE attestation proof
        bool isActive;              // Score validity flag
    }
    
    // ============ State Variables ============
    
    /// @notice Mapping from address to credit score
    mapping(address => CreditScore) public creditScores;
    
    /// @notice Mapping of authorized TEE workers
    mapping(address => bool) public authorizedTEEWorkers;
    
    /// @notice Score validity duration (30 days)
    uint256 public constant SCORE_VALIDITY_PERIOD = 30 days;
    
    /// @notice Minimum credit score
    uint256 public constant MIN_SCORE = 300;
    
    /// @notice Maximum credit score
    uint256 public constant MAX_SCORE = 850;
    
    // ============ Events ============
    
    event ScoreUpdated(
        address indexed user,
        uint256 score,
        uint8 tier,
        uint256 timestamp,
        uint256 expiresAt
    );
    
    event TEEWorkerAuthorized(address indexed worker, bool authorized);
    
    event ScoreExpired(address indexed user, uint256 expiredAt);
    
    // ============ Modifiers ============
    
    modifier onlyAuthorizedTEE() {
        require(authorizedTEEWorkers[msg.sender], "Not authorized TEE worker");
        _;
    }
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {}
    
    // ============ External Functions ============
    
    /**
     * @notice Update credit score for a user (called by TEE worker)
     * @param user Address of the user
     * @param score Credit score value (300-850)
     * @param encryptedScore Encrypted score data
     * @param attestation TEE attestation proof
     */
    function updateScore(
        address user,
        uint256 score,
        bytes32 encryptedScore,
        bytes calldata attestation
    ) external onlyAuthorizedTEE nonReentrant {
        require(user != address(0), "Invalid user address");
        require(score >= MIN_SCORE && score <= MAX_SCORE, "Score out of range");
        require(attestation.length > 0, "Invalid attestation");
        
        uint8 tier = calculateTier(score);
        uint256 timestamp = block.timestamp;
        uint256 expiresAt = timestamp + SCORE_VALIDITY_PERIOD;
        
        creditScores[user] = CreditScore({
            score: score,
            encryptedScore: encryptedScore,
            timestamp: timestamp,
            expiresAt: expiresAt,
            tier: tier,
            attestation: attestation,
            isActive: true
        });
        
        emit ScoreUpdated(user, score, tier, timestamp, expiresAt);
    }
    
    /**
     * @notice Get credit score for a user
     * @param user Address to query
     * @return score Credit score value
     * @return tier Tier level
     * @return isValid Whether score is still valid
     */
    function getScore(address user)
        external
        view
        returns (
            uint256 score,
            uint8 tier,
            bool isValid
        )
    {
        CreditScore memory cs = creditScores[user];
        bool valid = cs.isActive && !isScoreExpired(user);
        
        return (cs.score, cs.tier, valid);
    }
    
    /**
     * @notice Get maximum leverage for a user based on credit tier
     * @param user Address to query
     * @return leverage Maximum leverage multiplier (scaled by 100)
     */
    function getMaxLeverage(address user) external view returns (uint256 leverage) {
        CreditScore memory cs = creditScores[user];
        
        if (!cs.isActive || isScoreExpired(user)) {
            return 0;
        }
        
        // Leverage based on tier: 1=0.75x, 2=1.5x, 3=2.25x, 4=3.0x
        if (cs.tier == 1) return 75;        // 0.75x (scaled by 100)
        if (cs.tier == 2) return 150;       // 1.5x
        if (cs.tier == 3) return 225;       // 2.25x
        if (cs.tier == 4) return 300;       // 3.0x
        
        return 0;
    }
    
    /**
     * @notice Check if a score has expired
     * @param user Address to check
     * @return expired True if score has expired
     */
    function isScoreExpired(address user) public view returns (bool) {
        CreditScore memory cs = creditScores[user];
        return block.timestamp > cs.expiresAt;
    }
    
    /**
     * @notice Get full credit score details
     * @param user Address to query
     * @return CreditScore struct
     */
    function getCreditScoreDetails(address user)
        external
        view
        returns (CreditScore memory)
    {
        return creditScores[user];
    }
    
    /**
     * @notice Verify TEE attestation (simplified for testnet)
     * @param user Address to verify
     * @param attestation Attestation to verify
     * @return valid True if attestation is valid
     */
    function verifyAttestation(address user, bytes calldata attestation)
        external
        view
        returns (bool valid)
    {
        CreditScore memory cs = creditScores[user];
        
        // Simplified verification for testnet
        // In production, this would verify SGX/SCONE attestation
        return keccak256(cs.attestation) == keccak256(attestation);
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
     * @notice Manually expire a score (emergency function)
     * @param user Address to expire
     */
    function expireScore(address user) external onlyOwner {
        require(creditScores[user].isActive, "Score already inactive");
        creditScores[user].isActive = false;
        emit ScoreExpired(user, block.timestamp);
    }
    
    // ============ Internal Functions ============
    
    /**
     * @notice Calculate tier based on credit score
     * @param score Credit score (300-850)
     * @return tier Tier level (1-4)
     */
    function calculateTier(uint256 score) internal pure returns (uint8 tier) {
        if (score >= 750) return 4;        // Platinum: 750-850
        if (score >= 650) return 3;        // Gold: 650-749
        if (score >= 550) return 2;        // Silver: 550-649
        return 1;                          // Bronze: 300-549
    }
}
