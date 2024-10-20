// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@ensdomains/contracts/registry/ENS.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./QiaoContract.sol";

// Simple Resolver Interface
interface Resolver {
    function addr(bytes32 node) external view returns (address);
}

contract QiaoFactory is Resolver, Ownable {
    ENS public ens;
    bytes32 public baseNode;
    mapping(bytes32 => address) public addresses;

    event SubdomainCreated(bytes32 indexed node, string name, address owner);
    event ContractCreated(address contractAddress);

    constructor(ENS _ens, bytes32 _baseNode) Ownable(msg.sender) {
        ens = _ens;
        baseNode = _baseNode;
    }

    // Function to create a new QiaoContract and assign a subdomain
    function createContract(
        string memory name,
        string memory initialGatewayUrl
    ) public {
        // Deploy the new QiaoContract
        address newContract = address(
            new QiaoContract(address(this), initialGatewayUrl, msg.sender)
        );

        // Create the subdomain and set up resolution
        _createSubdomain(name, msg.sender, newContract);

        emit ContractCreated(newContract);
    }

    // Function to create a subdomain and set its address
    function createSubdomain(
        string memory name,
        address targetAddress
    ) public onlyOwner {
        _createSubdomain(name, msg.sender, targetAddress);
    }

    // Internal function to handle subdomain creation
    function _createSubdomain(
        string memory name,
        address owner,
        address targetAddress
    ) internal {
        bytes32 label = keccak256(bytes(name));
        bytes32 node = keccak256(abi.encodePacked(baseNode, label));

        // Set the owner of the subdomain to this contract
        ens.setSubnodeOwner(baseNode, label, address(this));

        // Set the resolver for the subdomain to this contract
        ens.setResolver(node, address(this));

        // Set the address record in the resolver
        addresses[node] = targetAddress;

        // Transfer ownership of the subdomain to the specified owner
        ens.setOwner(node, owner);

        emit SubdomainCreated(node, name, owner);
    }

    // Resolver function to resolve addresses
    function addr(bytes32 node) external view override returns (address) {
        return addresses[node];
    }

    // Function to update the ENS registry address
    function updateENS(ENS _newENS) external onlyOwner {
        ens = _newENS;
    }

    // Function to update the base node
    function updateBaseNode(bytes32 _newBaseNode) external onlyOwner {
        baseNode = _newBaseNode;
    }
}
