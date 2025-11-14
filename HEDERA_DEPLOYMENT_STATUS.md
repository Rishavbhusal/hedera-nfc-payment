# 📊 Hedera Testnet Deployment Status

## ✅ Successfully Deployed (3/6)

1. **TapThatXRegistry**: `0xC99b7352a86C0eFfbc72c4c1E9917480054a7B7e`
   - Transaction: `0x9208a34c2125ec5369e7a4339617cc0bfadec4d6e8d8bdf9e1d23a20f6b62d72`
   - HashScan: https://hashscan.io/testnet/contract/0xC99b7352a86C0eFfbc72c4c1E9917480054a7B7e

2. **TapThatXProtocol**: `0xA62f8b424b2Ca1797F4f299eE1354D6F2B684F7e`
   - Transaction: `0x2674aff68fdf3ab371d92e3cfa438ded8550032a947437be86e5226cf9a0a18b`
   - HashScan: https://hashscan.io/testnet/contract/0xA62f8b424b2Ca1797F4f299eE1354D6F2B684F7e

3. **TapThatXConfiguration**: `0x53d9128B8D1cBA182b18fa0825B92a497a385554`
   - Transaction: `0x68a8869f7fcddf9a2b399dc6ddb5fff1ea9d1106db9a8671c81ed850e4d56fee`
   - HashScan: https://hashscan.io/testnet/contract/0x53d9128B8D1cBA182b18fa0825B92a497a385554

## ❌ Failed (3/6) - Need Redeployment

4. **TapThatXExecutor**: Failed
   - Transaction Hash: `0x357f054b84b735c770976334411a96325c04c6733f2e9d5009d29f4a23f623e3`
   - Expected Address: `0xF88F18f475d402BC214E4f647531928275Ffd428`

5. **TapThatXPaymentTerminal**: Failed
   - Transaction Hash: `0x5c0df55fad6c3b4dbbbf73faa6e91086c768a8258e060b1ff50840c8141b8338`
   - Expected Address: `0x293534ea36Bf186a3a8a0e4f1cfB2E3DD2597280`

6. **MockUSDC**: Failed
   - Transaction Hash: `0xd1bb55baddec28c9c67b283023bd1bb6bdb97c2a79e784b7f37fd37e1cc24801`
   - Expected Address: `0x1C29754Da270132B74796370d395D95afaCe0B97`

## 🚀 Deploy Remaining Contracts

Run this command to deploy the 3 failed contracts:

```bash
cd /home/dean/nfc-project/nfc-payment-agent/packages/foundry

forge script script/DeployRemainingHedera.s.sol \
  --rpc-url hedera_testnet \
  --broadcast \
  --private-key 0x7d32d563dce16341cb8bfd41b957a2b37ebf102d4a20cc18cbe187b123f12e94
```

## 📝 Network Information

- **Network**: Hedera Testnet
- **Chain ID**: 296
- **RPC URL**: https://testnet.hashio.io/api
- **Explorer**: https://hashscan.io/testnet


