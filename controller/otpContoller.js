import twilio from "twilio";

// import User from "../models/userModel";

export const otpController = async (req, res) => {
   try {
      const { phoneNumber } = req.body;

      // const existingUser = await User.findOne({ phoneNumber });

      // if (existingUser) {
      //   return res.status(400).json({ error: 'Phone number already registered' });
      // }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      // const otpExpiration = new Date().getTime() + 5 * 60 * 1000; // OTP expires after 5 minutes

      // const user = new User({
      //   phoneNumber,
      // //   otp,
      // //   otpExpiration,
      // });

      // await user.save();

      // Send the OTP code to the user's mobile number using Twilio
      const client = twilio(
         process.env.TWILIO_ACCOUNT_SID,
         process.env.TWILIO_AUTH_TOKEN
      );

      await client.messages.create({
         body: `Your OTP code for Eduleague : ${otp}`,
         from: process.env.TWILIO_PHONE_NUMBER,
         to: phoneNumber,
      });

      res.status(201).json(otp);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
   }
};
