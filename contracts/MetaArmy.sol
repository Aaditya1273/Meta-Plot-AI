// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MetaArmy
 * @dev Upgraded Smart contract for MetaArmy 3.0
 * Features: ZK-Verifiability hooks, $ARMY token utility, Multi-protocol support
 */
contract MetaArmy is Ownable {
    
    struct Permission {
        address user;
        address target;
        uint256 amount;
        uint256 expiry;
        bool active;
        uint256 totalExecuted;
        string[] conditions;
        bool zkVerified; // Whether this agent action requires ZK verification
    }
    
    struct AgentExecution {
        bytes32 permissionId;
        address target;
        uint256 amount;
        uint256 timestamp;
        bool success;
        string reason;
        bytes32 zkProofHash; // Hash of the proof for verifiability
    }
    
    mapping(bytes32 => Permission) public permissions;
    mapping(address => bytes32[]) public userPermissions;
    mapping(bytes32 => AgentExecution[]) public executionHistory;
    
    // $ARMY Token for utility (fees, staking)
    address public armyToken;
    uint256 public standardFee = 10; // 0.1% = 10 basis points
    uint256 public stakedThreshold = 1000 * 10**18; // 1000 ARMY for free tier
    
    // ZK Prover address (Brevis/SnarkJS compatible hook)
    address public zkProver;

    event PermissionGranted(
        bytes32 indexed permissionId,
        address indexed user,
        address indexed target,
        uint256 amount,
        uint256 expiry
    );
    
    event AgentExecuted(
        bytes32 indexed permissionId,
        address indexed target,
        uint256 amount,
        bool success,
        bytes32 zkProofHash
    );

    constructor(address _armyToken, address _zkProver) Ownable(msg.sender) {
        armyToken = _armyToken;
        zkProver = _zkProver;
    }
    
    modifier onlyPermissionOwner(bytes32 permissionId) {
        require(permissions[permissionId].user == msg.sender, "Not permission owner");
        _;
    }
    
    modifier validPermission(bytes32 permissionId) {
        Permission memory perm = permissions[permissionId];
        require(perm.active, "Permission not active");
        require(perm.expiry > block.timestamp, "Permission expired");
        _;
    }
    
    /**
     * @dev Grant permission for AI agent to execute transactions
     */
    function grantPermission(
        address target,
        uint256 amount,
        uint256 expiry,
        string[] memory conditions,
        bool requiresZk
    ) external returns (bytes32) {
        bytes32 permissionId = keccak256(
            abi.encodePacked(msg.sender, target, amount, block.timestamp)
        );
        
        permissions[permissionId] = Permission({
            user: msg.sender,
            target: target,
            amount: amount,
            expiry: expiry,
            active: true,
            totalExecuted: 0,
            conditions: conditions,
            zkVerified: requiresZk
        });
        
        userPermissions[msg.sender].push(permissionId);
        
        emit PermissionGranted(permissionId, msg.sender, target, amount, expiry);
        return permissionId;
    }
    
    /**
     * @dev Execute transaction with granted permission
     * Includes hook for ZK proof validation and Fee logic
     */
    function executeWithPermission(
        bytes32 permissionId,
        address target,
        uint256 amount,
        bytes calldata data,
        bytes32 zkProofHash // Placeholder for ZK proof validation
    ) external validPermission(permissionId) {
        Permission storage perm = permissions[permissionId];
        
        require(target == perm.target, "Invalid target");
        require(amount <= perm.amount, "Amount exceeds limit");
        
        // ZK Verification Hook
        if (perm.zkVerified) {
            require(zkProofHash != bytes32(0), "ZK proof required");
        }
        
        // Execute the transaction
        bool success;
        (success, ) = target.call{value: 0}(data);
        
        // Record execution
        executionHistory[permissionId].push(AgentExecution({
            permissionId: permissionId,
            target: target,
            amount: amount,
            timestamp: block.timestamp,
            success: success,
            reason: success ? "Success" : "Failed",
            zkProofHash: zkProofHash
        }));
        
        if (success) {
            perm.totalExecuted += amount;
        }
        
        emit AgentExecuted(permissionId, target, amount, success, zkProofHash);
    }
    
    function _calculateFee(address user, uint256 amount) internal view returns (uint256) {
        if (IERC20(armyToken).balanceOf(user) >= stakedThreshold) {
            return 0;
        }
        return (amount * standardFee) / 10000;
    }

    struct SwarmAction {
        address target;
        uint256 amount;
        bytes data;
        bool requiresZk;
    }

    struct SwarmBundle {
        address user;
        string goal;
        uint256 timestamp;
        bool active;
        uint256 totalActions;
        uint256 executedActions;
    }

    mapping(bytes32 => SwarmBundle) public swarmBundles;
    mapping(bytes32 => SwarmAction[]) public bundleActions;

    event SwarmBundleCreated(bytes32 indexed bundleId, address indexed user, string goal, uint256 actionCount);
    event SwarmActionExecuted(bytes32 indexed bundleId, uint256 index, bool success);

    function createSwarmBundle(
        string memory goal,
        SwarmAction[] memory actions
    ) external returns (bytes32) {
        require(actions.length > 0, "No actions provided");
        require(actions.length <= 50, "Too many actions"); // Limit to prevent gas issues
        
        bytes32 bundleId = keccak256(abi.encodePacked(msg.sender, goal, block.timestamp));
        
        swarmBundles[bundleId] = SwarmBundle({
            user: msg.sender,
            goal: goal,
            timestamp: block.timestamp,
            active: true,
            totalActions: actions.length,
            executedActions: 0
        });

        // More gas-efficient batch storage
        for (uint256 i = 0; i < actions.length; i++) {
            bundleActions[bundleId].push(SwarmAction({
                target: actions[i].target,
                amount: actions[i].amount,
                data: actions[i].data,
                requiresZk: actions[i].requiresZk
            }));
        }

        emit SwarmBundleCreated(bundleId, msg.sender, goal, actions.length);
        return bundleId;
    }

    function executeBundle(
        bytes32 bundleId,
        bytes32[] memory zkProofHashes
    ) external {
        SwarmBundle storage bundle = swarmBundles[bundleId];
        require(bundle.active, "Bundle not active");
        require(bundle.user == msg.sender || msg.sender == owner(), "Not authorized");

        SwarmAction[] storage actions = bundleActions[bundleId];
        require(zkProofHashes.length == actions.length, "Proof count mismatch");
        
        uint256 successCount = 0;
        
        for (uint256 i = 0; i < actions.length; i++) {
            SwarmAction storage action = actions[i];
            
            if (action.requiresZk) {
                require(zkProofHashes[i] != bytes32(0), "Action requires ZK proof");
            }

            (bool success, ) = action.target.call{value: action.amount}(action.data);
            
            if (success) {
                successCount++;
            }
            
            emit SwarmActionExecuted(bundleId, i, success);
        }

        bundle.executedActions = successCount;
        bundle.active = false; 
    }

    function setArmyToken(address _armyToken) external onlyOwner {
        armyToken = _armyToken;
    }

    function setZkProver(address _zkProver) external onlyOwner {
        zkProver = _zkProver;
    }

    // Gas estimation helper
    function estimateBundleGas(SwarmAction[] memory actions) external view returns (uint256) {
        uint256 baseGas = 21000; // Base transaction cost
        uint256 storageGas = actions.length * 20000; // Approximate storage cost per action
        uint256 executionGas = actions.length * 50000; // Approximate execution cost per action
        
        return baseGas + storageGas + executionGas;
    }

    // Create bundle with gas limit check
    function createSwarmBundleSafe(
        string memory goal,
        SwarmAction[] memory actions,
        uint256 gasLimit
    ) external returns (bytes32) {
        uint256 estimatedGas = this.estimateBundleGas(actions);
        require(estimatedGas <= gasLimit, "Estimated gas exceeds limit");
        
        require(actions.length > 0, "No actions provided");
        require(actions.length <= 50, "Too many actions"); // Limit to prevent gas issues
        
        bytes32 bundleId = keccak256(abi.encodePacked(msg.sender, goal, block.timestamp));
        
        swarmBundles[bundleId] = SwarmBundle({
            user: msg.sender,
            goal: goal,
            timestamp: block.timestamp,
            active: true,
            totalActions: actions.length,
            executedActions: 0
        });

        // More gas-efficient batch storage
        for (uint256 i = 0; i < actions.length; i++) {
            bundleActions[bundleId].push(SwarmAction({
                target: actions[i].target,
                amount: actions[i].amount,
                data: actions[i].data,
                requiresZk: actions[i].requiresZk
            }));
        }

        emit SwarmBundleCreated(bundleId, msg.sender, goal, actions.length);
        return bundleId;
    }
}
