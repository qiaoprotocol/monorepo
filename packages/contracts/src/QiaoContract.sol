// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ERC3668Contract is Ownable {
    using ECDSA for bytes32;

    address public factory;
    string[] public gatewayUrls;
    bytes4 public callbackFunction;
    uint256 public price;
    address public signer;

    error OffchainLookup(
        address sender,
        string[] urls,
        bytes callData,
        bytes4 callbackFunction,
        bytes extraData
    );

    constructor(
        address _factory,
        string[] memory _gatewayUrls,
        bytes4 _callbackFunction,
        uint256 _price,
        address initialOwner
    ) Ownable(initialOwner) {
        factory = _factory;
        gatewayUrls = _gatewayUrls;
        callbackFunction = _callbackFunction;
        price = _price;
        signer = initialOwner; // Set the initial signer to the owner
    }

    function resolve(
        bytes calldata name,
        bytes calldata data
    ) external payable returns (bytes memory) {
        if (price > 0) {
            require(msg.value >= price, "Insufficient payment");
        }

        bytes memory callData = abi.encodeWithSelector(
            this.resolveWithProof.selector,
            name,
            data
        );

        revert OffchainLookup(
            address(this),
            gatewayUrls,
            callData,
            callbackFunction,
            abi.encodePacked(name, data)
        );
    }

    function resolveWithProof(
        bytes calldata response,
        bytes calldata extraData
    ) external view returns (bytes memory) {
        // Extract the signature from the response
        (bytes memory result, bytes memory signature) = abi.decode(
            response,
            (bytes, bytes)
        );

        // Reconstruct the message that was signed
        bytes32 messageHash = keccak256(
            abi.encodePacked(address(this), extraData, result)
        );
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();

        // Verify the signature
        address recoveredSigner = ethSignedMessageHash.recover(signature);
        require(recoveredSigner == signer, "Invalid signature");

        return result;
    }

    function setSigner(address _signer) external onlyOwner {
        signer = _signer;
    }

    function setPrice(uint256 _price) external onlyOwner {
        price = _price;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
