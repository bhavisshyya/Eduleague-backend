import express from "express";
import userAuth from "../middlewares/authMiddleware.js";
import {
   addReward,
   getRewards,
   giveReward,
} from "../controller/rewardController.js";

const router = express.Router();

router.post("/create-reward", userAuth, addReward);
router.put("/:id", userAuth, giveReward);
router.get("/all", userAuth, getRewards);

export default router;
