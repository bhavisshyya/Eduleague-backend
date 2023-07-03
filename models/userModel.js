import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
   {
      fName: {
         type: String,
      },
      lName: {
         type: String,
      },
      password: {
         type: String,
         minlength: [6, "length of password should be greater than 6"],
         select: true,
      },
      phoneNo: {
         type: String,
         validate: validator.isMobilePhone,
      },
      isAdmin: {
         type: Boolean,
         default: false,
      },
      quizWon: {
         type: Number,
         default: 0,
      },
      quizParticipated: {
         type: Number,
         default: 0,
      },
      balance: {
         type: Number,
         default: 50,
      },
      walletLog: {
         type: [String],
      },
      socialId: {
         type: String,
         default: "",
      },
      socialTag: {
         type: String,
         default: "normal login",
      },
      referralCode: {
         type: String,
      },
      otp: {
         type: String,
         // required: true,
      },
      //  otpExpiration: {
      //    type: Date,
      //    required: true,
      //  },
   },
   { timestamps: true }
);

// middlewares
userSchema.pre("save", async function (next) {
   if (!this.isModified("password")) return;
   const salt = await bcrypt.genSalt(10);
   this.password = await bcrypt.hash(this.password, salt);
});

// JSON Token
userSchema.methods.createJWT = function () {
   return jwt.sign(
      { userId: this._id, isAdmin: this.isAdmin },
      process.env.JWT_KEY,
      {
         expiresIn: "3d",
      }
   );
};

// compare password
userSchema.methods.comparePassword = async function (userPassword) {
   const isMatch = bcrypt.compare(userPassword, this.password);
   return isMatch;
};

export default mongoose.model("User", userSchema);
