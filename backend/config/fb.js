import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

// Initialize the app using the environment variable automatically
const app = initializeApp({
  credential: applicationDefault(),
});

// Export the services for use in your controllers
export const db = getFirestore(app);
export const auth = getAuth(app); 