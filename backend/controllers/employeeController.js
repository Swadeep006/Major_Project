import { db } from "../config/fb.js";
import { FieldValue } from "firebase-admin/firestore";

export const getPendingReqs = async (req, res) => {
  res.status(200).json({ message: "successful fetch" });
};

export const changeReq = async (req, res) => {
  res.status(200).json({ message: "successful change" });
};