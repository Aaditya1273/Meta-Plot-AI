// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PermissionManager.sol";

/**
 * @title AutomationExecutor
 * @dev Executes automated DeFi strategies using ERC-7715 permissions
 * @notice Handles Aave V3 interactions, gas optimization, and yield farming
 */
contract AutomationExecutor is ReentrancyGuard, Ownable {
    
    PermissionManager public immutable permissionManager;
    
    // Aave V3 Pool address (Sepolia)
    address public constant AAVE_POOL = 0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951;
    
    // USDC address (Sepolia)
    address public constant USDC = 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8;
    
    struct Strategy {
        bytes32 permissionId;
        address user;
        uint256 targetAmount;      // Amount to maintain in wallet
        uint256 investmentAmount;  // Amount to invest when threshold met
        uint256 maxGasPrice;       // Max gas price for execution
        uint256 minYield;          // Minimum APY required (basis points)
        uint256 lastExecution;     // Last execution timestamp
        uint256 frequency;         // Execution frequency in seconds
        bool isActive;
        string strategyType;       // "DCA", "YIELD_FARM", "LIMIT_ORDER"
    }
    
    struct GasCondition {
        uint256 maxGasPrice;
        uint256 priority;          // 1 = low, 2 = medium, 3 = high
        bool waitForOptimal;
    }
    
    // Events
    event StrategyCreated(
        bytes32 indexed strategyId,
        address indexed user,
        string strategyType,
        uint256 targetAmount
    );
    
    event StrategyExecuted(
        bytes32 indexed strategyId,
        address indexed user,
        uint256 amount,
        uint256 gasUsed,
        string action
    );
    
    event YieldEarned(
        address indexed user,
        address indexed asset,
        uint256 amount,
        uint256 apy,
        string protocol
    );
    
    // Storage
    mapping(bytes32 => Strategy) public strategies;
    mapping(address => bytes32[]) public userStrategies;
    mapping(address => uint256) public userYieldEarned;
    
    uint256 public totalStrategies;
    uint256 public totalExecutions;
    
    constructor(address _permissionManager) {
        permissionManager = PermissionManager(_permissionManager);
    }
    
    /**
     * @dev Create a new automated strategy
     */
    function createStrategy(
        bytes32 permissionId,
        uint256 targetAmount,
        uint256 investmentAmount,
        uint256 maxGasPrice,
        uint256 minYield,
        uint256 frequency,
        string calldata strategyType
    ) external returns (bytes32 strategyId) {
        require(permissionManager.isPermissionValid(permissionId), "Invalid permission");
        
        strategyId = keccak256(
            abi.encodePacked(
                msg.sender,
                permissionId,
                block.timestamp,
                totalStrategies++
            )
        );
        
        strategies[strategyId] = Strategy({
            permissionId: permissionId,
            user: msg.sender,
            targetAmount: targetAmount,
            investmentAmount: investmentAmount,
            maxGasPrice: maxGasPrice,
            minYield: minYield,
            lastExecution: 0,
            frequency: frequency,
            isActive: true,
            strategyType: strategyType
        });
        
        userStrategies[msg.sender].push(strategyId);
        
        emit StrategyCreated(strategyId, msg.sender, strategyType, targetAmount);
    }
    
    /**
     * @dev Execute a strategy if conditions are met
     */
    function executeStrategy(bytes32 strategyId) external nonReentrant {
        Strategy storage strategy = strategies[strategyId];
        require(strategy.isActive, "Strategy not active");
        require(
            block.timestamp >= strategy.lastExecution + strategy.frequency,
            "Too early to execute"
        );
        require(tx.gasprice <= strategy.maxGasPrice, "Gas price too high");
        
        // Check user's USDC balance
        uint256 userBalance = IERC20(USDC).balanceOf(strategy.user);
        
        if (userBalance > strategy.targetAmount + strategy.investmentAmount) {
            // Execute Aave deposit
            _executeAaveDeposit(strategy, strategy.investmentAmount);
            strategy.lastExecution = block.timestamp;
            totalExecutions++;
            
            emit StrategyExecuted(
                strategyId,
                strategy.user,
                strategy.investmentAmount,
                gasleft(),
                "AAVE_DEPOSIT"
            );
        }
    }
    
    /**
     * @dev Execute Aave V3 deposit using permission
     */
    function _executeAaveDeposit(Strategy memory strategy, uint256 amount) internal {
        // Prepare Aave deposit call data
        bytes memory depositData = abi.encodeWithSignature(
            "supply(address,uint256,address,uint16)",
            USDC,
            amount,
            strategy.user,
            0
        );
        
        // Execute using permission
        bool success = permissionManager.executeWithPermission(
            strategy.permissionId,
            0, // No ETH value for ERC-20 deposit
            depositData
        );
        
        require(success, "Aave deposit failed");
        
        // Track yield (simplified - in production would query Aave for actual APY)
        uint256 estimatedYield = (amount * 300) / 10000; // 3% APY estimate
        userYieldEarned[strategy.user] += estimatedYield;
        
        emit YieldEarned(
            strategy.user,
            USDC,
            estimatedYield,
            300, // 3% APY in basis points
            "AAVE_V3"
        );
    }
    
    /**
     * @dev Batch execute multiple strategies with gas optimization
     */
    function batchExecuteStrategies(
        bytes32[] calldata strategyIds,
        GasCondition calldata gasCondition
    ) external {
        require(tx.gasprice <= gasCondition.maxGasPrice, "Gas price exceeds limit");
        
        for (uint256 i = 0; i < strategyIds.length; i++) {
            try this.executeStrategy(strategyIds[i]) {
                // Strategy executed successfully
            } catch {
                // Continue with next strategy if one fails
                continue;
            }
        }
    }
    
    /**
     * @dev Emergency withdraw from Aave (user callable)
     */
    function emergencyWithdraw(bytes32 permissionId, uint256 amount) external {
        // Prepare Aave withdraw call data
        bytes memory withdrawData = abi.encodeWithSignature(
            "withdraw(address,uint256,address)",
            USDC,
            amount,
            msg.sender
        );
        
        // Execute using permission
        bool success = permissionManager.executeWithPermission(
            permissionId,
            0,
            withdrawData
        );
        
        require(success, "Emergency withdraw failed");
    }
    
    /**
     * @dev Pause a strategy
     */
    function pauseStrategy(bytes32 strategyId) external {
        Strategy storage strategy = strategies[strategyId];
        require(strategy.user == msg.sender, "Not strategy owner");
        strategy.isActive = false;
    }
    
    /**
     * @dev Resume a strategy
     */
    function resumeStrategy(bytes32 strategyId) external {
        Strategy storage strategy = strategies[strategyId];
        require(strategy.user == msg.sender, "Not strategy owner");
        strategy.isActive = true;
    }
    
    /**
     * @dev Get user's strategies
     */
    function getUserStrategies(address user) external view returns (bytes32[] memory) {
        return userStrategies[user];
    }
    
    /**
     * @dev Get strategy details
     */
    function getStrategy(bytes32 strategyId) external view returns (Strategy memory) {
        return strategies[strategyId];
    }
    
    /**
     * @dev Check if strategy can be executed
     */
    function canExecuteStrategy(bytes32 strategyId) external view returns (bool) {
        Strategy memory strategy = strategies[strategyId];
        
        if (!strategy.isActive) return false;
        if (block.timestamp < strategy.lastExecution + strategy.frequency) return false;
        if (tx.gasprice > strategy.maxGasPrice) return false;
        
        uint256 userBalance = IERC20(USDC).balanceOf(strategy.user);
        return userBalance > strategy.targetAmount + strategy.investmentAmount;
    }
}

// Interface for ERC-20 tokens
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}