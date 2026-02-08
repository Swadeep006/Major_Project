import express from "express";
import {
  getPendingReqs,
  changeReq,
} from "../controllers/employeeController.js";

const employeerouter = express.Router();

employeerouter.get("/permission-requests/", getPendingReqs);
employeerouter.patch("/perission-requests/:id", changeReq);
export default employeerouter;
