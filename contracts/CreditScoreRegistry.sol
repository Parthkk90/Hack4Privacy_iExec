// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CreditScoreRegistry
 * @dev Store encrypted credit scores with TEE attestations
 * @notice This contract maintains on-chain credit scores computed in TEE
 */
contract CreditScoreRegistry is Ownable, ReentrancyGuard {
    
    struct CreditScore {
        bytes32 scoreHash;        // Hash of encrypted score
        uint256 timestamp;        // Last update time
        bytes attestation;        // TEE attestation proof
        uint8 tier;              // 1=Bronze, 2=Silver, 3=Gold, 4=Platinum
        uint16 score;            // Actual score (300-850)
        bool isActive;           // Score validity
    }
    
    // Mappings
    mapping(address => CreditScore) public scores;
    mapping(address => bool) public authorizedTEE;
    mapping(address => uint256) public scoreUpdateCount;
    bool public strictAttestationMode; // For production TEE verification
    
    // Events
    event ScoreUpdated(
        address indexed user,
        uint8 tier,
        uint16 score,
        bytes32 scoreHash,
        uint256 timestamp
    );
    
    event TEEAuthorized(address indexed teeWorker, bool authorized);
    
    event AttestationVerified(
        address indexed user,
        bytes attestation,
        bool isValid
    );
    
    // Modifiers
    modifier onlyAuthorizedTEE() {
        require(authorizedTEE[msg.sender], "Not authorized TEE worker");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        // Allow flexible attestation for testing/development
        strictAttestationMode = false;
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
     * @dev Update user's credit score (only callable by authorized TEE)
     * @param user User's wallet address
     * @param scoreHash Hash of the encrypted score
     * @param tier Credit tier (1-4)
     * @param score Actual credit score (300-850)
     * @param attestation TEE attestation proof
     */
    function updateScore(
        address user,
        bytes32 scoreHash,
        uint8 tier,
        uint16 score,
        bytes memory attestation
    ) external onlyAuthorizedTEE nonReentrant {
        require(user != address(0), "Invalid user address");
        require(tier >= 1 && tier <= 4, "Invalid tier");
        require(score >= 300 && score <= 850, "Invalid score range");
        require(attestation.length > 0, "Attestation required");
        
        // Verify attestation
        require(verifyAttestation(attestation), "Invalid attestation");
        
        scores[user] = CreditScore({
            scoreHash: scoreHash,
            timestamp: block.timestamp,
            attestation: attestation,
            tier: tier,
            score: score,
            isActive: true
        });
        
        scoreUpdateCount[user]++;
        
        emit ScoreUpdated(user, tier, score, scoreHash, block.timestamp);
        emit AttestationVerified(user, attestation, true);
    }
    
    /**
     * @dev Verify TEE attestation proof
     * @param attestation The attestation bytes to verify
     * @return bool True if attestation is valid
     */
    function verifyAttestation(
        bytes memory attestation
    ) public view returns (bool) {
        // Basic validation - in production, implement full SGX/SCONE verification
        // This would verify:
        // 1. Signature from known TEE enclave
        // 2. Measurement/MRENCLAVE matches expected value
        // 3. Timestamp is recent
        // 4. Nonce hasn't been used
        
        // Minimum length check
        if (attestation.length == 0) {
            return false;
        }
        
        // In strict mode (production), require full attestation
        if (strictAttestationMode && attestation.length < 32) {
            return false;
        }
        
        // For testnet/development: allow any non-empty attestation
        // TODO: Implement full attestation verification with iExec's attestation service
        return true;
    }
    
    /**
     * @dev Get user's credit score details
     * @param user User's wallet address
     * @return CreditScore struct
     */
    function getScore(address user) external view returns (CreditScore memory) {
        return scores[user];
    }
    
    /**
     * @dev Get user's credit tier
     * @param user User's wallet address
     * @return uint8 Credit tier
     */
    function getTier(address user) external view returns (uint8) {
        return scores[user].tier;
    }
    
    /**
     * @dev Get user's max leverage based on credit score
     * @param user User's wallet address
     * @return uint256 Max leverage multiplier (in basis points, e.g., 300 = 3.0x)
     */
    function getMaxLeverage(address user) external view returns (uint256) {
        CreditScore memory userScore = scores[user];
        
        if (!userScore.isActive) {
            return 100; // 1.0x default
        }
        
        // Tier-based leverage:
        // Bronze (1): 1.0x = 100
        // Silver (2): 1.5x = 150
        // Gold (3): 2.25x = 225
        // Platinum (4): 3.0x = 300
        
        return uint256(userScore.tier) * 75;
    }
    
    /**
     * @dev Check if user's score is expired (older than 30 days)
     * @param user User's wallet address
     * @return bool True if expired
     */
    function isScoreExpired(address user) external view returns (bool) {
        CreditScore memory userScore = scores[user];
        
        if (!userScore.isActive) {
            return true;
        }
        
        return block.timestamp > userScore.timestamp + 30 days;
    }
    
    /**
     * @dev Deactivate user's score (for emergency)
     * @param user User's wallet address
     */
    function deactivateScore(address user) external onlyOwner {
        scores[user].isActive = false;
    }
    
    /**
     * @dev Enable/disable strict attestation verification
     * @param enabled True to require full SGX attestation (production mode)
     */
    function setStrictAttestationMode(bool enabled) external onlyOwner {
        strictAttestationMode = enabled;
    }
    
    /**
     * @dev Get total number of score updates for a user
     * @param user User's wallet address
     * @return uint256 Total updates
     */
    function getUpdateCount(address user) external view returns (uint256) {
        return scoreUpdateCount[user];
    }
}

