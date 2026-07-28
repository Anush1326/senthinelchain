const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SentinelChain", function () {
  let SentinelChain;
  let sentinelChain;
  let owner;
  let verifier;
  let addr1;
  let addr2;

  beforeEach(async function () {
    SentinelChain = await ethers.getContractFactory("SentinelChain");
    [owner, verifier, addr1, addr2] = await ethers.getSigners();
    sentinelChain = await SentinelChain.deploy();
    await sentinelChain.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await sentinelChain.owner()).to.equal(owner.address);
    });

    it("Should set owner as an authorized verifier", async function () {
      expect(await sentinelChain.authorizedVerifiers(owner.address)).to.equal(true);
    });
  });

  describe("Evidence Management", function () {
    const title = "Test Evidence";
    const ipfsHash = "QmTestHash123";
    const fileHash = ethers.id("test file content");
    const category = "Document";

    it("Should allow submitting new evidence", async function () {
      await expect(sentinelChain.connect(addr1).submitEvidence(title, ipfsHash, fileHash, category))
        .to.emit(sentinelChain, "EvidenceSubmitted")
        .withArgs(1, addr1.address, fileHash);
      
      const count = await sentinelChain.getEvidenceCount();
      expect(count).to.equal(1);
    });

    it("Should prevent duplicate hash submission", async function () {
      await sentinelChain.connect(addr1).submitEvidence(title, ipfsHash, fileHash, category);
      await expect(
        sentinelChain.connect(addr2).submitEvidence("Another Title", "AnotherHash", fileHash, category)
      ).to.be.revertedWith("Evidence hash already exists");
    });

    it("Should allow verifier to verify evidence", async function () {
      await sentinelChain.connect(addr1).submitEvidence(title, ipfsHash, fileHash, category);
      
      await sentinelChain.addVerifier(verifier.address);
      
      await expect(sentinelChain.connect(verifier).verifyEvidence(1))
        .to.emit(sentinelChain, "EvidenceVerified")
        .withArgs(1, verifier.address);
        
      const evidence = await sentinelChain.getEvidence(1);
      expect(evidence.status).to.equal(1); // 1 = Verified
    });

    it("Should prevent non-verifier from verifying evidence", async function () {
      await sentinelChain.connect(addr1).submitEvidence(title, ipfsHash, fileHash, category);
      await expect(
        sentinelChain.connect(addr2).verifyEvidence(1)
      ).to.be.revertedWith("Only authorized verifier can perform this action");
    });

    it("Should allow updating status", async function () {
      await sentinelChain.connect(addr1).submitEvidence(title, ipfsHash, fileHash, category);
      await sentinelChain.addVerifier(verifier.address);
      
      await expect(sentinelChain.connect(verifier).updateStatus(1, 2)) // 2 = Flagged
        .to.emit(sentinelChain, "EvidenceStatusChanged")
        .withArgs(1, 2);
    });

    it("Should record custody transfer", async function () {
      await sentinelChain.connect(addr1).submitEvidence(title, ipfsHash, fileHash, category);
      
      const note = "Transferred to lab";
      await expect(sentinelChain.transferCustody(1, note))
        .to.emit(sentinelChain, "CustodyTransferred")
        .withArgs(1, note);
        
      const evidence = await sentinelChain.getEvidence(1);
      expect(evidence.custody[1]).to.equal(note);
    });

    it("Should verify if hash exists", async function () {
      await sentinelChain.connect(addr1).submitEvidence(title, ipfsHash, fileHash, category);
      
      expect(await sentinelChain.verifyHash(fileHash)).to.be.true;
      expect(await sentinelChain.verifyHash(ethers.id("fake hash"))).to.be.false;
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to add verifier", async function () {
      await expect(sentinelChain.addVerifier(verifier.address))
        .to.emit(sentinelChain, "VerifierAdded")
        .withArgs(verifier.address);
      expect(await sentinelChain.authorizedVerifiers(verifier.address)).to.be.true;
    });

    it("Should prevent non-owner from adding verifier", async function () {
      await expect(
        sentinelChain.connect(addr1).addVerifier(verifier.address)
      ).to.be.revertedWith("Only owner can perform this action");
    });

    it("Should allow owner to remove verifier", async function () {
      await sentinelChain.addVerifier(verifier.address);
      await expect(sentinelChain.removeVerifier(verifier.address))
        .to.emit(sentinelChain, "VerifierRemoved")
        .withArgs(verifier.address);
      expect(await sentinelChain.authorizedVerifiers(verifier.address)).to.be.false;
    });
  });
});
