// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./SignatureVerifier.sol";

contract QiaoContract is Ownable {
    using ECDSA for bytes32;

    address public factory;
    string[] public gatewayUrls;
    mapping(address => bool) public signers;

    error OffchainLookup(
        address sender,
        string[] urls,
        bytes callData,
        bytes4 callbackFunction,
        bytes extraData
    );

    constructor(
        address _factory,
        string memory _initialGatewayUrl,
        address initialOwner
    ) Ownable(initialOwner) {
        factory = _factory;
        gatewayUrls.push(_initialGatewayUrl);
        signers[initialOwner] = true;
    }

    function callOffchain(
        bytes calldata input
    ) public view returns (bytes memory) {
        bytes memory callData = abi.encodeWithSelector(
            this.callOffchain.selector,
            input
        );

        revert OffchainLookup(
            address(this),
            gatewayUrls,
            callData,
            this.callOffchainWithProof.selector,
            callData
        );
    }

    function callOffchainWithProof(
        bytes calldata response,
        bytes calldata extraData
    ) external view returns (bytes memory) {
        (address signer, bytes memory result) = SignatureVerifier.verify(
            extraData,
            response
        );
        require(signers[signer], "SignatureVerifier: Invalid signature");
        return result;
    }

    function addSigner(address _signer) external onlyOwner {
        signers[_signer] = true;
    }

    function removeSigner(address _signer) external onlyOwner {
        signers[_signer] = false;
    }

    function addGatewayUrl(string memory _newUrl) external onlyOwner {
        gatewayUrls.push(_newUrl);
    }

    function removeGatewayUrl(uint256 index) external onlyOwner {
        require(gatewayUrls.length > 1, "Must keep at least one gateway URL");
        require(index < gatewayUrls.length, "Invalid index");

        gatewayUrls[index] = gatewayUrls[gatewayUrls.length - 1];
        gatewayUrls.pop();
    }
}
