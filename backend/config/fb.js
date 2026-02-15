import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";
import fs from "fs";

// Load environment variables from .env
dotenv.config();

let app;

// Robust check for credentials
let credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (credPath) {
  credPath = credPath.replace(/['"]+/g, '');
}

console.log(`Debug Cred Path: ${credPath}`);

try {
  if (credPath && fs.existsSync(credPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf8'));
    app = initializeApp({
      credential: cert(serviceAccount)
    });
    console.log("Firebase (cert) initialized");
  } else {
    console.log("Using default credentials");
    app = initializeApp({
      credential: applicationDefault(),
    });
    console.log("Firebase (default) initialized");
  }
} catch (error) {
  console.error("Firebase Init Error:", error);
  // process.exit(1); Don't exit, let user see error in nodemon loop
}

// Export the services for use in your controllers
export const db = getFirestore(app);
export const auth = getAuth(app); 