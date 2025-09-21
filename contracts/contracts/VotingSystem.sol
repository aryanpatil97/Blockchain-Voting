// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title VotingSystem
 * @dev A decentralized voting system that ensures transparent, secure, and tamper-proof elections
 * @author Blockchain Voting Team
 */
contract VotingSystem is Ownable, ReentrancyGuard, Pausable {
    
    // Structs
    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 voteCount;
        bool exists;
    }
    
    struct Voter {
        bool authorized;
        bool voted;
        uint256 vote;
        bool exists;
    }
    
    struct Election {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool active;
        bool exists;
    }
    
    // State variables
    mapping(address => Voter) public voters;
    mapping(uint256 => Candidate) public candidates;
    mapping(uint256 => Election) public elections;
    
    uint256 public candidatesCount;
    uint256 public electionsCount;
    uint256 public totalVotes;
    
    // Events
    event VoterAuthorized(address indexed voter);
    event CandidateAdded(uint256 indexed candidateId, string name, string party);
    event ElectionCreated(uint256 indexed electionId, string title, uint256 startTime, uint256 endTime);
    event VoteCast(address indexed voter, uint256 indexed candidateId, uint256 indexed electionId);
    event ElectionStatusChanged(uint256 indexed electionId, bool active);
    
    // Modifiers
    modifier onlyAuthorized() {
        require(voters[msg.sender].authorized, "Voter not authorized");
        _;
    }
    
    modifier onlyDuringElection(uint256 _electionId) {
        require(elections[_electionId].exists, "Election does not exist");
        require(elections[_electionId].active, "Election is not active");
        require(block.timestamp >= elections[_electionId].startTime, "Election has not started");
        require(block.timestamp <= elections[_electionId].endTime, "Election has ended");
        _;
    }
    
    modifier validCandidate(uint256 _candidateId) {
        require(candidates[_candidateId].exists, "Candidate does not exist");
        _;
    }
    
    /**
     * @dev Constructor to initialize the contract
     */
    constructor() {
        candidatesCount = 0;
        electionsCount = 0;
        totalVotes = 0;
    }
    
    /**
     * @dev Authorize a voter to participate in elections
     * @param _voter Address of the voter to authorize
     */
    function authorizeVoter(address _voter) external onlyOwner {
        require(!voters[_voter].exists, "Voter already exists");
        
        voters[_voter] = Voter({
            authorized: true,
            voted: false,
            vote: 0,
            exists: true
        });
        
        emit VoterAuthorized(_voter);
    }
    
    /**
     * @dev Add a new candidate to the system
     * @param _name Name of the candidate
     * @param _party Political party of the candidate
     */
    function addCandidate(string memory _name, string memory _party) external onlyOwner {
        candidatesCount++;
        
        candidates[candidatesCount] = Candidate({
            id: candidatesCount,
            name: _name,
            party: _party,
            voteCount: 0,
            exists: true
        });
        
        emit CandidateAdded(candidatesCount, _name, _party);
    }
    
    /**
     * @dev Create a new election
     * @param _title Title of the election
     * @param _description Description of the election
     * @param _startTime Start time of the election (Unix timestamp)
     * @param _endTime End time of the election (Unix timestamp)
     */
    function createElection(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyOwner {
        require(_startTime < _endTime, "Start time must be before end time");
        require(_startTime > block.timestamp, "Start time must be in the future");
        
        electionsCount++;
        
        elections[electionsCount] = Election({
            id: electionsCount,
            title: _title,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            active: true,
            exists: true
        });
        
        emit ElectionCreated(electionsCount, _title, _startTime, _endTime);
    }
    
    /**
     * @dev Cast a vote for a candidate in a specific election
     * @param _candidateId ID of the candidate to vote for
     * @param _electionId ID of the election
     */
    function vote(uint256 _candidateId, uint256 _electionId) 
        external 
        onlyAuthorized 
        onlyDuringElection(_electionId)
        validCandidate(_candidateId)
        nonReentrant
        whenNotPaused
    {
        require(!voters[msg.sender].voted, "Voter has already voted");
        
        voters[msg.sender].voted = true;
        voters[msg.sender].vote = _candidateId;
        
        candidates[_candidateId].voteCount++;
        totalVotes++;
        
        emit VoteCast(msg.sender, _candidateId, _electionId);
    }
    
    /**
     * @dev Get candidate information
     * @param _candidateId ID of the candidate
     * @return Candidate struct containing candidate information
     */
    function getCandidate(uint256 _candidateId) external view validCandidate(_candidateId) returns (Candidate memory) {
        return candidates[_candidateId];
    }
    
    /**
     * @dev Get election information
     * @param _electionId ID of the election
     * @return Election struct containing election information
     */
    function getElection(uint256 _electionId) external view returns (Election memory) {
        require(elections[_electionId].exists, "Election does not exist");
        return elections[_electionId];
    }
    
    /**
     * @dev Get voter information
     * @param _voter Address of the voter
     * @return Voter struct containing voter information
     */
    function getVoter(address _voter) external view returns (Voter memory) {
        require(voters[_voter].exists, "Voter does not exist");
        return voters[_voter];
    }
    
    /**
     * @dev Get all candidates
     * @return Array of all candidates
     */
    function getAllCandidates() external view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidatesCount);
        
        for (uint256 i = 1; i <= candidatesCount; i++) {
            allCandidates[i - 1] = candidates[i];
        }
        
        return allCandidates;
    }
    
    /**
     * @dev Get all elections
     * @return Array of all elections
     */
    function getAllElections() external view returns (Election[] memory) {
        Election[] memory allElections = new Election[](electionsCount);
        
        for (uint256 i = 1; i <= electionsCount; i++) {
            allElections[i - 1] = elections[i];
        }
        
        return allElections;
    }
    
    /**
     * @dev Toggle election status (active/inactive)
     * @param _electionId ID of the election
     */
    function toggleElectionStatus(uint256 _electionId) external onlyOwner {
        require(elections[_electionId].exists, "Election does not exist");
        
        elections[_electionId].active = !elections[_electionId].active;
        
        emit ElectionStatusChanged(_electionId, elections[_electionId].active);
    }
    
    /**
     * @dev Pause the contract in case of emergency
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get voting results for an election
     * @param _electionId ID of the election
     * @return Array of candidates with their vote counts
     */
    function getVotingResults(uint256 _electionId) external view returns (Candidate[] memory) {
        require(elections[_electionId].exists, "Election does not exist");
        
        Candidate[] memory results = new Candidate[](candidatesCount);
        
        for (uint256 i = 1; i <= candidatesCount; i++) {
            results[i - 1] = candidates[i];
        }
        
        return results;
    }
}

