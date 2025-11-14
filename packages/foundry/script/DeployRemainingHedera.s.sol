// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { MockUSDC } from "../contracts/MockUSDC.sol";
import { TapThatXConfiguration } from "../contracts/core/TapThatXConfiguration.sol";
import { TapThatXExecutor } from "../contracts/core/TapThatXExecutor.sol";
import { TapThatXPaymentTerminal } from "../contracts/extensions/TapThatXPaymentTerminal.sol";
import { TapThatXProtocol } from "../contracts/core/TapThatXProtocol.sol";
import { TapThatXRegistry } from "../contracts/core/TapThatXRegistry.sol";

/**
 * @notice Deploy remaining failed contracts to Hedera Testnet
 * @dev Uses the successfully deployed contracts from DeployAllHedera
 */
contract DeployRemainingHedera is ScaffoldETHDeploy {
    // Use the addresses from successful deployment
    address constant REGISTRY_ADDRESS = 0xC99b7352a86C0eFfbc72c4c1E9917480054a7B7e;
    address constant PROTOCOL_ADDRESS = 0xA62f8b424b2Ca1797F4f299eE1354D6F2B684F7e;
    address constant CONFIGURATION_ADDRESS = 0x53d9128B8D1cBA182b18fa0825B92a497a385554;

    function run() external ScaffoldEthDeployerRunner {
        require(
            block.chainid == 296,
            "DeployRemainingHedera: Only for Hedera Testnet (296)"
        );

        console.log("\n=== Deploying Remaining Contracts to Hedera Testnet ===\n");

        // Verify existing contracts exist
        require(REGISTRY_ADDRESS.code.length > 0, "Registry not found at expected address");
        require(PROTOCOL_ADDRESS.code.length > 0, "Protocol not found at expected address");
        require(CONFIGURATION_ADDRESS.code.length > 0, "Configuration not found at expected address");

        TapThatXRegistry registry = TapThatXRegistry(payable(REGISTRY_ADDRESS));
        TapThatXProtocol protocol = TapThatXProtocol(payable(PROTOCOL_ADDRESS));
        TapThatXConfiguration configuration = TapThatXConfiguration(payable(CONFIGURATION_ADDRESS));

        // Deploy TapThatXExecutor
        console.log("Deploying TapThatXExecutor...");
        TapThatXExecutor executor = new TapThatXExecutor(address(protocol), address(configuration));
        console.log("TapThatXExecutor deployed at:", address(executor));
        deployments.push(Deployment({ name: "TapThatXExecutor", addr: address(executor) }));

        // Deploy TapThatXPaymentTerminal
        console.log("Deploying TapThatXPaymentTerminal...");
        TapThatXPaymentTerminal paymentTerminal = new TapThatXPaymentTerminal(address(registry), address(protocol));
        console.log("TapThatXPaymentTerminal deployed at:", address(paymentTerminal));
        deployments.push(Deployment({ name: "TapThatXPaymentTerminal", addr: address(paymentTerminal) }));

        // Deploy MockUSDC
        console.log("Deploying MockUSDC...");
        MockUSDC usdc = new MockUSDC();
        console.log("MockUSDC deployed at:", address(usdc));
        deployments.push(Deployment({ name: "MockUSDC", addr: address(usdc) }));

        // Summary
        console.log("\n=== Remaining Contracts Deployed ===");
        console.log("Chain ID: 296 (Hedera Testnet)");
        console.log("TapThatXExecutor:", address(executor));
        console.log("TapThatXPaymentTerminal:", address(paymentTerminal));
        console.log("MockUSDC:", address(usdc));
        console.log("\nView on HashScan: https://hashscan.io/testnet");
    }
}

