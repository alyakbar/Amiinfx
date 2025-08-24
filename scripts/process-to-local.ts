import fs from "fs/promises";
import path from "path";
import { saveTransaction } from "../lib/firestore-admin";

const DATA_FILE = path.join(process.cwd(), "data", "mpesa-payments.json");
const OUTPUT_FILE = path.join(process.cwd(), "data", "processed-transactions.json");

interface MpesaPayment {
  merchantRequestID: string;
  checkoutRequestID: string;
  resultCode: number;
  resultDesc: string;
  metadata: {
    Amount?: number;
    MpesaReceiptNumber?: string;
    PhoneNumber?: string;
    TransactionDate?: string;
  };
  request?: {
    amount?: number;
    phone?: string;
    name?: string;
    email?: string;
  };
  receivedAt: string;
  raw: Record<string, unknown>;
}

interface ProcessedTransaction {
  id: string;
  type: 'mpesa';
  status: 'success' | 'failed' | 'cancelled' | 'pending';
  amount: number;
  currency: string;
  email?: string;
  phone?: string;
  name?: string;
  reference: string;
  metadata: Record<string, unknown>;
  paid_at: string;
  raw_data: Record<string, unknown>;
  processed_at: string;
}

function getTransactionStatus(resultCode: number): 'success' | 'failed' | 'cancelled' | 'pending' {
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

function formatMpesaTransactionId(merchantRequestID: string, checkoutRequestID: string): string {
  return `mpesa_${merchantRequestID}_${checkoutRequestID}`;
}

async function processToLocalFile() {
  try {
    console.log("🚀 Starting M-Pesa payments processing (local mode)...");
    console.log("Reading M-Pesa payments from JSON file...");
    
    const fileContent = await fs.readFile(DATA_FILE, "utf8");
    const payments: Record<string, MpesaPayment> = JSON.parse(fileContent);

    console.log(`Found ${Object.keys(payments).length} payment records`);

    // Track processed transactions to avoid duplicates
    const processedTransactions = new Set<string>();
    const transactions: ProcessedTransaction[] = [];
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

        const transaction: ProcessedTransaction = {
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
        // attempt to save to Firestore as well
        try {
          const res = await saveTransaction({
            id: transaction.id,
            type: transaction.type,
            status: transaction.status,
            amount: transaction.amount,
            currency: transaction.currency,
            email: transaction.email || '',
            phone: transaction.phone || '',
            name: transaction.name || '',
            reference: transaction.reference,
            metadata: transaction.metadata,
            paid_at: transaction.paid_at,
            raw_data: transaction.raw_data,
          });
          if (res) console.log(`✅ Saved to Firestore: ${transaction.id}`);
        } catch (err) {
          console.warn(`Could not save to Firestore for ${transaction.id}:`, err);
        }

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
    }, {} as Record<string, number>);

    console.log('\n📈 Transaction Status Summary:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    console.log(`\n💰 Total Transaction Amount: ${totalAmount.toFixed(2)} KES`);

    return transactions;

  } catch (error) {
    console.error("❌ Error processing M-Pesa payments:", error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  processToLocalFile().catch(console.error);
}

export { processToLocalFile };
