import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import connectMongoDb from "./db/connectMongoDb.js";

dotenv.config();
// console.log(process.env.MONGO_URI);
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware for JSON and URL-encoded data
app.use(express.json()); // Parses JSON bodies
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

//Middleware for requests
app.use(cookieParser()); //to get token we created for cookie.
// middleware
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}`);
  connectMongoDb();
});
