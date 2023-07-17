import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
   },
   price: {
      type: Number,
      required: true,
   },
   code: {
      type: String,
   },
   desc: {
      type: String,
   },
   quantity: {
      type: Number,
      required: true,
   },
   type: {
      type: String,
      enum: ["coupon", "item"],
   },
});

export default mongoose.model("Reward", rewardSchema);
