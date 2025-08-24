console.log("🚀 Transaction Processing Script Starting...");

const fs = require('fs').promises;
const path = require('path');

async function main() {
  try {
    const DATA_FILE = path.join(process.cwd(), "data", "mpesa-payments.json");
    console.log("📁 Looking for file:", DATA_FILE);
    
    // Check if file exists
    try {
      const stats = await fs.stat(DATA_FILE);
      console.log("✅ File found, size:", stats.size, "bytes");
    } catch (error) {
      console.error("❌ File not found:", error.message);
      return;
    }

    // Read and parse the file
    const fileContent = await fs.readFile(DATA_FILE, "utf8");
    const payments = JSON.parse(fileContent);
    
    console.log("📊 Found", Object.keys(payments).length, "payment records");
    
    // Show first few keys as sample
    const sampleKeys = Object.keys(payments).slice(0, 3);
    console.log("📋 Sample payment IDs:", sampleKeys);
    
    // Analyze the data
    let successCount = 0;
    let cancelledCount = 0;
    let failedCount = 0;
    let totalAmount = 0;
    
    const processedTransactions = new Set();
    
    for (const [key, payment] of Object.entries(payments)) {
      // Create unique ID
      const transactionId = `mpesa_${payment.merchantRequestID}_${payment.checkoutRequestID}`;
      
      // Skip duplicates
      if (processedTransactions.has(transactionId)) {
        continue;
      }
      processedTransactions.add(transactionId);
      
      // Analyze status
      switch (payment.resultCode) {
        case 0:
          successCount++;
          break;
        case 1032:
          cancelledCount++;
          break;
        default:
          failedCount++;
      }
      
      // Calculate amount
      const amount = payment.metadata?.Amount || payment.request?.amount || 0;
      totalAmount += typeof amount === 'number' ? amount / 100 : 0;
    }
    
    console.log("\n📈 Analysis Results:");
    console.log("   Total unique transactions:", processedTransactions.size);
    console.log("   Successful payments:", successCount);
    console.log("   Cancelled payments:", cancelledCount);  
    console.log("   Failed payments:", failedCount);
    console.log("   Total amount:", totalAmount.toFixed(2), "KES");
    
    console.log("\n✅ Analysis completed successfully!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

main();
