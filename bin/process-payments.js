#!/usr/bin/env node

/**
 * Command-line script to process M-Pesa payments from JSON file
 * Usage: npm run process-payments
 */

import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add the project root to the module search path
const projectRoot = path.resolve(__dirname, '..');
import Module from 'module';
Module.globalPaths.push(path.join(projectRoot, 'node_modules'));

async function main() {
  try {
    console.log('🚀 Starting M-Pesa payments processing...');
    console.log('Project root:', projectRoot);
    
  // Dynamically import the processing function.
  // Use a resolved path so Node/tsx can locate the module correctly.
  const modulePath = path.join(projectRoot, 'scripts', 'process-mpesa-payments.ts');
  const imported = await import(`file://${modulePath}`);
  const { processMpesaPayments } = imported;
    
    // Run the processing
    await processMpesaPayments();
    
    console.log('✅ Processing completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running payment processing:', error);
    process.exit(1);
  }
}

main();
