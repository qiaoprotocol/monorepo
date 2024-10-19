// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/utils/Create2.sol";
import "./QiaoContract.sol";

interface IExtendedResolver {
    function resolve(
        bytes memory name,
        bytes memory data
    ) external view returns (bytes memory);
}

contract QiaoFactory is IExtendedResolver {
    struct ContractInfo {
        address addr;
        string name;
        string[] gatewayUrls;
        bytes4 callbackFunction;
        uint256 price;
    }

    mapping(bytes32 => ContractInfo) public contracts;
    mapping(string => bytes32) public nameToHash;

    event ContractCreated(
        bytes32 indexed hash,
        address addr,
        string name,
        string[] gatewayUrls,
        bytes4 callbackFunction,
        uint256 price
    );

    constructor() {}

    function createContract(
        string memory name,
        string[] memory gatewayUrls,
        bytes4 callbackFunction,
        uint256 price
    ) public payable {
        bytes32 hash = keccak256(
            abi.encodePacked(name, gatewayUrls, callbackFunction, price)
        );
        require(contracts[hash].addr == address(0), "Contract already exists");

        bytes memory bytecode = type(ERC3668Contract).creationCode;
        bytes memory constructorArgs = abi.encode(
            address(this),
            gatewayUrls,
            callbackFunction,
            price,
            msg.sender
        );
        bytes32 salt = keccak256(abi.encodePacked(name, block.timestamp));

        address addr = Create2.deploy(
            0,
            salt,
            abi.encodePacked(bytecode, constructorArgs)
        );

        contracts[hash] = ContractInfo(
            addr,
            name,
            gatewayUrls,
            callbackFunction,
            price
        );
        nameToHash[name] = hash;

        emit ContractCreated(
            hash,
            addr,
            name,
            gatewayUrls,
            callbackFunction,
            price
        );
    }

    function resolve(
        bytes calldata name,
        bytes calldata data
    ) external view override returns (bytes memory) {
        bytes32 hash = nameToHash[string(name)];
        require(hash != bytes32(0), "Name not found");

        ContractInfo memory info = contracts[hash];
        return abi.encodePacked(info.addr);
    }
}
