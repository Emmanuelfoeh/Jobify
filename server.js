import express from "express";

// database connection import
import connectDB from "./db/connect.js";

import dotenv from "dotenv";

// Route
import authRouter from "./routes/authRouter.js"
import jobRoute from "./routes/jobRoute.js"


// middleWares
import errorHandler from "./middleware/error-handler.js";
import notFound from "./middleware/notFound.js";
import morgan from 'morgan'
// import 'express-async-errors' 

import authenticateUser from "./middleware/auth.js"

dotenv.config();

const app = express();

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(express.json())


app.get("/", (req, res) => {
  res.send("Welcome!");
});

app.use('/api/v1/auth',authRouter);
app.use("/api/v1/jobs", authenticateUser,jobRoute);
app.use(errorHandler);
app.use(notFound);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.DATABASE_LOCAL);
    console.log("DB connection successful");
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}....`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
