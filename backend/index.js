import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import studentRoutes from "./routes/studentRoutes.js";
import employeeRoutes from "./routes/employeeRoute.js";
import infoRoutes from "./routes/infoRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/student", studentRoutes);
app.use("/employee", employeeRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
