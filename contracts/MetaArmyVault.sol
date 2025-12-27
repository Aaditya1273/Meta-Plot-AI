// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MetaArmyVault
 * @dev ERC-4626 Tokenized Vault for MetaArmy liquidity management.
 * Automated agents can deposit assets here to earn yield from approved strategies.
 */
contract MetaArmyVault is ERC4626, Ownable {
    
    constructor(IERC20 asset, string memory name, string memory symbol) 
        ERC4626(asset) 
        ERC20(name, symbol) 
        Ownable(msg.sender)
    {}

    /**
     * @dev Hook for strategy execution (authorized only)
     * This is a placeholder for where the Swarm Orchestrator would call 
     * specific DeFi integrations like Aave or Uniswap.
     */
    function executeStrategy(address target, bytes calldata data) external onlyOwner {
        (bool success, ) = target.call(data);
        require(success, "Strategy execution failed");
    }
}
