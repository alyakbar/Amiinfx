// Use require to avoid needing @types/dotenv in dev dependencies for simple scripts
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { config } = require('dotenv');
import { processMpesaPayments } from '../scripts/process-mpesa-payments';

// Load environment variables
config();

async function main() {
  try {
    console.log('🚀 Starting M-Pesa payments processing...');
    
    // Check if Firebase service account is configured
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON && !process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      console.warn('⚠️  Warning: Firebase service account not configured. Make sure you have set:');
      console.warn('   - FIREBASE_SERVICE_ACCOUNT_JSON (JSON string) or');
      console.warn('   - FIREBASE_SERVICE_ACCOUNT_PATH (file path)');
      console.warn('   in your environment variables.');
    }
    
    // Run the processing
    await processMpesaPayments();
    
    console.log('✅ Processing completed successfully!');
    console.log('\n📋 What was done:');
    console.log('   • Read M-Pesa payments from data/mpesa-payments.json');
    console.log('   • Converted payment data to standardized transaction format');
    console.log('   • Saved transactions to Firestore "transactions" collection');
    console.log('   • Deduplicated records based on transaction IDs');
    console.log('\n🔗 Next steps:');
    console.log('   • Visit /admin/transactions in your web app to view the results');
    console.log('   • Use the /api/transactions endpoint to fetch transaction data');
    
  } catch (error) {
    console.error('❌ Error running payment processing:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ENOENT') && error.message.includes('mpesa-payments.json')) {
        console.error('\n💡 Tip: Make sure the data/mpesa-payments.json file exists');
      }
      if (error.message.includes('Firebase')) {
        console.error('\n💡 Tip: Check your Firebase configuration and service account credentials');
      }
    }
    
    process.exit(1);
  }
}

// Run the script
main();
