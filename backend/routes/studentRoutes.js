import express from "express";
import { sayHello } from "../controllers/studentController.js";

const studentrouter = express.Router();

studentrouter.get("/hello", sayHello);

export default studentrouter;
