import { db } from "../config/fb.js";
import { FieldValue } from "firebase-admin/firestore";

export const postRequest = async (req, res) => {
  try {
    const { reason, destination, rollNo } = req.body;
    if (!reason || !destination) {
      return res
        .status(400)
        .json({ error: "Reason and destination are required" });
    }
    const docRef = await db.collection("posts").add({
      reason,
      destination,
      rollNo,
      is_incharge: 0,
      is_HOD: 0,
      is_exit: false,
      timeOfExit: null,
      createdAt: FieldValue.serverTimestamp(),
    });
    res.status(201).json({
      message: "Request Applied successfully",
      requestId: docRef.id,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to submit request" });
  }
};
