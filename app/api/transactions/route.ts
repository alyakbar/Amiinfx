
import { NextResponse } from "next/server";
import { getAllTransactions } from "@/lib/firestore-admin";
import fs from "fs/promises";
import path from "path";
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function getLocalTransactions() {
  try {
    const filePath = path.join(process.cwd(), "data", "processed-transactions.json");
    const fileContent = await fs.readFile(filePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.warn("Could not read local transactions file:", error);
    return [];
  }
}

export async function GET() {
  try {
    console.log("Fetching transactions...");
    
    // Try to get from Firestore first
    let transactions = await getAllTransactions();
    
    // If no transactions from Firestore, try local file
    if (!transactions || transactions.length === 0) {
      console.log("No Firestore transactions found, trying local file...");
      transactions = await getLocalTransactions();
    }
    
    console.log(`Retrieved ${transactions.length} transactions`);
    
    return NextResponse.json({ 
      transactions,
      count: transactions.length,
      success: true,
      source: transactions.length > 0 && 'createdAt' in transactions[0] ? 'firestore' : 'local'
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ 
      error: "Failed to fetch transactions",
      success: false 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (body.action === "process_mpesa_payments") {
      // Import and run the M-Pesa processing script
      const { processMpesaPayments } = await import("@/scripts/process-mpesa-payments");
      await processMpesaPayments();
      
      return NextResponse.json({ 
        success: true,
        message: "M-Pesa payments processing completed" 
      });
    }
    
    if (body.action === "process_local") {
      // Run local processing
      try {        
        await execPromise('node scripts/process-final.js');
        
        return NextResponse.json({ 
          success: true,
          message: "Local M-Pesa payments processing completed" 
        });
      } catch (error) {
        console.error("Local processing error:", error);
        return NextResponse.json({ 
          error: "Local processing failed",
          success: false 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      error: "Invalid action",
      success: false 
    }, { status: 400 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ 
      error: "Failed to process request",
      success: false 
    }, { status: 500 });
  }
}
