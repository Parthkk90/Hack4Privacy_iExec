const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CreditScoreRegistry", function () {
  let creditScoreRegistry;
  let owner;
  let teeWorker;
  let user;

  beforeEach(async function () {
    [owner, teeWorker, user] = await ethers.getSigners();

    const CreditScoreRegistry = await ethers.getContractFactory("CreditScoreRegistry");
    creditScoreRegistry = await CreditScoreRegistry.deploy();
    await creditScoreRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await creditScoreRegistry.owner()).to.equal(owner.address);
    });

    it("Should not have any authorized TEE workers initially", async function () {
      expect(await creditScoreRegistry.authorizedTEE(teeWorker.address)).to.be.false;
    });
  });

  describe("TEE Authorization", function () {
    it("Should allow owner to authorize TEE worker", async function () {
      await creditScoreRegistry.setTEEAuthorization(teeWorker.address, true);
      expect(await creditScoreRegistry.authorizedTEE(teeWorker.address)).to.be.true;
    });

    it("Should emit TEEAuthorized event", async function () {
      await expect(creditScoreRegistry.setTEEAuthorization(teeWorker.address, true))
        .to.emit(creditScoreRegistry, "TEEAuthorized")
        .withArgs(teeWorker.address, true);
    });

    it("Should not allow non-owner to authorize TEE worker", async function () {
      await expect(
        creditScoreRegistry.connect(user).setTEEAuthorization(teeWorker.address, true)
      ).to.be.revertedWithCustomError(creditScoreRegistry, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to revoke TEE authorization", async function () {
      await creditScoreRegistry.setTEEAuthorization(teeWorker.address, true);
      await creditScoreRegistry.setTEEAuthorization(teeWorker.address, false);
      expect(await creditScoreRegistry.authorizedTEE(teeWorker.address)).to.be.false;
    });
  });

  describe("Score Updates", function () {
    beforeEach(async function () {
      await creditScoreRegistry.setTEEAuthorization(teeWorker.address, true);
    });

    it("Should allow authorized TEE to update score", async function () {
      const scoreHash = ethers.keccak256(ethers.toUtf8Bytes("encrypted-score"));
      const tier = 3;
      const score = 720;
      const attestation = ethers.toUtf8Bytes("attestation-data");

      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user.address, scoreHash, tier, score, attestation);

      const userScore = await creditScoreRegistry.getScore(user.address);
      expect(userScore.scoreHash).to.equal(scoreHash);
      expect(userScore.tier).to.equal(tier);
      expect(userScore.score).to.equal(score);
      expect(userScore.isActive).to.be.true;
    });

    it("Should emit ScoreUpdated event", async function () {
      const scoreHash = ethers.keccak256(ethers.toUtf8Bytes("encrypted-score"));
      const tier = 3;
      const score = 720;
      const attestation = ethers.toUtf8Bytes("attestation-data");

      await expect(
        creditScoreRegistry
          .connect(teeWorker)
          .updateScore(user.address, scoreHash, tier, score, attestation)
      ).to.emit(creditScoreRegistry, "ScoreUpdated");
    });

    it("Should not allow unauthorized address to update score", async function () {
      const scoreHash = ethers.keccak256(ethers.toUtf8Bytes("encrypted-score"));
      const attestation = ethers.toUtf8Bytes("attestation-data");

      await expect(
        creditScoreRegistry
          .connect(user)
          .updateScore(user.address, scoreHash, 3, 720, attestation)
      ).to.be.revertedWith("Not authorized TEE worker");
    });

    it("Should reject invalid tier values", async function () {
      const scoreHash = ethers.keccak256(ethers.toUtf8Bytes("encrypted-score"));
      const attestation = ethers.toUtf8Bytes("attestation-data");

      await expect(
        creditScoreRegistry
          .connect(teeWorker)
          .updateScore(user.address, scoreHash, 0, 720, attestation)
      ).to.be.revertedWith("Invalid tier");

      await expect(
        creditScoreRegistry
          .connect(teeWorker)
          .updateScore(user.address, scoreHash, 5, 720, attestation)
      ).to.be.revertedWith("Invalid tier");
    });

    it("Should reject invalid score values", async function () {
      const scoreHash = ethers.keccak256(ethers.toUtf8Bytes("encrypted-score"));
      const attestation = ethers.toUtf8Bytes("attestation-data");

      await expect(
        creditScoreRegistry
          .connect(teeWorker)
          .updateScore(user.address, scoreHash, 3, 299, attestation)
      ).to.be.revertedWith("Invalid score range");

      await expect(
        creditScoreRegistry
          .connect(teeWorker)
          .updateScore(user.address, scoreHash, 3, 851, attestation)
      ).to.be.revertedWith("Invalid score range");
    });

    it("Should increment update count", async function () {
      const scoreHash = ethers.keccak256(ethers.toUtf8Bytes("encrypted-score"));
      const attestation = ethers.toUtf8Bytes("attestation-data");

      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user.address, scoreHash, 3, 720, attestation);

      expect(await creditScoreRegistry.getUpdateCount(user.address)).to.equal(1);

      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user.address, scoreHash, 4, 800, attestation);

      expect(await creditScoreRegistry.getUpdateCount(user.address)).to.equal(2);
    });
  });

  describe("Max Leverage Calculation", function () {
    beforeEach(async function () {
      await creditScoreRegistry.setTEEAuthorization(teeWorker.address, true);
    });

    it("Should return correct leverage for Bronze tier", async function () {
      const scoreHash = ethers.keccak256(ethers.toUtf8Bytes("encrypted-score"));
      const attestation = ethers.toUtf8Bytes("attestation-data");

      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user.address, scoreHash, 1, 500, attestation);

      expect(await creditScoreRegistry.getMaxLeverage(user.address)).to.equal(75); // 1 * 75 = 75 (0.75x)
    });

    it("Should return correct leverage for Platinum tier", async function () {
      const scoreHash = ethers.keccak256(ethers.toUtf8Bytes("encrypted-score"));
      const attestation = ethers.toUtf8Bytes("attestation-data");

      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user.address, scoreHash, 4, 800, attestation);

      expect(await creditScoreRegistry.getMaxLeverage(user.address)).to.equal(300); // 4 * 75 = 300 (3.0x)
    });

    it("Should return default leverage for no score", async function () {
      expect(await creditScoreRegistry.getMaxLeverage(user.address)).to.equal(100); // 1.0x
    });
  });

  describe("Score Expiration", function () {
    beforeEach(async function () {
      await creditScoreRegistry.setTEEAuthorization(teeWorker.address, true);
    });

    it("Should report non-expired recent score", async function () {
      const scoreHash = ethers.keccak256(ethers.toUtf8Bytes("encrypted-score"));
      const attestation = ethers.toUtf8Bytes("attestation-data");

      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user.address, scoreHash, 3, 720, attestation);

      expect(await creditScoreRegistry.isScoreExpired(user.address)).to.be.false;
    });

    it("Should allow owner to deactivate score", async function () {
      const scoreHash = ethers.keccak256(ethers.toUtf8Bytes("encrypted-score"));
      const attestation = ethers.toUtf8Bytes("attestation-data");

      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user.address, scoreHash, 3, 720, attestation);

      await creditScoreRegistry.deactivateScore(user.address);

      const userScore = await creditScoreRegistry.getScore(user.address);
      expect(userScore.isActive).to.be.false;
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await creditScoreRegistry.setTEEAuthorization(teeWorker.address, true);

      const scoreHash = ethers.keccak256(ethers.toUtf8Bytes("encrypted-score"));
      const attestation = ethers.toUtf8Bytes("attestation-data");

      await creditScoreRegistry
        .connect(teeWorker)
        .updateScore(user.address, scoreHash, 3, 720, attestation);
    });

    it("Should return correct tier", async function () {
      expect(await creditScoreRegistry.getTier(user.address)).to.equal(3);
    });

    it("Should return full score details", async function () {
      const userScore = await creditScoreRegistry.getScore(user.address);
      expect(userScore.tier).to.equal(3);
      expect(userScore.score).to.equal(720);
      expect(userScore.isActive).to.be.true;
    });
  });
});
