import passport from "passport";
import bcrypt from "bcryptjs"; // use for hash the passport

import User from "../models/user.model.js";
import { GraphQLLocalStrategy } from "graphql-passport";

// done(err_message, return_results)
export const configurePassport = async () => {
  passport.serializeUser((user, done) => {
    console.log("Serializing User");
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    console.log("Deserialzing User");
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // reference to: https://www.npmjs.com/package/graphql-passport
  passport.use(
    // login function
    new GraphQLLocalStrategy(async (username, password, done) => {
      try {
        // get the user in the database
        const user = await User.findOne({ username });
        if (!user) {
          throw new Error("Invalid username or password");
        }
        // check if the password is invalid
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          throw new Error("Invalid username or password");
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
};
