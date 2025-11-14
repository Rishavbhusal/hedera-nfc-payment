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
 * @notice Deploy all contracts to Hedera Testnet in one go
 * @dev This script deploys all contracts sequentially to avoid nonce issues
 */
contract DeployAllHedera is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        require(
            block.chainid == 296,
            "DeployAllHedera: Only for Hedera Testnet (296)"
        );

        console.log("\n=== Starting Hedera Testnet Deployment ===\n");

        // Step 1: Deploy TapThatXRegistry
        console.log("Deploying TapThatXRegistry...");
        TapThatXRegistry registry = new TapThatXRegistry();
        console.log("TapThatXRegistry deployed at:", address(registry));
        deployments.push(Deployment({ name: "TapThatXRegistry", addr: address(registry) }));

        // Step 2: Deploy TapThatXProtocol (depends on Registry)
        console.log("Deploying TapThatXProtocol...");
        TapThatXProtocol protocol = new TapThatXProtocol(address(registry));
        console.log("TapThatXProtocol deployed at:", address(protocol));
        deployments.push(Deployment({ name: "TapThatXProtocol", addr: address(protocol) }));

        // Step 3: Deploy TapThatXConfiguration (depends on Registry)
        console.log("Deploying TapThatXConfiguration...");
        TapThatXConfiguration configuration = new TapThatXConfiguration(address(registry));
        console.log("TapThatXConfiguration deployed at:", address(configuration));
        deployments.push(Deployment({ name: "TapThatXConfiguration", addr: address(configuration) }));

        // Step 4: Deploy TapThatXExecutor (depends on Protocol and Configuration)
        console.log("Deploying TapThatXExecutor...");
        TapThatXExecutor executor = new TapThatXExecutor(address(protocol), address(configuration));
        console.log("TapThatXExecutor deployed at:", address(executor));
        deployments.push(Deployment({ name: "TapThatXExecutor", addr: address(executor) }));

        // Step 5: Deploy TapThatXPaymentTerminal (depends on Registry and Protocol)
        console.log("Deploying TapThatXPaymentTerminal...");
        TapThatXPaymentTerminal paymentTerminal = new TapThatXPaymentTerminal(address(registry), address(protocol));
        console.log("TapThatXPaymentTerminal deployed at:", address(paymentTerminal));
        deployments.push(Deployment({ name: "TapThatXPaymentTerminal", addr: address(paymentTerminal) }));

        // Step 6: Deploy MockUSDC
        console.log("Deploying MockUSDC...");
        MockUSDC usdc = new MockUSDC();
        console.log("MockUSDC deployed at:", address(usdc));
        deployments.push(Deployment({ name: "MockUSDC", addr: address(usdc) }));

        // Summary
        console.log("\n=== Deployment Complete ===");
        console.log("Chain ID: 296 (Hedera Testnet)");
        console.log("TapThatXRegistry:", address(registry));
        console.log("TapThatXProtocol:", address(protocol));
        console.log("TapThatXConfiguration:", address(configuration));
        console.log("TapThatXExecutor:", address(executor));
        console.log("TapThatXPaymentTerminal:", address(paymentTerminal));
        console.log("MockUSDC:", address(usdc));
        console.log("\nView on HashScan: https://hashscan.io/testnet");
        console.log("\nNext: yarn verify --network hedera_testnet");
    }
}


