const VotingContract = artifacts.require("VotingContract");
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');

contract("VotingContract", (accounts) => {
  let votingContract;
  const [deployer, admin1, admin2, voter1, voter2, voter3, unauthorized] = accounts;

  beforeEach(async () => {
    votingContract = await VotingContract.new({ from: deployer });
  });

  describe("Access Control and Role Management", () => {
    describe("Initial Setup", () => {
      it("should set deployer as admin", async () => {
        const isAdmin = await votingContract.isAdmin(deployer);
        assert.equal(isAdmin, true, "Deployer should be an admin");
      });

      it("should have correct initial admin count", async () => {
        const adminCount = await votingContract.getAdminCount();
        assert.equal(adminCount.toNumber(), 1, "Should have exactly one admin initially");
      });

      it("should have zero voters initially", async () => {
        const voterCount = await votingContract.getVoterCount();
        assert.equal(voterCount.toNumber(), 0, "Should have zero voters initially");
      });
    });

    describe("Voter Registration", () => {
      it("should allow admin to register a voter", async () => {
        const receipt = await votingContract.registerVoter(voter1, { from: deployer });
        
        expectEvent(receipt, 'VoterRegistered', {
          voter: voter1,
          admin: deployer
        });

        const isVoter = await votingContract.isRegisteredVoter(voter1);
        assert.equal(isVoter, true, "Voter should be registered");
      });

      it("should not allow non-admin to register a voter", async () => {
        await expectRevert(
          votingContract.registerVoter(voter1, { from: unauthorized }),
          "VotingContract: caller is not an admin"
        );
      });

      it("should not allow registering zero address as voter", async () => {
        await expectRevert(
          votingContract.registerVoter("0x0000000000000000000000000000000000000000", { from: deployer }),
          "VotingContract: invalid voter address"
        );
      });

      it("should not allow registering same voter twice", async () => {
        await votingContract.registerVoter(voter1, { from: deployer });
        
        await expectRevert(
          votingContract.registerVoter(voter1, { from: deployer }),
          "VotingContract: voter already registered"
        );
      });

      it("should allow batch voter registration", async () => {
        const voters = [voter1, voter2, voter3];
        const receipt = await votingContract.registerVotersBatch(voters, { from: deployer });
        
        // Check that all voters were registered
        for (let i = 0; i < voters.length; i++) {
          const isVoter = await votingContract.isRegisteredVoter(voters[i]);
          assert.equal(isVoter, true, `Voter ${i} should be registered`);
        }

        const voterCount = await votingContract.getVoterCount();
        assert.equal(voterCount.toNumber(), 3, "Should have 3 voters registered");
      });

      it("should not allow empty batch registration", async () => {
        await expectRevert(
          votingContract.registerVotersBatch([], { from: deployer }),
          "VotingContract: empty voters array"
        );
      });

      it("should not allow batch registration with invalid address", async () => {
        const voters = [voter1, "0x0000000000000000000000000000000000000000"];
        
        await expectRevert(
          votingContract.registerVotersBatch(voters, { from: deployer }),
          "VotingContract: invalid voter address"
        );
      });
    });

    describe("Voter Revocation", () => {
      beforeEach(async () => {
        await votingContract.registerVoter(voter1, { from: deployer });
      });

      it("should allow admin to revoke a voter", async () => {
        const receipt = await votingContract.revokeVoter(voter1, { from: deployer });
        
        expectEvent(receipt, 'VoterRevoked', {
          voter: voter1,
          admin: deployer
        });

        const isVoter = await votingContract.isRegisteredVoter(voter1);
        assert.equal(isVoter, false, "Voter should be revoked");
      });

      it("should not allow non-admin to revoke a voter", async () => {
        await expectRevert(
          votingContract.revokeVoter(voter1, { from: unauthorized }),
          "VotingContract: caller is not an admin"
        );
      });

      it("should not allow revoking unregistered voter", async () => {
        await expectRevert(
          votingContract.revokeVoter(voter2, { from: deployer }),
          "VotingContract: voter not registered"
        );
      });

      it("should not allow revoking zero address", async () => {
        await expectRevert(
          votingContract.revokeVoter("0x0000000000000000000000000000000000000000", { from: deployer }),
          "VotingContract: invalid voter address"
        );
      });
    });

    describe("Admin Role Management", () => {
      it("should allow admin to grant admin role", async () => {
        const receipt = await votingContract.grantAdminRole(admin1, { from: deployer });
        
        expectEvent(receipt, 'AdminGranted', {
          newAdmin: admin1,
          grantor: deployer
        });

        const isAdmin = await votingContract.isAdmin(admin1);
        assert.equal(isAdmin, true, "New admin should have admin role");
      });

      it("should not allow non-admin to grant admin role", async () => {
        await expectRevert(
          votingContract.grantAdminRole(admin1, { from: unauthorized }),
          "VotingContract: caller is not an admin"
        );
      });

      it("should not allow granting admin role to zero address", async () => {
        await expectRevert(
          votingContract.grantAdminRole("0x0000000000000000000000000000000000000000", { from: deployer }),
          "VotingContract: invalid admin address"
        );
      });

      it("should not allow granting admin role to existing admin", async () => {
        await votingContract.grantAdminRole(admin1, { from: deployer });
        
        await expectRevert(
          votingContract.grantAdminRole(admin1, { from: deployer }),
          "VotingContract: address already has admin role"
        );
      });

      it("should allow admin to revoke another admin's role", async () => {
        await votingContract.grantAdminRole(admin1, { from: deployer });
        
        const receipt = await votingContract.revokeAdminRole(admin1, { from: deployer });
        
        expectEvent(receipt, 'AdminRevoked', {
          admin: admin1,
          revoker: deployer
        });

        const isAdmin = await votingContract.isAdmin(admin1);
        assert.equal(isAdmin, false, "Admin role should be revoked");
      });

      it("should not allow admin to revoke their own role", async () => {
        await expectRevert(
          votingContract.revokeAdminRole(deployer, { from: deployer }),
          "VotingContract: cannot revoke own admin role"
        );
      });

      it("should not allow revoking the last admin", async () => {
        // Only one admin (deployer) exists
        await expectRevert(
          votingContract.revokeAdminRole(deployer, { from: deployer }),
          "VotingContract: cannot revoke own admin role"
        );
      });

      it("should not allow non-admin to revoke admin role", async () => {
        await votingContract.grantAdminRole(admin1, { from: deployer });
        
        await expectRevert(
          votingContract.revokeAdminRole(admin1, { from: unauthorized }),
          "VotingContract: caller is not an admin"
        );
      });
    });

    describe("Role Queries", () => {
      beforeEach(async () => {
        await votingContract.registerVoter(voter1, { from: deployer });
        await votingContract.registerVoter(voter2, { from: deployer });
        await votingContract.grantAdminRole(admin1, { from: deployer });
      });

      it("should return correct voter count", async () => {
        const voterCount = await votingContract.getVoterCount();
        assert.equal(voterCount.toNumber(), 2, "Should have 2 voters");
      });

      it("should return correct admin count", async () => {
        const adminCount = await votingContract.getAdminCount();
        assert.equal(adminCount.toNumber(), 2, "Should have 2 admins");
      });

      it("should return voter by index", async () => {
        const voter = await votingContract.getVoterByIndex(0);
        assert.equal(voter, voter1, "Should return correct voter at index 0");
      });

      it("should return admin by index", async () => {
        const admin = await votingContract.getAdminByIndex(1);
        assert.equal(admin, admin1, "Should return correct admin at index 1");
      });

      it("should revert when voter index is out of bounds", async () => {
        await expectRevert(
          votingContract.getVoterByIndex(5),
          "VotingContract: voter index out of bounds"
        );
      });

      it("should revert when admin index is out of bounds", async () => {
        await expectRevert(
          votingContract.getAdminByIndex(5),
          "VotingContract: admin index out of bounds"
        );
      });
    });

    describe("Access Control Modifiers", () => {
      beforeEach(async () => {
        await votingContract.registerVoter(voter1, { from: deployer });
      });

      it("should correctly identify registered voters", async () => {
        const isVoter = await votingContract.isRegisteredVoter(voter1);
        assert.equal(isVoter, true, "Should identify registered voter");
      });

      it("should correctly identify unregistered addresses", async () => {
        const isVoter = await votingContract.isRegisteredVoter(unauthorized);
        assert.equal(isVoter, false, "Should identify unregistered address");
      });

      it("should correctly identify admins", async () => {
        const isAdmin = await votingContract.isAdmin(deployer);
        assert.equal(isAdmin, true, "Should identify admin");
      });

      it("should correctly identify non-admins", async () => {
        const isAdmin = await votingContract.isAdmin(voter1);
        assert.equal(isAdmin, false, "Should identify non-admin");
      });
    });
  });
});