import GoogleStrategy from "passport-google-oauth20";
import FacebookStrategy from "passport-facebook";
import passport from "passport";
import User from "./models/userModel.js";

passport.use(
   new GoogleStrategy.Strategy(
      {
         clientID: process.env.GOOGLE_CLIENT_ID, // enter cloud client id
         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
         callbackURL: "/auth/google/callback",
         scope: ["profile", "email"],
      },
      async function (accessToken, refreshToken, profile, callback) {
         const check = User.findOne({ socialId: profile.id });
         if (!check) {
            const user = new User({
               fName: profile.displayName,
               socialId: profile.id,
               provider: profile.provider,
            });
            await user.save();
         }
      }
   )
);

passport.use(
   new FacebookStrategy.Strategy(
      {
         clientID: process.env.FACEBOOK_CLIENT_ID, // enter cloud client id
         clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
         callbackURL: "/auth/facebook/callback",
         scope: ["profile", "email"],
      },
      async function (accessToken, refreshToken, profile, callback) {
         const check = User.findOne({ socialId: profile.id });
         if (!check) {
            const user = new User({
               fName: profile.displayName,
               socialId: profile.id,
               provider: profile.provider,
            });
            await user.save();
         }
      }
   )
);

passport.serializeUser((user, done) => {
   done(null, user);
});

passport.deserializeUser((user, done) => {
   done(null, user);
});
