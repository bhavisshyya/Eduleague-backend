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
   img: {
      type: String,
   },
   desc: {
      type: String,
   },
   type: {
      type: String,
   },
});

export default mongoose.model("Reward", rewardSchema);
