import { db } from "../config/fb.js";
import { FieldValue } from "firebase-admin/firestore";

// Helper to generate a unique 6-digit code
const generateUniqueCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getEmployeeRequests = async (req, res) => {
  try {
    const { employeeId, role, department } = req.query; // Assuming passed as query params for now

    let query = db.collection("posts");

    if (role === "incharge") {
      // Incharge sees new requests assigned to them
      query = query.where("inchargeId", "==", employeeId);
    } else if (role === "hod") {
      // HOD sees requests approved by Incharge for their department (Current + History)
      query = query
        .where("inchargeStatus", "==", "Accepted")
        .where("department", "==", department);
    } else if (role === "security") {
      // Security sees completed/approved requests. For history, they usually want 'Completed'.
      // For verification, they use verifyCode endpoint.
      // Here we return Completed requests for History page.
      query = query.where("status", "==", "Completed");
    }

    const snapshot = await query.get();
    const requests = [];
    snapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });

    // Fetch Incharge Name using inchargeId
    const uniqueInchargeIds = [...new Set(requests.map(r => r.inchargeId).filter(id => id))];
    if (uniqueInchargeIds.length > 0) {
      const employeesSnapshot = await Promise.all(
        uniqueInchargeIds.map(id => db.collection("employees").doc(id).get())
      );

      const employeeNameMap = {};
      employeesSnapshot.forEach(doc => {
        if (doc.exists) {
          employeeNameMap[doc.id] = doc.data().name;
        }
      });

      requests.forEach(req => {
        if (req.inchargeId && employeeNameMap[req.inchargeId]) {
          req.inchargeName = employeeNameMap[req.inchargeId];
        }
      });
    }

    // Sort requests by createdAt desc
    requests.sort((a, b) => {
      const timeA = a.createdAt ? (a.createdAt._seconds || 0) : 0;
      const timeB = b.createdAt ? (b.createdAt._seconds || 0) : 0;
      return timeB - timeA;
    });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching employee requests:", error);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status, remarks, approverName } = req.body; // status: 'Accepted' or 'Rejected'

    const requestRef = db.collection("posts").doc(id);
    const doc = await requestRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Request not found" });
    }

    const updates = {
      remarks: remarks || doc.data().remarks,
    };

    if (role === "incharge") {
      if (approverName) {
        updates.inchargeName = approverName;
      }
      if (status === "Accepted") {
        updates.inchargeStatus = "Accepted";
        updates.stage = "HOD"; // Move to HOD
      } else {
        updates.inchargeStatus = "Rejected";
        updates.status = "Rejected"; // Overall status
        updates.stage = "Completed";
      }
    } else if (role === "hod") {
      if (approverName) {
        updates.hodName = approverName;
      }
      if (status === "Accepted") {
        updates.hodStatus = "Accepted";
        updates.status = "Approved"; // Overall status
        updates.stage = "Security";
        updates.uniqueCode = generateUniqueCode();
      } else {
        updates.hodStatus = "Rejected";
        updates.status = "Rejected";
        updates.stage = "Completed";
      }
    }

    await requestRef.update(updates);

    // Fetch updated doc to return
    const updatedDoc = await requestRef.get();

    res.status(200).json({ message: "Request updated", data: updatedDoc.data() });
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({ error: "Failed to update request" });
  }
};

export const verifyCode = async (req, res) => {
  try {
    const { code } = req.body;

    // Find request with this code and status Approved
    const snapshot = await db.collection("posts")
      .where("uniqueCode", "==", code)
      .where("status", "==", "Approved")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Invalid or expired code" });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    if (data.exitTime) {
      return res.status(400).json({ error: "Code already used for exit" });
    }

    res.status(200).json({
      valid: true,
      requestId: doc.id,
      ...data // Return full data so frontend can show reasons, remarks, etc.
    });

  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
};

export const markExit = async (req, res) => {
  try {
    const { requestId } = req.body;
    const requestRef = db.collection("posts").doc(requestId);

    await requestRef.update({
      exitTime: FieldValue.serverTimestamp(),
      stage: "Completed",
      status: "Completed" // Or "Exited"
    });

    res.status(200).json({ message: "Exit logged successfully" });

  } catch (error) {
    res.status(500).json({ error: "Failed to log exit" });
  }
};