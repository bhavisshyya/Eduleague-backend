import User from "../models/userModel.js";

export const updateUser = async (req, res, next) => {
   //this function is only to update user details
   const { email, fName, location, lName } = req.body;
   if (!email || !fName || !location || !lName)
      return next("No field can be left empty");

   const user = await User.findOne({ _id: req.user.userId });

   user.email = email;
   user.fName = fName;
   user.location = location;
   user.lName = lName;
   await user.save();

   const token = user.createJWT();

   res.status(200).json({
      message: "user updated successfully",
      success: true,
      user,
      token,
   });
};

export const getUser = async (req, res, next) => {
   const user = await User.findById({ _id: req.params.id });
   if (!user) return next("no user with this id exists");
   const { password, isAdmin, ...others } = user._doc;
   res.status(200).json(others);
};

export const getWallet = async (req, res, next) => {
   const userId = req.user.userId;
   const user = await User.findOne({ _id: userId });
   let wallet = {};
   wallet.balance = user.balance;
   wallet.log = user.walletLog;

   res.status(200).json(wallet);
};

export const getUserAuth = async (req, res, next) => {
   const user = await User.findById(req.user.userId);
   if (!user) return next("no user found");
   const { password, isAdmin, ...others } = user._doc;
   res.status(200).json({ success: true, others });
};
