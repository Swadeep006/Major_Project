import express from "express";
import { postRequest } from "../controllers/studentController.js";

const studentrouter = express.Router();

studentrouter.post("/permission-request", postRequest);
export default studentrouter;
