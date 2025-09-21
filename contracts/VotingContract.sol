// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title VotingContract
 * @dev A decentralized voting system with role-based access control
 */
contract VotingContract is AccessControl, ReentrancyGuard {
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");
    
    // Events for role management
    event VoterRegistered(address indexed voter, address indexed admin);
    event VoterRevoked(address indexed voter, address indexed admin);
    event AdminGranted(address indexed newAdmin, address indexed grantor);
    event AdminRevoked(address indexed admin, address indexed revoker);
    
    /**
     * @dev Constructor sets the deployer as the default admin
     */
    constructor() {
        // Grant the contract deployer the default admin role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // Grant the contract deployer the admin role
        _grantRole(ADMIN_ROLE, msg.sender);
        
        // Set admin role as the admin of voter role
        _setRoleAdmin(VOTER_ROLE, ADMIN_ROLE);
    }
    
    /**
     * @dev Modifier to check if caller has admin role
     */
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "VotingContract: caller is not an admin");
        _;
    }
    
    /**
     * @dev Modifier to check if caller has voter role
     */
    modifier onlyVoter() {
        require(hasRole(VOTER_ROLE, msg.sender), "VotingContract: caller is not a registered voter");
        _;
    }
    
    /**
     * @dev Modifier to check if caller has admin or voter role
     */
    modifier onlyAuthorized() {
        require(
            hasRole(ADMIN_ROLE, msg.sender) || hasRole(VOTER_ROLE, msg.sender),
            "VotingContract: caller is not authorized"
        );
        _;
    }
    
    /**
     * @dev Register a new voter (only admins can call this)
     * @param voter Address of the voter to register
     */
    function registerVoter(address voter) external onlyAdmin nonReentrant {
        require(voter != address(0), "VotingContract: invalid voter address");
        require(!hasRole(VOTER_ROLE, voter), "VotingContract: voter already registered");
        
        _grantRole(VOTER_ROLE, voter);
        emit VoterRegistered(voter, msg.sender);
    }
    
    /**
     * @dev Register multiple voters in batch (only admins can call this)
     * @param voters Array of voter addresses to register
     */
    function registerVotersBatch(address[] calldata voters) external onlyAdmin nonReentrant {
        require(voters.length > 0, "VotingContract: empty voters array");
        require(voters.length <= 100, "VotingContract: too many voters in batch");
        
        for (uint256 i = 0; i < voters.length; i++) {
            address voter = voters[i];
            require(voter != address(0), "VotingContract: invalid voter address");
            
            if (!hasRole(VOTER_ROLE, voter)) {
                _grantRole(VOTER_ROLE, voter);
                emit VoterRegistered(voter, msg.sender);
            }
        }
    }
    
    /**
     * @dev Revoke voter role (only admins can call this)
     * @param voter Address of the voter to revoke
     */
    function revokeVoter(address voter) external onlyAdmin nonReentrant {
        require(voter != address(0), "VotingContract: invalid voter address");
        require(hasRole(VOTER_ROLE, voter), "VotingContract: voter not registered");
        
        _revokeRole(VOTER_ROLE, voter);
        emit VoterRevoked(voter, msg.sender);
    }
    
    /**
     * @dev Grant admin role to a new address (only existing admins can call this)
     * @param newAdmin Address to grant admin role to
     */
    function grantAdminRole(address newAdmin) external onlyAdmin nonReentrant {
        require(newAdmin != address(0), "VotingContract: invalid admin address");
        require(!hasRole(ADMIN_ROLE, newAdmin), "VotingContract: address already has admin role");
        
        _grantRole(ADMIN_ROLE, newAdmin);
        emit AdminGranted(newAdmin, msg.sender);
    }
    
    /**
     * @dev Revoke admin role from an address (only existing admins can call this)
     * @param admin Address to revoke admin role from
     */
    function revokeAdminRole(address admin) external onlyAdmin nonReentrant {
        require(admin != address(0), "VotingContract: invalid admin address");
        require(hasRole(ADMIN_ROLE, admin), "VotingContract: address does not have admin role");
        require(admin != msg.sender, "VotingContract: cannot revoke own admin role");
        
        // Ensure there's at least one admin remaining
        uint256 adminCount = getRoleMemberCount(ADMIN_ROLE);
        require(adminCount > 1, "VotingContract: cannot revoke last admin");
        
        _revokeRole(ADMIN_ROLE, admin);
        emit AdminRevoked(admin, msg.sender);
    }
    
    /**
     * @dev Check if an address is a registered voter
     * @param voter Address to check
     * @return bool True if the address is a registered voter
     */
    function isRegisteredVoter(address voter) external view returns (bool) {
        return hasRole(VOTER_ROLE, voter);
    }
    
    /**
     * @dev Check if an address is an admin
     * @param admin Address to check
     * @return bool True if the address is an admin
     */
    function isAdmin(address admin) external view returns (bool) {
        return hasRole(ADMIN_ROLE, admin);
    }
    
    /**
     * @dev Get the total number of registered voters
     * @return uint256 Number of registered voters
     */
    function getVoterCount() external view returns (uint256) {
        return getRoleMemberCount(VOTER_ROLE);
    }
    
    /**
     * @dev Get the total number of admins
     * @return uint256 Number of admins
     */
    function getAdminCount() external view returns (uint256) {
        return getRoleMemberCount(ADMIN_ROLE);
    }
    
    /**
     * @dev Get voter address by index
     * @param index Index of the voter
     * @return address Voter address at the given index
     */
    function getVoterByIndex(uint256 index) external view returns (address) {
        require(index < getRoleMemberCount(VOTER_ROLE), "VotingContract: voter index out of bounds");
        return getRoleMember(VOTER_ROLE, index);
    }
    
    /**
     * @dev Get admin address by index
     * @param index Index of the admin
     * @return address Admin address at the given index
     */
    function getAdminByIndex(uint256 index) external view returns (address) {
        require(index < getRoleMemberCount(ADMIN_ROLE), "VotingContract: admin index out of bounds");
        return getRoleMember(ADMIN_ROLE, index);
    }
}