// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./QiaoContract.sol";

contract QiaoFactory is Ownable {
    mapping(bytes32 => address) public addresses;

    event ContractCreated(address contractAddress);

    constructor() Ownable(msg.sender) {}

    // Function to create a new QiaoContract and assign a subdomain
    function createContract(
        string memory name,
        string memory initialGatewayUrl
    ) public {
        // Deploy the new QiaoContract
        address newContract = address(
            new QiaoContract(address(this), initialGatewayUrl, msg.sender)
        );
        bytes32 hash = keccak256(abi.encodePacked(name));
        require(addresses[hash] == address(0), "Contract already exists");
        addresses[hash] = newContract;
        emit ContractCreated(newContract);
    }

    function getContract(string memory name) public view returns (address) {
        bytes32 hash = keccak256(abi.encodePacked(name));
        return addresses[hash];
    }
}
