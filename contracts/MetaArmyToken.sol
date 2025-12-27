// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MetaArmyToken
 * @dev $ARMY - Utility token for MetaArmy 3.0
 */
contract MetaArmyToken is ERC20, Ownable {
    constructor() ERC20("MetaArmy", "ARMY") Ownable(msg.sender) {
        _mint(msg.sender, 10000000 * 10**18); // 10M tokens
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
