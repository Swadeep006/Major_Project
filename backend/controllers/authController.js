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
      department,
      phone,
      email,
      createdAt: FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: "Employee created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
