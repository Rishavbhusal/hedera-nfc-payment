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
 * @notice Deploy remaining contracts to Hedera Testnet
 * @dev Use this if some contracts failed during initial deployment
 * 
 * Already deployed addresses (from your successful deployment):
 * - TapThatXRegistry: 0x1E3151b584da3a4D0cBDDFAD3f0bb5Bf6acB6C89
 * - TapThatXProtocol: 0x7Cf995Be81C4c4fDD8CEc3c43B6D5C6513f27aB4
 * 
 * This script will deploy:
 * - TapThatXConfiguration
 * - TapThatXExecutor
 * - TapThatXPaymentTerminal
 * - MockUSDC
 */
contract DeployRemaining is ScaffoldETHDeploy {
    // Use the addresses from your successful deployment
    address constant REGISTRY_ADDRESS = 0x1E3151b584da3a4D0cBDDFAD3f0bb5Bf6acB6C89;
    address constant PROTOCOL_ADDRESS = 0x7Cf995Be81C4c4fDD8CEc3c43B6D5C6513f27aB4;

    function run() external ScaffoldEthDeployerRunner {
        require(
            block.chainid == 296,
            "DeployRemaining: Only for Hedera Testnet (296)"
        );

        // Verify existing contracts exist
        require(REGISTRY_ADDRESS.code.length > 0, "Registry not found at expected address");
        require(PROTOCOL_ADDRESS.code.length > 0, "Protocol not found at expected address");

        TapThatXRegistry registry = TapThatXRegistry(payable(REGISTRY_ADDRESS));
        TapThatXProtocol protocol = TapThatXProtocol(payable(PROTOCOL_ADDRESS));

        // Deploy TapThatXConfiguration
        TapThatXConfiguration configuration = new TapThatXConfiguration(address(registry));
        console.log("TapThatXConfiguration deployed at:", address(configuration));
        deployments.push(Deployment({ name: "TapThatXConfiguration", addr: address(configuration) }));

        // Deploy TapThatXExecutor
        TapThatXExecutor executor = new TapThatXExecutor(address(protocol), address(configuration));
        console.log("TapThatXExecutor deployed at:", address(executor));
        deployments.push(Deployment({ name: "TapThatXExecutor", addr: address(executor) }));

        // Deploy TapThatXPaymentTerminal
        TapThatXPaymentTerminal paymentTerminal = new TapThatXPaymentTerminal(address(registry), address(protocol));
        console.log("TapThatXPaymentTerminal deployed at:", address(paymentTerminal));
        deployments.push(Deployment({ name: "TapThatXPaymentTerminal", addr: address(paymentTerminal) }));

        // Deploy MockUSDC
        MockUSDC usdc = new MockUSDC();
        console.log("MockUSDC deployed at:", address(usdc));
        deployments.push(Deployment({ name: "MockUSDC", addr: address(usdc) }));

        console.log("\n=== Remaining Contracts Deployed ===");
        console.log("Chain ID: 296 (Hedera Testnet)");
        console.log("TapThatXConfiguration:", address(configuration));
        console.log("TapThatXExecutor:", address(executor));
        console.log("TapThatXPaymentTerminal:", address(paymentTerminal));
        console.log("MockUSDC:", address(usdc));
        console.log("\nView on HashScan: https://hashscan.io/testnet");
    }
}

