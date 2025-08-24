const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(process.cwd(), "data", "mpesa-payments.json");
const OUTPUT_FILE = path.join(process.cwd(), "data", "processed-transactions.json");

function getTransactionStatus(resultCode) {
  switch (resultCode) {
    case 0:
      return 'success';
    case 1032:
      return 'cancelled';
    case 1037:
      return 'failed'; // No response from user
    default:
      return 'failed';
  }
}

function formatMpesaTransactionId(merchantRequestID, checkoutRequestID) {
  return `mpesa_${merchantRequestID}_${checkoutRequestID}`;
}

async function processToLocalFile() {
  try {
    console.log("🚀 Starting M-Pesa payments processing (local mode)...");
    console.log("Reading M-Pesa payments from JSON file...");
    
    const fileContent = await fs.readFile(DATA_FILE, "utf8");
    const payments = JSON.parse(fileContent);

    console.log(`Found ${Object.keys(payments).length} payment records`);

    // Track processed transactions to avoid duplicates
    const processedTransactions = new Set();
    const transactions = [];
    let successCount = 0;
    let failedCount = 0;

    for (const [, payment] of Object.entries(payments)) {
      // Skip if this is a duplicate (same payment stored under multiple keys)
      const transactionId = formatMpesaTransactionId(
        payment.merchantRequestID,
        payment.checkoutRequestID
      );

      if (processedTransactions.has(transactionId)) {
        console.log(`Skipping duplicate transaction: ${transactionId}`);
        continue;
      }

      try {
        const status = getTransactionStatus(payment.resultCode);
        const amount = payment.metadata?.Amount || payment.request?.amount || 0;
        const phone = payment.metadata?.PhoneNumber || payment.request?.phone || '';
        const email = payment.request?.email || '';
        const name = payment.request?.name || '';
        
        // Convert amount from cents to actual amount if needed
        const actualAmount = typeof amount === 'number' ? amount / 100 : 0;

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

        console.log(`Processing transaction: ${transactionId} - Status: ${status}, Amount: ${actualAmount} KES`);

        transactions.push(transaction);
        successCount++;
        processedTransactions.add(transactionId);
        console.log(`✅ Processed transaction: ${transactionId}`);
      } catch (error) {
        failedCount++;
        console.error(`❌ Error processing transaction ${transactionId}:`, error);
      }
    }

    // Save to local file
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(transactions, null, 2), 'utf8');

    console.log(`\n📊 Processing Summary:`);
    console.log(`Total payment records: ${Object.keys(payments).length}`);
    console.log(`Unique transactions processed: ${processedTransactions.size}`);
    console.log(`Successfully processed: ${successCount}`);
    console.log(`Failed to process: ${failedCount}`);
    console.log(`\n💾 Results saved to: ${OUTPUT_FILE}`);

    // Show sample transactions
    const statusCounts = transactions.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📈 Transaction Status Summary:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    console.log(`\n💰 Total Transaction Amount: ${totalAmount.toFixed(2)} KES`);

    // Show some sample successful transactions
    const successfulTransactions = transactions.filter(t => t.status === 'success');
    if (successfulTransactions.length > 0) {
      console.log('\n🎯 Sample Successful Transactions:');
      successfulTransactions.slice(0, 3).forEach(t => {
        console.log(`   ${t.id}: ${t.amount} ${t.currency} - ${t.phone || t.email || 'No contact'}`);
      });
    }

    return transactions;

  } catch (error) {
    console.error("❌ Error processing M-Pesa payments:", error);
    
    if (error.code === 'ENOENT') {
      console.error(`\n💡 File not found: ${DATA_FILE}`);
      console.error('Make sure the M-Pesa payments JSON file exists.');
    }
    
    throw error;
  }
}

// Run the script
processToLocalFile().catch(console.error);
