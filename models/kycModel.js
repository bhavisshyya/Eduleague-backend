import mongoose from "mongoose";
import validator from "validator";

const kycSchema = new mongoose.Schema(
   {
      name: {
         type: String,
      },
      phoneNo: {
         type: String,
         validate: validator.isMobilePhone,
      },
      address: {
         type: String,
         required: true,
      },
      pincode: {
         type: Number,
         required: true,
      },
      documentType: {
         type: String,
         required: true,
      },
      document: {
         type: String,
         required: true,
      },
      nameOnAccount: {
         type: String,
         required: true,
      },
      accountNumber: {
         type: String,
         required: true,
      },
      IfscCode: {
         type: String,
         required: true,
      },
      user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      status: {
         type: String,
         enum: ["Pending", "Verified"],
         default: "Pending",
      },
   },
   { timestamps: true }
);

export default mongoose.model("Kyc", kycSchema);
