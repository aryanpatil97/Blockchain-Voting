const VotingSystem = artifacts.require("VotingSystem");
const { expect } = require("chai");

contract("VotingSystem", (accounts) => {
  let votingSystem;
  const owner = accounts[0];
  const voter1 = accounts[1];
  const voter2 = accounts[2];
  const unauthorizedVoter = accounts[3];

  beforeEach(async () => {
    votingSystem = await VotingSystem.new({ from: owner });
  });

  describe("Contract Deployment", () => {
    it("should deploy successfully", async () => {
      assert.ok(votingSystem.address);
    });

    it("should set the correct owner", async () => {
      const contractOwner = await votingSystem.owner();
      assert.equal(contractOwner, owner);
    });
  });

  describe("Voter Authorization", () => {
    it("should authorize a voter", async () => {
      await votingSystem.authorizeVoter(voter1, { from: owner });
      const voter = await votingSystem.getVoter(voter1);
      assert.equal(voter.authorized, true);
      assert.equal(voter.exists, true);
    });

    it("should not allow non-owner to authorize voters", async () => {
      try {
        await votingSystem.authorizeVoter(voter1, { from: voter1 });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Ownable: caller is not the owner");
      }
    });
  });

  describe("Candidate Management", () => {
    it("should add a candidate", async () => {
      await votingSystem.addCandidate("John Doe", "Independent", { from: owner });
      const candidate = await votingSystem.getCandidate(1);
      assert.equal(candidate.name, "John Doe");
      assert.equal(candidate.party, "Independent");
      assert.equal(candidate.voteCount, 0);
    });

    it("should not allow non-owner to add candidates", async () => {
      try {
        await votingSystem.addCandidate("John Doe", "Independent", { from: voter1 });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Ownable: caller is not the owner");
      }
    });
  });

  describe("Election Management", () => {
    it("should create an election", async () => {
      const startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const endTime = startTime + 7200; // 2 hours duration

      await votingSystem.createElection(
        "Test Election",
        "A test election",
        startTime,
        endTime,
        { from: owner }
      );

      const election = await votingSystem.getElection(1);
      assert.equal(election.title, "Test Election");
      assert.equal(election.description, "A test election");
      assert.equal(election.active, true);
    });

    it("should not allow invalid election times", async () => {
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      const endTime = startTime - 3600; // End time before start time

      try {
        await votingSystem.createElection(
          "Test Election",
          "A test election",
          startTime,
          endTime,
          { from: owner }
        );
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Start time must be before end time");
      }
    });
  });

  describe("Voting Process", () => {
    beforeEach(async () => {
      // Setup: authorize voters, add candidates, create election
      await votingSystem.authorizeVoter(voter1, { from: owner });
      await votingSystem.authorizeVoter(voter2, { from: owner });
      
      await votingSystem.addCandidate("John Doe", "Independent", { from: owner });
      await votingSystem.addCandidate("Jane Smith", "Democrat", { from: owner });
      
      const startTime = Math.floor(Date.now() / 1000) + 1; // Start in 1 second
      const endTime = startTime + 3600; // 1 hour duration
      
      await votingSystem.createElection(
        "Test Election",
        "A test election",
        startTime,
        endTime,
        { from: owner }
      );
    });

    it("should allow authorized voter to vote", async () => {
      // Wait for election to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await votingSystem.vote(1, 1, { from: voter1 });
      
      const voter = await votingSystem.getVoter(voter1);
      const candidate = await votingSystem.getCandidate(1);
      
      assert.equal(voter.voted, true);
      assert.equal(voter.vote, 1);
      assert.equal(candidate.voteCount, 1);
    });

    it("should not allow unauthorized voter to vote", async () => {
      try {
        await votingSystem.vote(1, 1, { from: unauthorizedVoter });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Voter not authorized");
      }
    });

    it("should not allow double voting", async () => {
      // Wait for election to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await votingSystem.vote(1, 1, { from: voter1 });
      
      try {
        await votingSystem.vote(2, 1, { from: voter1 });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Voter has already voted");
      }
    });
  });

  describe("Results and Statistics", () => {
    beforeEach(async () => {
      // Setup complete voting scenario
      await votingSystem.authorizeVoter(voter1, { from: owner });
      await votingSystem.authorizeVoter(voter2, { from: owner });
      
      await votingSystem.addCandidate("John Doe", "Independent", { from: owner });
      await votingSystem.addCandidate("Jane Smith", "Democrat", { from: owner });
      
      const startTime = Math.floor(Date.now() / 1000) + 1;
      const endTime = startTime + 3600;
      
      await votingSystem.createElection(
        "Test Election",
        "A test election",
        startTime,
        endTime,
        { from: owner }
      );
    });

    it("should return correct voting results", async () => {
      // Wait for election to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await votingSystem.vote(1, 1, { from: voter1 });
      await votingSystem.vote(2, 1, { from: voter2 });
      
      const results = await votingSystem.getVotingResults(1);
      
      assert.equal(results.length, 2);
      assert.equal(results[0].voteCount, 1);
      assert.equal(results[1].voteCount, 1);
    });

    it("should return all candidates", async () => {
      const candidates = await votingSystem.getAllCandidates();
      assert.equal(candidates.length, 2);
      assert.equal(candidates[0].name, "John Doe");
      assert.equal(candidates[1].name, "Jane Smith");
    });

    it("should return all elections", async () => {
      const elections = await votingSystem.getAllElections();
      assert.equal(elections.length, 1);
      assert.equal(elections[0].title, "Test Election");
    });
  });
});

