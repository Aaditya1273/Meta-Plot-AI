// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MetaArmyRegistry
 * @dev Security registry for whitelisting approved protocols and sub-agent modules.
 */
contract MetaArmyRegistry is Ownable {
    
    mapping(address => bool) public isTrustedModule;
    mapping(bytes4 => bool) public isApprovedFunction;

    event ModuleStatusChanged(address indexed module, bool status);
    event FunctionStatusChanged(bytes4 indexed sig, bool status);

    constructor() Ownable(msg.sender) {}

    function setModuleStatus(address module, bool status) external onlyOwner {
        isTrustedModule[module] = status;
        emit ModuleStatusChanged(module, status);
    }

    function setFunctionStatus(bytes4 sig, bool status) external onlyOwner {
        isApprovedFunction[sig] = status;
        emit FunctionStatusChanged(sig, status);
    }

    function isActionAuthorized(address target, bytes calldata data) external view returns (bool) {
        if (!isTrustedModule[target]) return false;
        if (data.length >= 4) {
            bytes4 sig = bytes4(data[:4]);
            return isApprovedFunction[sig];
        }
        return true;
    }
}
