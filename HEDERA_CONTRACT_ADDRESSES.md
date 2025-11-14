# 📋 Hedera Testnet Contract Addresses

## ✅ Successfully Deployed Contracts

### Core Contracts
- **TapThatXRegistry**: `0x1E3151b584da3a4D0cBDDFAD3f0bb5Bf6acB6C89`
  - HashScan: https://hashscan.io/testnet/contract/0x1E3151b584da3a4D0cBDDFAD3f0bb5Bf6acB6C89

- **TapThatXProtocol**: `0x7Cf995Be81C4c4fDD8CEc3c43B6D5C6513f27aB4`
  - HashScan: https://hashscan.io/testnet/contract/0x7Cf995Be81C4c4fDD8CEc3c43B6D5C6513f27aB4

## ⚠️ Failed Contracts (Need Redeployment)

These contracts failed during the initial deployment. Use `DeployRemaining.s.sol` to deploy them:

- **TapThatXConfiguration**: `0x13443Daa801B6969a55Cd11A45c8DE11a70231AC` (Failed - needs redeployment)
- **TapThatXExecutor**: `0x5CB8B9fa50ba68696148DEa8DfEac6f519486A2a` (Failed - needs redeployment)
- **TapThatXPaymentTerminal**: `0x19D3FA24ec8171d0B273c0Bc6D7FA42Ca7522D2e` (Failed - needs redeployment)
- **MockUSDC**: `0x742c507DD534C35d543c39f74e29c34f51446313` (Failed - needs redeployment)

## 🚀 Deploy Remaining Contracts

To deploy the remaining contracts, run:

```bash
cd /home/dean/nfc-project/nfc-payment-agent/packages/foundry

forge script script/DeployRemaining.s.sol \
  --rpc-url hedera_testnet \
  --broadcast \
  --private-key 0x7d32d563dce16341cb8bfd41b957a2b37ebf102d4a20cc18cbe187b123f12e94
```

After successful deployment, update this file with the new addresses.

## 📝 Network Information

- **Network**: Hedera Testnet
- **Chain ID**: 296
- **RPC URL**: https://testnet.hashio.io/api
- **Explorer**: https://hashscan.io/testnet

## 🔗 Quick Links

- [HashScan Testnet Explorer](https://hashscan.io/testnet)
- [View All Contracts](https://hashscan.io/testnet/contracts)


