import express from "express";
import "dotenv/config.js"
import authRoutes from "./Routes/authRoutes.js";
import connectDb from "./lib/db.js";
import bookRoutes from "./Routes/bookRoutes.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes)
app.use("/api/book", bookRoutes)

app.listen(PORT, () => {
    console.log(`Server is running in ${PORT}`);
    connectDb();
})