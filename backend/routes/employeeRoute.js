import express from "express";
import {
  getEmployeeRequests,
  updateRequestStatus,
  verifyCode,
  markExit
} from "../controllers/employeeController.js";

const employeerouter = express.Router();

employeerouter.get("/requests", getEmployeeRequests);
employeerouter.patch("/requests/:id", updateRequestStatus);
employeerouter.post("/verify-code", verifyCode); // Security
employeerouter.post("/mark-exit", markExit);     // Security

export default employeerouter;
