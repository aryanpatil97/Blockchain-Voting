// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title VotingContract
 * @dev Enhanced voting contract with improved data structures and security
 * @author Blockchain Voting Team
 */
contract VotingContract is VotingAccessControl, Pausable {
    using Counters for Counters.Counter;
    
    // Custom errors for gas optimization
    error ElectionNotFound(uint256 electionId);
    error CandidateNotFound(uint256 candidateId);
    error VoterNotAuthorized(address voter);
    error VoterAlreadyVoted(address voter);
    error ElectionNotActive(uint256 electionId);
    error ElectionNotStarted(uint256 electionId);
    error ElectionEnded(uint256 electionId);
    error InvalidTimeRange(uint256 startTime, uint256 endTime);
    error InvalidCandidateData(string name, string description);
    error DuplicateCandidate(uint256 candidateId);
    
    // Enhanced data structures
    struct Election {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        uint256 totalVotes;
        uint256[] candidateIds;
        mapping(address => bool) hasVoted;
        mapping(uint256 => uint256) votes;
        address creator;
        uint256 createdAt;
    }
    
    struct Candidate {
        uint256 id;
        string name;
        string description;
        uint256 voteCount;
        bool exists;
        address addedBy;
        uint256 addedAt;
    }
    
    struct VoterProfile {
        address voterAddress;
        bool isRegistered;
        bool isEligible;
        uint256 registrationTime;
        uint256 totalVotesCast;
        mapping(uint256 => bool) electionsVotedIn;
    }
    
    // State variables
    Counters.Counter private _electionIds;
    Counters.Counter private _candidateIds;
    
    mapping(uint256 => Election) public elections;
    mapping(uint256 => Candidate) public candidates;
    mapping(address => VoterProfile) public voterProfiles;
    
    // Events
    event ElectionCreated(
        uint256 indexed electionId,
        string title,
        uint256 startTime,
        uint256 endTime,
        address indexed creator
    );
    event CandidateAdded(
        uint256 indexed candidateId,
        string name,
        string description,
        address indexed addedBy
    );
    event VoteCast(
        address indexed voter,
        uint256 indexed electionId,
        uint256 indexed candidateId,
        uint256 timestamp
    );
    event ElectionStatusChanged(
        uint256 indexed electionId,
        bool isActive,
        address indexed changedBy
    );
    event ElectionEnded(
        uint256 indexed electionId,
        uint256 totalVotes,
        address indexed endedBy
    );
    
    // Modifiers
    modifier electionExists(uint256 _electionId) {
        if (_electionId == 0 || _electionId > _electionIds.current()) {
            revert ElectionNotFound(_electionId);
        }
        _;
    }
    
    modifier candidateExists(uint256 _candidateId) {
        if (!candidates[_candidateId].exists) {
            revert CandidateNotFound(_candidateId);
        }
        _;
    }
    
    modifier onlyDuringElection(uint256 _electionId) {
        Election storage election = elections[_electionId];
        
        if (!election.isActive) {
            revert ElectionNotActive(_electionId);
        }
        
        if (block.timestamp < election.startTime) {
            revert ElectionNotStarted(_electionId);
        }
        
        if (block.timestamp > election.endTime) {
            revert ElectionEnded(_electionId);
        }
        _;
    }
    
    modifier hasNotVoted(uint256 _electionId) {
        if (elections[_electionId].hasVoted[msg.sender]) {
            revert VoterAlreadyVoted(msg.sender);
        }
        _;
    }
    
    /**
     * @dev Create a new election
     * @param _title Title of the election
     * @param _description Description of the election
     * @param _startTime Start time (Unix timestamp)
     * @param _endTime End time (Unix timestamp)
     * @param _candidateIds Array of candidate IDs for this election
     */
    function createElection(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        uint256[] memory _candidateIds
    ) external onlyElectionCreator whenNotPaused {
        if (_startTime >= _endTime) {
            revert InvalidTimeRange(_startTime, _endTime);
        }
        
        if (_startTime <= block.timestamp) {
            revert InvalidTimeRange(_startTime, block.timestamp);
        }
        
        _electionIds.increment();
        uint256 electionId = _electionIds.current();
        
        Election storage newElection = elections[electionId];
        newElection.id = electionId;
        newElection.title = _title;
        newElection.description = _description;
        newElection.startTime = _startTime;
        newElection.endTime = _endTime;
        newElection.isActive = true;
        newElection.totalVotes = 0;
        newElection.candidateIds = _candidateIds;
        newElection.creator = msg.sender;
        newElection.createdAt = block.timestamp;
        
        emit ElectionCreated(electionId, _title, _startTime, _endTime, msg.sender);
    }
    
    /**
     * @dev Add a new candidate
     * @param _name Name of the candidate
     * @param _description Description of the candidate
     */
    function addCandidate(
        string memory _name,
        string memory _description
    ) external onlyElectionCreator whenNotPaused {
        if (bytes(_name).length == 0 || bytes(_description).length == 0) {
            revert InvalidCandidateData(_name, _description);
        }
        
        _candidateIds.increment();
        uint256 candidateId = _candidateIds.current();
        
        candidates[candidateId] = Candidate({
            id: candidateId,
            name: _name,
            description: _description,
            voteCount: 0,
            exists: true,
            addedBy: msg.sender,
            addedAt: block.timestamp
        });
        
        emit CandidateAdded(candidateId, _name, _description, msg.sender);
    }
    
    /**
     * @dev Cast a vote for a candidate in an election
     * @param _electionId ID of the election
     * @param _candidateId ID of the candidate
     */
    function castVote(
        uint256 _electionId,
        uint256 _candidateId
    ) external 
        onlyVoter 
        electionExists(_electionId)
        candidateExists(_candidateId)
        onlyDuringElection(_electionId)
        hasNotVoted(_electionId)
        whenNotPaused
        nonReentrant
    {
        Election storage election = elections[_electionId];
        Candidate storage candidate = candidates[_candidateId];
        
        // Verify candidate is part of this election
        bool candidateInElection = false;
        for (uint256 i = 0; i < election.candidateIds.length; i++) {
            if (election.candidateIds[i] == _candidateId) {
                candidateInElection = true;
                break;
            }
        }
        require(candidateInElection, "VotingContract: Candidate not in this election");
        
        // Record the vote
        election.hasVoted[msg.sender] = true;
        election.votes[_candidateId]++;
        election.totalVotes++;
        candidate.voteCount++;
        
        // Update voter profile
        voterProfiles[msg.sender].totalVotesCast++;
        voterProfiles[msg.sender].electionsVotedIn[_electionId] = true;
        
        emit VoteCast(msg.sender, _electionId, _candidateId, block.timestamp);
    }
    
    /**
     * @dev Get election information
     * @param _electionId ID of the election
     * @return Election data
     */
    function getElection(uint256 _electionId) 
        external 
        view 
        electionExists(_electionId)
        returns (
            uint256 id,
            string memory title,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            bool isActive,
            uint256 totalVotes,
            uint256[] memory candidateIds,
            address creator,
            uint256 createdAt
        )
    {
        Election storage election = elections[_electionId];
        return (
            election.id,
            election.title,
            election.description,
            election.startTime,
            election.endTime,
            election.isActive,
            election.totalVotes,
            election.candidateIds,
            election.creator,
            election.createdAt
        );
    }
    
    /**
     * @dev Get candidate information
     * @param _candidateId ID of the candidate
     * @return Candidate data
     */
    function getCandidate(uint256 _candidateId)
        external
        view
        candidateExists(_candidateId)
        returns (
            uint256 id,
            string memory name,
            string memory description,
            uint256 voteCount,
            address addedBy,
            uint256 addedAt
        )
    {
        Candidate storage candidate = candidates[_candidateId];
        return (
            candidate.id,
            candidate.name,
            candidate.description,
            candidate.voteCount,
            candidate.addedBy,
            candidate.addedAt
        );
    }
    
    /**
     * @dev Get voting results for an election
     * @param _electionId ID of the election
     * @return Array of candidate results
     */
    function getElectionResults(uint256 _electionId)
        external
        view
        electionExists(_electionId)
        returns (uint256[] memory candidateIds, uint256[] memory voteCounts)
    {
        Election storage election = elections[_electionId];
        uint256 length = election.candidateIds.length;
        
        candidateIds = new uint256[](length);
        voteCounts = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            candidateIds[i] = election.candidateIds[i];
            voteCounts[i] = election.votes[election.candidateIds[i]];
        }
    }
    
    /**
     * @dev End an election
     * @param _electionId ID of the election to end
     */
    function endElection(uint256 _electionId) 
        external 
        onlyElectionCreator 
        electionExists(_electionId)
    {
        Election storage election = elections[_electionId];
        require(election.isActive, "VotingContract: Election already ended");
        
        election.isActive = false;
        
        emit ElectionEnded(_electionId, election.totalVotes, msg.sender);
    }
    
    /**
     * @dev Toggle election status
     * @param _electionId ID of the election
     */
    function toggleElectionStatus(uint256 _electionId) 
        external 
        onlyElectionCreator 
        electionExists(_electionId)
    {
        elections[_electionId].isActive = !elections[_electionId].isActive;
        
        emit ElectionStatusChanged(
            _electionId, 
            elections[_electionId].isActive, 
            msg.sender
        );
    }
    
    /**
     * @dev Get total number of elections
     * @return uint256 Total elections count
     */
    function getTotalElections() external view returns (uint256) {
        return _electionIds.current();
    }
    
    /**
     * @dev Get total number of candidates
     * @return uint256 Total candidates count
     */
    function getTotalCandidates() external view returns (uint256) {
        return _candidateIds.current();
    }
    
    /**
     * @dev Check if a voter has voted in a specific election
     * @param _voter Address of the voter
     * @param _electionId ID of the election
     * @return bool True if the voter has voted
     */
    function hasVotedInElection(address _voter, uint256 _electionId) 
        external 
        view 
        electionExists(_electionId)
        returns (bool)
    {
        return elections[_electionId].hasVoted[_voter];
    }
    
    /**
     * @dev Pause the contract
     */
    function pause() external onlyAdmin {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyAdmin {
        _unpause();
    }
}

