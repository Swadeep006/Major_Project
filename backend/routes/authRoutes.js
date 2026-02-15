import express from "express";
import {
  studentSignUp,
  employeeSignup,
  getUserProfile,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/student/signup", studentSignUp);
router.post("/employee/signup", employeeSignup);
router.get("/user/:uid", getUserProfile);

export default router;
