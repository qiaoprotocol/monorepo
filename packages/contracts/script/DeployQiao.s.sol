// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Script.sol";
import "../src/QiaoContract.sol";

//use for testing only
contract DeployQiao is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        QiaoContract qiao = new QiaoContract(
            address(0), // factory address (0x0 for testing)
            "http://localhost:3000/{sender}/{data}",
            deployer // initial owner
        );

        vm.stopBroadcast();

        console.log("New Qiao deployed at:", address(qiao));
    }
}
