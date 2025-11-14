# Check Recent Transactions for TapThatXRegistry

## Address
`0x1C29754Da270132B74796370d395D95afaCe0B97`

## Quick Links

### HashScan Explorer
- **Contract Page**: https://hashscan.io/testnet/contract/0x1C29754Da270132B74796370d395D95afaCe0B97
- **Transactions**: https://hashscan.io/testnet/address/0x1C29754Da270132B74796370d395D95afaCe0B97

## Using Foundry Cast

```bash
# Check if contract exists
cast code --rpc-url https://testnet.hashio.io/api 0x1C29754Da270132B74796370d395D95afaCe0B97

# Get recent logs/events
cast logs --rpc-url https://testnet.hashio.io/api \
  --address 0x1C29754Da270132B74796370d395D95afaCe0B97 \
  --from-block latest-100

# Call getChipOwners to check if a chip is registered
cast call --rpc-url https://testnet.hashio.io/api \
  0x1C29754Da270132B74796370d395D95afaCe0B97 \
  "getChipOwners(address)" \
  0xYOUR_CHIP_ADDRESS
```

## Check Chip Registration

To check if a specific chip address is registered:

```bash
cast call --rpc-url https://testnet.hashio.io/api \
  0x1C29754Da270132B74796370d395D95afaCe0B97 \
  "getChipOwners(address)" \
  0xYOUR_CHIP_ADDRESS
```

If the chip is registered, this will return an array of owner addresses. If empty, the chip is not registered.

