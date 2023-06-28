import express from "express";
import {
   changePassword,
   forgetPassword,
   login,
   register,
   socialLogin,
} from "../controller/authController.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import userAuth from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.post("/social-login", socialLogin);
router.put("/forgot-password", forgetPassword);
router.put("/change-password", userAuth, changePassword);

//to check get user when logged in from social
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
   "/google/callback", //hit this url from client to use google auth
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

// to clear session
router.get("/logout", (req, res) => {
   req.logout();
});

export default router;
