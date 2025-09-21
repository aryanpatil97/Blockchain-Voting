// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AccessControl
 * @dev Manages permissions and roles for the voting system
 * @author Blockchain Voting Team
 */
contract VotingAccessControl is AccessControl, ReentrancyGuard {
    
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");
    bytes32 public constant ELECTION_CREATOR_ROLE = keccak256("ELECTION_CREATOR_ROLE");
    
    // Events
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
    event VoterRegistered(address indexed voter, uint256 registrationTime);
    
    // Voter registration tracking
    mapping(address => uint256) public voterRegistrationTime;
    mapping(address => bool) public isVoterRegistered;
    
    // Modifiers
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "AccessControl: Must have admin role");
        _;
    }
    
    modifier onlyElectionCreator() {
        require(hasRole(ELECTION_CREATOR_ROLE, msg.sender), "AccessControl: Must have election creator role");
        _;
    }
    
    modifier onlyVoter() {
        require(hasRole(VOTER_ROLE, msg.sender), "AccessControl: Must have voter role");
        _;
    }
    
    /**
     * @dev Constructor sets up initial roles
     */
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(ELECTION_CREATOR_ROLE, msg.sender);
    }
    
    /**
     * @dev Register a new voter
     * @param _voter Address of the voter to register
     */
    function registerVoter(address _voter) external onlyAdmin {
        require(!isVoterRegistered[_voter], "AccessControl: Voter already registered");
        
        _grantRole(VOTER_ROLE, _voter);
        isVoterRegistered[_voter] = true;
        voterRegistrationTime[_voter] = block.timestamp;
        
        emit VoterRegistered(_voter, block.timestamp);
    }
    
    /**
     * @dev Grant election creator role
     * @param _account Address to grant the role to
     */
    function grantElectionCreatorRole(address _account) external onlyAdmin {
        _grantRole(ELECTION_CREATOR_ROLE, _account);
        emit RoleGranted(ELECTION_CREATOR_ROLE, _account, msg.sender);
    }
    
    /**
     * @dev Revoke election creator role
     * @param _account Address to revoke the role from
     */
    function revokeElectionCreatorRole(address _account) external onlyAdmin {
        _revokeRole(ELECTION_CREATOR_ROLE, _account);
        emit RoleRevoked(ELECTION_CREATOR_ROLE, _account, msg.sender);
    }
    
    /**
     * @dev Check if an address is a registered voter
     * @param _voter Address to check
     * @return bool True if the address is a registered voter
     */
    function isRegisteredVoter(address _voter) external view returns (bool) {
        return hasRole(VOTER_ROLE, _voter);
    }
    
    /**
     * @dev Get voter registration time
     * @param _voter Address of the voter
     * @return uint256 Registration timestamp
     */
    function getVoterRegistrationTime(address _voter) external view returns (uint256) {
        require(isVoterRegistered[_voter], "AccessControl: Voter not registered");
        return voterRegistrationTime[_voter];
    }
    
    /**
     * @dev Batch register multiple voters
     * @param _voters Array of voter addresses
     */
    function batchRegisterVoters(address[] calldata _voters) external onlyAdmin {
        require(_voters.length > 0, "AccessControl: Empty voters array");
        require(_voters.length <= 100, "AccessControl: Too many voters in batch");
        
        for (uint256 i = 0; i < _voters.length; i++) {
            if (!isVoterRegistered[_voters[i]]) {
                _grantRole(VOTER_ROLE, _voters[i]);
                isVoterRegistered[_voters[i]] = true;
                voterRegistrationTime[_voters[i]] = block.timestamp;
                emit VoterRegistered(_voters[i], block.timestamp);
            }
        }
    }
}

