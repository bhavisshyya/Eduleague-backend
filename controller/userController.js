import Kyc from "../models/kycModel.js";
import User from "../models/userModel.js";

export const updateUser = async (req, res, next) => {
   //this function is only to update user details
   const { fName, lName, location } = req.body;
   // if (!fName || !lName) return next("No field can be left empty");

   const user = await User.findOne({ _id: req.user.userId });

   // user.email = email;
   user.fName = fName;
   user.location = location;
   user.lName = lName;
   await user.save();

   res.status(200).json({
      message: "user updated successfully",
      success: true,
      user,
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
   wallet.log = user.walletLog.reverse();
   res.status(200).json(wallet);
};

export const getUserAuth = async (req, res, next) => {
   const user = await User.findById(req.user.userId);
   if (!user) return next("no user found");
   const { password, isAdmin, ...others } = user._doc;
   res.status(200).json({ success: true, user: others });
};

export const addKyc = async (req, res, next) => {
   const kyc = new Kyc(req.body);
   if (req.file) kyc.document = req.file.path;
   else return next("you need to upload your id proof");
   kyc.user = req.user.userId;
   const savedKyc = await kyc.save();
   const user = await User.findById(req.user.userId);
   user.isKycSubmitted = true;
   user.kyc = savedKyc._id;
   await user.save();
   res.status(201).json({ success: true, message: "KYC added successfully" });
};

export const updateKyc = async (req, res, next) => {
   const userId = req.user.userId;
   const {
      address,
      pincode,
      documentType,
      document,
      nameOnAccount,
      accountNumber,
      IfscCode,
      name,
      phoneNo,
   } = req.body;

   const user = await User.findById(userId);

   if (!user) {
      return next("User not found");
   }

   let kyc = await Kyc.findOne({ user: userId });
   if (!kyc) {
      kyc = new Kyc({
         address,
         pincode,
         documentType,
         document,
         nameOnAccount,
         accountNumber,
         IfscCode,
         user: userId,
         name,
         phoneNo,
      });
   } else {
      kyc.address = address;
      kyc.pincode = pincode;
      kyc.documentType = documentType;
      kyc.document = document;
      kyc.nameOnAccount = nameOnAccount;
      kyc.accountNumber = accountNumber;
      kyc.IfscCode = IfscCode;
      kyc.name = name;
      kyc.phoneNo = phoneNo;
   }

   await kyc.save();

   return res.status(200).send({ kyc });
};
