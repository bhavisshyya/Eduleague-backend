import Reward from "../models/rewardModel.js";
import User from "../models/userModel.js";

export const addReward = async (req, res, next) => {
   if (!req.user.isAdmin) return next("only admins can create reward");
   const reward = new Reward(req.body);
   await reward.save();
   res.status(201).json({
      success: true,
      message: "reward created successfully",
      reward,
   });
};

export const getRewards = async (req, res, next) => {
   const reward = await Reward.find();
   if (!reward)
      return res
         .status(404)
         .json({ message: "no reward available at this time" });
   res.status(200).json({ success: true, reward });
};

export const giveReward = async (req, res, next) => {
   const id = req.params.id;
   const reward = await Reward.findById(id);
   const user = await User.findById(req.user.userId);
   if (user.balance < reward.price)
      return res
         .status(200)
         .json({ success: false, message: "you dont have enough coins" });

   user.rewards.push(reward);
   user.balance -= reward.price;
   await user.save();
   await reward.save();

   res.status(200).json({
      success: true,
      message: "reward granted successfully",
   });
};
