import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

export const register = async (req, res, next) => {
   const { phoneNo, password, fName, referral } = req.body;

   if (!fName) return next("name is required");

   if (!phoneNo) return next("phone Number is required");

   if (!password) return next("password is required");

   if (phoneNo.length !== 10) return next("enter a 10 digit mobile number");

   const phoneNoCheck = await User.findOne({ phoneNo });
   if (phoneNoCheck) return next("This phone number is already been used");

   //we will hash password at model(as it is more secure) by using mongoose middleware

   const user = new User(req.body);
   const ref_user = await User.findOne({ referralCode: referral });
   user.walletLog.push("+50 coins as signup bonus");
   if (referral && ref_user) {
      user.balance = 75;
      ref_user.balance += 25;
      user.walletLog.push("+25 coins through referral");
      ref_user.walletLog.push("+25 coins through referral");
      await ref_user.save();
   }
   const savedUser = await user.save();

   const generate_referral = savedUser._id.toString().slice(-10);
   savedUser.referralCode = generate_referral;
   await savedUser.save();

   const token = user.createJWT();

   res.status(201).json({
      success: true,
      message: "user registered",
      user: {
         fName: user.fName,
         lName: user.lName,
         phoneNo: user.phoneNo,
         location: user.location,
         referralCode: generate_referral,
         token,
      },
   });
};

export const login = async (req, res, next) => {
   const { phoneNo, password } = req.body;

   if (!password) return next("password is required");

   if (!phoneNo) return next("phoneNo is required");

   let user = await User.findOne({ phoneNo }).select("+password");

   if (!user) return res.status(200).json("wrong phone Number or password");

   const check = await user.comparePassword(password);

   if (!check) return res.status(200).json("wrong phone Number or password");

   const token = user.createJWT();

   user.password = undefined;

   user = { ...user._doc, token };

   res.status(200).json({
      message: "logged in successfully",
      success: true,
      token,
      user,
   });
};

export const socialLogin = async (req, res, next) => {
   const { socialId, socialTag } = req.body;
   if (!socialId) return next("social id is required");
   if (!socialTag) return next("social tag is required");

   const user = await User.findOne({ socialId: socialId });

   if (user) {
      // user has already logged in
      const token = jwt.sign(
         { userId: user._id, isEmp: user.isEmployer },
         process.env.JWT_KEY,
         {
            expiresIn: "3d",
         }
      );
      res.status(200).json({
         message: "user logged in successfully",
         success: true,
         user,
         token,
      });
   } else {
      const newUser = new User({ socialId, socialTag });
      const savedUser = await newUser.save();
      const generate_referral = savedUser._id.toString().slice(-10);
      savedUser.referralCode = generate_referral;
      savedUser.walletLog.push("+50 coins as signup bonus");
      const generate_name = `user_${socialId}`;
      savedUser.fName = generate_name;
      const socialUser = await savedUser.save();
      const token = jwt.sign(
         { userId: savedUser._id, isEmp: savedUser.isEmployer },
         process.env.JWT_KEY,
         {
            expiresIn: "3d",
         }
      );
      res.status(201).json({
         message: "user registered in successfully",
         success: true,
         socialUser,
         token,
      });
   }
};

export const forgetPassword = async (req, res, next) => {
   const { phoneNo, newPassword } = req.body;

   if (!phoneNo) return next("phone number is needed");
   if (!newPassword) return next("password is needed");

   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(newPassword, salt);

   await User.findOneAndUpdate(
      { phoneNo },
      { $set: { password: hashedPassword } },
      { new: true }
   );

   res.status(200).json({
      success: true,
      message: "password updated successfully",
   });
};

export const changePassword = async (req, res, next) => {
   const { oldPassword, newPassword } = req.body;
   const userId = req.user.userId;
   if (!oldPassword || !newPassword) return next("all fields are required");

   const user = await User.findById(userId);
   const check = await user.comparePassword(oldPassword);
   if (!check) return next("wrong password");

   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(newPassword, salt);

   await User.findOneAndUpdate(
      { _id: userId },
      { $set: { password: hashedPassword } },
      { new: true }
   );

   res.status(200).json({
      success: true,
      message: "password updated successfully",
   });
};
