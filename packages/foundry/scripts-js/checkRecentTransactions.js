const REGISTRY_ADDRESS = "0x1C29754Da270132B74796370d395D95afaCe0B97";
const HASHSCAN_API = "https://hashscan.io/testnet/api/v1";

async function checkRecentTransactions() {
  console.log(`\n🔍 Checking recent transactions for: ${REGISTRY_ADDRESS}\n`);
  console.log(`Network: Hedera Testnet\n`);

  try {
    // Query HashScan API for account transactions
    const response = await fetch(
      `${HASHSCAN_API}/accounts/${REGISTRY_ADDRESS}/transactions?limit=20&order=desc`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.transactions || data.transactions.length === 0) {
      console.log("❌ No transactions found for this address.\n");
      console.log("💡 View on HashScan:");
      console.log(`   https://hashscan.io/testnet/address/${REGISTRY_ADDRESS}\n`);
      return;
    }

    console.log(`✅ Found ${data.transactions.length} transaction(s):\n`);

    data.transactions.forEach((tx, index) => {
      const timestamp = tx.consensus_timestamp
        ? new Date(parseInt(tx.consensus_timestamp.split(".")[0]) * 1000).toISOString()
        : "Unknown";

      console.log(`Transaction ${index + 1}:`);
      console.log(`  Hash: ${tx.transaction_hash || tx.transaction_id || "N/A"}`);
      console.log(`  Type: ${tx.name || "Unknown"}`);
      console.log(`  From: ${tx.from || "N/A"}`);
      console.log(`  To: ${tx.to || "N/A"}`);
      console.log(`  Amount: ${tx.amount ? `${tx.amount / 1e8} HBAR` : "N/A"}`);
      console.log(`  Status: ${tx.result === "SUCCESS" ? "✅ Success" : "❌ Failed"}`);
      console.log(`  Timestamp: ${timestamp}`);
      
      if (tx.transaction_hash) {
        console.log(`  HashScan: https://hashscan.io/testnet/transaction/${tx.transaction_hash}`);
      } else if (tx.transaction_id) {
        console.log(`  HashScan: https://hashscan.io/testnet/transaction/${tx.transaction_id}`);
      }
      console.log("");
    });

    // Also check contract info
    console.log("\n📋 Contract Information:\n");
    const contractResponse = await fetch(
      `${HASHSCAN_API}/contracts/${REGISTRY_ADDRESS}`
    );

    if (contractResponse.ok) {
      const contractData = await contractResponse.json();
      console.log(`Contract Address: ${REGISTRY_ADDRESS}`);
      console.log(`Created: ${contractData.created_timestamp || "N/A"}`);
      console.log(`Admin Key: ${contractData.admin_key || "N/A"}`);
      console.log(`Memo: ${contractData.memo || "N/A"}`);
      console.log(`HashScan: https://hashscan.io/testnet/contract/${REGISTRY_ADDRESS}`);
    }

  } catch (error) {
    console.error("❌ Error checking transactions:", error.message);
    console.log("\n💡 Alternative: Check HashScan directly:");
    console.log(`   https://hashscan.io/testnet/address/${REGISTRY_ADDRESS}\n`);
  }
}

checkRecentTransactions().catch(console.error);
