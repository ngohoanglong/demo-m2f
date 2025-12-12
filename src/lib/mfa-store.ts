import fs from "fs";
import path from "path";

interface MFAData {
  secret: string;
  backupCodes: string[];
  enabled?: boolean;
}

type MFAStore = Record<string, MFAData>;

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "mfa-store.json");

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read MFA store from file
export function readMFAStore(): MFAStore {
  try {
    ensureDataDir();
    if (!fs.existsSync(STORE_FILE)) {
      return {};
    }
    const data = fs.readFileSync(STORE_FILE, "utf-8");
    return JSON.parse(data) as MFAStore;
  } catch (error) {
    console.error("Error reading MFA store:", error);
    return {};
  }
}

// Write MFA store to file
export function writeMFAStore(store: MFAStore): void {
  try {
    ensureDataDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing MFA store:", error);
    throw error;
  }
}

// Get MFA data for a user
export function getMFAData(userId: string): MFAData | null {
  const store = readMFAStore();
  return store[userId] || null;
}

// Set MFA data for a user
export function setMFAData(userId: string, data: MFAData): void {
  const store = readMFAStore();
  store[userId] = data;
  writeMFAStore(store);
}

// Update MFA data for a user
export function updateMFAData(userId: string, updates: Partial<MFAData>): void {
  const store = readMFAStore();
  if (store[userId]) {
    store[userId] = { ...store[userId], ...updates };
    writeMFAStore(store);
  }
}

// Delete MFA data for a user
export function deleteMFAData(userId: string): void {
  const store = readMFAStore();
  if (store[userId]) {
    delete store[userId];
    writeMFAStore(store);
  }
}
