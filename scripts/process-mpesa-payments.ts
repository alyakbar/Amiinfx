import fs from "fs/promises";
import path from "path";
import { saveTransaction } from "../lib/firestore-admin";

const DATA_FILE = path.join(process.cwd(), "data", "mpesa-payments.json");

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

async function processMpesaPayments() {
  try {
    console.log("Reading M-Pesa payments from JSON file...");
    const fileContent = await fs.readFile(DATA_FILE, "utf8");
    const payments: Record<string, MpesaPayment> = JSON.parse(fileContent);

    console.log(`Found ${Object.keys(payments).length} payment records`);

    // Track processed transactions to avoid duplicates
    const processedTransactions = new Set<string>();
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
          type: 'mpesa' as const,
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
        };

        console.log(`Processing transaction: ${transactionId} - Status: ${status}, Amount: ${actualAmount} KES`);

        const result = await saveTransaction(transaction);
        if (result) {
          successCount++;
          processedTransactions.add(transactionId);
          console.log(`✅ Successfully saved transaction: ${transactionId}`);
        } else {
          failedCount++;
          console.error(`❌ Failed to save transaction: ${transactionId}`);
        }
      } catch (error) {
        failedCount++;
        console.error(`❌ Error processing transaction ${transactionId}:`, error);
      }
    }

    console.log(`\n📊 Processing Summary:`);
    console.log(`Total payment records: ${Object.keys(payments).length}`);
    console.log(`Unique transactions processed: ${processedTransactions.size}`);
    console.log(`Successfully saved: ${successCount}`);
    console.log(`Failed to save: ${failedCount}`);

  } catch (error) {
    console.error("Error processing M-Pesa payments:", error);
  }
}

// Run the script
if (require.main === module) {
  processMpesaPayments();
}

export { processMpesaPayments };
