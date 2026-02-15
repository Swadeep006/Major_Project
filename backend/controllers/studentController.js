import { db } from "../config/fb.js";
import { FieldValue } from "firebase-admin/firestore";

export const getFaculty = async (req, res) => {
  try {
    const facultySnapshot = await db
      .collection("employees")
      .where("role", "==", "incharge")
      .get();

    const faculty = [];
    facultySnapshot.forEach((doc) => {
      faculty.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(faculty);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch faculty list" });
  }
};

export const getEmployeesByDepartment = async (req, res) => {
  try {
    const { department, role } = req.query;

    let query = db.collection("employees");

    if (department) {
      query = query.where("department", "==", department);
    }

    if (role) {
      query = query.where("role", "==", role);
    }

    const snapshot = await query.get();

    const employees = [];
    snapshot.forEach((doc) => {
      employees.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

export const postRequest = async (req, res) => {
  try {
    const { reason, destination, rollNo, inchargeId, inchargeName, studentId, studentName, department, yearSection } = req.body;

    if (!reason || !destination || !inchargeId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const docRef = await db.collection("posts").add({
      studentId, // UID of the student
      name: studentName,
      rollNo,
      department,
      yearSection,
      reason,
      destination,
      inchargeId,
      inchargeName: inchargeName || null,
      status: "Pending", // Overall status: Pending, Rejected, Approved
      stage: "Incharge", // Current stage: Incharge, HOD, Security, Completed
      inchargeStatus: "Pending",
      hodStatus: "Pending",
      uniqueCode: null,
      exitTime: null,
      remarks: "",
      createdAt: FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      message: "Request Applied successfully",
      requestId: docRef.id,
    });
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ error: "Failed to submit request" });
  }
};

export const getStudentRequests = async (req, res) => {
  try {
    const { studentId } = req.params;
    const requestsSnapshot = await db
      .collection("posts")
      .where("studentId", "==", studentId)
      // .orderBy("createdAt", "desc") // Sort in JS to avoid index requirement
      .get();

    const requests = [];
    requestsSnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });

    // Sort heavily in memory
    requests.sort((a, b) => {
      const timeA = a.createdAt ? (a.createdAt._seconds || 0) : 0;
      const timeB = b.createdAt ? (b.createdAt._seconds || 0) : 0;
      return timeB - timeA;
    });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};
