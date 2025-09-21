const VotingContract = artifacts.require("VotingContract");
const { expect } = require("chai");
const { time } = require("@openzeppelin/test-helpers");

contract("VotingContract", (accounts) => {
  let votingContract;
  const owner = accounts[0];
  const admin = accounts[1];
  const voter1 = accounts[2];
  const voter2 = accounts[3];
  const voter3 = accounts[4];
  const unauthorizedVoter = accounts[5];

  beforeEach(async () => {
    votingContract = await VotingContract.new({ from: owner });
  });

  describe("Contract Deployment", () => {
    it("should deploy successfully", async () => {
      assert.ok(votingContract.address);
    });

    it("should set the correct owner as admin", async () => {
      const hasAdminRole = await votingContract.hasRole(
        await votingContract.ADMIN_ROLE(),
        owner
      );
      assert.equal(hasAdminRole, true);
    });

    it("should set the correct owner as election creator", async () => {
      const hasElectionCreatorRole = await votingContract.hasRole(
        await votingContract.ELECTION_CREATOR_ROLE(),
        owner
      );
      assert.equal(hasElectionCreatorRole, true);
    });
  });

  describe("Role Management", () => {
    it("should grant admin role", async () => {
      await votingContract.grantRole(
        await votingContract.ADMIN_ROLE(),
        admin,
        { from: owner }
      );
      
      const hasAdminRole = await votingContract.hasRole(
        await votingContract.ADMIN_ROLE(),
        admin
      );
      assert.equal(hasAdminRole, true);
    });

    it("should grant election creator role", async () => {
      await votingContract.grantElectionCreatorRole(admin, { from: owner });
      
      const hasElectionCreatorRole = await votingContract.hasRole(
        await votingContract.ELECTION_CREATOR_ROLE(),
        admin
      );
      assert.equal(hasElectionCreatorRole, true);
    });

    it("should revoke election creator role", async () => {
      await votingContract.grantElectionCreatorRole(admin, { from: owner });
      await votingContract.revokeElectionCreatorRole(admin, { from: owner });
      
      const hasElectionCreatorRole = await votingContract.hasRole(
        await votingContract.ELECTION_CREATOR_ROLE(),
        admin
      );
      assert.equal(hasElectionCreatorRole, false);
    });
  });

  describe("Voter Registration", () => {
    it("should register a voter", async () => {
      await votingContract.registerVoter(voter1, { from: owner });
      
      const isRegistered = await votingContract.isRegisteredVoter(voter1);
      assert.equal(isRegistered, true);
      
      const registrationTime = await votingContract.getVoterRegistrationTime(voter1);
      assert.isAbove(registrationTime.toNumber(), 0);
    });

    it("should not allow non-admin to register voters", async () => {
      try {
        await votingContract.registerVoter(voter1, { from: voter1 });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "AccessControl: Must have admin role");
      }
    });

    it("should not allow duplicate voter registration", async () => {
      await votingContract.registerVoter(voter1, { from: owner });
      
      try {
        await votingContract.registerVoter(voter1, { from: owner });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "AccessControl: Voter already registered");
      }
    });

    it("should batch register multiple voters", async () => {
      const voters = [voter1, voter2, voter3];
      await votingContract.batchRegisterVoters(voters, { from: owner });
      
      for (const voter of voters) {
        const isRegistered = await votingContract.isRegisteredVoter(voter);
        assert.equal(isRegistered, true);
      }
    });

    it("should not allow empty batch registration", async () => {
      try {
        await votingContract.batchRegisterVoters([], { from: owner });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "AccessControl: Empty voters array");
      }
    });

    it("should not allow batch registration with too many voters", async () => {
      const voters = Array(101).fill(voter1); // 101 voters
      try {
        await votingContract.batchRegisterVoters(voters, { from: owner });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "AccessControl: Too many voters in batch");
      }
    });
  });

  describe("Candidate Management", () => {
    it("should add a candidate", async () => {
      const tx = await votingContract.addCandidate("John Doe", "Independent", { from: owner });
      
      const candidate = await votingContract.getCandidate(1);
      assert.equal(candidate.name, "John Doe");
      assert.equal(candidate.description, "Independent");
      assert.equal(candidate.voteCount, 0);
      assert.equal(candidate.addedBy, owner);
    });

    it("should not allow non-election creator to add candidates", async () => {
      try {
        await votingContract.addCandidate("John Doe", "Independent", { from: voter1 });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "AccessControl: Must have election creator role");
      }
    });

    it("should not allow empty candidate name", async () => {
      try {
        await votingContract.addCandidate("", "Independent", { from: owner });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "InvalidCandidateData");
      }
    });

    it("should not allow empty candidate description", async () => {
      try {
        await votingContract.addCandidate("John Doe", "", { from: owner });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "InvalidCandidateData");
      }
    });
  });

  describe("Election Management", () => {
    let startTime, endTime;

    beforeEach(async () => {
      // Add candidates first
      await votingContract.addCandidate("John Doe", "Independent", { from: owner });
      await votingContract.addCandidate("Jane Smith", "Democrat", { from: owner });
      
      startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      endTime = startTime + 7200; // 2 hours duration
    });

    it("should create an election", async () => {
      const candidateIds = [1, 2];
      
      const tx = await votingContract.createElection(
        "Test Election",
        "A test election",
        startTime,
        endTime,
        candidateIds,
        { from: owner }
      );

      const election = await votingContract.getElection(1);
      assert.equal(election.title, "Test Election");
      assert.equal(election.description, "A test election");
      assert.equal(election.isActive, true);
      assert.equal(election.creator, owner);
      assert.equal(election.candidateIds.length, 2);
    });

    it("should not allow invalid time range", async () => {
      const candidateIds = [1, 2];
      
      try {
        await votingContract.createElection(
          "Test Election",
          "A test election",
          endTime, // start time after end time
          startTime,
          candidateIds,
          { from: owner }
        );
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "InvalidTimeRange");
      }
    });

    it("should not allow past start time", async () => {
      const candidateIds = [1, 2];
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      try {
        await votingContract.createElection(
          "Test Election",
          "A test election",
          pastTime,
          endTime,
          candidateIds,
          { from: owner }
        );
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "InvalidTimeRange");
      }
    });

    it("should end an election", async () => {
      const candidateIds = [1, 2];
      
      await votingContract.createElection(
        "Test Election",
        "A test election",
        startTime,
        endTime,
        candidateIds,
        { from: owner }
      );

      await votingContract.endElection(1, { from: owner });
      
      const election = await votingContract.getElection(1);
      assert.equal(election.isActive, false);
    });

    it("should toggle election status", async () => {
      const candidateIds = [1, 2];
      
      await votingContract.createElection(
        "Test Election",
        "A test election",
        startTime,
        endTime,
        candidateIds,
        { from: owner }
      );

      // Toggle to inactive
      await votingContract.toggleElectionStatus(1, { from: owner });
      let election = await votingContract.getElection(1);
      assert.equal(election.isActive, false);

      // Toggle back to active
      await votingContract.toggleElectionStatus(1, { from: owner });
      election = await votingContract.getElection(1);
      assert.equal(election.isActive, true);
    });
  });

  describe("Voting Process", () => {
    let electionId, candidateIds;

    beforeEach(async () => {
      // Setup: register voters, add candidates, create election
      await votingContract.registerVoter(voter1, { from: owner });
      await votingContract.registerVoter(voter2, { from: owner });
      
      await votingContract.addCandidate("John Doe", "Independent", { from: owner });
      await votingContract.addCandidate("Jane Smith", "Democrat", { from: owner });
      
      candidateIds = [1, 2];
      const startTime = Math.floor(Date.now() / 1000) + 1; // Start in 1 second
      const endTime = startTime + 3600; // 1 hour duration
      
      await votingContract.createElection(
        "Test Election",
        "A test election",
        startTime,
        endTime,
        candidateIds,
        { from: owner }
      );
      
      electionId = 1;
    });

    it("should allow authorized voter to vote", async () => {
      // Wait for election to start
      await time.increase(2);
      
      await votingContract.vote(electionId, 1, { from: voter1 });
      
      const hasVoted = await votingContract.hasVotedInElection(voter1, electionId);
      assert.equal(hasVoted, true);
      
      const candidate = await votingContract.getCandidate(1);
      assert.equal(candidate.voteCount, 1);
    });

    it("should not allow unauthorized voter to vote", async () => {
      // Wait for election to start
      await time.increase(2);
      
      try {
        await votingContract.vote(electionId, 1, { from: unauthorizedVoter });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "AccessControl: Must have voter role");
      }
    });

    it("should not allow double voting", async () => {
      // Wait for election to start
      await time.increase(2);
      
      await votingContract.vote(electionId, 1, { from: voter1 });
      
      try {
        await votingContract.vote(electionId, 2, { from: voter1 });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "VoterAlreadyVoted");
      }
    });

    it("should not allow voting for candidate not in election", async () => {
      // Add another candidate not in the election
      await votingContract.addCandidate("Bob Johnson", "Republican", { from: owner });
      
      // Wait for election to start
      await time.increase(2);
      
      try {
        await votingContract.vote(electionId, 3, { from: voter1 }); // Candidate 3 not in election
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "VotingContract: Candidate not in this election");
      }
    });

    it("should not allow voting before election starts", async () => {
      try {
        await votingContract.vote(electionId, 1, { from: voter1 });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "ElectionNotStarted");
      }
    });

    it("should not allow voting after election ends", async () => {
      // Wait for election to start and end
      await time.increase(3602); // Past end time
      
      try {
        await votingContract.vote(electionId, 1, { from: voter1 });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "ElectionEnded");
      }
    });
  });

  describe("Results and Statistics", () => {
    let electionId;

    beforeEach(async () => {
      // Setup complete voting scenario
      await votingContract.registerVoter(voter1, { from: owner });
      await votingContract.registerVoter(voter2, { from: owner });
      
      await votingContract.addCandidate("John Doe", "Independent", { from: owner });
      await votingContract.addCandidate("Jane Smith", "Democrat", { from: owner });
      
      const candidateIds = [1, 2];
      const startTime = Math.floor(Date.now() / 1000) + 1;
      const endTime = startTime + 3600;
      
      await votingContract.createElection(
        "Test Election",
        "A test election",
        startTime,
        endTime,
        candidateIds,
        { from: owner }
      );
      
      electionId = 1;
    });

    it("should return correct voting results", async () => {
      // Wait for election to start
      await time.increase(2);
      
      await votingContract.vote(electionId, 1, { from: voter1 });
      await votingContract.vote(electionId, 2, { from: voter2 });
      
      const results = await votingContract.getElectionResults(electionId);
      
      assert.equal(results.candidateIds.length, 2);
      assert.equal(results.voteCounts[0], 1); // First candidate
      assert.equal(results.voteCounts[1], 1); // Second candidate
    });

    it("should return total counts", async () => {
      const totalElections = await votingContract.getTotalElections();
      const totalCandidates = await votingContract.getTotalCandidates();
      
      assert.equal(totalElections, 1);
      assert.equal(totalCandidates, 2);
    });
  });

  describe("Pausable Functionality", () => {
    it("should pause the contract", async () => {
      await votingContract.pause({ from: owner });
      
      const isPaused = await votingContract.paused();
      assert.equal(isPaused, true);
    });

    it("should unpause the contract", async () => {
      await votingContract.pause({ from: owner });
      await votingContract.unpause({ from: owner });
      
      const isPaused = await votingContract.paused();
      assert.equal(isPaused, false);
    });

    it("should not allow voting when paused", async () => {
      // Setup
      await votingContract.registerVoter(voter1, { from: owner });
      await votingContract.addCandidate("John Doe", "Independent", { from: owner });
      
      const candidateIds = [1];
      const startTime = Math.floor(Date.now() / 1000) + 1;
      const endTime = startTime + 3600;
      
      await votingContract.createElection(
        "Test Election",
        "A test election",
        startTime,
        endTime,
        candidateIds,
        { from: owner }
      );
      
      // Pause contract
      await votingContract.pause({ from: owner });
      
      // Wait for election to start
      await time.increase(2);
      
      try {
        await votingContract.vote(1, 1, { from: voter1 });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Pausable: paused");
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle non-existent election", async () => {
      try {
        await votingContract.getElection(999);
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "ElectionNotFound");
      }
    });

    it("should handle non-existent candidate", async () => {
      try {
        await votingContract.getCandidate(999);
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "CandidateNotFound");
      }
    });

    it("should handle non-registered voter lookup", async () => {
      try {
        await votingContract.getVoterRegistrationTime(voter1);
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "AccessControl: Voter not registered");
      }
    });
  });
});

