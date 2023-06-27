import User from "../models/userModel.js";

export const register = async (req, res, next) => {
   const { phoneNo, password, fName } = req.body;

   if (!fName) return next("name is required");

   if (!phoneNo) return next("phone Number is required");

   if (!password) return next("password is required");

   const phoneNoCheck = await User.findOne({ phoneNo });
   if (phoneNoCheck) return next("This emai is already been used");

   //we will hash password at model(as it is more secure) by using mongoose middleware

   const user = new User(req.body);
   await user.save();

   const token = user.createJWT();

   res.status(201).json({
      success: true,
      message: "user registered",
      user: {
         fName: user.fName,
         lName: user.lName,
         phoneNo: user.phoneNo,
         location: user.location,
         token,
      },
   });
};

export const login = async (req, res, next) => {
   const { phoneNo, password } = req.body;

   if (!password) return next("password is required");

   if (!phoneNo) return next("phoneNo is required");

   let user = await User.findOne({ phoneNo }).select("+password");

   if (!user) return next("wrong phone Number or password");

   const check = await user.comparePassword(password);

   if (!check) return next("wrong phone Number or password");

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
