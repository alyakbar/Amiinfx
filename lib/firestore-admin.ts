import admin from "firebase-admin";

let db: admin.firestore.Firestore | null = null;

function initAdmin() {
  if (admin.apps.length === 0) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    let serviceAccount: Record<string, unknown> | null = null;

    if (serviceAccountJson) {
      try {
        serviceAccount = JSON.parse(serviceAccountJson);
      } catch (err) {
        console.error("Invalid FIREBASE_SERVICE_ACCOUNT_JSON", err);
      }
    } else if (serviceAccountPath) {
      try {
        const fs = require("fs");
        const raw = fs.readFileSync(serviceAccountPath, "utf8");
        serviceAccount = JSON.parse(String(raw));
      } catch (err) {
        console.error("Failed to read FIREBASE_SERVICE_ACCOUNT_PATH", err);
      }
    } else {
      console.warn("FIREBASE_SERVICE_ACCOUNT_JSON and FIREBASE_SERVICE_ACCOUNT_PATH not set; Firestore admin not initialized.");
      return;
    }

    if (!serviceAccount) {
      console.warn("Service account not available; Firestore admin not initialized.");
      return;
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
    });
  }

  db = admin.firestore();
}

export function getFirestoreAdmin(): admin.firestore.Firestore | null {
  if (!db) initAdmin();
  return db;
}

export async function saveMpesaTransaction(record: Record<string, unknown>) {
  const database = getFirestoreAdmin();
  if (!database) {
    return null;
  }

  try {
    // Remove undefined properties so Firestore doesn't reject the document
    const cleaned = cleanForFirestore(record);
    const docRef = await database.collection("mpesaTransactions").add({
      ...cleaned,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error("Failed to write mpesa transaction to Firestore:", err);
    return null;
  }
}

export async function saveTransaction(transaction: {
  id: string;
  type: 'mpesa' | 'paystack' | 'paddle' | string;
  status: 'success' | 'failed' | 'pending' | 'cancelled';
  amount: number;
  currency: string;
  email?: string;
  phone?: string;
  name?: string;
  reference: string;
  metadata?: Record<string, unknown>;
  paid_at?: string;
  raw_data?: Record<string, unknown>;
}) {
  const database = getFirestoreAdmin();
  if (!database) {
    return null;
  }

  try {
    // Remove undefined properties (Firestore rejects undefined values)
    const cleaned = cleanForFirestore(transaction);
    const docRef = await database.collection("transactions").doc(transaction.id);
    await docRef.set({
      ...cleaned,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return transaction.id;
  } catch (err) {
    console.error("Failed to write transaction to Firestore:", err);
    return null;
  }
}

function cleanForFirestore<T>(input: T): T {
  try {
    // JSON serialize/deserialize removes undefined properties.
    // This is a simple and safe way to strip undefined before sending to Firestore.
    return JSON.parse(JSON.stringify(input));
  } catch {
    // If serialization fails, return the original object and let Firestore handle/report errors.
    return input;
  }
}

export async function getAllTransactions() {
  const database = getFirestoreAdmin();
  if (!database) {
    return [];
  }

  try {
    const snapshot = await database.collection("transactions").orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error("Failed to fetch transactions from Firestore:", err);
    return [];
  }
}
