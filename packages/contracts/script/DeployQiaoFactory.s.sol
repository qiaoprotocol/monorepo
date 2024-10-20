// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Script.sol";
import "../src/QiaoFactory.sol";

contract DeployQiaoFactory is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        QiaoFactory factory = new QiaoFactory();

        vm.stopBroadcast();

        console.log("Factory deployed at:", address(factory));
    }
}
