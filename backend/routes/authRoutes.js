import express from "express";
import {
  studentSignUp,
  employeeSignup,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/student/signup", studentSignUp);
router.post("/employee/signup", employeeSignup);

export default router;
