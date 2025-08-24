console.log("🚀 Transaction Processing Script Starting...");

const fs = require('fs').promises;
const path = require('path');

async function processTransactions() {
  try {
    const DATA_FILE = path.join(process.cwd(), "data", "mpesa-payments.json");
    const OUTPUT_FILE = path.join(process.cwd(), "data", "processed-transactions.json");
    
    console.log("📁 Reading file:", DATA_FILE);
    
    const fileContent = await fs.readFile(DATA_FILE, "utf8");
    const payments = JSON.parse(fileContent);
    
    console.log("📊 Found", Object.keys(payments).length, "payment records");
    
    const processedTransactions = new Set();
    const transactions = [];
    let successCount = 0;
    let cancelledCount = 0;
    let failedCount = 0;
    
    for (const [, payment] of Object.entries(payments)) {
      // Create unique ID
      const transactionId = `mpesa_${payment.merchantRequestID}_${payment.checkoutRequestID}`;
      
      // Skip duplicates
      if (processedTransactions.has(transactionId)) {
        console.log(`⏭️  Skipping duplicate: ${transactionId}`);
        continue;
      }
      processedTransactions.add(transactionId);
      
      // Determine status
      let status;
      switch (payment.resultCode) {
        case 0:
          status = 'success';
          successCount++;
          break;
        case 1032:
          status = 'cancelled';
          cancelledCount++;
          break;
        default:
          status = 'failed';
          failedCount++;
      }
      
      // Extract amount and contact details
      const amount = payment.metadata?.Amount || payment.request?.amount || 0;
      const actualAmount = typeof amount === 'number' ? amount / 100 : 0;
      const phone = payment.metadata?.PhoneNumber || payment.request?.phone || '';
      const email = payment.request?.email || '';
      const name = payment.request?.name || '';
      
      const transaction = {
        id: transactionId,
        type: 'mpesa',
        status,
        amount: actualAmount,
        currency: 'KES',
        email,
        phone,
        name,
        reference: payment.checkoutRequestID,
        metadata: {
          merchantRequestID: payment.merchantRequestID,
          resultCode: payment.resultCode,
          resultDesc: payment.resultDesc,
          mpesaReceiptNumber: payment.metadata?.MpesaReceiptNumber,
          transactionDate: payment.metadata?.TransactionDate,
        },
        paid_at: payment.receivedAt,
        raw_data: payment.raw,
        processed_at: new Date().toISOString(),
      };
      
      transactions.push(transaction);
      console.log(`✅ Processed: ${transactionId} - ${status} - ${actualAmount} KES`);
    }
    
    // Save processed transactions
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(transactions, null, 2), 'utf8');
    
    console.log("\n📊 Processing Complete!");
    console.log(`   Total records processed: ${Object.keys(payments).length}`);
    console.log(`   Unique transactions: ${processedTransactions.size}`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Cancelled: ${cancelledCount}`);
    console.log(`   Failed: ${failedCount}`);
    console.log(`\n💾 Processed transactions saved to: ${OUTPUT_FILE}`);
    
    // Show some sample transactions
    console.log("\n📋 Sample Processed Transactions:");
    transactions.slice(0, 3).forEach(t => {
      console.log(`   ${t.id}:`);
      console.log(`     Status: ${t.status}`);
      console.log(`     Amount: ${t.amount} ${t.currency}`);
      console.log(`     Phone: ${t.phone || 'N/A'}`);
      console.log(`     Date: ${new Date(t.paid_at).toLocaleDateString()}`);
      console.log("");
    });
    
    return transactions;
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

processTransactions();
