import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";
import fs from "fs";

// Load environment variables
dotenv.config();

let app;

let cred = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// Remove quotes if accidentally added
if (cred) {
  cred = cred.replace(/['"]+/g, '');
}

console.log("Debug Cred:", cred ? "Found" : "Not Found");

try {
  if (cred) {
    // 🔥 Case 1: Render (JSON string)
    if (cred.trim().startsWith("{")) {
      const serviceAccount = JSON.parse(cred);

      app = initializeApp({
        credential: cert(serviceAccount),
      });

      console.log("✅ Firebase initialized using ENV JSON");
    } 
    // 🧊 Case 2: Local (file path)
    else if (fs.existsSync(cred)) {
      const serviceAccount = JSON.parse(fs.readFileSync(cred, "utf8"));

      app = initializeApp({
        credential: cert(serviceAccount),
      });

      console.log("✅ Firebase initialized using file path");
    } 
    else {
      throw new Error("❌ Invalid GOOGLE_APPLICATION_CREDENTIALS");
    }
  } 
  // ⚙️ Case 3: Default credentials (fallback)
  else {
    app = initializeApp({
      credential: applicationDefault(),
    });

    console.log("⚙️ Firebase initialized using default credentials");
  }
} catch (error) {
  console.error("🔥 Firebase Init Error:", error);
}

// Export services
export const db = getFirestore(app);
export const auth = getAuth(app);