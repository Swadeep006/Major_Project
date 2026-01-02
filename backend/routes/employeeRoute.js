import express from "express";
import { sayHelloemp } from "../controllers/employeeController.js"

const employeerouter = express.Router();

employeerouter.get("/helloemployee",sayHelloemp)
export default employeerouter;
