import { auth, db } from "../config/fb.js";
import { FieldValue } from "firebase-admin/firestore";

export const studentSignUp = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      rollNumber,
      department,
      yearSection,
      studentPhone,
      parentPhone,
    } = req.body;

    const user = await auth.createUser({
      email,
      password,
    });

    await db.collection("students").doc(user.uid).set({
      name,
      rollNumber,
      department,
      yearSection,
      studentPhone,
      parentPhone,
      email,
      role: "student", // Explicitly saving role
      createdAt: FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      message: "Student registered successfully",
      uid: user.uid,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const employeeSignup = async (req, res) => {
  try {
    const { email, password, name, employeeId, role, department, phone } =
      req.body;

    if (!["hod", "security", "incharge"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await auth.createUser({ email, password });

    await db.collection("employees").doc(user.uid).set({
      name,
      employeeId,
      role,
      department: department || "", // Handle optional department for Security
      phone,
      email,
      createdAt: FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: "Employee created successfully" });
  } catch (error) {
    console.error("Employee Signup Error:", error);
    res.status(400).json({ error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { uid } = req.params;

    // Check Students
    const studentDoc = await db.collection("students").doc(uid).get();
    if (studentDoc.exists) {
      return res.status(200).json({ role: "student", ...studentDoc.data() });
    }

    // Check Employees
    const employeeDoc = await db.collection("employees").doc(uid).get();
    if (employeeDoc.exists) {
      return res.status(200).json({ ...employeeDoc.data() });
    }

    res.status(404).json({ error: "User not found" });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};
