const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CreditScoreRegistry", function () {
  let creditScoreRegistry;
  let owner, teeWorker, user1, user2;

  beforeEach(async function () {
    [owner, teeWorker, user1, user2] = await ethers.getSigners();

    const CreditScoreRegistry = await ethers.getContractFactory("CreditScoreRegistry");
    creditScoreRegistry = await CreditScoreRegistry.deploy();
    await creditScoreRegistry.waitForDeployment();

    // Authorize TEE worker
    await creditScoreRegistry.authorizeTEEWorker(teeWorker.address, true);
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await creditScoreRegistry.owner()).to.equal(owner.address);
    });

    it("Should have correct constants", async function () {
      expect(await creditScoreRegistry.MIN_SCORE()).to.equal(300);
      expect(await creditScoreRegistry.MAX_SCORE()).to.equal(850);
      expect(await creditScoreRegistry.SCORE_VALIDITY_PERIOD()).to.equal(30 * 24 * 60 * 60);
    });
  });

  describe("TEE Worker Authorization", function () {
    it("Should authorize TEE worker", async function () {
      expect(await creditScoreRegistry.authorizedTEEWorkers(teeWorker.address)).to.be.true;
    });

    it("Should revoke TEE worker authorization", async function () {
      await creditScoreRegistry.authorizeTEEWorker(teeWorker.address, false);
      expect(await creditScoreRegistry.authorizedTEEWorkers(teeWorker.address)).to.be.false;
    });

    it("Should revert if non-owner tries to authorize", async function () {
      await expect(
        creditScoreRegistry.connect(user1).authorizeTEEWorker(user2.address, true)
      ).to.be.revertedWithCustomError(creditScoreRegistry, "OwnableUnauthorizedAccount");
    });

    it("Should emit event when authorizing TEE worker", async function () {
      await expect(creditScoreRegistry.authorizeTEEWorker(user1.address, true))
        .to.emit(creditScoreRegistry, "TEEWorkerAuthorized")
        .withArgs(user1.address, true);
    });
  });

  describe("Score Updates", function () {
    const validScore = 700;
    const encryptedScore = ethers.id("encrypted_score_data");
    const attestation = ethers.toUtf8Bytes("valid_attestation");

    it("Should update credit score", async function () {
      await expect(
        creditScoreRegistry
          .connect(teeWorker)
          .updateScore(user1.address, validScore, encryptedScore, attestation)
      )
        .to.emit(creditScoreRegistry, "ScoreUpdated")
        .withArgs(user1.address, validScore, 3, await time.latest() + 1, await time.latest() + 1 + 30 * 24 * 60 * 60);

      const [score, tier, isValid] = await creditScoreRegistry.getScore(user1.address);
      expect(score).to.equal(validScore);
      expect(tier).to.equal(3); // Gold tier
      expect(isValid).to.be.true;
    });

    it("Should revert if unauthorized TEE worker tries to update", async function () {
      await expect(
        creditScoreRegistry
          .connect(user1)
          .updateScore(user1.address, validScore, encryptedScore, attestation)
      ).to.be.revertedWith("Not authorized TEE worker");
    });

    it("Should revert with invalid user address", async function () {
      await expect(
        creditScoreRegistry
          .connect(teeWorker)
          .updateScore(ethers.ZeroAddress, validScore, encryptedScore, attestation)
      ).to.be.revertedWith("Invalid user address");
    });

    it("Should revert with score below minimum", async function () {
      await expect(
        creditScoreRegistry
          .connect(teeWorker)
          .updateScore(user1.address, 299, encryptedScore, attestation)
      ).to.be.revertedWith("Score out of range");
    });

    it("Should revert with score above maximum", async function () {
      await expect(
        creditScoreRegistry
          .connect(teeWorker)
          .updateScore(user1.address, 851, encryptedScore, attestation)
      ).to.be.revertedWith("Score out of range");
    });

    it("Should revert with empty attestation", async function () {
      await expect(
        creditScoreRegistry
          .connect(teeWorker)
          .updateScore(user1.address, validScore, encryptedScore, "0x")
      ).to.be.revertedWith("Invalid attestation");
    });
  });

  describe("Tier Calculation", function () {
    const encryptedScore = ethers.id("encrypted_score_data");
    const attestation = ethers.toUtf8Bytes("valid_attestation");

    it("Should assign Bronze tier (300-549)", async function () {
      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user1.address, 500, encryptedScore, attestation);

      const [, tier] = await creditScoreRegistry.getScore(user1.address);
      expect(tier).to.equal(1);
    });

    it("Should assign Silver tier (550-649)", async function () {
      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user1.address, 600, encryptedScore, attestation);

      const [, tier] = await creditScoreRegistry.getScore(user1.address);
      expect(tier).to.equal(2);
    });

    it("Should assign Gold tier (650-749)", async function () {
      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user1.address, 700, encryptedScore, attestation);

      const [, tier] = await creditScoreRegistry.getScore(user1.address);
      expect(tier).to.equal(3);
    });

    it("Should assign Platinum tier (750-850)", async function () {
      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user1.address, 800, encryptedScore, attestation);

      const [, tier] = await creditScoreRegistry.getScore(user1.address);
      expect(tier).to.equal(4);
    });
  });

  describe("Leverage Calculation", function () {
    const encryptedScore = ethers.id("encrypted_score_data");
    const attestation = ethers.toUtf8Bytes("valid_attestation");

    it("Should return 0.75x leverage for Bronze tier", async function () {
      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user1.address, 500, encryptedScore, attestation);

      const leverage = await creditScoreRegistry.getMaxLeverage(user1.address);
      expect(leverage).to.equal(75);
    });

    it("Should return 1.5x leverage for Silver tier", async function () {
      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user1.address, 600, encryptedScore, attestation);

      const leverage = await creditScoreRegistry.getMaxLeverage(user1.address);
      expect(leverage).to.equal(150);
    });

    it("Should return 2.25x leverage for Gold tier", async function () {
      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user1.address, 700, encryptedScore, attestation);

      const leverage = await creditScoreRegistry.getMaxLeverage(user1.address);
      expect(leverage).to.equal(225);
    });

    it("Should return 3.0x leverage for Platinum tier", async function () {
      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user1.address, 800, encryptedScore, attestation);

      const leverage = await creditScoreRegistry.getMaxLeverage(user1.address);
      expect(leverage).to.equal(300);
    });

    it("Should return 0 leverage for expired score", async function () {
      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user1.address, 700, encryptedScore, attestation);

      // Fast forward 31 days
      await time.increase(31 * 24 * 60 * 60);

      const leverage = await creditScoreRegistry.getMaxLeverage(user1.address);
      expect(leverage).to.equal(0);
    });
  });

  describe("Score Expiration", function () {
    const encryptedScore = ethers.id("encrypted_score_data");
    const attestation = ethers.toUtf8Bytes("valid_attestation");

    it("Should report score as not expired initially", async function () {
      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user1.address, 700, encryptedScore, attestation);

      expect(await creditScoreRegistry.isScoreExpired(user1.address)).to.be.false;
    });

    it("Should report score as expired after validity period", async function () {
      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user1.address, 700, encryptedScore, attestation);

      await time.increase(31 * 24 * 60 * 60);

      expect(await creditScoreRegistry.isScoreExpired(user1.address)).to.be.true;
    });

    it("Should allow manual score expiration by owner", async function () {
      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user1.address, 700, encryptedScore, attestation);

      await expect(creditScoreRegistry.expireScore(user1.address))
        .to.emit(creditScoreRegistry, "ScoreExpired");

      const [, , isValid] = await creditScoreRegistry.getScore(user1.address);
      expect(isValid).to.be.false;
    });

    it("Should revert if non-owner tries to manually expire", async function () {
      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user1.address, 700, encryptedScore, attestation);

      await expect(
        creditScoreRegistry.connect(user1).expireScore(user1.address)
      ).to.be.revertedWithCustomError(creditScoreRegistry, "OwnableUnauthorizedAccount");
    });
  });

  describe("Attestation Verification", function () {
    const encryptedScore = ethers.id("encrypted_score_data");
    const attestation = ethers.toUtf8Bytes("valid_attestation");

    it("Should verify valid attestation", async function () {
      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user1.address, 700, encryptedScore, attestation);

      const isValid = await creditScoreRegistry.verifyAttestation(user1.address, attestation);
      expect(isValid).to.be.true;
    });

    it("Should reject invalid attestation", async function () {
      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user1.address, 700, encryptedScore, attestation);

      const invalidAttestation = ethers.toUtf8Bytes("invalid_attestation");
      const isValid = await creditScoreRegistry.verifyAttestation(user1.address, invalidAttestation);
      expect(isValid).to.be.false;
    });
  });

  describe("Credit Score Details", function () {
    const validScore = 700;
    const encryptedScore = ethers.id("encrypted_score_data");
    const attestation = ethers.toUtf8Bytes("valid_attestation");

    it("Should return full credit score details", async function () {
      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user1.address, validScore, encryptedScore, attestation);

      const details = await creditScoreRegistry.getCreditScoreDetails(user1.address);
      
      expect(details.score).to.equal(validScore);
      expect(details.tier).to.equal(3);
      expect(details.isActive).to.be.true;
      expect(details.encryptedScore).to.equal(encryptedScore);
    });
  });
});
