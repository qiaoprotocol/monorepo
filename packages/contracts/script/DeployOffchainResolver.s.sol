// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Script.sol";
import "../src/OffchainResolver.sol";

//use for testing only
contract DeployResolver is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        address[] memory signers = new address[](1);
        signers[0] = deployer;

        OffchainResolver resolver = new OffchainResolver(
            "https://qiao.up.railway.app/{sender}/{data}",
            signers
        );

        vm.stopBroadcast();

        console.log("Resolver deployed at:", address(resolver));
    }
}
