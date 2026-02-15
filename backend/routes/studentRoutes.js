import express from "express";
import { postRequest, getFaculty, getStudentRequests, getEmployeesByDepartment } from "../controllers/studentController.js";

const studentrouter = express.Router();

studentrouter.get("/employees/incharge", getFaculty);
studentrouter.get("/employees", getEmployeesByDepartment);
studentrouter.post("/permission-request", postRequest);
studentrouter.get("/requests/:studentId", getStudentRequests);

export default studentrouter;
