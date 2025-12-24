// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PermissionManager
 * @dev Manages ERC-7715 Advanced Permissions for Meta-Pilot AI
 * @notice Handles permission granting, validation, and revocation
 */
contract PermissionManager is ReentrancyGuard, Ownable {
    
    struct Permission {
        address user;
        address target;
        uint256 maxValue;
        uint256 remainingValue;
        uint256 expiry;
        bool isActive;
        bytes32 parentPermission; // For A2A delegation
        uint256 createdAt;
    }
    
    // Events
    event PermissionGranted(
        bytes32 indexed permissionId,
        address indexed user,
        address indexed target,
        uint256 maxValue,
        uint256 expiry
    );
    
    event PermissionRevoked(
        bytes32 indexed permissionId,
        address indexed user,
        uint256 revokedAt
    );
    
    event PermissionUsed(
        bytes32 indexed permissionId,
        address indexed user,
        uint256 amount,
        uint256 remainingValue
    );
    
    event AgentAuthorized(
        address indexed agent,
        address indexed authorizer
    );
    
    event AgentRevoked(
        address indexed agent,
        address indexed revoker
    );
    
    // Storage
    mapping(bytes32 => Permission) public permissions;
    mapping(address => bytes32[]) public userPermissions;
    mapping(address => bool) public authorizedAgents;
    
    uint256 public totalPermissions;
    uint256 public activePermissions;
    
    modifier onlyAuthorizedAgent() {
        require(authorizedAgents[msg.sender], "Not authorized agent");
        _;
    }
    
    /**
     * @dev Grant a new permission
     */
    function grantPermission(
        address target,
        uint256 maxValue,
        uint256 expiry,
        bytes32 parentPermission
    ) external returns (bytes32 permissionId) {
        require(target != address(0), "Invalid target");
        require(maxValue > 0, "Invalid max value");
        require(expiry > block.timestamp, "Invalid expiry");
        
        // If this is a sub-permission, validate parent
        if (parentPermission != bytes32(0)) {
            Permission storage parent = permissions[parentPermission];
            require(parent.user == msg.sender, "Not parent permission owner");
            require(parent.isActive, "Parent permission not active");
            require(parent.expiry > block.timestamp, "Parent permission expired");
            require(parent.remainingValue >= maxValue, "Insufficient parent allowance");
            
            // Reduce parent's remaining value
            parent.remainingValue -= maxValue;
        }
        
        permissionId = keccak256(
            abi.encodePacked(
                msg.sender,
                target,
                maxValue,
                expiry,
                block.timestamp,
                totalPermissions++
            )
        );
        
        permissions[permissionId] = Permission({
            user: msg.sender,
            target: target,
            maxValue: maxValue,
            remainingValue: maxValue,
            expiry: expiry,
            isActive: true,
            parentPermission: parentPermission,
            createdAt: block.timestamp
        });
        
        userPermissions[msg.sender].push(permissionId);
        activePermissions++;
        
        emit PermissionGranted(permissionId, msg.sender, target, maxValue, expiry);
    }
    
    /**
     * @dev Revoke a permission
     */
    function revokePermission(bytes32 permissionId) external {
        Permission storage permission = permissions[permissionId];
        require(permission.user == msg.sender, "Not permission owner");
        require(permission.isActive, "Permission already revoked");
        
        permission.isActive = false;
        activePermissions--;
        
        // If this permission has a parent, restore the remaining value
        if (permission.parentPermission != bytes32(0)) {
            Permission storage parent = permissions[permission.parentPermission];
            if (parent.isActive) {
                parent.remainingValue += permission.remainingValue;
            }
        }
        
        emit PermissionRevoked(permissionId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Execute a transaction using a permission
     */
    function executeWithPermission(
        bytes32 permissionId,
        uint256 value,
        bytes calldata data
    ) external onlyAuthorizedAgent nonReentrant returns (bool success) {
        Permission storage permission = permissions[permissionId];
        
        require(permission.isActive, "Permission not active");
        require(permission.expiry > block.timestamp, "Permission expired");
        require(permission.remainingValue >= value, "Insufficient permission allowance");
        
        // Reduce remaining value
        permission.remainingValue -= value;
        
        // Execute the transaction
        (success, ) = permission.target.call{value: value}(data);
        require(success, "Transaction execution failed");
        
        emit PermissionUsed(permissionId, permission.user, value, permission.remainingValue);
        
        // Auto-revoke if fully used
        if (permission.remainingValue == 0) {
            permission.isActive = false;
            activePermissions--;
        }
    }
    
    /**
     * @dev Check if permission is valid and has sufficient allowance
     */
    function isPermissionValid(bytes32 permissionId) external view returns (bool) {
        Permission storage permission = permissions[permissionId];
        return permission.isActive && 
               permission.expiry > block.timestamp && 
               permission.remainingValue > 0;
    }
    
    /**
     * @dev Get permission details
     */
    function getPermission(bytes32 permissionId) external view returns (Permission memory) {
        return permissions[permissionId];
    }
    
    /**
     * @dev Get user's permissions
     */
    function getUserPermissions(address user) external view returns (bytes32[] memory) {
        return userPermissions[user];
    }
    
    /**
     * @dev Authorize an agent to execute permissions
     */
    function authorizeAgent(address agent) external onlyOwner {
        require(agent != address(0), "Invalid agent address");
        authorizedAgents[agent] = true;
        emit AgentAuthorized(agent, msg.sender);
    }
    
    /**
     * @dev Revoke agent authorization
     */
    function revokeAgent(address agent) external onlyOwner {
        authorizedAgents[agent] = false;
        emit AgentRevoked(agent, msg.sender);
    }
    
    /**
     * @dev Clean up expired permissions (anyone can call)
     */
    function cleanupExpiredPermissions(bytes32[] calldata permissionIds) external {
        for (uint256 i = 0; i < permissionIds.length; i++) {
            Permission storage permission = permissions[permissionIds[i]];
            if (permission.isActive && permission.expiry <= block.timestamp) {
                permission.isActive = false;
                activePermissions--;
                emit PermissionRevoked(permissionIds[i], permission.user, block.timestamp);
            }
        }
    }
}