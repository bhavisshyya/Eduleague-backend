import express from "express";
import { login, register } from "../controller/authController.js";
import passport from "passport";
import jwt from "jsonwebtoken";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/login/success", (req, res) => {
   if (req.user) {
      const token = jwt.sign({ userId: req.user.id }, process.env.JWT_KEY, {
         expiresIn: "3d",
      });
      res.status(200).json({
         error: false,
         message: "Successfully Loged In",
         user: req.user,
         token,
      });
   } else {
      res.status(403).json({ error: true, message: "Not Authorized" });
   }
});

router.get("/login/failed", (req, res) => {
   res.status(401).json({
      error: true,
      message: "Log in failure",
   });
});

router.get("/google", passport.authenticate("google", ["profile", "email"]));

router.get(
   "/google/callback",
   passport.authenticate("google", {
      successRedirect: process.env.CLIENT_URL, //redirect after successful login
      // failureRedirect: "client/route"
   })
);

router.get(
   "/facebook",
   passport.authenticate("facebook", { scope: ["profile"] })
);

router.get(
   "/facebook/callback",
   passport.authenticate("facebook", {
      successRedirect: process.env.CLIENT_URL,
      // failureRedirect: "/login/failed",
   })
);

export default router;
