import express, { json } from "express"; // changed type to module in package.json
import dotenv from "dotenv"; // to work with env files
import colors from "colors"; //to add color to console
import "express-async-errors"; //to avoid writing try catch
import connectDb from "./config/db.js"; //to connect to db
import cors from "cors"; // to allow cross origin requests
import morgan from "morgan"; // logs which api has been hit
import passport from "passport";
import cookieSession from "cookie-session";
import("./passport.js");

// routes import
import authRoutes from "./route/authRoutes.js";
import userRoutes from "./route/userRoutes.js";
import questionRoutes from "./route/questionRoutes.js";
import quizRoutes from "./route/quizRoute.js";
import participantRoutes from "./route/participantRoute.js";
import rewardRoutes from "./route/rewardRoutes.js";
import otpRoutes from "./route/otpRoute.js";

// error middleware
import errorMiddelware from "./middlewares/errroMiddleware.js";

//security packages
import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";

//initializing
dotenv.config();

//database connection
connectDb();

// initializing express
const app = express();

// middlewares
app.use(mongoSanitize()); //to secure database
app.use(helmet()); //to secure header data
app.use(xss()); //to prevent from cross site scripting
app.use(express.json()); //to use json data in our application
app.use(
   cookieSession({
      name: "session",
      keys: ["eduleague"],
      maxAge: 24 * 60 * 60 * 100,
   })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
   cors({
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
   })
);
//to use cross origin sites

app.use(morgan("dev")); //logs which api route has been called and other info
app.use("/uploads", express.static("uploads")); //to serve uploaded file

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/question", questionRoutes);
app.use("/api/v1/quiz", quizRoutes);
app.use("/api/v1/participant", participantRoutes);
app.use("/api/v1/reward", rewardRoutes);
app.use("/api/v1", otpRoutes);

// error middleWare
app.use(errorMiddelware);

//listen
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
   console.log(
      `listening to post ${PORT} on ${process.env.DEV_MODE} mode`.bgWhite.blue
   );
});
