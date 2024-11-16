import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import connectMongoDb from "./db/connectMongoDb.js";

dotenv.config();
// console.log(process.env.MONGO_URI);
const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use("/api/auth", authRoutes);
// for json request // to parse req.body
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}`);
  connectMongoDb();
});
